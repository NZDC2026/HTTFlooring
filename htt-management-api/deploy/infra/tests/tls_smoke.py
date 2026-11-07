#!/usr/bin/env python3
"""Explicit test-only CA smoke test. Never use these certificates for an actual production deployment."""
import argparse
import importlib.util
import os
from pathlib import Path
import socket
import ssl
import subprocess

ROOT = Path(__file__).resolve().parents[1]


def run(*args):
    subprocess.run(args, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--allow-test-ca', action='store_true', required=True)
    parser.add_argument('--replace-test-certificates', action='store_true')
    parser.add_argument('--java-probe', action='store_true', help='Also test Java AMQP mTLS using the populated notification-test Maven cache.')
    args = parser.parse_args()
    spec = importlib.util.spec_from_file_location('infra', ROOT / 'manage.py')
    infra = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(infra)
    state, values = infra.load('production')
    replace = args.replace_test_certificates and (state / '.tls-smoke-only').exists()
    if values['HTT_BIND_ADDRESS'] != '127.0.0.1' or (any((state / 'tls').iterdir()) and not replace):
        raise ValueError('Smoke test requires a fresh, loopback-only production configuration with no certificates.')
    if infra.compose('production', 'ps', '--status', 'running', '--quiet', capture=True).stdout.strip():
        raise ValueError('Stop the smoke stack before generating test certificates.')
    private = state / 'test-ca-private'
    private.mkdir(mode=0o700, exist_ok=replace)
    (state / '.tls-smoke-only').write_text('Test CA only; never promote this state to production.\n')
    os.environ['HTT_ALLOW_TLS_SMOKE'] = '1'
    tls = state / 'tls'
    run('openssl', 'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '2', '-subj', '/CN=HTT-SMOKE-TEST-CA',
        '-addext', 'basicConstraints=critical,CA:TRUE', '-addext', 'keyUsage=critical,keyCertSign,cRLSign',
        '-addext', 'subjectKeyIdentifier=hash',
        '-keyout', str(private / 'ca.key'), '-out', str(tls / 'ca.crt'))
    for name in ('rabbitmq', 'redis', 'ops-client'):
        server = name != 'ops-client'
        subject = 'htt-' + name if server else 'htt-ops-test-client'
        run('openssl', 'req', '-newkey', 'rsa:2048', '-nodes', '-subj', '/CN=' + subject,
            '-keyout', str(tls / (name + '.key')), '-out', str(private / (name + '.csr')))
        extension = private / (name + '.ext')
        extension.write_text('basicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature,keyEncipherment\n'
                             'subjectKeyIdentifier=hash\nauthorityKeyIdentifier=keyid,issuer\nextendedKeyUsage=' + ('serverAuth' if server else 'clientAuth')
                             + ('\nsubjectAltName=DNS:' + subject + ',DNS:localhost,IP:127.0.0.1\n' if server else '\n'))
        run('openssl', 'x509', '-req', '-in', str(private / (name + '.csr')), '-CA', str(tls / 'ca.crt'),
            '-CAkey', str(private / 'ca.key'), '-CAcreateserial', '-days', '2', '-extfile', str(extension),
            '-out', str(tls / (name + '.crt')))
    for file in [*tls.iterdir(), *private.iterdir()]:
        file.chmod(0o600)
    try:
        infra.preflight('production')
        infra.compose('production', 'up', '-d', '--wait', '--wait-timeout', '180', 'rabbitmq', 'redis')
        infra.check('production')
        without_client = ssl.create_default_context(cafile=str(tls / 'ca.crt'))
        without_client.maximum_version = ssl.TLSVersion.TLSv1_2
        for service in ('RABBITMQ', 'REDIS'):
            rejected = False
            try:
                with socket.create_connection(('127.0.0.1', int(values[service + '_PORT'])), timeout=5) as wire:
                    with without_client.wrap_socket(wire, server_hostname=values[service + '_TLS_NAME']):
                        pass
            except ssl.SSLError:
                rejected = True
            if not rejected:
                raise ValueError(service + ' accepted a client without its certificate.')
        if args.java_probe:
            subprocess.run(['sh', str(ROOT / 'tests/amqp_probe.sh')], check=True, stdin=subprocess.DEVNULL)
        infra.backup('production', cold=True)
        print('PASS: production TLS profile, client certificates required, authenticated operations and cold backups.')
    finally:
        infra.compose('production', 'stop', 'rabbitmq', 'redis')
        print('TLS smoke stack stopped. Temporary test CA must never be reused in production.')


if __name__ == '__main__':
    main()

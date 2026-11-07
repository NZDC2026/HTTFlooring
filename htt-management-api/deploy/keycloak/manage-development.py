#!/usr/bin/env python3
"""Only the dedicated htt-keycloak-dev stack. No sudo, shared DB changes or deletion commands."""
import argparse
import datetime
import ipaddress
import hashlib
import json
import os
from pathlib import Path
import secrets
import ssl
import subprocess
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parent
STATE = ROOT / '.state' / 'development'
PROJECT = 'htt-keycloak-dev'
KEYCLOAK = 'quay.io/keycloak/keycloak@sha256:3879c623248408de29a5303178b5816c77e8dfef3890c361f8c0bbeaa979ba3b'
POSTGRES = 'postgres@sha256:18cfe3ef5e6815560c98237d6216d1e5119702fb0f3894c8785dd58b8bbe5d73'


def run(*args, capture=False):
    return subprocess.run(args, check=True, cwd=ROOT, stdin=subprocess.DEVNULL,
                          stdout=subprocess.PIPE if capture else None, text=True)


def compose(*args, capture=False):
    if not (STATE / '.env').is_file():
        raise ValueError('Run init first; existing secrets are never overwritten.')
    return run('docker', 'compose', '-p', PROJECT, '--env-file', str(STATE / '.env'),
               '-f', 'compose.development.yaml', *args, capture=capture)


def write_private(path, content, mode=0o600):
    with path.open('x') as stream:
        stream.write(content)
    path.chmod(mode)


def initialize(address):
    ip = ipaddress.ip_address(address)
    if ip.version != 4 or not ip.is_private or ip.is_loopback:
        raise ValueError('Use the actual private IPv4 address of the development server.')
    if STATE.exists():
        raise ValueError('State already exists; inspect it instead of replacing credentials.')
    STATE.mkdir(parents=True, mode=0o700)
    STATE.chmod(0o700)
    secret_dir = STATE / 'secrets'
    tls = STATE / 'tls'
    secret_dir.mkdir(mode=0o700)
    tls.mkdir(mode=0o700)
    for name in ('db_password', 'postgres_password', 'bootstrap_password'):
        # Mounted non-root PostgreSQL must read its files. Host parent directories remain 0700.
        write_private(secret_dir / name, secrets.token_urlsafe(40) + '\n',
                      0o644 if name in ('db_password', 'postgres_password') else 0o600)
    run('openssl', 'req', '-x509', '-newkey', 'rsa:3072', '-nodes', '-sha256', '-days', '365',
        '-keyout', str(tls / 'ca.key'), '-out', str(tls / 'ca.crt'), '-subj', '/CN=HTT Development Identity CA',
        '-addext', 'basicConstraints=critical,CA:TRUE', '-addext', 'keyUsage=critical,keyCertSign,cRLSign')
    run('openssl', 'req', '-new', '-newkey', 'rsa:2048', '-nodes', '-sha256',
        '-keyout', str(tls / 'server.key'), '-out', str(tls / 'server.csr'), '-subj', f'/CN={address}')
    write_private(tls / 'server.ext', 'basicConstraints=critical,CA:FALSE\n'
                  'keyUsage=critical,digitalSignature,keyEncipherment\nextendedKeyUsage=serverAuth\n'
                  f'subjectAltName=IP:{address},IP:127.0.0.1\n')
    run('openssl', 'x509', '-req', '-in', str(tls / 'server.csr'), '-CA', str(tls / 'ca.crt'),
        '-CAkey', str(tls / 'ca.key'), '-CAcreateserial', '-out', str(tls / 'server.crt'),
        '-days', '90', '-sha256', '-extfile', str(tls / 'server.ext'))
    (tls / 'ca.key').chmod(0o600)
    (tls / 'server.key').chmod(0o600)
    write_private(STATE / 'dev-ca.txt', (tls / 'ca.crt').read_text(), 0o644)
    write_private(STATE / '.env', f'KEYCLOAK_IMAGE={KEYCLOAK}\nPOSTGRES_IMAGE={POSTGRES}\n'
                  f'KEYCLOAK_HOSTNAME=https://{address}:18443\nKEYCLOAK_BIND_ADDRESS={address}\nSTATE_DIR={STATE}\n')
    write_private(STATE / 'identity.json', json.dumps({'address': address, 'origin': f'https://{address}:18443'}))
    print('Initialized private development state; no password values printed. This CA is not for production.')


def check_ownership():
    for kind, name in [('volume', PROJECT + '_identity-data'), ('network', PROJECT + '_identity')]:
        probe = subprocess.run(['docker', kind, 'inspect', name], stdin=subprocess.DEVNULL,
                               stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True)
        if probe.returncode == 0:
            data = json.loads(probe.stdout)[0]
            labels = data.get('Labels') or {}
            if labels.get('com.docker.compose.project') != PROJECT:
                raise ValueError('A pre-existing resource belongs to another project.')


def check():
    info = json.loads((STATE / 'identity.json').read_text())
    context = ssl.create_default_context(cafile=str(STATE / 'tls' / 'ca.crt'))
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}), urllib.request.HTTPSHandler(context=context))

    def request(path, form=None, token=None, origin=None):
        data = urllib.parse.urlencode(form).encode() if form else None
        headers = {'Authorization': 'Bearer ' + token} if token else {}
        req = urllib.request.Request((origin or info['origin']) + path, data=data, headers=headers)
        with opener.open(req, timeout=15) as response:
            return json.load(response)

    assert request('/health/ready', origin='https://127.0.0.1:19000')['status'] == 'UP'
    for realm in ('htt-staff', 'htt-customer'):
        discovery = request(f'/realms/{realm}/.well-known/openid-configuration')
        assert discovery['issuer'] == info['origin'] + '/realms/' + realm
        assert request(f'/realms/{realm}/protocol/openid-connect/certs')['keys']
    admin = request('/realms/master/protocol/openid-connect/token', {
        'grant_type': 'password', 'client_id': 'admin-cli', 'username': 'htt-bootstrap',
        'password': (STATE / 'secrets' / 'bootstrap_password').read_text().strip()})['access_token']
    for realm, client_ids, audience in [
        ('htt-staff', ('htt-management-web', 'htt-flooring-app'), 'htt-staff-api'),
        ('htt-customer', ('htt-customer-portal',), 'htt-portal-api')]:
        clients = request('/admin/realms/' + realm + '/clients', token=admin)
        for client_id in client_ids:
            client = next(item for item in clients if item['clientId'] == client_id)
            assert client['publicClient'] and client['standardFlowEnabled']
            assert not client['directAccessGrantsEnabled'] and not client['implicitFlowEnabled']
            assert client['attributes']['pkce.code.challenge.method'] == 'S256'
            assert any(mapper.get('config', {}).get('included.custom.audience') == audience
                       for mapper in client['protocolMappers'])
    print('PASS: HTTPS/IP SAN trust, readiness, both issuers/JWKS, admin login and three PKCE/audience client configurations.')
    print('Frontend callbacks are placeholders; real phone/email login and Java account binding remain separate acceptance work.')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('action', choices=['init', 'up', 'check', 'stop', 'backup'])
    parser.add_argument('--address', default='192.168.10.174')
    args = parser.parse_args()
    if args.action == 'init':
        initialize(args.address)
    elif args.action == 'up':
        check_ownership()
        compose('config', '--quiet')
        compose('up', '-d')
    elif args.action == 'check':
        check()
    elif args.action == 'stop':
        compose('stop')
    else:
        directory = STATE / 'backups'
        directory.mkdir(mode=0o700, exist_ok=True)
        path = directory / (datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S%fZ') + '.dump')
        partial = path.with_suffix('.partial')
        with partial.open('xb') as target:
            partial.chmod(0o600)
            subprocess.run(['docker', 'compose', '-p', PROJECT, '--env-file', str(STATE / '.env'),
                            '-f', str(ROOT / 'compose.development.yaml'), 'exec', '-T', 'keycloak-db',
                            'pg_dump', '-U', 'postgres', '-d', 'htt_keycloak', '-Fc'],
                           check=True, stdin=subprocess.DEVNULL, stdout=target)
        with partial.open('rb') as source:
            subprocess.run(['docker', 'compose', '-p', PROJECT, '--env-file', str(STATE / '.env'),
                            '-f', str(ROOT / 'compose.development.yaml'), 'exec', '-T', 'keycloak-db',
                            'pg_restore', '--list'], check=True, stdin=source, stdout=subprocess.DEVNULL)
        partial.rename(path)
        with path.open('rb') as source:
            digest = hashlib.file_digest(source, 'sha256').hexdigest()
        write_private(path.with_suffix('.sha256'), digest + '  ' + path.name + '\n')
        print('Identity database backup stored at ' + str(path))


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, subprocess.CalledProcessError, AssertionError, StopIteration) as error:
        raise SystemExit('Keycloak development action failed: ' + type(error).__name__)

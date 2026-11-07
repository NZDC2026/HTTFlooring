#!/usr/bin/env python3
"""Isolated Linux Docker Compose deployment. Secrets stay in .state/<environment>/."""
import argparse
import base64
import fcntl
import hashlib
import ipaddress
import json
import os
from pathlib import Path
import re
import secrets
import socket
import ssl
import subprocess
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parent


def run(*args, capture=False, check=True):
    return subprocess.run(args, check=check, text=True, capture_output=capture, stdin=subprocess.DEVNULL)


def state_dir(environment):
    return ROOT / '.state' / environment


def write(path, content, mode=0o600):
    with path.open('x', encoding='utf-8') as stream:
        stream.write(content)
    path.chmod(mode)


def load(environment):
    state = state_dir(environment)
    values = dict(line.split('=', 1) for line in (state / '.env').read_text().splitlines() if line)
    if values['HTT_PROJECT'] != 'htt-infra-' + environment or values['HTT_STATE_DIR'] != str(state):
        raise ValueError('Deployment state does not belong to this project/directory.')
    for name in ('RABBITMQ_IMAGE', 'REDIS_IMAGE'):
        if '@sha256:' not in values[name]:
            raise ValueError('Deployment images must be pinned by digest.')
    return state, values


def compose_args(environment, *args):
    state, values = load(environment)
    return ['docker', 'compose', '--project-name', values['HTT_PROJECT'], '--env-file', str(state / '.env'),
            '--file', str(ROOT / 'compose.yaml'), '--file', str(ROOT / f'compose.{environment}.yaml'), *args]


def compose(environment, *args, capture=False):
    return run(*compose_args(environment, *args), capture=capture)


def copy_from_container(environment, service, remote_path, destination):
    # Docker archive/cp cannot reliably read tmpfs on every engine. Stream without buffering secret data in RAM.
    with destination.open('xb') as target:
        subprocess.run(compose_args(environment, 'exec', '-T', service, 'cat', remote_path),
                       check=True, stdin=subprocess.DEVNULL, stdout=target)


def image_digest(reference):
    if not re.fullmatch(r'[A-Za-z0-9./:@_-]+', reference):
        raise ValueError('Invalid image reference.')
    run('docker', 'pull', reference)
    details = json.loads(run('docker', 'image', 'inspect', reference, capture=True).stdout)[0]
    return details['RepoDigests'][0]


def rabbit_hash(password):
    salt = secrets.token_bytes(4)
    return base64.b64encode(salt + hashlib.sha256(salt + password.encode()).digest()).decode()


def init(args):
    if os.name != 'posix' or not re.fullmatch(r'/[A-Za-z0-9_./-]+', str(ROOT)):
        raise ValueError('Run on Linux from an absolute deployment path without spaces.')
    state = state_dir(args.environment)
    if state.exists():
        raise ValueError('State already exists; credentials/images are not overwritten. Use check/up.')
    # Pull before creating credentials, so interrupted downloads cannot leave partial credential state.
    rabbit = image_digest(args.rabbitmq_image)
    redis = image_digest(args.redis_image)
    state.mkdir(parents=True, mode=0o700)
    (state / 'secrets').mkdir(mode=0o700)
    (state / 'tls').mkdir(mode=0o700)
    passwords = {}
    for name in ('rabbitmq-admin', 'rabbitmq-app', 'redis-admin', 'redis-app', 'redis-health'):
        passwords[name] = secrets.token_hex(32)
        write(state / 'secrets' / (name + '-password'), passwords[name] + '\n')
    test = args.environment == 'test'
    values = {
        'HTT_PROJECT': 'htt-infra-' + args.environment, 'HTT_INFRA_MODE': args.environment,
        'HTT_STATE_DIR': str(state), 'HTT_BIND_ADDRESS': '127.0.0.1',
        'RABBITMQ_IMAGE': rabbit, 'REDIS_IMAGE': redis,
        'RABBITMQ_PORT': str(args.rabbitmq_port or (5678 if test else 5671)),
        'RABBITMQ_MANAGEMENT_PORT': str(args.management_port or (15678 if test else 15679)),
        'REDIS_PORT': str(args.redis_port or (16379 if test else 16380)),
        'RABBITMQ_TLS_NAME': 'htt-rabbitmq', 'REDIS_TLS_NAME': 'htt-redis',
        'RABBITMQ_MEMORY_LIMIT': '1g' if test else '4g', 'RABBITMQ_CPUS': '1' if test else '2',
        'REDIS_MEMORY_LIMIT': '512m' if test else '2g', 'REDIS_CPUS': '0.5' if test else '1',
    }
    write(state / '.env', ''.join(f'{key}={value}\n' for key, value in values.items()))
    rabbit_config = f'''log.console = true
log.file = false
vm_memory_high_watermark.absolute = {'512MiB' if test else '2GiB'}
disk_free_limit.absolute = {'1GB' if test else '8GB'}
heartbeat = 60
definitions.import_backend = local_filesystem
definitions.local.path = /etc/rabbitmq/definitions.json
definitions.skip_if_unchanged = true
management.tcp.port = 15672
'''
    if test:
        rabbit_config += 'listeners.tcp.default = 5672\n'
    else:
        rabbit_config += '''listeners.tcp = none
listeners.ssl.default = 5671
ssl_options.cacertfile = /run/htt-tls/ca.crt
ssl_options.certfile = /run/htt-tls/server.crt
ssl_options.keyfile = /run/htt-tls/server.key
ssl_options.verify = verify_peer
ssl_options.fail_if_no_peer_cert = true
ssl_options.versions.1 = tlsv1.3
ssl_options.versions.2 = tlsv1.2
'''
    write(state / 'rabbitmq.conf', rabbit_config, 0o644)
    resource_pattern = r'^(htt\.notification\..*|amq\.gen-.*)$'
    definitions = {
        'users': [{'name': 'htt_ops', 'password_hash': rabbit_hash(passwords['rabbitmq-admin']),
                   'hashing_algorithm': 'rabbit_password_hashing_sha256', 'tags': ['administrator']},
                  {'name': 'htt_app', 'password_hash': rabbit_hash(passwords['rabbitmq-app']),
                   'hashing_algorithm': 'rabbit_password_hashing_sha256', 'tags': []}],
        'vhosts': [{'name': 'htt-notifications'}],
        'permissions': [{'user': 'htt_ops', 'vhost': 'htt-notifications', 'configure': '.*', 'write': '.*', 'read': '.*'},
                        {'user': 'htt_app', 'vhost': 'htt-notifications', 'configure': resource_pattern,
                         'write': resource_pattern, 'read': resource_pattern}],
    }
    write(state / 'definitions.json', json.dumps(definitions, indent=2) + '\n', 0o644)
    redis_config = f'''bind 0.0.0.0
protected-mode yes
daemonize no
dir /data
logfile ""
aclfile /etc/redis/users.acl
appendonly yes
appendfsync everysec
save ""
maxmemory {'128mb' if test else '768mb'}
maxmemory-policy noeviction
maxmemory-clients {'32mb' if test else '128mb'}
maxclients {'1000' if test else '10000'}
tcp-keepalive 60
'''
    if test:
        redis_config += 'port 6379\n'
    else:
        redis_config += '''port 0
tls-port 6379
tls-cert-file /run/htt-tls/server.crt
tls-key-file /run/htt-tls/server.key
tls-ca-cert-file /run/htt-tls/ca.crt
tls-auth-clients yes
'''
    write(state / 'redis.conf', redis_config, 0o644)
    sha = lambda role: hashlib.sha256(passwords['redis-' + role].encode()).hexdigest()
    acl = f'''user default off
user htt_admin on #{sha('admin')} ~* &* +@all
user htt_app on #{sha('app')} ~htt:* &htt:* +@read +@write +@transaction +ping +auth +hello +select +client|setname +client|setinfo -@admin -@dangerous
user htt_health on #{sha('health')} +ping
'''
    write(state / 'users.acl', acl, 0o644)
    write(state / 'release.json', json.dumps({'created_at': datetime.now(timezone.utc).isoformat(), 'images': [rabbit, redis]}, indent=2))
    print(f'Initialized {values["HTT_PROJECT"]}; credentials retained in {state / "secrets"} (not printed).')
    if not test:
        print('Production start requires CA, server certificates/keys and ops client certificate/key in tls/.')


def tls_preflight(state, values):
    tls = state / 'tls'
    for name, purpose in [('rabbitmq', 'sslserver'), ('redis', 'sslserver'), ('ops-client', 'sslclient')]:
        cert, key = tls / (name + '.crt'), tls / (name + '.key')
        hostname = ['-verify_hostname', values[name.upper() + '_TLS_NAME']] if name != 'ops-client' else []
        run('openssl', 'verify', '-x509_strict', '-purpose', purpose, *hostname, '-CAfile', str(tls / 'ca.crt'), str(cert), capture=True)
        run('openssl', 'x509', '-checkend', '86400', '-noout', '-in', str(cert), capture=True)
        cert_pub = run('openssl', 'x509', '-pubkey', '-noout', '-in', str(cert), capture=True).stdout
        key_pub = run('openssl', 'pkey', '-pubout', '-in', str(key), capture=True).stdout
        if cert_pub != key_pub:
            raise ValueError('TLS certificate/key mismatch: ' + name)


def preflight(environment):
    state, values = load(environment)
    run('docker', 'compose', 'version', capture=True)
    address = ipaddress.ip_address(values['HTT_BIND_ADDRESS'])
    if address.version != 4 or address.is_unspecified or address.is_multicast or not (address.is_loopback or address.is_private):
        raise ValueError('Choose an explicit loopback/private IPv4 interface; public/wildcard publication is refused.')
    if environment == 'production':
        if (state / '.tls-smoke-only').exists() and os.environ.get('HTT_ALLOW_TLS_SMOKE') != '1':
            raise ValueError('This state contains test-only TLS certificates; production start is refused.')
        tls_preflight(state, values)
    listed = run('docker', 'ps', '-a', '--filter', 'label=com.docker.compose.project=' + values['HTT_PROJECT'], '--format', 'json', capture=True).stdout
    existing = [json.loads(line) for line in listed.splitlines() if line.strip()]
    for container in existing:
        labels = json.loads(run('docker', 'inspect', '--format', '{{json .Config.Labels}}', container['ID'], capture=True).stdout)
        if labels.get('com.htt.managed-by') != 'htt-management-api':
            raise ValueError('Compose project collision with an unowned container.')
    for kind, name in [('volume', values['HTT_PROJECT'] + '_rabbitmq-data'),
                       ('volume', values['HTT_PROJECT'] + '_redis-data'),
                       ('network', values['HTT_PROJECT'] + '_network')]:
        inspected = run('docker', kind, 'inspect', name, capture=True, check=False)
        if inspected.returncode == 0:
            labels = json.loads(inspected.stdout)[0].get('Labels') or {}
            if labels.get('com.htt.managed-by') != 'htt-management-api' or labels.get('com.docker.compose.project') != values['HTT_PROJECT']:
                raise ValueError('Deployment resource collision: ' + name)
    if not existing:
        for name in ('RABBITMQ_PORT', 'RABBITMQ_MANAGEMENT_PORT', 'REDIS_PORT'):
            address = '127.0.0.1' if name == 'RABBITMQ_MANAGEMENT_PORT' else values['HTT_BIND_ADDRESS']
            with socket.socket() as listener:
                listener.bind((address, int(values[name])))
    available = next(int(line.split()[1]) for line in Path('/proc/meminfo').read_text().splitlines() if line.startswith('MemAvailable:'))
    if available < (2 if environment == 'test' else 7) * 1024 * 1024:
        raise ValueError('Insufficient available host memory for the configured limits.')
    if os.statvfs(state).f_bavail * os.statvfs(state).f_frsize < (2 if environment == 'test' else 10) * 1024**3:
        raise ValueError('Insufficient free disk for broker persistence and safety margin.')
    compose(environment, 'config', '--quiet')
    print('Preflight passed: owned project, pinned images, ports, memory, disk and configuration.')


def check(environment):
    state, values = load(environment)
    compose(environment, 'exec', '-T', 'rabbitmq', 'rabbitmq-diagnostics', '-q', 'check_local_alarms')
    response = compose(environment, 'exec', '-T', 'redis', '/bin/sh', '/opt/htt/redis-cli.sh', 'health', 'PING', capture=True)
    if response.stdout.strip() != 'PONG':
        raise ValueError('Redis authentication/health check failed.')
    if environment == 'production':
        tls = state / 'tls'
        context = ssl.create_default_context(cafile=str(tls / 'ca.crt'))
        context.load_cert_chain(str(tls / 'ops-client.crt'), str(tls / 'ops-client.key'))
        for service in ('RABBITMQ', 'REDIS'):
            with socket.create_connection((values['HTT_BIND_ADDRESS'], int(values[service + '_PORT'])), timeout=5) as wire:
                with context.wrap_socket(wire, server_hostname=values[service + '_TLS_NAME']):
                    pass
    probe = 'htt:deployment:probe:' + secrets.token_hex(8)
    for command, expected in [(('SET', probe, 'ok', 'EX', '30'), 'OK'), (('GET', probe), 'ok'), (('DEL', probe), '1')]:
        result = compose(environment, 'exec', '-T', 'redis', '/bin/sh', '/opt/htt/redis-cli.sh', 'app', *command, capture=True)
        if result.stdout.strip() != expected:
            raise ValueError('Redis application ACL probe failed.')
    forbidden = compose(environment, 'exec', '-T', 'redis', '/bin/sh', '/opt/htt/redis-cli.sh', 'app', 'SET', 'foreign:probe', 'blocked', capture=True)
    if 'NOPERM' not in forbidden.stdout:
        raise ValueError('Redis key prefix restriction not enforced.')
    password = (state / 'secrets/rabbitmq-admin-password').read_text().strip()
    request = urllib.request.Request('http://127.0.0.1:' + values['RABBITMQ_MANAGEMENT_PORT'] + '/api/users')
    request.add_header('Authorization', 'Basic ' + base64.b64encode(('htt_ops:' + password).encode()).decode())
    with urllib.request.urlopen(request, timeout=10) as response:
        users = json.load(response)
    if {user['name'] for user in users} != {'htt_ops', 'htt_app'}:
        raise ValueError('Unexpected broker users; default guest must not remain.')
    app = next(user for user in users if user['name'] == 'htt_app')
    if app['tags']:
        raise ValueError('Application broker user must not have administrative tags.')
    compose(environment, 'ps')
    print('PASS: authenticated Redis operations, key isolation, RabbitMQ users/alarms. Credentials not displayed.')


def backup(environment, cold):
    state, values = load(environment)
    stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    target = state / 'backups' / stamp
    target.mkdir(parents=True, mode=0o700)
    exported = '/tmp/htt-definitions-' + stamp + '.json'
    compose(environment, 'exec', '-T', 'rabbitmq', 'rabbitmqctl', 'export_definitions', exported, capture=True)
    copy_from_container(environment, 'rabbitmq', exported, target / 'rabbitmq-definitions.json')
    started = compose(environment, 'exec', '-T', 'redis', '/bin/sh', '/opt/htt/redis-cli.sh', 'admin', 'BGSAVE', capture=True)
    if started.stdout.strip() != 'Background saving started':
        raise ValueError('Redis did not start a fresh snapshot; retry after the current persistence operation finishes.')
    for _ in range(60):
        info = compose(environment, 'exec', '-T', 'redis', '/bin/sh', '/opt/htt/redis-cli.sh', 'admin', 'INFO', 'persistence', capture=True).stdout
        if 'rdb_bgsave_in_progress:0' in info and 'rdb_last_bgsave_status:ok' in info:
            break
        time.sleep(1)
    else:
        raise ValueError('Redis snapshot did not complete.')
    copy_from_container(environment, 'redis', '/data/dump.rdb', target / 'redis.rdb')
    if cold:
        compose(environment, 'stop', 'rabbitmq', 'redis')
        try:
            for service in ('rabbitmq', 'redis'):
                run('docker', 'run', '--rm', '--network', 'none', '--read-only', '--entrypoint', '/bin/sh',
                    '--user', '0:0',
                    '--mount', 'type=volume,source=' + values['HTT_PROJECT'] + '_' + service + '-data,target=/source,readonly',
                    '--mount', 'type=bind,source=' + str(target) + ',target=/backup', values['REDIS_IMAGE'],
                    '-c', 'cd /source && tar -czf /backup/' + service + '-volume.tgz . && chown '
                    + str(os.getuid()) + ':' + str(os.getgid()) + ' /backup/' + service + '-volume.tgz')
        finally:
            compose(environment, 'up', '-d', '--wait', '--wait-timeout', '180', 'rabbitmq', 'redis')
    for file in target.iterdir():
        file.chmod(0o600)
    checksums = {}
    for file in target.iterdir():
        digest = hashlib.sha256()
        with file.open('rb') as source:
            for block in iter(lambda: source.read(1024 * 1024), b''):
                digest.update(block)
        checksums[file.name] = digest.hexdigest()
    write(target / 'manifest.json', json.dumps({'project': values['HTT_PROJECT'], 'images': [values['RABBITMQ_IMAGE'], values['REDIS_IMAGE']],
          'cold': cold, 'sha256': checksums}, indent=2))
    print('Backup written to ' + str(target) + (' (cold volumes included).' if cold else ' (RabbitMQ definitions only; queued messages NOT included).'))


def main():
    os.umask(0o077)
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['init', 'preflight', 'up', 'check', 'stop', 'backup'])
    parser.add_argument('environment', choices=['test', 'production'])
    parser.add_argument('--rabbitmq-image', default='rabbitmq:4.3-management-alpine')
    parser.add_argument('--redis-image', default='redis:8.6-alpine')
    parser.add_argument('--rabbitmq-port', type=int)
    parser.add_argument('--management-port', type=int)
    parser.add_argument('--redis-port', type=int)
    parser.add_argument('--cold', action='store_true', help='Stop this stack briefly and back up both volumes.')
    args = parser.parse_args()
    locks = ROOT / '.state'
    locks.mkdir(mode=0o700, exist_ok=True)
    lock = (locks / (args.environment + '.lock')).open('a')
    fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    if args.command == 'init':
        init(args)
    elif args.command == 'preflight':
        preflight(args.environment)
    elif args.command == 'up':
        preflight(args.environment)
        compose(args.environment, 'up', '-d', '--wait', '--wait-timeout', '180', 'rabbitmq', 'redis')
        check(args.environment)
    elif args.command == 'check':
        check(args.environment)
    elif args.command == 'stop':
        compose(args.environment, 'stop', 'rabbitmq', 'redis')
        print('Stopped only this project. Data volumes and credentials retained.')
    elif args.command == 'backup':
        backup(args.environment, args.cold)


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, subprocess.CalledProcessError, urllib.error.URLError) as failure:
        # Never dump environment, configuration contents or password-bearing request headers.
        print('Deployment failed: ' + str(failure))
        raise SystemExit(1)

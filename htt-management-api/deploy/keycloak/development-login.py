#!/usr/bin/env python3
"""Dedicated demo users/Swagger clients only; no realm or existing application-client changes."""
import argparse
import base64
import hashlib
import http.cookiejar
from html.parser import HTMLParser
import json
from pathlib import Path
import secrets
import ssl
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parent
STATE = ROOT / '.state/development'
ORIGIN = 'https://192.168.10.174:18443'
CLIENT = 'htt-api-swagger'
FIXTURE = 'htt-demo-v1'
USERS = {'manager': 'htt-staff', 'sales': 'htt-staff',
         'customer-a': 'htt-customer', 'customer-b': 'htt-customer'}


def private_file(path, content):
    with path.open('x') as stream:
        stream.write(content)
    path.chmod(0o600)


def request(opener, url, payload=None, token=None, method=None, form=False):
    headers = {}
    data = None
    if payload is not None:
        data = (urllib.parse.urlencode(payload) if form else json.dumps(payload)).encode()
        headers['Content-Type'] = 'application/x-www-form-urlencoded' if form else 'application/json'
    if token:
        headers['Authorization'] = 'Bearer ' + token
    with opener.open(urllib.request.Request(url, data=data, headers=headers, method=method), timeout=15) as reply:
        body = reply.read()
        return json.loads(body) if body else None


def provision(opener):
    token = request(opener, ORIGIN + '/realms/master/protocol/openid-connect/token', {
        'grant_type': 'password', 'client_id': 'admin-cli', 'username': 'htt-bootstrap',
        'password': (STATE / 'secrets/bootstrap_password').read_text().strip()}, form=True)['access_token']
    demo = STATE / 'demo-login'
    demo.mkdir(mode=0o700, exist_ok=True)
    demo.chmod(0o700)
    manifest = {}
    for realm in sorted(set(USERS.values())):
        admin = ORIGIN + '/admin/realms/' + realm
        audience = 'htt-staff-api' if realm == 'htt-staff' else 'htt-portal-api'
        client = {'clientId': CLIENT, 'name': '[DEMO] Local API Swagger', 'protocol': 'openid-connect',
                  'enabled': True, 'publicClient': True, 'standardFlowEnabled': True,
                  'implicitFlowEnabled': False, 'directAccessGrantsEnabled': False,
                  'serviceAccountsEnabled': False, 'fullScopeAllowed': False,
                  'redirectUris': [f'http://{host}:{port}/swagger-ui/oauth2-redirect.html'
                                   for host in ('localhost', '127.0.0.1') for port in (8080, 8081)],
                  'webOrigins': [f'http://{host}:{port}' for host in ('localhost', '127.0.0.1') for port in (8080, 8081)],
                  'attributes': {'pkce.code.challenge.method': 'S256', 'htt.demo.fixture': FIXTURE},
                  'protocolMappers': [{'name': 'api-audience', 'protocol': 'openid-connect',
                                       'protocolMapper': 'oidc-audience-mapper',
                                       'config': {'included.custom.audience': audience,
                                                  'access.token.claim': 'true', 'id.token.claim': 'false'}}]}
        found = request(opener, admin + '/clients?clientId=' + CLIENT, token=token)
        if found:
            if len(found) != 1 or found[0].get('attributes', {}).get('htt.demo.fixture') != FIXTURE:
                raise ValueError('Refusing to adopt an existing non-demo client')
            request(opener, admin + '/clients/' + found[0]['id'], client, token, 'PUT')
        else:
            request(opener, admin + '/clients', client, token)
        configured = request(opener, admin + '/clients?clientId=' + CLIENT, token=token)[0]
        for key in ('publicClient', 'standardFlowEnabled', 'directAccessGrantsEnabled', 'redirectUris', 'webOrigins'):
            actual, expected = configured[key], client[key]
            if isinstance(expected, list):
                actual, expected = sorted(actual), sorted(expected)
            if actual != expected:
                raise ValueError('Demo client configuration mismatch')

    for label, realm in USERS.items():
        admin = ORIGIN + '/admin/realms/' + realm
        email = f'{label}@htt-demo.invalid'
        password_file = demo / f'{label}.password'
        identity_file = demo / f'{label}.subject'
        found = request(opener, admin + '/users?' + urllib.parse.urlencode({'username': email, 'exact': 'true'}), token=token)
        if found:
            if len(found) != 1 or not identity_file.exists() or found[0]['id'] != identity_file.read_text().strip():
                raise ValueError('Refusing to adopt an existing user')
            if found[0].get('email') != email or not password_file.exists():
                raise ValueError('Existing demo account metadata mismatch')
            subject = found[0]['id']
        else:
            if identity_file.exists() or password_file.exists():
                raise ValueError('Partial demo user state; inspect before retrying')
            password = secrets.token_urlsafe(32)
            private_file(password_file, password + '\n')
            request(opener, admin + '/users', {'username': email, 'email': email,
                    'firstName': 'DEMO', 'lastName': label, 'enabled': True, 'emailVerified': True,
                    'requiredActions': [], 'credentials': [{'type': 'password', 'value': password, 'temporary': False}]}, token)
            subject = request(opener, admin + '/users?' + urllib.parse.urlencode({'username': email, 'exact': 'true'}), token=token)[0]['id']
            private_file(identity_file, subject + '\n')
        manifest[label] = subject
        print(f'DEMO account ready: {email} realm={realm} subject={subject}')
    # Public identifiers only, never passwords or tokens.
    export = ''.join(f'{label}={subject}\n' for label, subject in manifest.items())
    (STATE / 'demo-bindings.txt').write_text(export)
    (STATE / 'demo-bindings.txt').chmod(0o600)
    print('Public binding manifest exported; passwords remain in private server files.')


class LoginForm(HTMLParser):
    action = None

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if tag == 'form' and attributes.get('id') == 'kc-form-login':
            self.action = attributes['action']


class StopCallback(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if newurl.startswith('http://localhost:8080/swagger-ui/oauth2-redirect.html'):
            return None
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def login(label, realm, context):
    opener = urllib.request.build_opener(urllib.request.HTTPSHandler(context=context),
              urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()), StopCallback())
    issuer = ORIGIN + '/realms/' + realm
    verifier = secrets.token_urlsafe(48)
    state = secrets.token_urlsafe(24)
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).decode().rstrip('=')
    callback = 'http://localhost:8080/swagger-ui/oauth2-redirect.html'
    auth = issuer + '/protocol/openid-connect/auth?' + urllib.parse.urlencode({
        'client_id': CLIENT, 'redirect_uri': callback, 'response_type': 'code', 'scope': 'openid',
        'state': state, 'code_challenge': challenge, 'code_challenge_method': 'S256'})
    with opener.open(auth, timeout=15) as reply:
        parser = LoginForm()
        parser.feed(reply.read().decode())
    if not parser.action or not parser.action.startswith(issuer + '/login-actions/'):
        raise ValueError('Unexpected login form action')
    password = (STATE / 'demo-login' / f'{label}.password').read_text().strip()
    data = urllib.parse.urlencode({'username': f'{label}@htt-demo.invalid', 'password': password}).encode()
    try:
        opener.open(urllib.request.Request(parser.action, data=data), timeout=15).close()
        raise ValueError('Login did not complete with an authorization code')
    except urllib.error.HTTPError as redirect:
        if redirect.code != 302:
            raise
        location = redirect.headers['Location']
        if not location.startswith(callback + '?'):
            raise ValueError('Unexpected callback')
        query = urllib.parse.parse_qs(urllib.parse.urlparse(location).query)
        if query.get('state') != [state] or 'code' not in query:
            raise ValueError('Authorization state mismatch')
    token = request(opener, issuer + '/protocol/openid-connect/token', {
        'grant_type': 'authorization_code', 'client_id': CLIENT, 'redirect_uri': callback,
        'code': query['code'][0], 'code_verifier': verifier}, form=True)['access_token']
    print(f'Authorization Code + PKCE email/password: PASS ({label})')
    return token


def verify(context, api):
    opener = urllib.request.build_opener(urllib.request.HTTPSHandler(context=context))
    for realm in sorted(set(USERS.values())):
        req = urllib.request.Request(ORIGIN + '/realms/' + realm + '/protocol/openid-connect/token',
                method='OPTIONS', headers={'Origin': 'http://localhost:8080',
                'Access-Control-Request-Method': 'POST'})
        with opener.open(req, timeout=15) as reply:
            if reply.headers.get('Access-Control-Allow-Origin') != 'http://localhost:8080':
                raise ValueError('Swagger token endpoint CORS mismatch')
    print('Exact localhost Swagger token CORS: PASS')
    grants = {}
    tokens = {}
    for label, realm in USERS.items():
        token = login(label, realm, context)
        tokens[label] = token
        path = '/api/v1/me' if realm == 'htt-staff' else '/api/portal/v1/me'
        body = request(opener, api + path, token=token)
        if realm == 'htt-staff':
            if len(body['companies']) != 1 or (('order:create' in body['companies'][0]['permissions']) != (label == 'manager')):
                raise ValueError('Unexpected staff permissions')
        else:
            if len(body['contexts']) != 1:
                raise ValueError('Unexpected customer context')
            grants[label] = body['contexts'][0]
        print(f'Real token -> Java -> PostgreSQL /me: PASS ({label})')
    for label in ('customer-a', 'customer-b'):
        own = grants[label]
        other = grants['customer-b' if label == 'customer-a' else 'customer-a']
        def branches(scope):
            req = urllib.request.Request(api + '/api/portal/v1/branches', headers={
                'Authorization': 'Bearer ' + tokens[label], 'X-Company-Id': scope['companyId'],
                'X-Portal-Grant-Id': scope['grantId']})
            return opener.open(req, timeout=15)
        with branches(own) as reply:
            body = json.load(reply)
            expected = 'DEMO-A1' if label == 'customer-a' else 'DEMO-B1'
            if [item['code'] for item in body['items']] != [expected]:
                raise ValueError('Unexpected visible branches')
        try:
            branches(other).close()
            raise ValueError('Cross-company access was permitted')
        except urllib.error.HTTPError as denied:
            if denied.code != 403:
                raise
        print(f'Own branch and cross-company 403: PASS ({label})')
    for path, token in [('/api/portal/v1/me', tokens['sales']), ('/api/v1/me', tokens['customer-a']), ('/api/v1/me', None)]:
        try:
            request(opener, api + path, token=token)
            raise ValueError('Expected 401')
        except urllib.error.HTTPError as denied:
            if denied.code != 401:
                raise
    print('Wrong realm / missing authentication 401: PASS')


def disable(opener):
    token = request(opener, ORIGIN + '/realms/master/protocol/openid-connect/token', {
        'grant_type': 'password', 'client_id': 'admin-cli', 'username': 'htt-bootstrap',
        'password': (STATE / 'secrets/bootstrap_password').read_text().strip()}, form=True)['access_token']
    for label, realm in USERS.items():
        subject = (STATE / 'demo-login' / f'{label}.subject').read_text().strip()
        url = ORIGIN + '/admin/realms/' + realm + '/users/' + subject
        user = request(opener, url, token=token)
        if user.get('username') != f'{label}@htt-demo.invalid':
            raise ValueError('Refusing to disable another user')
        user['enabled'] = False
        request(opener, url, user, token, 'PUT')
    for realm in sorted(set(USERS.values())):
        admin = ORIGIN + '/admin/realms/' + realm
        client = request(opener, admin + '/clients?clientId=' + CLIENT, token=token)[0]
        if client.get('attributes', {}).get('htt.demo.fixture') != FIXTURE:
            raise ValueError('Refusing to disable another client')
        client['enabled'] = False
        request(opener, admin + '/clients/' + client['id'], client, token, 'PUT')
    print('Only dedicated demo users/Swagger clients disabled; data and passwords retained.')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('action', choices=['provision', 'verify', 'disable'])
    parser.add_argument('--api-origin', choices=['http://127.0.0.1:18082'])
    args = parser.parse_args()
    identity = json.loads((STATE / 'identity.json').read_text())
    if identity['origin'] != ORIGIN:
        raise ValueError('Unexpected development deployment')
    context = ssl.create_default_context(cafile=str(STATE / 'tls/ca.crt'))
    if args.action == 'provision':
        provision(urllib.request.build_opener(urllib.request.HTTPSHandler(context=context)))
    elif args.action == 'disable':
        disable(urllib.request.build_opener(urllib.request.HTTPSHandler(context=context)))
    elif args.api_origin:
        verify(context, args.api_origin)
    else:
        raise ValueError('verify requires the explicit temporary SSH tunnel origin')


if __name__ == '__main__':
    try:
        main()
    except Exception as failure:
        # No URLs (codes), response bodies, passwords or tokens in failure logs.
        print('Demo login operation failed: ' + type(failure).__name__
              + (f' HTTP {failure.code}' if isinstance(failure, urllib.error.HTTPError) else ''))
        if type(failure) is ValueError:
            print(str(failure))  # Only the fixed diagnostic messages above, never an HTTP response.
        raise SystemExit(1)

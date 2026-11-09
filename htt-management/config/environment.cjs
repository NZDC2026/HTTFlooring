// Node-only configuration. Never import this module into browser application code.
const { existsSync, readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { loadEnvFile } = require('node:process');
const { parseEnv } = require('node:util');
const keys = [
  'API_PORT', 'HOST', 'HTT_DATA_DIR', 'PUBLIC_ORIGIN', 'COOKIE_SECURE',
  'HTT_OCR_HELPER', 'RESEND_API_KEY', 'WEB_ONLY',
  'HTT_ACCEPTANCE_PROFILE', 'HTT_G17_CASE', 'HTT_ROUTE_EVIDENCE',
  'HTT_RELEASE_TAG', 'CSC_LINK', 'CSC_KEY_PASSWORD', 'CSC_NAME',
  'APPLE_ID', 'APPLE_APP_SPECIFIC_PASSWORD', 'APPLE_TEAM_ID', 'CSC_IDENTITY_AUTO_DISCOVERY',
  'npm_execpath', 'VITE_DEV_SERVER_URL',
];
const example = resolve(process.cwd(), '.env.example');
const defaults = existsSync(example) ? parseEnv(readFileSync(example, 'utf8')) : {};
const file = resolve(process.cwd(), '.env');
// Existing shell / CI variables take precedence. Values are read at access time so
// temporary acceptance profiles and test overrides remain isolated and effective.
if (!(process.versions.electron && !process.defaultApp) && existsSync(file)) loadEnvFile(file);
const environment = Object.create(null);
for (const key of keys) Object.defineProperty(environment, key, {
  enumerable: true,
  get() { const value = process.env[key] ?? defaults[key]; return value === '' ? undefined : value; },
});
Object.defineProperty(environment, 'required', { value(key) {
  if (!keys.includes(key)) throw new Error('Unknown environment setting: ' + key);
  const value = environment[key];
  if (value === undefined) throw new Error('Configure ' + key + ' in .env or the process environment.');
  return value;
} });
// Preserve OS/runtime variables when launching platform tools. These are not app settings.
Object.defineProperty(environment, 'childEnvironment', { value(overrides = {}) { return { ...process.env, ...overrides }; } });
module.exports = Object.freeze(environment);

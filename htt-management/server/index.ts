import { resolve } from 'node:path';
import { createWebApplication } from './app';
const port = Number(process.env.API_PORT || 8787);
const host = process.env.HOST || '127.0.0.1';
const directory = resolve(process.env.HTT_DATA_DIR || 'web-data');
const app = createWebApplication({ directory, staticDirectory: resolve('dist-web'), publicOrigin: process.env.PUBLIC_ORIGIN, secureCookie: process.env.COOKIE_SECURE === '1' });
app.server.listen(port, host, () => console.log(`HTT web server: http://${host}:${port}\nSQLite data directory: ${directory}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { void app.close().then(() => process.exit(0)); });

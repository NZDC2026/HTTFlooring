import { copyFile, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const version = JSON.parse(await readFile('package.json', 'utf8')).version;
const source = resolve('release/download-preview');
const destination = resolve('dist-web/downloads/packages');
const filenames = [
    `HTT-Flooring-Demo-${version}-win-x64.exe`,
    `HTT-Flooring-Demo-${version}-win-arm64.exe`,
    `HTT-Flooring-Demo-${version}-mac-arm64.dmg`,
    `HTT-Flooring-Demo-${version}-mac-x64.dmg`,
];
const candidates = await readdir(source).catch(error => {
    if (error.code === 'ENOENT') return [];
    throw error;
});
if (!candidates.some(name => filenames.includes(name))) process.exit(0);
await mkdir(destination, { recursive: true });
const assets = [];
for (const name of filenames.filter(filename => candidates.includes(filename))) {
    if (!(await stat(join(source, name))).isFile()) continue;
    await copyFile(join(source, name), join(destination, name));
    assets.push({ name });
}
if (!assets.length) throw new Error('No current preview installers found.');
await writeFile(join(destination, 'manifest.json'), JSON.stringify({ assets }, null, 2) + '\n');
console.log('Staged preview installers:', assets.map(asset => asset.name).join(', '));

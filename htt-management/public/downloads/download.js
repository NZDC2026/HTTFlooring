const releaseApi = 'https://api.github.com/repos/NZDC2026/HTTFlooring/releases/latest';
const releaseAssetRoot = 'https://github.com/NZDC2026/HTTFlooring/releases/download/';
const installerName = /^HTT-Flooring-(Demo-)?(\d+\.\d+\.\d+(?:-[\w.-]+)?)-(win|mac)-(x64|arm64)\.(exe|dmg)$/;
const status = document.querySelector('#status');
const recommended = document.querySelector('#recommended');
const installers = document.querySelector('#installers');

function parseInstaller(asset, preview) {
    const match = installerName.exec(asset.name);
    if (!match) return null;
    const [, demo, version, platform, architecture, extension] = match;
    if (Boolean(demo) !== preview || (platform === 'win' ? extension !== 'exe' : extension !== 'dmg')) return null;
    const href = preview ? new URL('./packages/' + encodeURIComponent(asset.name), location.href).href : asset.browser_download_url;
    if (!preview && !href?.startsWith(releaseAssetRoot)) return null;
    return { version, platform, architecture, extension, href, preview };
}

async function getJson(url) {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return null;
    return response.json();
}

async function detectSystem() {
    const hints = navigator.userAgentData;
    const platform = hints?.platform || navigator.platform || navigator.userAgent;
    const windows = /win/i.test(platform);
    if (!windows && (!/mac/i.test(platform) || navigator.maxTouchPoints > 1)) return null;
    const details = await hints?.getHighEntropyValues?.(['architecture']).catch(() => null);
    const architecture = details?.architecture === 'arm' ? 'arm64' : details?.architecture === 'x86' ? 'x64' : null;
    return { platform: windows ? 'win' : 'mac', architecture };
}

function downloadLink(installer, primary = false) {
    const link = document.createElement('a');
    link.className = primary ? 'button primary' : 'button';
    link.href = installer.href;
    if (installer.preview) link.download = '';
    const label = installer.platform === 'win' ? (installer.architecture === 'arm64' ? 'Windows ARM64' : 'Windows x64') : installer.architecture === 'arm64' ? 'Mac · Apple silicon' : 'Mac · Intel';
    link.textContent = primary ? 'Download for ' + label : label;
    const detail = document.createElement('small');
    detail.textContent = `v${installer.version} · .${installer.extension} · ${installer.preview ? 'Unsigned preview' : 'Release'}`;
    const item = document.createElement(primary ? 'div' : 'li');
    item.append(link, detail);
    return item;
}

const [releaseResult, previewResult, systemResult] = await Promise.allSettled([
    getJson(releaseApi),
    getJson('./packages/manifest.json'),
    detectSystem(),
]);
const release = releaseResult.status === 'fulfilled' ? releaseResult.value : null;
const preview = previewResult.status === 'fulfilled' ? previewResult.value : null;
const system = systemResult.status === 'fulfilled' ? systemResult.value : null;
const assets = (release?.assets ?? []).map(asset => parseInstaller(asset, false)).filter(Boolean);
const previews = (preview?.assets ?? []).map(asset => parseInstaller(asset, true)).filter(Boolean);
const available = assets.length ? assets : previews;
installers.replaceChildren(...available.map(installer => downloadLink(installer)));

const matches = available.filter(installer => installer.platform === system?.platform);
const preferred = matches.find(installer => installer.architecture === system?.architecture)
    ?? (matches.length === 1 && !system?.architecture ? matches[0] : null);
if (preferred) {
    status.textContent = preferred.preview ? 'The current build is an unsigned preview for internal testing.' : 'The latest release for your system is ready.';
    recommended.append(downloadLink(preferred, true));
} else if (matches.length) {
    status.textContent = 'Choose the installer for your processor below.';
} else {
    status.textContent = available.length ? 'Choose an available installer below.' : 'No desktop installers are currently available.';
}

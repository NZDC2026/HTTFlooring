// Formal release is opt-in; default configuration remains an explicitly unsigned internal build.
module.exports = {
  extends: './electron-builder.yml',
  artifactName: 'HTT-Flooring-${version}-${os}-${arch}.${ext}',
  forceCodeSigning: true,
  mac: {
    identity: process.env.CSC_NAME,
    hardenedRuntime: true,
    entitlements: 'build/entitlements.mac.plist',
    entitlementsInherit: 'build/entitlements.mac.plist',
    binaries: ['Contents/Resources/ocr/htt-ocr'],
    notarize: true,
  },
  dmg: { title: 'HTT Flooring ${version}' },
  win: { signtoolOptions: { signingHashAlgorithms: ['sha256'] } },
};

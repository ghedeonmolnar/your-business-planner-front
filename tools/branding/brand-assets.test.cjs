const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '../..');
const png = file => {
  const bytes = fs.readFileSync(path.join(root, file));
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    colorType: bytes[25],
  };
};

test('pastreaza iconul furnizat si toate formatele Android de launcher', () => {
  const source = fs.readFileSync(
    path.join(root, 'assets/app-icon/ybp-icon-source.png'),
  );
  assert.equal(
    crypto.createHash('sha256').update(source).digest('hex'),
    '53ffaabb6f2912f9f126f94035369f9b09b3639a93a841b2fd39316a4a91e2cc',
  );
  for (const [density, size] of Object.entries({
    mdpi: 48,
    hdpi: 72,
    xhdpi: 96,
    xxhdpi: 144,
    xxxhdpi: 192,
  })) {
    for (const name of ['ic_launcher', 'ic_launcher_round']) {
      const image = png(
        `android/app/src/main/res/mipmap-${density}/${name}.png`,
      );
      assert.equal(image.width, size);
      assert.equal(image.height, size);
    }
  }
});

test('pastreaza logo-ul orizontal transparent pe mobil si la pornirea iOS', () => {
  const source = fs.readFileSync(path.join(root, 'assets/brand/ybp-logo.png'));
  assert.equal(
    crypto.createHash('sha256').update(source).digest('hex'),
    '5467f7b4852d0d4c8a153cc0dc032569b86859ade6f8cf98394210d3ea746440',
  );
  assert.deepEqual(
    fs.readFileSync(path.join(root, 'src/shared/branding/ybp-logo.png')),
    source,
  );
  assert.equal(png('src/shared/branding/ybp-logo.png').width, 2172);
  assert.equal(png('src/shared/branding/ybp-logo.png').height, 724);
  assert.equal(png('src/shared/branding/ybp-logo.png').colorType, 6);
  const directory = 'ios/GTEventsApp/Images.xcassets/BrandLogo.imageset';
  const catalog = JSON.parse(
    fs.readFileSync(path.join(root, directory, 'Contents.json'), 'utf8'),
  );
  for (const asset of catalog.images) {
    const scale = Number(asset.scale.replace('x', ''));
    const image = png(`${directory}/${asset.filename}`);
    assert.equal(image.width, 312 * scale);
    assert.equal(image.height, 104 * scale);
    assert.equal(image.colorType, 6);
  }
});

test('iconitele iOS sunt opace si respecta dimensiunile catalogului', () => {
  const directory = 'ios/GTEventsApp/Images.xcassets/AppIcon.appiconset';
  const catalog = JSON.parse(
    fs.readFileSync(path.join(root, directory, 'Contents.json'), 'utf8'),
  );
  for (const asset of catalog.images) {
    const size =
      Number(asset.size.split('x')[0]) * Number(asset.scale.replace('x', ''));
    const image = png(`${directory}/${asset.filename}`);
    assert.equal(image.width, size);
    assert.equal(image.height, size);
    assert.equal(image.colorType, 2);
  }
});

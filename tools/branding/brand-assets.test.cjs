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

test('pastreaza PNG-ul furnizat si toate formatele Android de launcher', () => {
  const source = fs.readFileSync(path.join(root, 'assets/brand/ybp-logo.png'));
  assert.equal(
    crypto.createHash('sha256').update(source).digest('hex'),
    'a5862b52185fc89cda355c2229e3cbafa11b1f158dca9e6fc8fd53ccdadd79d4',
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

test('foloseste logo-ul patrat pe mobil si la pornirea iOS', () => {
  assert.equal(png('src/shared/branding/ybp-logo.png').width, 512);
  assert.equal(png('src/shared/branding/ybp-logo.png').height, 512);
  const directory = 'ios/GTEventsApp/Images.xcassets/BrandLogo.imageset';
  const catalog = JSON.parse(
    fs.readFileSync(path.join(root, directory, 'Contents.json'), 'utf8'),
  );
  for (const asset of catalog.images) {
    const size = 156 * Number(asset.scale.replace('x', ''));
    const image = png(`${directory}/${asset.filename}`);
    assert.equal(image.width, size);
    assert.equal(image.height, size);
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

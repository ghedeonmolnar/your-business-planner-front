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

test('pastreaza SVG-ul furnizat si toate formatele Android de launcher', () => {
  const svg = fs.readFileSync(
    path.join(root, 'assets/brand/gatify-animated.svg'),
  );
  assert.equal(
    crypto.createHash('sha256').update(svg).digest('hex'),
    '479f748cfaccfe490165ee8a17d1ecc412f806bb0572d8cdda73b83d97ec042b',
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

const { Buffer } = require('node:buffer');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { Resvg } = require(process.argv[2]);

const repository = path.resolve(__dirname, '../..');
const source = fs.readFileSync(
  path.join(repository, 'assets/brand/gatify-animated.svg'),
  'utf8',
);
const paths = [...source.matchAll(/<clipPath[^>]*>(.*?)<\/clipPath>/gs)][0][1];
const letters = [...paths.matchAll(/<path d="([^"]+)"\/>/g)].map(
  match => match[1],
);
if (letters.length !== 6) throw new Error('LOGO_PATHS_INVALID');
const ink = source.match(/style="color:([^";]+)/)[1];
const word = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 50 1400 410" width="280" height="82"><g fill="${ink}">${letters.map(letter => `<path d="${letter}"/>`).join('')}</g></svg>`;
const mark = round =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="400 -53 608 608" width="608" height="608">${round ? '<circle cx="704" cy="251" r="304" fill="white"/>' : '<path fill="white" d="M400-53h608v608H400z"/>'}<g fill="${ink}"><path transform="translate(414 0)" d="${letters[0]}"/><path transform="translate(140 0)" d="${letters[2]}"/></g></svg>`;
const write = (relative, data) => {
  const target = path.resolve(repository, relative);
  const workspace = path.dirname(repository);
  if (!target.startsWith(workspace + path.sep))
    throw new Error('LOGO_OUTPUT_REFUSED');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, data);
};
const chunk = (type, content) => {
  const name = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(content.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(zlib.crc32(Buffer.concat([name, content])));
  return Buffer.concat([length, name, content, checksum]);
};
const rgbPng = image => {
  const pixels = image.pixels;
  const rows = Buffer.alloc((image.width * 3 + 1) * image.height);
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const sourceOffset = (y * image.width + x) * 4;
      const targetOffset = y * (image.width * 3 + 1) + 1 + x * 3;
      pixels.copy(rows, targetOffset, sourceOffset, sourceOffset + 3);
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(image.width, 0);
  header.writeUInt32BE(image.height, 4);
  header[8] = 8;
  header[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', zlib.deflateSync(rows)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};
const render = (svg, width, opaque = false) => {
  const image = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
  }).render();
  return opaque ? rgbPng(image) : image.asPng();
};
for (const [density, size] of Object.entries({
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192,
})) {
  write(
    `android/app/src/main/res/mipmap-${density}/ic_launcher.png`,
    render(mark(false), size, true),
  );
  write(
    `android/app/src/main/res/mipmap-${density}/ic_launcher_round.png`,
    render(mark(true), size),
  );
}
const icons = 'ios/GTEventsApp/Images.xcassets/AppIcon.appiconset';
for (const image of JSON.parse(
  fs.readFileSync(path.join(repository, icons, 'Contents.json'), 'utf8'),
).images) {
  const size =
    Number(image.size.split('x')[0]) * Number(image.scale.replace('x', ''));
  write(`${icons}/${image.filename}`, render(mark(false), size, true));
}
const launch = 'ios/GTEventsApp/Images.xcassets/GatifyLogo.imageset';
const launchImages = [1, 2, 3].map(scale => {
  const filename = `gatify-${scale}x.png`;
  write(`${launch}/${filename}`, render(word, 280 * scale));
  return { idiom: 'universal', filename, scale: `${scale}x` };
});
write(
  `${launch}/Contents.json`,
  JSON.stringify(
    { images: launchImages, info: { author: 'xcode', version: 1 } },
    null,
    2,
  ) + '\n',
);
write('assets/brand/gatify-static.png', render(word, 840));
write('assets/app-icon/gatify-icon.png', render(mark(false), 1024, true));
const api = path.resolve(repository, '../business-api');
if (fs.existsSync(api)) {
  write('../business-api/public/brand/gatify-static.png', render(word, 840));
  const png = render(mark(false), 64, true);
  const ico = Buffer.alloc(22);
  ico.writeUInt16LE(1, 2);
  ico.writeUInt16LE(1, 4);
  ico[6] = 64;
  ico[7] = 64;
  ico.writeUInt16LE(1, 10);
  ico.writeUInt16LE(24, 12);
  ico.writeUInt32LE(png.length, 14);
  ico.writeUInt32LE(22, 18);
  write('../business-api/public/favicon.ico', Buffer.concat([ico, png]));
}

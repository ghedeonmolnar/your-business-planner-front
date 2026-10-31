const { Buffer } = require('node:buffer');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { Resvg } = require(process.argv[2]);

const repository = path.resolve(__dirname, '../..');
const source = fs.readFileSync(
  path.join(repository, 'assets/brand/ybp-logo.png'),
);
const sourceWidth = source.readUInt32BE(16);
const sourceHeight = source.readUInt32BE(20);
if (sourceWidth !== sourceHeight || sourceWidth < 1024)
  throw new Error('LOGO_SQUARE_MINIMUM_1024_REQUIRED');
const image = `<image width="${sourceWidth}" height="${sourceHeight}" href="data:image/png;base64,${source.toString('base64')}"/>`;
const mark = round =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sourceWidth} ${sourceHeight}">${round ? `<defs><clipPath id="round"><circle cx="${sourceWidth / 2}" cy="${sourceHeight / 2}" r="${sourceWidth / 2}"/></clipPath></defs><g clip-path="url(#round)">${image}</g>` : image}</svg>`;
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
const rgbPng = rendered => {
  const pixels = rendered.pixels;
  const rows = Buffer.alloc((rendered.width * 3 + 1) * rendered.height);
  for (let y = 0; y < rendered.height; y++) {
    for (let x = 0; x < rendered.width; x++) {
      const sourceOffset = (y * rendered.width + x) * 4;
      const targetOffset = y * (rendered.width * 3 + 1) + 1 + x * 3;
      pixels.copy(rows, targetOffset, sourceOffset, sourceOffset + 3);
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(rendered.width, 0);
  header.writeUInt32BE(rendered.height, 4);
  header[8] = 8;
  header[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', zlib.deflateSync(rows)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};
const render = (width, round = false) => {
  const rendered = new Resvg(mark(round), {
    fitTo: { mode: 'width', value: width },
  }).render();
  return round ? rendered.asPng() : rgbPng(rendered);
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
    render(size),
  );
  write(
    `android/app/src/main/res/mipmap-${density}/ic_launcher_round.png`,
    render(size, true),
  );
}
const icons = 'ios/GTEventsApp/Images.xcassets/AppIcon.appiconset';
for (const asset of JSON.parse(
  fs.readFileSync(path.join(repository, icons, 'Contents.json'), 'utf8'),
).images) {
  const size =
    Number(asset.size.split('x')[0]) * Number(asset.scale.replace('x', ''));
  write(`${icons}/${asset.filename}`, render(size));
}
const launch = 'ios/GTEventsApp/Images.xcassets/BrandLogo.imageset';
const launchLogoWidth = 156;
const launchImages = [1, 2, 3].map(scale => {
  const filename = `ybp-${scale}x.png`;
  write(`${launch}/${filename}`, render(launchLogoWidth * scale));
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
const displayLogoWidth = 512;
write('src/shared/branding/ybp-logo.png', render(displayLogoWidth));
write('assets/app-icon/ybp-icon.png', render(1024));
if (fs.existsSync(path.resolve(repository, '../business-api'))) {
  write('../business-api/public/brand/ybp-logo.png', render(displayLogoWidth));
  const faviconSize = 64;
  const png = render(faviconSize);
  const ico = Buffer.alloc(22);
  ico.writeUInt16LE(1, 2);
  ico.writeUInt16LE(1, 4);
  ico[6] = faviconSize;
  ico[7] = faviconSize;
  ico.writeUInt16LE(1, 10);
  ico.writeUInt16LE(24, 12);
  ico.writeUInt32LE(png.length, 14);
  ico.writeUInt32LE(22, 18);
  write('../business-api/public/favicon.ico', Buffer.concat([ico, png]));
}

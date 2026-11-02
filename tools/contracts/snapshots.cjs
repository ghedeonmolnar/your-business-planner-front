const fs = require('node:fs');
const path = require('node:path');

const contractFiles = ['openapi.json', 'limitations.json'];
const isObject = value =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

function readContractSnapshots(directory) {
  const snapshots = Object.fromEntries(
    contractFiles.map(file => [
      file,
      fs
        .readFileSync(path.join(directory, file), 'utf8')
        .replace(/\r\n/g, '\n'),
    ]),
  );
  const specification = JSON.parse(snapshots['openapi.json']);
  const limitations = JSON.parse(snapshots['limitations.json']);
  if (
    !isObject(specification) ||
    typeof specification.openapi !== 'string' ||
    !/^3\.1\.\d+$/.test(specification.openapi) ||
    !isObject(specification.paths) ||
    !isObject(specification.components) ||
    !isObject(limitations) ||
    !Array.isArray(limitations.unresolved_types) ||
    !limitations.unresolved_types.every(value => typeof value === 'string') ||
    !isObject(limitations.generator_diagnostics) ||
    !Object.values(limitations.generator_diagnostics).every(
      value => Number.isInteger(value) && value >= 0,
    )
  ) {
    throw new Error(
      'Contractul OpenAPI 3.1 sau inventarul limitarilor este invalid.',
    );
  }
  return snapshots;
}

function verifyContractSnapshots(repository) {
  const local = readContractSnapshots(path.join(repository, 'contracts'));
  const backend = path.resolve(repository, '../business-api');
  if (!fs.existsSync(backend)) return;
  const source = readContractSnapshots(path.join(backend, 'contracts'));
  for (const file of contractFiles) {
    if (local[file] !== source[file]) {
      throw new Error(`${file} difera de backend. Ruleaza npm run api:sync.`);
    }
  }
}

function syncContractSnapshots(source, destination) {
  const snapshots = readContractSnapshots(source);
  fs.mkdirSync(destination, { recursive: true });
  for (const [file, contents] of Object.entries(snapshots)) {
    fs.writeFileSync(path.join(destination, file), contents);
  }
}

module.exports = {
  readContractSnapshots,
  verifyContractSnapshots,
  syncContractSnapshots,
};

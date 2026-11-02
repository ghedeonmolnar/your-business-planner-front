const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const {
  readContractSnapshots,
  verifyContractSnapshots,
  syncContractSnapshots,
} = require('./snapshots.cjs');

function fixture(t) {
  const workspace = fs.mkdtempSync(
    path.join(os.tmpdir(), 'planner-snapshots-'),
  );
  t.after(() => fs.rmSync(workspace, { recursive: true }));
  const frontend = path.join(workspace, 'business-front');
  const backend = path.join(workspace, 'business-api/contracts');
  const destination = path.join(frontend, 'contracts');
  fs.mkdirSync(backend, { recursive: true });
  fs.writeFileSync(
    path.join(backend, 'openapi.json'),
    JSON.stringify({ openapi: '3.1.0', paths: {}, components: {} }) + '\n',
  );
  fs.writeFileSync(
    path.join(backend, 'limitations.json'),
    JSON.stringify({ unresolved_types: [], generator_diagnostics: {} }) + '\n',
  );
  syncContractSnapshots(backend, destination);
  return { frontend, backend, destination };
}

test('verificarea detecteaza un inventar diferit chiar daca OpenAPI coincide', t => {
  const { frontend, backend } = fixture(t);
  fs.writeFileSync(
    path.join(backend, 'limitations.json'),
    JSON.stringify({ unresolved_types: ['/new'], generator_diagnostics: {} }),
  );
  assert.throws(
    () => verifyContractSnapshots(frontend),
    /limitations.json difera/,
  );
});

test('sincronizarea refuza intrari incomplete fara sa rescrie snapshotul curent', t => {
  const { backend, destination } = fixture(t);
  const original = readContractSnapshots(destination);
  fs.writeFileSync(
    path.join(backend, 'openapi.json'),
    JSON.stringify({ openapi: '3.1.0', paths: { '/new': {} }, components: {} }),
  );
  for (const invalid of [
    '{',
    'null',
    '{"unresolved_types":[],"generator_diagnostics":[]}',
  ]) {
    fs.writeFileSync(path.join(backend, 'limitations.json'), invalid);
    assert.throws(() => syncContractSnapshots(backend, destination));
    assert.deepEqual(readContractSnapshots(destination), original);
  }
  fs.unlinkSync(path.join(backend, 'limitations.json'));
  assert.throws(() => syncContractSnapshots(backend, destination));
  assert.deepEqual(readContractSnapshots(destination), original);
});

test('verificarea accepta CRLF si checkout frontend izolat', t => {
  const { frontend, backend, destination } = fixture(t);
  for (const [file, contents] of Object.entries(
    readContractSnapshots(destination),
  )) {
    fs.writeFileSync(
      path.join(destination, file),
      contents.replace(/\n/g, '\r\n'),
    );
  }
  assert.doesNotThrow(() => verifyContractSnapshots(frontend));
  fs.renameSync(
    path.dirname(backend),
    path.join(path.dirname(frontend), 'api-hidden'),
  );
  assert.doesNotThrow(() => verifyContractSnapshots(frontend));
});

test('checkout API prezent dar incomplet nu este ignorat', t => {
  const { frontend, backend } = fixture(t);
  fs.unlinkSync(path.join(backend, 'openapi.json'));
  assert.throws(() => verifyContractSnapshots(frontend));
});

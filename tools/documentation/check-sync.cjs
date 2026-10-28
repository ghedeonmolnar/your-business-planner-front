const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const repository = path.resolve(__dirname, '../..');
const manifestPath = path.join(repository, 'docs/documentation-manifest.json');
const documents = [
  'AGENTS.md',
  'PROJECT_SCHEMA.md',
  'docs/ROADMAP_LANSARE.md',
  'docs/PLAN_CALITATE_2026-10-26.md',
  'docs/PROJECT_SCHEMA_ISTORIC_2026-10-26.md',
  'docs/RECUPERARE_SI_DEPLOY.md',
  'docs/INVENTAR_LEGACY_2026-10-27.md',
  'docs/IMPLEMENTARE_PLAN_CALITATE_2026-10-27.md',
  'docs/DEMO_PREZENTARE.md',
];
const digest = file =>
  crypto
    .createHash('sha256')
    .update(
      fs
        .readFileSync(file, 'utf8')
        .replace(/^\uFEFF/, '')
        .replace(/\r\n/g, '\n')
        .trimEnd() + '\n',
    )
    .digest('hex');

if (process.argv.includes('--update')) {
  const hashes = Object.fromEntries(
    documents.map(document => [
      document,
      digest(path.join(repository, document)),
    ]),
  );
  fs.writeFileSync(manifestPath, JSON.stringify(hashes, null, 2) + '\n');
} else {
  const expected = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const workspace = path.dirname(repository);
  const copies = [repository];
  if (
    fs.existsSync(path.join(workspace, 'business-api/AGENTS.md')) &&
    fs.existsSync(path.join(workspace, 'business-front/AGENTS.md'))
  ) {
    copies.push(
      workspace,
      path.join(
        workspace,
        path.basename(repository) === 'business-api'
          ? 'business-front'
          : 'business-api',
      ),
    );
  }
  const failures = [];
  for (const document of documents) {
    for (const copy of copies) {
      const file = path.join(copy, document);
      if (!fs.existsSync(file) || digest(file) !== expected[document])
        failures.push(`${path.basename(copy)}: ${document}`);
    }
  }
  if (failures.length) {
    process.stderr.write(
      `Documentatie nesincronizata:\n${failures.join('\n')}\n`,
    );
    process.exitCode = 1;
  } else
    process.stdout.write('Documentatia si manifestul sunt sincronizate.\n');
}

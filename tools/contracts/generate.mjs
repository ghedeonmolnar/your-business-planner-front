import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@hey-api/openapi-ts';
import snapshots from './snapshots.cjs';

const repository = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const input = path.join(repository, 'contracts/openapi.json');
const destination = path.join(repository, 'src/shared/api/generated');
const checking = process.argv.includes('--check');
if (checking) snapshots.verifyContractSnapshots(repository);
const temporary = checking
  ? fs.mkdtempSync(path.join(os.tmpdir(), 'planner-contract-'))
  : null;

try {
  await createClient({
    configFile: false,
    input,
    output: temporary ?? destination,
    plugins: [{ name: '@hey-api/typescript', comments: false }],
  });
  if (checking) {
    const files = fs.readdirSync(temporary).sort();
    const existing = fs.existsSync(destination)
      ? fs.readdirSync(destination).sort()
      : [];
    const normalize = file =>
      fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
    if (
      JSON.stringify(files) !== JSON.stringify(existing) ||
      files.some(
        file =>
          normalize(path.join(temporary, file)) !==
          normalize(path.join(destination, file)),
      )
    ) {
      throw new Error(
        'Tipurile generate sunt invechite. Ruleaza npm run api:generate.',
      );
    }
  }
} finally {
  if (
    temporary &&
    path.dirname(fs.realpathSync(temporary)) === fs.realpathSync(os.tmpdir()) &&
    path.basename(temporary).startsWith('planner-contract-')
  ) {
    fs.rmSync(temporary, { recursive: true });
  }
}

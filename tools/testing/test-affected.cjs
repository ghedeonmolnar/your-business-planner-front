const path = require('node:path');
const { readChanges } = require('./changes.cjs');
const {
  parseOptions,
  capture,
  executeTests,
  reportSelection,
} = require('./cli.cjs');
const { selectFrontend } = require('./frontend-impact.cjs');

const root = path.resolve(__dirname, '../..');
const jest = path.join(root, 'node_modules/jest/bin/jest.js');

function listTests(argumentsList = []) {
  const output = capture(
    process.execPath,
    [jest, '--listTests', '--json', '--runInBand', ...argumentsList],
    root,
  );
  const tests = JSON.parse(output);
  if (
    !Array.isArray(tests) ||
    tests.some(
      test =>
        typeof test !== 'string' || path.relative(root, test).startsWith('..'),
    )
  ) {
    throw new Error('Jest a returnat o lista de teste invalida.');
  }
  return tests
    .map(test => path.relative(root, test).split(path.sep).join('/'))
    .sort();
}

function main() {
  const options = parseOptions(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(
      'npm run test:affected -- [--base=origin/main] [--list]\n',
    );
    return 0;
  }
  const snapshot = readChanges(root, options.base);
  const selection = selectFrontend(snapshot, source =>
    listTests(['--findRelatedTests', source]),
  );
  const tests = selection.mode === 'full' ? listTests() : selection.tests;
  if (selection.mode !== 'none' && !tests.length) {
    throw new Error(
      'Selectia nu contine teste. Verifica instalarea si configuratia Jest.',
    );
  }
  reportSelection(snapshot, selection, tests);
  if (options.list || selection.mode === 'none') {
    return 0;
  }
  const argumentsList = [jest, '--runInBand'];
  if (selection.mode === 'affected') {
    argumentsList.push('--runTestsByPath', ...tests);
  }
  return executeTests(process.execPath, argumentsList, root);
}

try {
  process.exitCode = main();
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}

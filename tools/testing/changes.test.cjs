const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  git,
  parseDiff,
  readChanges,
  initialSelection,
} = require('./changes.cjs');
const { parseOptions, executeTests } = require('./cli.cjs');

test('parseaza nume cu spatii, taburi si newline fara a pierde stergerile sau redenumirile', () => {
  assert.deepEqual(
    parseDiff(
      'M\0src/a b.ts\0D\0src/old.ts\0R100\0src/before.ts\0src/after\n\t.ts\0',
    ),
    [
      { status: 'M', path: 'src/a b.ts' },
      { status: 'D', path: 'src/old.ts' },
      { status: 'R100', path: 'src/before.ts' },
      { status: 'R100', path: 'src/after\n\t.ts' },
    ],
  );
  assert.throws(() => parseDiff('R100\0old.ts\0'), /incompleta/);
});

test('include commituri, staged, unstaged si untracked fata de baza comuna', context => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'planner-affected-'));
  context.after(() => {
    assert.equal(path.dirname(root), path.resolve(os.tmpdir()));
    fs.rmSync(root, { recursive: true, force: true });
  });
  git(root, ['init', '--quiet']);
  fs.writeFileSync(path.join(root, 'committed.txt'), 'initial');
  fs.writeFileSync(path.join(root, 'staged.txt'), 'initial');
  fs.writeFileSync(path.join(root, 'unstaged.txt'), 'initial');
  git(root, ['add', '.']);
  const commit = [
    '-c',
    'user.name=Selector Test',
    '-c',
    'user.email=selector@example.test',
    '-c',
    'commit.gpgsign=false',
    'commit',
    '--quiet',
    '-m',
  ];
  git(root, [...commit, 'initial']);
  git(root, ['branch', 'selection-base']);
  fs.writeFileSync(path.join(root, 'committed.txt'), 'committed');
  git(root, ['add', 'committed.txt']);
  git(root, [...commit, 'change']);
  fs.writeFileSync(path.join(root, 'staged.txt'), 'staged');
  git(root, ['add', 'staged.txt']);
  fs.writeFileSync(path.join(root, 'unstaged.txt'), 'unstaged');
  fs.writeFileSync(path.join(root, 'new file.txt'), 'new');
  const snapshot = readChanges(root, 'selection-base');
  assert.equal(snapshot.error, null);
  assert.deepEqual(snapshot.changes.map(change => change.path).sort(), [
    'committed.txt',
    'new file.txt',
    'staged.txt',
    'unstaged.txt',
  ]);
  assert.equal(
    initialSelection(readChanges(root, 'missing-base')).mode,
    'full',
  );
});

test('calculeaza merge-base si pastreaza separat cele trei diferente Git', () => {
  const calls = [];
  const snapshot = readChanges('.', 'origin/main', (_root, argumentsList) => {
    calls.push(argumentsList);
    if (argumentsList[0] === 'merge-base') {
      return 'a'.repeat(40);
    }
    if (argumentsList[0] === 'ls-files') {
      return 'src/new.ts\0';
    }
    return argumentsList.includes('--cached')
      ? 'D\0src/removed.ts\0'
      : 'M\0src/changed.ts\0';
  });
  assert.equal(calls[1][4], 'a'.repeat(40));
  assert.equal(snapshot.changes.length, 3);
  assert.equal(initialSelection(snapshot).mode, 'full');
});

test('doar documentatia si absenta modificarilor pot omite testele', () => {
  assert.equal(initialSelection({ changes: [], error: null }).mode, 'none');
  assert.equal(
    initialSelection({
      changes: [{ status: 'M', path: 'docs/guide.md' }],
      error: null,
    }).mode,
    'none',
  );
  assert.equal(
    initialSelection({
      changes: [{ status: 'D', path: 'README.md' }],
      error: null,
    }).mode,
    'full',
  );
  assert.equal(
    initialSelection({
      changes: [{ status: 'M', path: 'src/guide.md' }],
      error: null,
    }),
    null,
  );
});

test('deduplica sursele fara a pierde un status distructiv intre index si working tree', () => {
  for (const status of ['A', 'D', 'R100']) {
    const snapshot = readChanges('.', 'origin/main', (_root, argumentsList) => {
      if (argumentsList[0] === 'merge-base') {
        return 'a'.repeat(40);
      }
      if (argumentsList[0] === 'ls-files') {
        return '';
      }
      if (argumentsList.includes('--cached')) {
        return status === 'R100'
          ? 'R100\0src/old.ts\0src/file.ts\0'
          : `${status}\0src/file.ts\0`;
      }
      return 'M\0src/file.ts\0';
    });
    assert.equal(
      snapshot.changes.filter(change => change.path === 'src/file.ts').length,
      1,
    );
    assert.equal(
      snapshot.changes.find(change => change.path === 'src/file.ts').status,
      status,
    );
    assert.equal(
      initialSelection(snapshot)?.mode,
      status === 'A' ? undefined : 'full',
    );
  }
});

test('valideaza optiunile fara a permite argumente care schimba selectia runnerului', () => {
  assert.equal(
    parseOptions(['--base', 'feature/base', '--list']).base,
    'feature/base',
  );
  assert.equal(parseOptions(['--base=origin/main', '--list']).list, true);
  assert.equal(
    parseOptions(['--configuration=phpunit.mysql.xml'], true).configuration,
    'phpunit.mysql.xml',
  );
  for (const argumentsList of [
    ['--base'],
    ['--base='],
    ['--base=--help'],
    ['--passWithNoTests'],
    ['--configuration=other.xml'],
  ]) {
    assert.throws(() => parseOptions(argumentsList, true));
  }
  assert.throws(() => parseOptions(['--configuration=phpunit.mysql.xml']));
});

test('esecul runnerului se propaga si nu poate produce un gate verde', context => {
  context.mock.method(process.stdout, 'write', () => true);
  assert.equal(
    executeTests(process.execPath, ['-e', 'process.exit(7)'], process.cwd()),
    7,
  );
  assert.equal(
    executeTests(process.execPath, ['-e', 'process.exit(0)'], process.cwd()),
    0,
  );
});

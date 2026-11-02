const assert = require('node:assert/strict');
const path = require('node:path');
const { test } = require('node:test');
const { ESLint } = require('eslint');

const repository = path.resolve(__dirname, '../..');
const eslint = new ESLint({ cwd: repository });
const errorsFor = async (file, dependency) => {
  const [result] = await eslint.lintText(
    `import * as dependency from '${dependency}';\nvoid dependency;\n`,
    {
      filePath: path.join(repository, file),
    },
  );
  return result.messages.filter(message =>
    message.ruleId?.startsWith('boundaries/'),
  );
};

test('shared nu poate importa un feature prin aliasul TypeScript', async () => {
  const errors = await errorsFor(
    'src/shared/utils/architectureProbe.ts',
    '@/features/auth/AuthProvider',
  );
  assert.ok(errors.some(error => error.ruleId === 'boundaries/dependencies'));
});

test('un feature nu poate adauga implicit o dependenta noua', async () => {
  const errors = await errorsFor(
    'src/features/analytics/utils/architectureProbe.ts',
    '@/features/halls/types',
  );
  assert.ok(errors.some(error => error.ruleId === 'boundaries/dependencies'));
});

test('dependentele comune si cele existente explicit raman permise', async () => {
  assert.deepEqual(
    await errorsFor(
      'src/features/analytics/utils/architectureProbe.ts',
      '@/shared/utils/money',
    ),
    [],
  );
  assert.deepEqual(
    await errorsFor(
      'src/features/bookings/utils/architectureProbe.ts',
      '@/features/halls/types',
    ),
    [],
  );
});

test('un feature nou necesita clasificare explicita', async () => {
  const errors = await errorsFor(
    'src/features/unclassified/screens/architectureProbe.tsx',
    '@/shared/utils/money',
  );
  assert.ok(
    errors.some(error => error.ruleId === 'boundaries/no-unknown-files'),
  );
});

test('codul de productie nu poate importa suportul comun de teste', async () => {
  const errors = await errorsFor(
    'src/features/auth/utils/architectureProbe.ts',
    '@/shared/test/renderWithProviders',
  );
  assert.ok(errors.some(error => error.ruleId === 'boundaries/dependencies'));
});

for (const [file, dependency] of [
  [
    'src/features/auth/utils/architectureProbe.ts',
    '@/features/auth/AuthProvider.test',
  ],
  [
    'src/features/halls/utils/architectureProbe.ts',
    '@/features/halls/utils/hallTestFixtures',
  ],
  [
    'src/features/bookings/utils/architectureProbe.ts',
    '@/features/halls/utils/hallTestFixtures',
  ],
  ['src/app/architectureProbe.ts', '@/features/auth/AuthProvider.test'],
]) {
  test(`productia refuza importul de test ${dependency} din ${file}`, async () => {
    const errors = await errorsFor(file, dependency);
    assert.ok(errors.some(error => error.ruleId === 'boundaries/dependencies'));
  });
}

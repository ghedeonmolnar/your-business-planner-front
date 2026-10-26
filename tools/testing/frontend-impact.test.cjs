const assert = require('node:assert/strict');
const { test } = require('node:test');
const { selectFrontend } = require('./frontend-impact.cjs');

function snapshot(...paths) {
  return { error: null, changes: paths.map(path => ({ status: 'M', path })) };
}

test('selecteaza dependentii unei componente izolate, inclusiv teste din alte feature-uri', () => {
  const result = selectFrontend(
    snapshot('src/features/halls/components/HallBasicsFields.tsx'),
    () => [
      'src/features/halls/screens/HallFormScreen.test.tsx',
      'src/app/navigation/RootNavigator.test.tsx',
    ],
  );
  assert.equal(result.mode, 'affected');
  assert.equal(result.tests.length, 2);
  assert.equal(
    result.tests.some(file => file.includes('/auth/')),
    false,
  );
});

test('include testele modificate si elimina duplicatele din dependentele tranzitive', () => {
  const changedTest = 'src/features/halls/screens/HallFormScreen.test.tsx';
  const result = selectFrontend(
    snapshot('src/features/halls/components/HallBasicsFields.tsx', changedTest),
    () => [changedTest],
  );
  assert.deepEqual(result.tests, [changedTest]);
});

test('clientul API, sesiunea, autentificarea, configul si infrastructura cer rulare completa', () => {
  for (const file of [
    'src/shared/api/client.ts',
    'src/shared/storage/authTokenStorage.ts',
    'src/features/auth/screens/LoginScreen.tsx',
    'src/app/navigation/RootNavigator.tsx',
    'src/shared/navigation/createResettingTabScreen.tsx',
    'jest.config.js',
    'package-lock.json',
    'tools/testing/test-affected.cjs',
    'android/app/build.gradle',
  ]) {
    const result = selectFrontend(snapshot(file), () =>
      assert.fail('Nu trebuie limitata selectia pentru fisiere globale.'),
    );
    assert.equal(result.mode, 'full', file);
  }
});

test('un fisier fara teste cere rulare completa chiar daca alte fisiere au dependenti', () => {
  const result = selectFrontend(
    snapshot('src/features/halls/known.ts', 'src/features/halls/new.ts'),
    file => (file.endsWith('known.ts') ? ['known.test.ts'] : []),
  );
  assert.equal(result.mode, 'full');
  assert.match(result.reason, /new\.ts/);
});

test('erorile de descoperire sunt propagate si nu devin selectie goala acceptata', () => {
  assert.throws(
    () =>
      selectFrontend(snapshot('src/features/halls/known.ts'), () => {
        throw new Error('Jest failed');
      }),
    /Jest failed/,
  );
});

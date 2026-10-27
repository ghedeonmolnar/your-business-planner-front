const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseBase } = require('./quality-control.cjs');

test('refuza orice tinta fara loopback explicit si prefix API exact', () => {
  for (const value of [
    'https://production.invalid/api',
    'http://127.0.0.1:8010',
    'http://localhost:8010/api',
    'http://user:private@127.0.0.1:8010/api',
    'http://127.0.0.1:8010/api?token=private',
    'http://127.0.0.1:8010/api#private',
  ]) {
    assert.throws(() => parseBase(value), /LOCAL_TEST_API_REQUIRED/);
  }
  assert.equal(parseBase('http://127.0.0.1:8011/api').port, '8011');
});

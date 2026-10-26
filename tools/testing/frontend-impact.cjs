const { isDocumentation, initialSelection } = require('./changes.cjs');

const GLOBAL_PATH =
  /^(?:src\/app\/|src\/features\/auth\/|src\/shared\/(?:api|auth|session|storage|test|notifications|navigation)\/|__mocks__\/)/;
const SOURCE_PATH =
  /^(?:src\/.*\.[cm]?[jt]sx?|__tests__\/.*\.test\.[cm]?[jt]sx?)$/;

function selectFrontend(snapshot, findRelatedTests) {
  const initial = initialSelection(snapshot);
  if (initial) {
    return { ...initial, tests: [] };
  }
  const changedSources = snapshot.changes
    .map(change => change.path)
    .filter(path => !isDocumentation(path));
  const globalPath = changedSources.find(
    path => GLOBAL_PATH.test(path) || !SOURCE_PATH.test(path),
  );
  if (globalPath) {
    return {
      mode: 'full',
      reason: `Fisier global sau neclasificat: ${globalPath}`,
      tests: [],
    };
  }
  const selected = new Set();
  for (const source of changedSources) {
    const related = findRelatedTests(source);
    if (!related.length) {
      return {
        mode: 'full',
        reason: `Nu au fost identificate teste pentru ${source}`,
        tests: [],
      };
    }
    related.forEach(test => selected.add(test));
  }
  return {
    mode: 'affected',
    reason: 'Dependentele directe si indirecte identificate de Jest.',
    tests: [...selected].sort(),
  };
}

module.exports = { selectFrontend };

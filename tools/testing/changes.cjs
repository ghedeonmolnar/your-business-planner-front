const { spawnSync } = require('node:child_process');

const MAX_GIT_OUTPUT_BYTES = 16 * 1024 * 1024;

function git(root, argumentsList) {
  const result = spawnSync('git', argumentsList, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: MAX_GIT_OUTPUT_BYTES,
  });
  if (result.error || result.status !== 0) {
    throw new Error(`Git nu poate executa ${argumentsList[0]}.`);
  }
  return result.stdout;
}

function parseDiff(output) {
  const fields = output.split('\0');
  const changes = [];
  for (let index = 0; index < fields.length && fields[index]; index += 2) {
    const status = fields[index];
    const path = fields[index + 1];
    if (!path) {
      throw new Error('Lista Git a modificarilor este incompleta.');
    }
    changes.push({ status, path });
    if (/^[RC]/.test(status)) {
      index += 1;
      if (!fields[index + 1]) {
        throw new Error('Lista Git a redenumirilor este incompleta.');
      }
      changes.push({ status, path: fields[index + 1] });
    }
  }
  return changes;
}

function readChanges(root, base, execute = git) {
  try {
    const mergeBase = execute(root, ['merge-base', base, 'HEAD']).trim();
    if (!/^[a-f0-9]{40,64}$/.test(mergeBase)) {
      throw new Error('Baza comuna Git nu este valida.');
    }
    const changes = [
      ...parseDiff(
        execute(root, [
          'diff',
          '--name-status',
          '-z',
          '--find-renames',
          mergeBase,
          'HEAD',
          '--',
        ]),
      ),
      ...parseDiff(
        execute(root, [
          'diff',
          '--cached',
          '--name-status',
          '-z',
          '--find-renames',
          '--',
        ]),
      ),
      ...parseDiff(
        execute(root, ['diff', '--name-status', '-z', '--find-renames', '--']),
      ),
      ...execute(root, ['ls-files', '--others', '--exclude-standard', '-z'])
        .split('\0')
        .filter(Boolean)
        .map(path => ({ status: 'A', path })),
    ];
    const uniqueChanges = new Map();
    for (const change of changes) {
      const previous = uniqueChanges.get(change.path);
      if (
        !previous ||
        (/^[AM]$/.test(previous.status) && change.status !== 'M')
      ) {
        uniqueChanges.set(change.path, change);
      }
    }
    return {
      base,
      mergeBase,
      changes: [...uniqueChanges.values()],
      error: null,
    };
  } catch (error) {
    return { base, mergeBase: null, changes: [], error: error.message };
  }
}

function isDocumentation(path) {
  return /^(?:[^/]+\.md|docs\/.*\.md|LICENSE(?:\.txt)?)$/i.test(path);
}

function initialSelection(snapshot) {
  if (snapshot.error) {
    return { mode: 'full', reason: snapshot.error };
  }
  if (snapshot.changes.some(change => !/^[AM]$/.test(change.status))) {
    return {
      mode: 'full',
      reason: 'Exista stergeri, redenumiri sau stari Git neclasificate.',
    };
  }
  if (snapshot.changes.every(change => isDocumentation(change.path))) {
    return {
      mode: 'none',
      reason: snapshot.changes.length
        ? 'Doar documentatie.'
        : 'Nu exista modificari.',
    };
  }
  return null;
}

module.exports = {
  git,
  parseDiff,
  readChanges,
  isDocumentation,
  initialSelection,
};

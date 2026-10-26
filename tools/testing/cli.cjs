const { spawnSync } = require('node:child_process');
const { appendFileSync } = require('node:fs');

const MAX_DISCOVERY_OUTPUT_BYTES = 16 * 1024 * 1024;

function parseOptions(argumentsList, allowConfiguration = false) {
  const options = {
    base: 'origin/main',
    list: false,
    configuration: 'phpunit.xml',
    help: false,
  };
  const valueOptions = allowConfiguration
    ? ['--base', '--configuration']
    : ['--base'];
  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument === '--list' || argument === '--help') {
      options[argument.slice(2)] = true;
      continue;
    }
    const separator = argument.indexOf('=');
    const name = separator < 0 ? argument : argument.slice(0, separator);
    if (!valueOptions.includes(name)) {
      throw new Error(`Optiune necunoscuta: ${argument}`);
    }
    const value =
      separator < 0 ? argumentsList[++index] : argument.slice(separator + 1);
    if (!value || value.startsWith('-')) {
      throw new Error(`Lipseste valoarea valida pentru ${name}.`);
    }
    options[name.slice(2)] = value;
  }
  if (!['phpunit.xml', 'phpunit.mysql.xml'].includes(options.configuration)) {
    throw new Error(
      'Configuratia acceptata este phpunit.xml sau phpunit.mysql.xml.',
    );
  }
  return options;
}

function capture(command, argumentsList, root) {
  const result = spawnSync(command, argumentsList, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: MAX_DISCOVERY_OUTPUT_BYTES,
  });
  if (result.error || result.status !== 0) {
    throw new Error(
      result.error?.message ||
        result.stderr ||
        'Descoperirea testelor a esuat.',
    );
  }
  return result.stdout;
}

function executeTests(command, argumentsList, root) {
  const started = Date.now();
  const result = spawnSync(command, argumentsList, {
    cwd: root,
    stdio: 'inherit',
  });
  process.stdout.write(
    `Durata executiei: ${((Date.now() - started) / 1000).toFixed(1)} s\n`,
  );
  if (result.error) {
    throw result.error;
  }
  return result.status ?? 1;
}

function reportSelection(snapshot, selection, tests, configuration) {
  const lines = [
    `Baza solicitata: ${snapshot.base}`,
    `Baza comuna: ${snapshot.mergeBase || 'indisponibila'}`,
    ...(configuration ? [`Configuratie: ${configuration}`] : []),
    `Selectie: ${selection.mode}; motiv: ${selection.reason}`,
    `Fisiere modificate (${snapshot.changes.length}):`,
    ...snapshot.changes.map(
      change =>
        `  ${JSON.stringify(change.status)} ${JSON.stringify(change.path)}`,
    ),
    `Fisiere de teste selectate (${tests.length}):`,
    ...tests.map(test => `  ${JSON.stringify(test)}`),
  ];
  const report = `${lines.join('\n')}\n`;
  process.stdout.write(report);
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `\n### Selectia testelor\n\n\`\`\`text\n${report.replaceAll('`', '\\u0060')}\`\`\`\n`,
    );
  }
}

module.exports = { parseOptions, capture, executeTests, reportSelection };

const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { assertDevice, cleanupCredentials } = require('./native-input.cjs');

const run = (executable, argumentsList, log) =>
  new Promise((resolve, reject) => {
    const output = fs.openSync(log, 'w', 0o600);
    let closed = false;
    const closeOutput = () => {
      if (closed) return;
      closed = true;
      fs.closeSync(output);
    };
    const child = spawn(executable, argumentsList, {
      windowsHide: true,
      stdio: ['ignore', output, output],
      env: {
        ...process.env,
        DEBUG: '',
        MAESTRO_CLI_NO_ANALYTICS: 'true',
        MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED: 'true',
      },
    });
    child.once('error', () => {
      closeOutput();
      reject(new Error('QUALITY_MAESTRO_UNAVAILABLE'));
    });
    child.once('close', code => {
      closeOutput();
      resolve(code);
    });
  });

const main = async () => {
  const device = process.env.QUALITY_DEVICE;
  const home = process.env.QUALITY_MAESTRO_HOME;
  const java = process.env.QUALITY_JAVA || 'java';
  if (!home || !fs.existsSync(path.join(home, 'lib')))
    throw new Error('QUALITY_MAESTRO_HOME_REQUIRED');
  await assertDevice(device);
  const classpath = path.join(home, 'lib', '*');
  const artifactRoot = path.resolve(
    'e2e/results',
    new Date().toISOString().replace(/[:.]/g, '-'),
  );
  fs.mkdirSync(artifactRoot, { recursive: true, mode: 0o700 });
  const passes = Number(process.env.QUALITY_PASSES || '5');
  if (!Number.isInteger(passes) || passes < 1 || passes > 5)
    throw new Error('QUALITY_PASSES_INVALID');
  const versionFile = path.join(artifactRoot, 'version.log');
  const prefix = [
    '--enable-native-access=ALL-UNNAMED',
    '-cp',
    classpath,
    'maestro.cli.AppKt',
  ];
  if (
    (await run(java, [...prefix, '--version'], versionFile)) !== 0 ||
    !fs
      .readFileSync(versionFile, 'utf8')
      .split(/\r?\n/)
      .some(line => line.trim() === '2.12.0')
  )
    throw new Error('QUALITY_MAESTRO_VERSION_MISMATCH');
  const results = [];
  try {
    for (let pass = 1; pass <= passes; pass++) {
      const directory = path.join(artifactRoot, `pass-${pass}`);
      fs.mkdirSync(directory, { mode: 0o700 });
      const code = await run(
        java,
        [
          ...prefix,
          '--device',
          device,
          'test',
          '-e',
          'CONTROL=http://127.0.0.1:8012/__quality',
          '--format=JUNIT',
          `--output=${path.join(directory, 'report.xml')}`,
          `--test-output-dir=${path.join(directory, 'artifacts')}`,
          'e2e/smoke',
        ],
        path.join(directory, 'maestro.log'),
      );
      results.push({ pass, code });
      fs.writeFileSync(
        path.join(artifactRoot, 'results.json'),
        JSON.stringify(results, null, 2),
        { mode: 0o600 },
      );
      process.stdout.write(`Smoke ${pass}: ${code === 0 ? 'PASS' : 'FAIL'}\n`);
      if (code !== 0) {
        process.exitCode = 1;
        return;
      }
    }
  } finally {
    await cleanupCredentials(device);
  }
};

main().catch(() => {
  process.stderr.write('QUALITY_SMOKE_FAILED\n');
  process.exitCode = 1;
});

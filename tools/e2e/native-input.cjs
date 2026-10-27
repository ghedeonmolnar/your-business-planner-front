const { spawn } = require('node:child_process');

const APP_ID = 'com.yourbusinessplanner.e2e';
const PASTE_KEY = '279';

const adb = (device, argumentsList, input) =>
  new Promise((resolve, reject) => {
    const child = spawn('adb', ['-s', device, ...argumentsList], {
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout.on('data', chunk => {
      output += chunk.toString();
    });
    child.stderr.resume();
    child.on('error', () => reject(new Error('QUALITY_ADB_UNAVAILABLE')));
    child.on('close', code =>
      code === 0 ? resolve(output) : reject(new Error('QUALITY_ADB_FAILED')),
    );
    child.stdin.end(input);
  });

const assertDevice = async device => {
  if (!/^emulator-[0-9]+$/.test(device))
    throw new Error('QUALITY_DEVICE_INVALID');
  const name = await adb(device, ['emu', 'avd', 'name']);
  if (
    !name
      .split(/\r?\n/)
      .some(line => /^Planner_E2E_[A-Za-z0-9_]+$/.test(line.trim()))
  )
    throw new Error('QUALITY_AVD_REQUIRED');
};

const writeCredentials = async (device, username, password) => {
  await assertDevice(device);
  await adb(device, ['shell', 'run-as', APP_ID, 'mkdir', '-p', 'files']);
  await adb(
    device,
    [
      'shell',
      'run-as',
      APP_ID,
      'sh',
      '-c',
      "'cat > files/quality-credentials.json'",
    ],
    JSON.stringify({ username, password }),
  );
};

const broadcast = async (device, field) => {
  const output = await adb(device, [
    'shell',
    'am',
    'broadcast',
    '-n',
    `${APP_ID}/com.gteventsapp.QualityInputReceiver`,
    '--es',
    'field',
    field,
  ]);
  if (!output.includes('result=-1')) throw new Error('QUALITY_INPUT_REFUSED');
};

const pasteCredential = async (device, field) => {
  if (!['username', 'password'].includes(field))
    throw new Error('QUALITY_FIELD_INVALID');
  await broadcast(device, field);
  await adb(device, ['shell', 'input', 'keyevent', PASTE_KEY]);
  await broadcast(device, 'clear');
};

module.exports = {
  APP_ID,
  assertDevice,
  writeCredentials,
  pasteCredential,
  cleanupCredentials: device => broadcast(device, 'cleanup'),
};

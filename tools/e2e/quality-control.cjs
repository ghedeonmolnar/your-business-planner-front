const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { spawn } = require('node:child_process');
const {
  assertDevice,
  writeCredentials,
  pasteCredential,
  cleanupCredentials,
} = require('./native-input.cjs');

const parseBase = value => {
  const url = new URL(value);
  if (
    url.protocol !== 'http:' ||
    url.hostname !== '127.0.0.1' ||
    url.pathname !== '/api' ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    throw new Error('LOCAL_TEST_API_REQUIRED');
  return url;
};

const seed = (project, runId) =>
  new Promise((resolve, reject) => {
    const child = spawn(
      'php',
      [
        'tools/quality-artisan.php',
        'business:quality-fixtures',
        '--profile=smoke',
        `--run-id=${runId}`,
      ],
      { cwd: project, windowsHide: true, stdio: 'ignore' },
    );
    child.on('error', () => reject(new Error('QUALITY_SEED_UNAVAILABLE')));
    child.on('close', code =>
      code === 0 ? resolve() : reject(new Error('QUALITY_SEED_FAILED')),
    );
  });

const startQualityControl = async ({
  api,
  project,
  manifest,
  device,
  port,
}) => {
  const target = parseBase(api);
  await assertDevice(device);
  const reference = JSON.parse(fs.readFileSync(manifest, 'utf8'));
  const check = await fetch(`${target}/quality-context`).then(response =>
    response.json(),
  );
  if (
    check.testing !== true ||
    check.run_id !== reference.run_id ||
    reference.database !== 'dedicated_test'
  )
    throw new Error('QUALITY_SERVER_CONTEXT_MISMATCH');
  let account;
  let context;
  let createdId;
  let dropPayment = false;
  let competitorId;
  const requestApi = async (
    route,
    { method = 'GET', body, token = account?.token } = {},
  ) => {
    const response = await fetch(`${target}${route}`, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'X-App-Build': '1',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = response.status === 204 ? null : await response.json();
    if (!response.ok) throw new Error(`QUALITY_API_STATUS_${response.status}`);
    return data;
  };
  const controls = async route => {
    if (route.startsWith('/begin/')) {
      const scenario = route.slice('/begin/'.length);
      if (!['E01', 'E02', 'E03', 'E04'].includes(scenario))
        throw new Error('QUALITY_SCENARIO_INVALID');
      const runId = randomUUID();
      await seed(project, runId);
      const data = JSON.parse(
        fs.readFileSync(
          path.join(project, 'storage/app/private/quality', `${runId}.json`),
          'utf8',
        ),
      );
      account = data.accounts[0];
      const future = new Date(`${account.date}T00:00:00Z`);
      future.setUTCDate(future.getUTCDate() + 2);
      const date =
        scenario === 'E03' ? account.date : future.toISOString().slice(0, 10);
      const monthName = new Intl.DateTimeFormat('ro-RO', {
        month: 'long',
        timeZone: 'UTC',
      }).format(new Date(`${date}T12:00:00Z`));
      context = {
        scenario,
        date,
        hallId: account.hall_id,
        clientId: account.client_id,
        monthNumber: date.slice(5, 7),
        baseId: account.booking_id,
        client: `E2E Client ${runId}`,
        startsAt: `${date} 18:00`,
        endsAt: `${date} 23:00`,
        year: date.slice(0, 4),
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      };
      createdId = undefined;
      competitorId = undefined;
      await writeCredentials(device, account.email, account.password);
      return context;
    }
    if (!context || !account) throw new Error('QUALITY_CONTEXT_REQUIRED');
    if (route.startsWith('/paste/')) {
      await pasteCredential(device, route.slice('/paste/'.length));
      return { ok: true };
    }
    if (route === '/cleanup-input') {
      await cleanupCredentials(device);
      return { ok: true };
    }
    if (route === '/drop-next-payment') {
      dropPayment = true;
      return { ok: true };
    }
    if (route === '/compete') {
      if (context.scenario !== 'E02')
        throw new Error('QUALITY_SCENARIO_INVALID');
      const colleague = await requestApi('/login', {
        method: 'POST',
        token: null,
        body: {
          username: account.admin_email,
          password: account.admin_password,
        },
      });
      const booking = await requestApi('/events', {
        method: 'POST',
        token: colleague.token,
        body: {
          operation_id: randomUUID(),
          hall_id: account.hall_id,
          client_id: account.client_id,
          date: context.date,
          type: 'nunta',
          status: 'confirmed',
          starts_at: `${context.date}T18:00:00+02:00`,
          ends_at: `${context.date}T23:00:00+02:00`,
          expires_at: null,
          minimum_guests: 100,
          final_guests: null,
          menu_price: '350.00',
          menu_name: null,
          agreed_advance: '0.00',
          advance_due_at: null,
          extra_services: [],
          staff: [],
          notes: '',
        },
      });
      competitorId = booking.id;
      const halls = await requestApi('/halls?per_page=100');
      const alternative = halls.data.find(hall => hall.name === 'E2E Sala 3');
      if (!alternative || !competitorId)
        throw new Error('QUALITY_COMPETITION_FAILED');
      context.hallId = alternative.id;
      return { ok: true, hallId: alternative.id };
    }
    if (route === '/verify-created') {
      const result = await requestApi(
        `/events?date_from=${context.date}&date_to=${context.date}&hall_id=${context.hallId}`,
      );
      const matches = result.data.filter(
        event =>
          event.date === context.date &&
          event.hall_id === context.hallId &&
          event.status === 'confirmed',
      );
      if (matches.length !== 1)
        throw new Error('QUALITY_BOOKING_COUNT_INVALID');
      createdId = matches[0].id;
      if (context.scenario === 'E02') {
        const original = await requestApi(
          `/events?date_from=${context.date}&date_to=${context.date}&hall_id=${account.hall_id}`,
        );
        if (
          !competitorId ||
          original.data.length !== 1 ||
          original.data[0].id !== competitorId
        )
          throw new Error('QUALITY_COMPETITION_INVARIANT_FAILED');
      }
      return { eventId: createdId };
    }
    if (route === '/verify-payment') {
      if (!createdId) throw new Error('QUALITY_BOOKING_REQUIRED');
      const payments = await requestApi(`/events/${createdId}/payments`);
      const booking = await requestApi(`/events/${createdId}`);
      if (
        payments.data.length !== 1 ||
        booking.paid_amount !== '1000.00' ||
        booking.balance_due !== '34000.00'
      )
        throw new Error('QUALITY_FINANCIAL_INVARIANT_FAILED');
      return { ok: true };
    }
    if (route === '/verify-cancelled') {
      const event = await requestApi(`/events/${context.baseId}`);
      const day = await requestApi(
        `/calendar/day?date=${context.date}&hall_id=${context.hallId}`,
      );
      const year = await requestApi(
        `/calendar?date_from=${context.year}-01-01&date_to=${context.year}-12-31&hall_id=${context.hallId}`,
      );
      if (
        event.status !== 'cancelled' ||
        day.data[0].status !== 'free' ||
        year.days.some(value => value.occupied_halls !== 0)
      )
        throw new Error('QUALITY_CANCELLATION_INVARIANT_FAILED');
      return { ok: true };
    }
    throw new Error('QUALITY_CONTROL_NOT_FOUND');
  };
  const server = http.createServer(async (request, response) => {
    const route = new URL(request.url, 'http://127.0.0.1');
    try {
      if (route.pathname.startsWith('/__quality/')) {
        const result = await controls(
          route.pathname.slice('/__quality'.length),
        );
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(result));
        return;
      }
      if (!route.pathname.startsWith('/api/'))
        throw new Error('QUALITY_ROUTE_REFUSED');
      const headers = { ...request.headers, host: target.host };
      const upstream = http.request(
        new URL(route.pathname + route.search, target.origin),
        { method: request.method, headers },
        result => {
          const shouldDrop =
            dropPayment &&
            request.method === 'POST' &&
            /^\/api\/events\/[^/]+\/payments$/.test(route.pathname) &&
            result.statusCode === 201;
          if (shouldDrop) {
            dropPayment = false;
            result.resume();
            result.on('end', () => response.destroy());
          } else {
            response.writeHead(result.statusCode, result.headers);
            result.pipe(response);
          }
        },
      );
      upstream.on('error', () => {
        if (!response.headersSent) response.writeHead(502);
        response.end();
      });
      request.pipe(upstream);
    } catch {
      response.writeHead(500, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'QUALITY_CONTROL_FAILED' }));
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
  return server;
};

if (require.main === module) {
  startQualityControl({
    api: process.env.QUALITY_API_URL,
    project: process.env.QUALITY_API_PROJECT,
    manifest: process.env.QUALITY_MANIFEST,
    device: process.env.QUALITY_DEVICE,
    port: Number(process.env.QUALITY_PORT || '8012'),
  })
    .then(() => process.stdout.write('QUALITY_CONTROL_READY\n'))
    .catch(() => {
      process.stderr.write('QUALITY_CONTROL_START_FAILED\n');
      process.exitCode = 1;
    });
}

module.exports = { startQualityControl, parseBase };

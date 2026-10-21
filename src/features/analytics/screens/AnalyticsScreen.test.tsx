import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import dayjs from 'dayjs';
import { AnalyticsScreen } from '@/features/analytics/screens/AnalyticsScreen';
import {
  AnalyticsYearReport,
  BusinessReport,
  MonthlyBusinessReport,
} from '@/features/analytics/types';
import { AppSegmentedControl } from '@/shared/components/AppSegmentedControl';
import {
  jsonResponse,
  renderWithProviders,
} from '@/shared/test/renderWithProviders';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('token-de-test')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

const currentYear = dayjs().year();

const reportRequests = () =>
  jest
    .mocked(globalThis.fetch)
    .mock.calls.map(([url]) => String(url))
    .filter(url => url.includes('/analytics-reports'));

const makeReport = (): BusinessReport => ({
  revenue_amount: 0,
  advance_amount: 0,
  outstanding_amount: 0,
  team_cost_amount: 0,
  transport_amount: 0,
  profit_amount: 0,
  profit_margin_percent: null,
  average_revenue_per_event: 0,
  events: {
    total: 0,
    completed: 0,
    upcoming: 0,
    cancelled: 0,
    cancellation_rate_percent: 0,
  },
  clients: { active: 0, new: 0, returning: 0, returning_rate_percent: 0 },
  locations: [],
  event_types: [],
  client_sources: [],
  weekdays: [],
  mascots: [],
  team: [],
  ratings: {
    internal_average: null,
    internal_count: 0,
    client_average: null,
    client_count: 0,
  },
});

const makeMonth = (year: number, number: number): MonthlyBusinessReport => ({
  ...makeReport(),
  month: `${year}-${String(number).padStart(2, '0')}`,
  comparison: {
    previous_month: `${year}-${String(number - 1).padStart(2, '0')}`,
    revenue_change_percent: null,
    profit_change_percent: null,
    events_change_percent: null,
  },
});

const reportFor = (year: number): AnalyticsYearReport => {
  const months = Array.from({ length: 12 }, (_, index) =>
    makeMonth(year, index + 1),
  );
  const target = year === currentYear ? months[7] : months[11];
  target.revenue_amount = 3000;
  target.team_cost_amount = 500;
  target.transport_amount = 150;
  target.profit_amount = 2500;
  target.events.total = 9;
  target.clients = {
    active: 2,
    new: 1,
    returning: 1,
    returning_rate_percent: 50,
  };
  target.locations = [
    { label: 'Oradea', count: 5, percent: 55.6 },
    { label: 'Beius', count: 3, percent: 33.3 },
    { label: 'Ioanis', count: 1, percent: 11.1 },
  ];
  const summary = {
    ...makeReport(),
    year,
    revenue_amount: 4200,
    team_cost_amount: 1100,
    profit_amount: 3100,
    events: { ...makeReport().events, total: 12, completed: 12 },
    locations: [{ label: 'Oradea', count: 7, percent: 58.3 }],
    best_month: { month: target.month, revenue_amount: 3000 },
    busiest_month: { month: target.month, events_count: 9 },
  };
  return {
    year,
    available_years: [currentYear - 1, currentYear],
    summary,
    months,
  };
};

const selectedTab = (renderer: ReactTestRenderer.ReactTestRenderer) =>
  renderer.root.findByType(AppSegmentedControl).props.selectedIndex;

const openMonthlyTab = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
) => {
  await ReactTestRenderer.act(async () => {
    renderer.root.findByType(AppSegmentedControl).props.onChangeIndex(1);
  });
};

function renderedText(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(renderedText).join('');
  }
  if (value && typeof value === 'object' && 'children' in value) {
    return renderedText((value as { children?: unknown }).children);
  }
  return '';
}

test('selectarea lunii actualizează întregul raport fără alt request', async () => {
  globalThis.fetch = jest.fn(url => {
    const year = Number(String(url).match(/year=(\d{4})/)?.[1]);
    return Promise.resolve(jsonResponse(200, reportFor(year)));
  }) as unknown as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(<AnalyticsScreen />);

  await ReactTestRenderer.act(async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ testID: `chart-month-${currentYear}-08` })
      .props.onPress();
  });

  const text = renderedText(renderer.toJSON());
  expect(text).toContain(`August ${currentYear}`);
  expect(text).toContain('Cost transport150 lei');
  expect(text).toContain('3.000 lei');
  expect(text).toContain('2.500 lei');
  expect(text).toContain('Profit după plata angajaților');
  expect(text).toContain('500 lei');
  expect(text).toContain('Oradea5');
  expect(text).toContain('Beius3');
  expect(text).toContain('Ioanis1');
  expect(reportRequests()).toHaveLength(1);

  await unmount();
});

test('schimbarea anului cere raportul corespunzător și selectează ultima lună activă', async () => {
  globalThis.fetch = jest.fn(url => {
    const year = Number(String(url).match(/year=(\d{4})/)?.[1]);
    return Promise.resolve(jsonResponse(200, reportFor(year)));
  }) as unknown as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(<AnalyticsScreen />);

  await ReactTestRenderer.act(async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
  });
  await openMonthlyTab(renderer);

  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: 'Anul anterior' })
      .props.onPress();
  });
  await ReactTestRenderer.act(async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  expect(reportRequests()).toEqual([
    expect.stringContaining(`year=${currentYear}`),
    expect.stringContaining(`year=${currentYear - 1}`),
  ]);
  expect(renderedText(renderer.toJSON())).toContain(
    `Decembrie ${currentYear - 1}`,
  );
  expect(
    jest
      .mocked(globalThis.fetch)
      .mock.calls.some(([url]) =>
        String(url).includes(`year=${currentYear - 1}`),
      ),
  ).toBe(true);

  await unmount();
});

test('graficul păstrează valori mari și profit negativ accesibile', async () => {
  const report = reportFor(currentYear);
  report.months[7].revenue_amount = 2_000_000;
  report.months[7].team_cost_amount = 2_500_000;
  report.months[7].profit_amount = -500_000;
  globalThis.fetch = jest.fn(() =>
    Promise.resolve(jsonResponse(200, report)),
  ) as unknown as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(<AnalyticsScreen />);
  await ReactTestRenderer.act(async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  const point = renderer.root.findByProps({
    testID: `chart-month-${currentYear}-08`,
  });
  expect(point.props.accessibilityLabel).toContain('profit -500000 lei');
  await ReactTestRenderer.act(async () => point.props.onPress());
  const text = renderedText(renderer.toJSON());
  expect(text).toContain('2.000.000 lei');
  expect(text).toContain('-500.000 lei');
  const paths = renderer.root.findAll(node => typeof node.props.d === 'string');
  expect(paths.length).toBeGreaterThanOrEqual(2);
  expect(paths.every(path => !path.props.d.includes('NaN'))).toBe(true);

  await unmount();
});

test('afișează anul fără activitate și eroarea de încărcare', async () => {
  const empty = reportFor(currentYear);
  empty.months = Array.from({ length: 12 }, (_, index) =>
    makeMonth(currentYear, index + 1),
  );
  globalThis.fetch = jest.fn(() =>
    Promise.resolve(jsonResponse(200, empty)),
  ) as unknown as typeof globalThis.fetch;
  const emptyScreen = await renderWithProviders(<AnalyticsScreen />);
  await ReactTestRenderer.act(async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
  });
  expect(renderedText(emptyScreen.renderer.toJSON())).toContain(
    'Nu există date pentru acest an',
  );
  await emptyScreen.unmount();

  globalThis.fetch = jest.fn(() =>
    Promise.resolve(jsonResponse(500, { message: 'Eroare raport' })),
  ) as unknown as typeof globalThis.fetch;
  const errorScreen = await renderWithProviders(<AnalyticsScreen />);
  await ReactTestRenderer.act(async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
  });
  expect(renderedText(errorScreen.renderer.toJSON())).toContain(
    'A apărut o eroare pe server. Încearcă din nou.',
  );
  await errorScreen.unmount();
});

test('luna viitoare arată doar ce e de încasat, fără profit', async () => {
  const report = reportFor(currentYear);
  const december = report.months[11];
  december.profit_amount = null;
  december.outstanding_amount = 1200;
  december.advance_amount = 300;
  december.events.total = 2;
  december.events.upcoming = 2;
  december.team = [
    {
      employee_id: 'owner',
      employee_name: 'Proprietar',
      events_count: 2,
      worked_hours: 0,
      cost_amount: 0,
      profit_share_amount: null,
    },
  ];
  globalThis.fetch = jest.fn(() =>
    Promise.resolve(jsonResponse(200, report)),
  ) as unknown as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(<AnalyticsScreen />);
  await ReactTestRenderer.act(async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  const point = renderer.root.findByProps({
    testID: `chart-month-${currentYear}-12`,
  });
  expect(point.props.accessibilityLabel).toContain('de încasat 1200 lei');
  await ReactTestRenderer.act(async () => point.props.onPress());

  const text = renderedText(renderer.toJSON());
  expect(text).toContain('De încasat');
  expect(text).toContain('1.200 lei');
  expect(text).toContain('Avansuri primite');
  expect(text).toContain('Profitul se calculează după ce au loc evenimentele.');
  expect(text).not.toContain('Cost: ');
  expect(text).not.toContain('Parte din profit');

  await unmount();
});

test('proprietarii apar cu partea din profit, nu cu cost', async () => {
  const report = reportFor(currentYear);
  report.months[7].team = [
    {
      employee_id: 'paid',
      employee_name: 'Animator plătit',
      events_count: 1,
      worked_hours: 2,
      cost_amount: 100,
      profit_share_amount: null,
    },
    {
      employee_id: 'owner',
      employee_name: 'Proprietar',
      events_count: 1,
      worked_hours: 2,
      cost_amount: 0,
      profit_share_amount: 1250,
    },
  ];
  globalThis.fetch = jest.fn(() =>
    Promise.resolve(jsonResponse(200, report)),
  ) as unknown as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(<AnalyticsScreen />);
  await ReactTestRenderer.act(async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
  });
  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ testID: `chart-month-${currentYear}-08` })
      .props.onPress();
  });

  const text = renderedText(renderer.toJSON());
  expect(text).toContain('Cost: 100 lei');
  expect(text).toContain('Parte din profit: 1.250 lei');
  expect(text).not.toContain('Cost: 0 lei');

  await unmount();
});

test('păstrează lista de ani cât se încarcă anul ales', async () => {
  let resolvePreviousYear: (response: unknown) => void = () => undefined;
  globalThis.fetch = jest.fn(url => {
    const year = Number(String(url).match(/year=(\d{4})/)?.[1]);

    if (year === currentYear - 1) {
      return new Promise(resolve => {
        resolvePreviousYear = resolve;
      });
    }

    return Promise.resolve(jsonResponse(200, reportFor(year)));
  }) as unknown as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(<AnalyticsScreen />);
  await ReactTestRenderer.act(async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
  });
  await openMonthlyTab(renderer);

  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: 'Anul anterior' })
      .props.onPress();
  });

  expect(
    renderer.root.findAllByProps({ accessibilityLabel: `Raport ${currentYear}` })
      .length,
  ).toBeGreaterThan(0);
  expect(
    renderer.root.findAllByProps({
      accessibilityLabel: 'Se încarcă statisticile',
    }).length,
  ).toBeGreaterThan(0);
  expect(renderedText(renderer.toJSON())).not.toContain(
    `August ${currentYear}`,
  );

  await ReactTestRenderer.act(async () => {
    resolvePreviousYear(jsonResponse(200, reportFor(currentYear - 1)));
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  expect(renderedText(renderer.toJSON())).toContain(
    `Decembrie ${currentYear - 1}`,
  );

  await unmount();
});

test('raportul anual este primul tab și rezumă tot anul', async () => {
  globalThis.fetch = jest.fn(() =>
    Promise.resolve(jsonResponse(200, reportFor(currentYear))),
  ) as unknown as typeof globalThis.fetch;
  const { renderer, unmount } = await renderWithProviders(<AnalyticsScreen />);
  await ReactTestRenderer.act(async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  const text = renderedText(renderer.toJSON());
  expect(selectedTab(renderer)).toBe(0);
  expect(text).toContain(`Anul ${currentYear}`);
  expect(text).toContain('Situația până la');
  expect(text).toContain('4.200 lei');
  expect(text).toContain('3.100 lei');
  expect(text).toContain(`Cea mai bună lunăAugust ${currentYear} · 3.000 lei`);
  expect(text).toContain(
    `Cea mai aglomerată lunăAugust ${currentYear} · 9 evenimente`,
  );
  expect(text).toContain('Oradea7');
  expect(text).not.toContain('Față de luna trecută');

  await ReactTestRenderer.act(async () => {
    renderer.root
      .findByProps({ testID: `chart-month-${currentYear}-08` })
      .props.onPress();
  });

  expect(selectedTab(renderer)).toBe(1);
  expect(renderedText(renderer.toJSON())).toContain('Față de luna trecută');
  expect(reportRequests()).toHaveLength(1);

  await unmount();
});

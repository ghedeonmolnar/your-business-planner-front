import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { EmployeeStatisticsScreen } from '@/features/employeeWorkspace/screens/EmployeeStatisticsScreen';
import { AppSegmentedControl } from '@/shared/components/AppSegmentedControl';
import { jsonResponse, renderWithProviders } from '@/shared/test/renderWithProviders';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('employee-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

beforeEach(() => {
  const statistics = {
    period: 'month',
    month: '2026-09',
    earnings: 300,
    events_count: 2,
    worked_minutes: 180,
    top_coworker: { id: 'coworker-1', name: 'Ana', events_count: 2 },
    top_mascot: { id: 'mascot-1', name: 'Minnie', events_count: 2 },
  };
  globalThis.fetch = jest.fn(url => String(url).endsWith('/me')
    ? Promise.resolve(jsonResponse(200, {
      id: 'user-1', name: 'Animator', email: 'animator@example.com',
      role: 'employee', employee_id: 'employee-1',
    }))
    : Promise.resolve(jsonResponse(200, statistics))) as unknown as typeof globalThis.fetch;
});

test('loads personal statistics and switches to the full history', async () => {
  const { renderer, unmount } = await renderWithProviders(<EmployeeStatisticsScreen />);

  expect(JSON.stringify(renderer.toJSON())).toContain('Câștig cuvenit');
  expect(JSON.stringify(renderer.toJSON())).toContain('Ana');
  expect(JSON.stringify(renderer.toJSON())).toContain('Minnie');
  expect(globalThis.fetch).toHaveBeenCalledWith(
    expect.stringContaining('/me/statistics?period=month'),
    expect.any(Object),
  );

  await ReactTestRenderer.act(async () => {
    renderer.root.findByType(AppSegmentedControl).props.onChangeIndex(1);
  });

  expect(globalThis.fetch).toHaveBeenCalledWith(
    expect.stringContaining('/me/statistics?period=all'),
    expect.any(Object),
  );
  await unmount();
});

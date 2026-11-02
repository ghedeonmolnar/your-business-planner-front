import ReactTestRenderer from 'react-test-renderer';
import { TextInput } from 'react-native-paper';
import { HallEditor } from '@/features/halls/components/HallEditor';
import { HallMenuRuleEditor } from '@/features/halls/components/HallMenuRuleEditor';
import {
  hallFetch,
  renderHallScreen,
  pressHallButton,
  finishHallSteps,
} from '@/features/halls/screens/hallScreens.testUtils';
import {
  getVisibleDialog,
  jsonResponse,
  pressDialogButton,
} from '@/shared/test/renderWithProviders';
import { advanceSessionGeneration } from '@/shared/api/sessionExpiry';
import { hallFixture } from '@/features/halls/utils/hallTestFixtures';
import { waitForUi } from '@/shared/test/waitForUi';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(() => Promise.resolve({ didCancel: true })),
}));

test('răspunsul pierdut blochează editarea și păstrează exact multipartul după redeschidere', async () => {
  hallFetch();
  const originalFetch = globalThis.fetch;
  let posts = 0;
  globalThis.fetch = jest.fn((url, init) => {
    if (init?.method !== 'POST' || !String(url).endsWith('/halls'))
      return originalFetch(url, init);
    posts += 1;
    return posts === 1
      ? Promise.reject(new Error('Răspuns pierdut'))
      : Promise.resolve(jsonResponse(201, hallFixture));
  }) as typeof globalThis.fetch;
  const first = await renderHallScreen('HallForm');
  let unmountSecond: (() => Promise<void>) | undefined;
  try {
    await waitForUi(() =>
      expect(first.renderer.root.findAllByType(HallEditor)).toHaveLength(1),
    );
    await ReactTestRenderer.act(async () => {
      first.renderer.root
        .findAllByType(TextInput)
        .find(field => field.props.label === 'Nume sală *')
        ?.props.onChangeText('Sală nouă');
      first.renderer.root
        .findAllByType(TextInput)
        .find(field => field.props.label === 'Capacitate maximă *')
        ?.props.onChangeText('100');
    });
    await finishHallSteps(first.renderer);
    await pressHallButton(first.renderer, 'Salvează sala');
    await pressHallButton(first.renderer, 'Înapoi');
    await pressHallButton(first.renderer, 'Înapoi');
    await waitForUi(() =>
      expect(
        first.renderer.root
          .findAllByType(TextInput)
          .find(field => field.props.label === 'Nume sală *')?.props.disabled,
      ).toBe(true),
    );
    await first.unmount();
    const second = await renderHallScreen('HallForm');
    unmountSecond = second.unmount;
    await waitForUi(() =>
      expect(
        second.renderer.root
          .findAllByType(TextInput)
          .find(field => field.props.label === 'Nume sală *')?.props.value,
      ).toBe('Sală nouă'),
    );
    await ReactTestRenderer.act(async () => {
      second.renderer.root
        .findAllByType(TextInput)
        .find(field => field.props.label === 'Nume sală *')
        ?.props.onChangeText('');
    });
    await pressHallButton(second.renderer, 'Reîncearcă salvarea');
    await waitForUi(() => expect(posts).toBe(2));
    const bodies = jest
      .mocked(globalThis.fetch)
      .mock.calls.filter(
        ([url, init]) =>
          String(url).endsWith('/halls') && init?.method === 'POST',
      )
      .map(([, init]) => init?.body);
    expect(bodies[1]).toBe(bodies[0]);
  } finally {
    await first.unmount();
    await unmountSecond?.();
  }
});

test('răspunsul început într-o sesiune veche nu navighează și nu afișează dialog în sesiunea următoare', async () => {
  hallFetch();
  const initialFetch = globalThis.fetch;
  let finish: ((response: Response) => void) | undefined;
  globalThis.fetch = jest.fn((url, init) =>
    init?.method === 'POST' && String(url).endsWith('/halls')
      ? new Promise<Response>(resolve => {
          finish = resolve;
        })
      : initialFetch(url, init),
  ) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderHallScreen('HallForm');
  await waitForUi(() =>
    expect(renderer.root.findAllByType(HallEditor)).toHaveLength(1),
  );
  await ReactTestRenderer.act(async () => {
    renderer.root
      .findAllByType(TextInput)
      .find(field => field.props.label === 'Nume sală *')
      ?.props.onChangeText('Sală nouă');
    renderer.root
      .findAllByType(TextInput)
      .find(field => field.props.label === 'Capacitate maximă *')
      ?.props.onChangeText('100');
  });
  await finishHallSteps(renderer);
  await pressHallButton(renderer, 'Salvează sala');
  await waitForUi(() => expect(finish).toBeDefined());
  await ReactTestRenderer.act(async () => {
    advanceSessionGeneration();
    finish?.(jsonResponse(200, hallFixture));
  });
  expect(getVisibleDialog(renderer)).toBeNull();
  expect(renderer.root.findAllByType(HallEditor)).toHaveLength(1);
  await unmount();
});

test('reîncărcarea după conflict închide regula veche și folosește tarifele salvate', async () => {
  const rule = {
    name: 'Tarif vechi',
    starts_on: '2027-05-01',
    ends_on: '2027-09-30',
    weekdays: [5, 6],
    menu_price: '400.00',
    child_menu_price: '200.00',
  };
  hallFetch({ menu_pricing_mode: 'advanced', menu_price_rules: [rule] });
  const initialFetch = globalThis.fetch;
  let conflicted = false;
  globalThis.fetch = jest.fn((url, init) => {
    if (!String(url).endsWith('/halls/hall-1')) return initialFetch(url, init);
    if (init?.method === 'POST') {
      conflicted = true;
      return Promise.resolve(
        jsonResponse(409, { error: { code: 'RESOURCE_VERSION_CONFLICT' } }),
      );
    }
    return conflicted
      ? Promise.resolve(
          jsonResponse(200, {
            ...hallFixture,
            version: 2,
            menu_pricing_mode: 'advanced',
            menu_price_rules: [{ ...rule, name: 'Tarif actualizat' }],
          }),
        )
      : initialFetch(url, init);
  }) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderHallScreen('HallForm', {
    hallId: 'hall-1',
  });
  try {
    await waitForUi(() =>
      expect(renderer.root.findAllByType(HallEditor)).toHaveLength(1),
    );
    await pressHallButton(renderer, 'Continuă');
    await pressHallButton(renderer, 'Editează regula Tarif vechi');
    expect(renderer.root.findAllByType(HallMenuRuleEditor)).toHaveLength(1);
    await pressHallButton(renderer, 'Continuă');
    await pressHallButton(renderer, 'Salvează modificările');
    await waitForUi(() =>
      expect(getVisibleDialog(renderer)?.title).toBe('Eroare'),
    );
    await pressDialogButton(renderer, 'OK');
    await pressHallButton(renderer, 'Încarcă versiunea salvată');
    await pressDialogButton(renderer, 'Încarcă versiunea');
    await waitForUi(() =>
      expect(renderer.root.findAllByType(HallMenuRuleEditor)).toHaveLength(0),
    );
    await pressHallButton(renderer, 'Continuă');
    await pressHallButton(renderer, 'Editează regula Tarif actualizat');
    expect(renderer.root.findByType(HallMenuRuleEditor).props.rule.name).toBe(
      'Tarif actualizat',
    );
  } finally {
    await unmount();
  }
});

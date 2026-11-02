import ReactTestRenderer from 'react-test-renderer';
import { TextInput } from 'react-native-paper';
import { HallEditor } from '@/features/halls/components/HallEditor';
import { HallPhotosField } from '@/features/halls/components/HallPhotosField';
import {
  hallFetch,
  renderHallScreen,
  pressHallButton,
  finishHallSteps,
} from '@/features/halls/screens/hallScreens.testUtils';
import {
  getVisibleDialog,
  jsonResponse,
} from '@/shared/test/renderWithProviders';
import { waitForUi } from '@/shared/test/waitForUi';
import { plannerAccount } from '@/features/bookings/utils/plannerTestFixtures';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(() => Promise.resolve({ didCancel: true })),
}));

test('inițializează editorul numai după identificarea companiei din sesiunea restaurată', async () => {
  hallFetch();
  const originalFetch = globalThis.fetch;
  let finishBootstrap: ((response: Response) => void) | undefined;
  globalThis.fetch = jest.fn((url, init) =>
    String(url).endsWith('/me')
      ? new Promise<Response>(resolve => {
          finishBootstrap = resolve;
        })
      : originalFetch(url, init),
  ) as typeof globalThis.fetch;
  const { renderer, unmount } = await renderHallScreen('HallForm');
  try {
    expect(renderer.root.findAllByType(HallEditor)).toHaveLength(0);
    expect(
      renderer.root.findAllByProps({ accessibilityLabel: 'Salvează sala' }),
    ).toHaveLength(0);
    await ReactTestRenderer.act(async () => {
      finishBootstrap?.(jsonResponse(200, plannerAccount));
    });
    await waitForUi(() =>
      expect(renderer.root.findAllByType(HallEditor)).toHaveLength(1),
    );
  } finally {
    await unmount();
  }
});

test('adăugarea respinge datele obligatorii lipsă înainte de cererea API', async () => {
  hallFetch();
  const { renderer, unmount } = await renderHallScreen('HallForm');
  await waitForUi(() =>
    expect(renderer.root.findAllByType(HallEditor)).toHaveLength(1),
  );
  await pressHallButton(renderer, 'Continuă');
  expect(getVisibleDialog(renderer)?.title).toBe('Verifică formularul');
  expect(
    jest
      .mocked(globalThis.fetch)
      .mock.calls.some(
        ([url, init]) =>
          String(url).endsWith('/halls') && init?.method === 'POST',
      ),
  ).toBe(false);
  await unmount();
});

test('editarea păstrează imaginile și câmpurile existente, duplicarea golește notele și galeria', async () => {
  hallFetch({ images: [{ id: 'photo-1', url: null }] });
  const edited = await renderHallScreen('HallForm', { hallId: 'hall-1' });
  await waitForUi(() =>
    expect(edited.renderer.root.findAllByType(HallEditor)).toHaveLength(1),
  );
  await pressHallButton(edited.renderer, 'Continuă');
  await pressHallButton(edited.renderer, 'Continuă');
  await waitForUi(() =>
    expect(edited.renderer.root.findAllByType(HallPhotosField)).toHaveLength(1),
  );
  expect(
    edited.renderer.root.findByType(HallPhotosField).props.photos,
  ).toHaveLength(1);
  await edited.unmount();
  hallFetch({ images: [{ id: 'photo-1', url: null }] });
  const duplicated = await renderHallScreen('HallForm', {
    duplicateHallId: 'hall-1',
  });
  await waitForUi(() =>
    expect(duplicated.renderer.root.findAllByType(HallEditor)).toHaveLength(1),
  );
  const fields = duplicated.renderer.root.findAllByType(TextInput);
  expect(
    fields.find(field => field.props.label === 'Nume sală *')?.props.value,
  ).toBe('Sala test (copie)');
  await pressHallButton(duplicated.renderer, 'Continuă');
  await pressHallButton(duplicated.renderer, 'Continuă');
  expect(
    duplicated.renderer.root.findByType(HallPhotosField).props.photos,
  ).toHaveLength(0);
  expect(
    duplicated.renderer.root
      .findAllByType(TextInput)
      .find(field => field.props.label === 'Note interne (opțional)')?.props
      .value,
  ).toBe('');
  await duplicated.unmount();
});

test('submit-ul dublu nu creează două săli și trimite cheia operațiunii', async () => {
  hallFetch();
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
  await ReactTestRenderer.act(async () => {
    const button = renderer.root.findAllByProps({
      accessibilityLabel: 'Salvează sala',
    })[0];
    button.props.onPress();
    button.props.onPress();
  });
  await waitForUi(() =>
    expect(
      jest
        .mocked(globalThis.fetch)
        .mock.calls.filter(
          ([url, init]) =>
            String(url).endsWith('/halls') && init?.method === 'POST',
        ),
    ).toHaveLength(1),
  );
  const request = jest
    .mocked(globalThis.fetch)
    .mock.calls.find(
      ([url, init]) =>
        String(url).endsWith('/halls') && init?.method === 'POST',
    );
  const body = request?.[1]?.body as FormData;
  const metadata = JSON.parse(String(body.getAll('metadata')[0]));
  expect(metadata.capacity).toBe(100);
  expect(metadata.operation_id).toMatch(/^[a-f\d-]{36}$/);
  expect(metadata.minimum_guests).toBe(50);
  expect(metadata.is_active).toBe(true);
  await unmount();
});

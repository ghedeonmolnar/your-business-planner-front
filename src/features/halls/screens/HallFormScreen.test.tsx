import ReactTestRenderer from 'react-test-renderer';
import { TextInput } from 'react-native-paper';
import { HallEditor } from '@/features/halls/components/HallEditor';
import { HallPhotosField } from '@/features/halls/components/HallPhotosField';
import {
  hallFetch,
  renderHallScreen,
  pressHallButton,
} from '@/features/halls/screens/hallScreens.testUtils';
import {
  getVisibleDialog,
  jsonResponse,
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

test('adăugarea respinge datele obligatorii lipsă înainte de cererea API', async () => {
  hallFetch();
  const { renderer, unmount } = await renderHallScreen('HallForm');
  await waitForUi(() =>
    expect(renderer.root.findAllByType(HallEditor)).toHaveLength(1),
  );
  await pressHallButton(renderer, 'Salvează sala');
  expect(getVisibleDialog(renderer)?.title).toBe('Verifică formularul');
  expect(
    jest
      .mocked(globalThis.fetch)
      .mock.calls.some(([, init]) => init?.method === 'POST'),
  ).toBe(false);
  await unmount();
});

test('editarea păstrează imaginile și câmpurile existente, duplicarea golește notele și galeria', async () => {
  hallFetch({ images: [{ id: 'photo-1', url: null }] });
  const edited = await renderHallScreen('HallForm', { hallId: 'hall-1' });
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
  expect(
    duplicated.renderer.root.findByType(HallPhotosField).props.photos,
  ).toHaveLength(0);
  const fields = duplicated.renderer.root.findAllByType(TextInput);
  expect(
    fields.find(field => field.props.label === 'Nume sală *')?.props.value,
  ).toBe('Sala test (copie)');
  expect(
    fields.find(field => field.props.label === 'Note interne')?.props.value,
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
      .find(field => field.props.label === 'Capacitate maximă (persoane) *')
      ?.props.onChangeText('100');
  });
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
        .mock.calls.filter(([, init]) => init?.method === 'POST'),
    ).toHaveLength(1),
  );
  const request = jest
    .mocked(globalThis.fetch)
    .mock.calls.find(([, init]) => init?.method === 'POST');
  const body = request?.[1]?.body as FormData;
  const metadata = JSON.parse(String(body.getAll('metadata')[0]));
  expect(metadata.capacity).toBe(100);
  expect(metadata.operation_id).toMatch(/^[a-f\d-]{36}$/);
  expect(metadata.minimum_guests).toBeNull();
  await unmount();
});

test('răspunsul pierdut blochează editarea și păstrează exact multipartul după redeschidere', async () => {
  hallFetch();
  const originalFetch = globalThis.fetch;
  let posts = 0;
  globalThis.fetch = jest.fn((url, init) => {
    if (init?.method !== 'POST') return originalFetch(url, init);
    posts += 1;
    return posts === 1
      ? Promise.reject(new Error('Răspuns pierdut'))
      : Promise.resolve(jsonResponse(201, hallFixture));
  }) as typeof globalThis.fetch;
  const first = await renderHallScreen('HallForm');
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
      .find(field => field.props.label === 'Capacitate maximă (persoane) *')
      ?.props.onChangeText('100');
  });
  await pressHallButton(first.renderer, 'Salvează sala');
  await waitForUi(() =>
    expect(
      first.renderer.root
        .findAllByType(TextInput)
        .find(field => field.props.label === 'Nume sală *')?.props.disabled,
    ).toBe(true),
  );
  await first.unmount();
  const second = await renderHallScreen('HallForm');
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
  await pressHallButton(second.renderer, 'Salvează sala');
  await waitForUi(() => expect(posts).toBe(2));
  const bodies = jest
    .mocked(globalThis.fetch)
    .mock.calls.filter(([, init]) => init?.method === 'POST')
    .map(([, init]) => init?.body);
  expect(bodies[1]).toBe(bodies[0]);
  await second.unmount();
});

test('răspunsul început într-o sesiune veche nu navighează și nu afișează dialog în sesiunea următoare', async () => {
  hallFetch();
  const initialFetch = globalThis.fetch;
  let finish: ((response: Response) => void) | undefined;
  globalThis.fetch = jest.fn((url, init) =>
    init?.method === 'POST'
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
      .find(field => field.props.label === 'Capacitate maximă (persoane) *')
      ?.props.onChangeText('100');
  });
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

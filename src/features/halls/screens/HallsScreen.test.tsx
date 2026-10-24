import ReactTestRenderer from 'react-test-renderer';
import { AppSegmentedControl } from '@/shared/components/AppSegmentedControl';
import { SearchField } from '@/shared/components/SearchField';
import { HallCard } from '@/features/halls/components/HallCard';
import {
  hallFetch,
  renderHallScreen,
  pressHallButton,
} from '@/features/halls/screens/hallScreens.testUtils';
import { HallEditor } from '@/features/halls/components/HallEditor';
import { waitForUi } from '@/shared/test/waitForUi';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(() => Promise.resolve({ didCancel: true })),
}));

test('căutarea și filtrele listei se trimit către server, iar adăugarea deschide formularul', async () => {
  hallFetch();
  const { renderer, unmount } = await renderHallScreen('CompanyHalls');
  await waitForUi(() =>
    expect(renderer.root.findAllByType(HallCard)).toHaveLength(1),
  );
  await ReactTestRenderer.act(async () =>
    renderer.root.findByType(AppSegmentedControl).props.onChangeIndex(2),
  );
  await waitForUi(() =>
    expect(
      jest
        .mocked(globalThis.fetch)
        .mock.calls.some(([url]) => String(url).includes('status=inactive')),
    ).toBe(true),
  );
  await ReactTestRenderer.act(async () =>
    renderer.root.findByType(SearchField).props.onChange('test'),
  );
  await waitForUi(() =>
    expect(
      jest
        .mocked(globalThis.fetch)
        .mock.calls.some(([url]) =>
          String(url).includes('search=test&status=inactive'),
        ),
    ).toBe(true),
  );
  await pressHallButton(renderer, 'Adaugă sală');
  await waitForUi(() =>
    expect(renderer.root.findAllByType(HallEditor)).toHaveLength(1),
  );
  await unmount();
});

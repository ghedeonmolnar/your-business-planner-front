import { API_URL } from '@env';
import { isTrustedMapSelectorUrl } from '@/features/events/schemas/eventMapSchemas';

const selectorUrl = () =>
  `${new URL(API_URL).origin}/event-map-picker/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb?signature=test&expires=2000000000`;

test('allows the configured API origin without allowing arbitrary HTTP origins', () => {
  expect(isTrustedMapSelectorUrl(selectorUrl())).toBe(true);
  expect(
    isTrustedMapSelectorUrl(
      selectorUrl().replace(
        new URL(API_URL).origin,
        'http://untrusted.example.test',
      ),
    ),
  ).toBe(false);
});

test('rejects HTTP selectors in production', () => {
  const originalDevelopmentMode = __DEV__;
  try {
    Object.defineProperty(globalThis, '__DEV__', { value: false });
    expect(
      isTrustedMapSelectorUrl(selectorUrl().replace(/^https:/, 'http:')),
    ).toBe(false);
  } finally {
    Object.defineProperty(globalThis, '__DEV__', {
      value: originalDevelopmentMode,
    });
  }
});

test('allows the exact configured HTTP origin only in development', () => {
  const originalUrl = URL;
  const originalDevelopmentMode = __DEV__;
  const urlConstructor = jest
    .spyOn(globalThis, 'URL')
    .mockImplementation((...args) => {
      const parsed = new originalUrl(...args);
      if (args[0] === API_URL) {
        parsed.protocol = 'http:';
      }
      return parsed;
    });

  try {
    Object.defineProperty(globalThis, '__DEV__', { value: true });
    const url = selectorUrl();
    expect(isTrustedMapSelectorUrl(url)).toBe(true);

    Object.defineProperty(globalThis, '__DEV__', { value: false });
    expect(isTrustedMapSelectorUrl(url)).toBe(false);
  } finally {
    urlConstructor.mockRestore();
    Object.defineProperty(globalThis, '__DEV__', {
      value: originalDevelopmentMode,
    });
  }
});

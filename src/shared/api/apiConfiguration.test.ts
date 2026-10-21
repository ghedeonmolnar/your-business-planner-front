import { isAllowedApiUrl } from '@/shared/api/apiConfiguration';

test.each([
  ['https://api.example.test/api', false, true],
  ['http://10.0.2.2:8010/api', true, true],
  ['http://10.0.2.2:8010/api', false, false],
  ['https://user:password@api.example.test/api', false, false],
  ['https://api.example.test/api?token=secret', false, false],
  ['https://api.example.test/api#fragment', false, false],
  ['file:///private/database', true, false],
  ['', true, false],
])(
  'validates API configuration %s in development=%s',
  (url, development, allowed) => {
    expect(isAllowedApiUrl(url, development)).toBe(allowed);
  },
);

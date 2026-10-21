import {
  isMapSelectorDocumentUrl,
  isMapSelectorMessageSource,
} from '@/features/events/utils/eventMapWebViewUrls';

const origin = 'https://maps.example.test';
const documentPath = '/event-map-picker/admin/event';
const selector = `${origin}${documentPath}?expires=2000000000&signature=test`;

test.each([origin, `${origin}/`])(
  'accepta originea trimisa de WebMessageListener Android: %s',
  source => {
    expect(isMapSelectorMessageSource(source, selector, 'android')).toBe(true);
    expect(isMapSelectorMessageSource(source, selector, 'ios')).toBe(false);
    expect(isMapSelectorDocumentUrl(source, selector)).toBe(false);
  },
);

test.each(['android', 'ios'])(
  'accepta documentul complet sau fara query pe %s',
  platform => {
    expect(isMapSelectorMessageSource(selector, selector, platform)).toBe(true);
    expect(
      isMapSelectorMessageSource(
        `${origin}${documentPath}`,
        selector,
        platform,
      ),
    ).toBe(true);
  },
);

test.each([
  'https://maps.example.test.attacker.test',
  'https://other.example.test',
  'http://maps.example.test',
  'https://maps.example.test:444',
  'https://attacker@maps.example.test',
  `${origin}/other-page`,
  `${origin}/event-map-picker/admin/other-event`,
  `${origin}/?signature=other`,
  `${origin}/#other`,
  'about:blank',
  'null',
])('refuza sursa mesajului din alta origine sau pagina: %s', source => {
  expect(isMapSelectorMessageSource(source, selector, 'android')).toBe(false);
  expect(isMapSelectorMessageSource(source, selector, 'ios')).toBe(false);
});

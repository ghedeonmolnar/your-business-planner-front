import {
  buildContactUrl,
  buildWhatsAppShareUrl,
  eventContactPhone,
} from '@/shared/utils/contactLinks';

describe('buildContactUrl', () => {
  it.each([
    ['whatsapp', '0732 652 339', 'https://wa.me/40732652339'],
    ['call', '0732 652 339', 'tel:+40732652339'],
    ['email', ' Client@Example.COM ', 'mailto:client@example.com'],
    ['facebook', '@client.test', 'https://m.me/client.test'],
    [
      'instagram',
      'https://instagram.com/client.test/',
      'https://www.instagram.com/client.test/',
    ],
    ['tiktok', '@client', 'https://www.tiktok.com/@client'],
  ] as const)('construiește linkul pentru %s', (channel, value, expected) => {
    expect(buildContactUrl(channel, value)).toBe(expected);
  });

  it('permite numai linkuri OLX HTTPS', () => {
    expect(buildContactUrl('olx', 'https://www.olx.ro/d/oferta/test')).toBe(
      'https://www.olx.ro/d/oferta/test',
    );
    expect(buildContactUrl('olx', 'https://example.com/test')).toBeNull();
    expect(buildContactUrl('olx', 'http://olx.ro/test')).toBeNull();
  });
});

describe('buildWhatsAppShareUrl', () => {
  it('trimite mesajul către numărul clientului', () => {
    expect(buildWhatsAppShareUrl('0732 652 339', 'Salut GT')).toBe(
      'https://wa.me/40732652339?text=Salut%20GT',
    );
  });

  it('deschide lista de contacte când numărul lipsește sau este invalid', () => {
    expect(buildWhatsAppShareUrl(null, 'Salut GT')).toBe(
      'https://wa.me/?text=Salut%20GT',
    );
    expect(buildWhatsAppShareUrl('123', 'Salut GT')).toBe(
      'https://wa.me/?text=Salut%20GT',
    );
  });
});

describe('eventContactPhone', () => {
  it('preferă numărul salvat al clientului', () => {
    expect(
      eventContactPhone({
        communication_channel: 'facebook',
        contact_value: 'client.test',
        contact_phone: '0732652339',
      }),
    ).toBe('0732652339');
  });

  it('cade pe valoarea canalului când este un număr de telefon', () => {
    expect(
      eventContactPhone({
        communication_channel: 'whatsapp',
        contact_value: '0732652339',
        contact_phone: null,
      }),
    ).toBe('0732652339');
  });

  it('întoarce null când nu există un număr utilizabil', () => {
    expect(
      eventContactPhone({
        communication_channel: 'instagram',
        contact_value: 'client.test',
        contact_phone: null,
      }),
    ).toBeNull();
  });
});

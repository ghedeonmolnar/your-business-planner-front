import ReactTestRenderer from 'react-test-renderer';
import { Linking } from 'react-native';
import { BookingDetailsHeader } from '@/features/bookings/components/BookingDetailsHeader';
import { BookingDetailsSection } from '@/features/bookings/components/BookingDetailsSection';
import { BookingPhoneForm } from '@/features/bookings/components/BookingPhoneForm';
import {
  renderBookingDetails,
  pressBookingDetails,
} from '@/features/bookings/screens/bookingDetails.testUtils';
import {
  getVisibleDialog,
  pressDialogButton,
} from '@/shared/test/renderWithProviders';
import { waitForUi } from '@/shared/test/waitForUi';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

test('legacy fără telefon păstrează contactul dezactivat și secțiunile secundare închise', async () => {
  const { renderer, unmount } = await renderBookingDetails();
  expect(JSON.stringify(renderer.toJSON())).toContain('Telefon lipsă');
  expect(
    renderer.root.findByProps({ accessibilityLabel: 'Apelează clientul' }).props
      .disabled,
  ).toBe(true);
  expect(renderer.root.findByType(BookingDetailsHeader).props.canShare).toBe(
    false,
  );
  for (const title of [
    'Personal și organizare',
    'Plăți și cheltuieli',
    'Documente',
    'Note interne',
  ]) {
    expect(
      renderer.root.findByProps({ accessibilityLabel: title }).props
        .accessibilityState.expanded,
    ).toBe(false);
  }
  expect(
    jest
      .mocked(globalThis.fetch)
      .mock.calls.some(([url]) =>
        /\/payments|\/documents|\/employees/.test(String(url)),
      ),
  ).toBe(false);
  await pressBookingDetails(renderer, 'Completează telefonul');
  expect(renderer.root.findByType(BookingPhoneForm)).toBeDefined();
  expect(
    jest
      .mocked(globalThis.fetch)
      .mock.calls.some(([, init]) => init?.method === 'PUT'),
  ).toBe(false);
  await unmount();
});

test.each([null, 0, 240])(
  'meniurile comandate %s rămân distincte de minim și de lipsa confirmării',
  async finalGuests => {
    const { renderer, unmount } = await renderBookingDetails({
      final_guests: finalGuests,
    });
    const value = finalGuests ?? 'Numărul exact nu a fost completat';
    expect(
      renderer.root.findByProps({
        accessibilityLabel: `Meniuri confirmate: ${value}`,
      }),
    ).toBeDefined();
    expect(
      renderer.root.findByProps({
        accessibilityLabel: 'Minimul sălii (adulți): 200',
      }),
    ).toBeDefined();
    expect(
      JSON.stringify(renderer.toJSON()).includes(
        'Numărul exact de meniuri nu a fost completat',
      ),
    ).toBe(finalGuests === null);
    await unmount();
  },
);

test('afișează sumele serverului fără scăderea suplimentară a avansului și data următoare', async () => {
  const { renderer, unmount } = await renderBookingDetails({
    date: '2026-10-24',
    starts_at: '2026-10-24T15:00:00Z',
    ends_at: '2026-10-25T02:00:00Z',
    agreed_advance: '20000.00',
    paid_amount: '10000.00',
    balance_due: '62000.00',
  });
  expect(
    renderer.root.findByProps({
      accessibilityLabel: 'Rest de încasat: 62.000 lei',
    }),
  ).toBeDefined();
  expect(
    renderer.root.findByProps({
      accessibilityLabel: 'Avans convenit: 20.000 lei',
    }),
  ).toBeDefined();
  expect(
    renderer.root.findByProps({
      accessibilityLabel: 'Sfârșit: 25.10.2026 04:00',
    }),
  ).toBeDefined();
  expect(JSON.stringify(renderer.toJSON())).toContain('(+1 zi)');
  await unmount();
});

test('WhatsApp prezintă destinatarul și mesajul fără note private, apoi cere confirmare', async () => {
  const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  const { renderer, unmount } = await renderBookingDetails({
    client_phone: '0712345678',
    notes: 'Secret intern',
  });
  expect(open).not.toHaveBeenCalled();
  await pressBookingDetails(
    renderer,
    'Verifică mesajul WhatsApp pentru client',
  );
  const dialog = getVisibleDialog(renderer);
  expect(dialog?.message).toContain('0712345678');
  expect(dialog?.message).not.toContain('Secret intern');
  expect(open).not.toHaveBeenCalled();
  await pressDialogButton(renderer, 'Renunță');
  expect(open).not.toHaveBeenCalled();
  await pressBookingDetails(
    renderer,
    'Verifică mesajul WhatsApp pentru client',
  );
  await pressDialogButton(renderer, 'Deschide WhatsApp');
  expect(open).toHaveBeenCalledWith(
    expect.stringContaining('https://wa.me/40712345678?text='),
  );
  await unmount();
  open.mockRestore();
});

test('anularea cere confirmare, trimite versiunea și actualizează starea din API', async () => {
  const { renderer, unmount } = await renderBookingDetails();
  const openConfirmation = async () => {
    await ReactTestRenderer.act(async () => {
      renderer.root.findByType(BookingDetailsHeader).props.onCancel();
    });
  };
  await openConfirmation();
  expect(getVisibleDialog(renderer)?.message).toContain('calendar');
  await pressDialogButton(renderer, 'Păstrează rezervarea');
  expect(
    jest
      .mocked(globalThis.fetch)
      .mock.calls.some(([, init]) => init?.method === 'DELETE'),
  ).toBe(false);
  await openConfirmation();
  await pressDialogButton(renderer, 'Anulează rezervarea');
  await waitForUi(() => {
    expect(renderer.root.findByType(BookingDetailsHeader).props.canCancel).toBe(
      false,
    );
  });
  const writes = jest
    .mocked(globalThis.fetch)
    .mock.calls.filter(([, init]) => init?.method === 'DELETE');
  expect(writes).toHaveLength(1);
  expect(JSON.parse(String(writes[0][1]?.body))).toEqual({ version: 1 });
  await unmount();
});

test('personalul nu vede meniul de administrare, contactul, financiarul, documentele sau notele', async () => {
  const { renderer, unmount } = await renderBookingDetails(
    {},
    { role: 'employee' },
  );
  expect(renderer.root.findByType(BookingDetailsHeader).props.canManage).toBe(
    false,
  );
  const sections = renderer.root
    .findAllByType(BookingDetailsSection)
    .map(section => section.props.title);
  expect(sections).toEqual(['Detalii eveniment', 'Personal și organizare']);
  expect(
    renderer.root.findAllByProps({ accessibilityLabel: 'Apelează clientul' }),
  ).toHaveLength(0);
  await unmount();
});

test('modulele oprite elimină secțiunile opționale și o rezervare anulată nu poate fi anulată din nou', async () => {
  const { renderer, unmount } = await renderBookingDetails(
    { status: 'cancelled' },
    { features: [] },
  );
  const sections = renderer.root
    .findAllByType(BookingDetailsSection)
    .map(section => section.props.title);
  expect(sections).toEqual(['Detalii eveniment', 'Financiar', 'Note interne']);
  expect(renderer.root.findByType(BookingDetailsHeader).props.canCancel).toBe(
    false,
  );
  expect(
    renderer.root.findAllByProps({
      accessibilityLabel: 'Rest de încasat: 60.000 lei',
    }),
  ).toHaveLength(0);
  await unmount();
});

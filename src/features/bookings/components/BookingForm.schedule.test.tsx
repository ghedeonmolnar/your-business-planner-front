import ReactTestRenderer from 'react-test-renderer';
import { ControlledTextField } from '@/shared/components/ControlledTextField';
import { BookingTimePicker } from '@/features/bookings/components/BookingTimePicker';
import {
  field,
  mockBookingCalendar,
  mount,
  summary,
} from '@/features/bookings/components/bookingAvailabilityTestHelpers';
import { jsonResponse } from '@/shared/test/renderWithProviders';
import { renderedText } from '@/shared/test/renderedText';

jest.mock('@/shared/storage/authTokenStorage', () => ({
  clearAuthToken: jest.fn(() => Promise.resolve()),
  getAuthToken: jest.fn(() => Promise.resolve('owner-token')),
  setAuthToken: jest.fn(() => Promise.resolve()),
}));

beforeEach(() =>
  mockBookingCalendar(params =>
    Promise.resolve(jsonResponse(200, summary(params))),
  ),
);

const timeField = (
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
) => {
  const result = renderer.root
    .findAllByProps({ accessibilityLabel: label })
    .find(item => typeof item.props.onPress === 'function');
  if (!result) throw new Error(`Lipsește selectorul ${label}.`);
  return result;
};

const chooseTime = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
  value: string,
) => {
  await ReactTestRenderer.act(async () =>
    timeField(renderer, label).props.onPress(),
  );
  await ReactTestRenderer.act(async () => {
    const picker = renderer.root.findByType(BookingTimePicker);
    picker.props.onChange(value);
    picker.props.onClose();
  });
};

test('alege numai orele și mută automat sfârșitul în ziua următoare', async () => {
  const { renderer, unmount } = await mount(true);
  try {
    expect(
      renderer.root
        .findAllByType(ControlledTextField)
        .some(input => input.props.name === 'expires_at'),
    ).toBe(false);
    await chooseTime(renderer, 'Ora de început', '2027-11-13 19:15');
    await chooseTime(renderer, 'Ora de sfârșit', '2027-11-14 04:30');
    expect(
      timeField(renderer, 'Ora de sfârșit').props.accessibilityValue.text,
    ).toBe('04:30');
    expect(renderedText(renderer)).toContain('Sfârșitul este a doua zi');
    await ReactTestRenderer.act(async () =>
      field(renderer).props.onChange('2027-12-31'),
    );
    expect(
      timeField(renderer, 'Ora de început').props.accessibilityValue.text,
    ).toBe('19:15');
    expect(
      timeField(renderer, 'Ora de sfârșit').props.accessibilityValue.text,
    ).toBe('04:30');
    expect(renderedText(renderer)).toContain('1 Ianuarie, 2028');
  } finally {
    await unmount();
  }
});

test('schimbarea orei de început recalculează ziua sfârșitului, iar golirea elimină ambele ore', async () => {
  const { renderer, unmount } = await mount(true);
  try {
    await chooseTime(renderer, 'Ora de început', '2027-11-13 02:00');
    expect(
      timeField(renderer, 'Ora de sfârșit').props.accessibilityValue.text,
    ).toBe('04:00');
    expect(renderedText(renderer)).not.toContain('Sfârșitul este a doua zi');
    await chooseTime(renderer, 'Ora de început', '');
    expect(
      timeField(renderer, 'Ora de început').props.accessibilityValue.text,
    ).toBe('Ora necompletată');
    expect(
      timeField(renderer, 'Ora de sfârșit').props.accessibilityValue.text,
    ).toBe('Ora necompletată');
  } finally {
    await unmount();
  }
});

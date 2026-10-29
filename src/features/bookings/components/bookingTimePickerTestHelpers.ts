import ReactTestRenderer from 'react-test-renderer';
import { BookingTimePicker } from '@/features/bookings/components/BookingTimePicker';

export const chooseBookingTime = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
  value: string,
) => {
  await ReactTestRenderer.act(async () => {
    renderer.root
      .findAllByProps({ accessibilityLabel: label })
      .find(node => typeof node.props.onPress === 'function')!
      .props.onPress();
  });
  await ReactTestRenderer.act(async () => {
    const picker = renderer.root.findByType(BookingTimePicker);
    picker.props.onChange(value);
    picker.props.onClose();
  });
};

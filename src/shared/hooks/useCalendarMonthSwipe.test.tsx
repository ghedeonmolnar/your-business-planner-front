import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { View } from 'react-native';
import { useCalendarMonthSwipe } from '@/shared/hooks/useCalendarMonthSwipe';

const touch = (x: number, y: number, count = 1) => ({
  nativeEvent: {
    pageX: x,
    pageY: y,
    touches: Array.from({ length: count }, () => ({ pageX: x, pageY: y })),
  },
});

function SwipeCalendar({
  onChange,
}: {
  onChange: (direction: -1 | 1) => void;
}) {
  return <View testID="calendar-swipe" {...useCalendarMonthSwipe(onChange)} />;
}

test('glisarea schimbă câte o lună și păstrează gesturile verticale, anulate și cu mai multe degete', async () => {
  const first = jest.fn();
  const next = jest.fn();
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<SwipeCalendar onChange={first} />);
  });
  if (!renderer) throw new Error('Calendarul nu a fost montat.');
  const mounted = renderer;
  const handlers = () =>
    mounted.root.findByProps({ testID: 'calendar-swipe' }).props;
  try {
    handlers().onTouchStart(touch(200, 100));
    handlers().onTouchEnd(touch(195, 100, 0));
    handlers().onTouchStart(touch(200, 100));
    handlers().onTouchEnd(touch(180, 300, 0));
    expect(first).not.toHaveBeenCalled();
    handlers().onTouchStart(touch(200, 100));
    handlers().onTouchEnd(touch(50, 100, 0));
    expect(first).toHaveBeenCalledWith(1);
    handlers().onTouchStart(touch(50, 100));
    await ReactTestRenderer.act(async () =>
      mounted.update(<SwipeCalendar onChange={next} />),
    );
    handlers().onTouchEnd(touch(200, 100, 0));
    expect(next.mock.calls).toEqual([[-1]]);
    handlers().onTouchStart(touch(200, 100));
    handlers().onTouchCancel(touch(50, 100, 0));
    handlers().onTouchEnd(touch(50, 100, 0));
    handlers().onTouchStart(touch(200, 100));
    handlers().onTouchMove(touch(150, 100, 2));
    handlers().onTouchEnd(touch(50, 100, 0));
    expect(next).toHaveBeenCalledTimes(1);
  } finally {
    await ReactTestRenderer.act(async () => mounted.unmount());
  }
});

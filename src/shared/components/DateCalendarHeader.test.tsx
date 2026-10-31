import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { DateCalendarHeader } from '@/shared/components/DateCalendarHeader';
import { IconButton } from '@/shared/components/IconButton';
import { renderWithProviders } from '@/shared/test/renderWithProviders';

test('săgețile sunt butoane etichetate în afara oricărui strămoș care le ascunde de TalkBack', async () => {
  const addMonth = jest.fn();
  const { renderer, unmount } = await renderWithProviders(
    <DateCalendarHeader month="2026-11-01" onChangeMonth={addMonth} />,
  );
  try {
    const buttons = renderer.root.findAllByType(IconButton);
    expect(buttons.map(button => button.props.accessibilityLabel)).toEqual([
      'Luna anterioară',
      'Luna următoare',
    ]);
    for (const button of buttons) {
      let ancestor = button.parent;
      while (ancestor) {
        expect(ancestor.props.importantForAccessibility).not.toBe(
          'no-hide-descendants',
        );
        ancestor = ancestor.parent;
      }
    }
    await ReactTestRenderer.act(async () => buttons[0].props.onPress());
    await ReactTestRenderer.act(async () => buttons[1].props.onPress());
    expect(addMonth.mock.calls).toEqual([[-1], [1]]);
    expect(JSON.stringify(renderer.toJSON())).toContain('Noiembrie 2026');
  } finally {
    await unmount();
  }
});

test('limita calendarului dezactivează și blochează navigarea spre luna precedentă', async () => {
  const addMonth = jest.fn();
  const { renderer, unmount } = await renderWithProviders(
    <DateCalendarHeader
      month="2026-10-30"
      onChangeMonth={addMonth}
      disableArrowLeft
    />,
  );
  try {
    const previous = renderer.root.findAllByType(IconButton)[0];
    expect(previous.props.disabled).toBe(true);
    await ReactTestRenderer.act(async () => previous.props.onPress());
    expect(addMonth).not.toHaveBeenCalled();
  } finally {
    await unmount();
  }
});

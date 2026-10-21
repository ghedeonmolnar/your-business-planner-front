import ReactTestRenderer from 'react-test-renderer';
import { PaymentOvertimeForm } from '@/features/events/components/PaymentOvertimeForm';
import { eventFixture } from '@/shared/test/apiFixtures';
import {
  renderForm,
  submit,
  saveOvertime,
  selectField,
  enterText,
} from '@/features/events/components/paymentForm.testUtils';

test('întreabă despre prelungire înainte de salvare și folosește implicit Nu', async () => {
  const onSubmit = jest.fn();
  const renderer = await renderForm(onSubmit);
  const button = renderer.root
    .findAllByProps({ label: 'Salvează' })
    .find(node => typeof node.props.onPress === 'function');

  await ReactTestRenderer.act(async () => button?.props.onPress());
  expect(onSubmit).not.toHaveBeenCalled();
  expect(renderer.root.findAllByType(PaymentOvertimeForm)).toHaveLength(1);

  await saveOvertime(renderer);
  expect(onSubmit).toHaveBeenCalledWith(
    expect.objectContaining({ amount: 500, overtime: null }),
  );

  await ReactTestRenderer.act(async () => renderer.unmount());
});

test.each([
  {
    scope: 'all',
    selectedIds: [],
    total: 800,
    expectedIds: ['employee-1', 'employee-2'],
  },
  {
    scope: 'selected',
    selectedIds: ['employee-2'],
    total: 650,
    expectedIds: ['employee-2'],
  },
])(
  'calculează prelungirea pentru selecția $scope',
  async ({ scope, selectedIds, total, expectedIds }) => {
    const onSubmit = jest.fn();
    const renderer = await renderForm(onSubmit);
    const button = renderer.root
      .findAllByProps({ label: 'Salvează' })
      .find(node => typeof node.props.onPress === 'function');

    await ReactTestRenderer.act(async () => button?.props.onPress());
    await selectField(renderer, 'A fost prelungire?', ['yes']);
    await enterText(renderer, 'Câte ore a durat prelungirea?', '1,5');
    await enterText(renderer, 'Tarif client pe oră / animator (lei)', '100');
    await selectField(renderer, 'Cine a participat la prelungire?', [scope]);
    if (scope === 'selected') {
      await selectField(renderer, 'Animatori participanți', selectedIds);
    }
    await saveOvertime(renderer);

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: total,
        overtime: {
          duration_minutes: 90,
          hourly_rate: 100,
          employee_ids: expectedIds,
        },
      }),
    );

    await ReactTestRenderer.act(async () => renderer.unmount());
  },
);

test('editarea păstrează prelungirea fără să o adauge de două ori', async () => {
  const onSubmit = jest.fn();
  const renderer = await renderForm(onSubmit, {
    initialPayment: {
      id: 'payment-1',
      event_id: eventFixture.id,
      type: 'incoming',
      category: 'full',
      amount: 650,
      paid_at: '2026-10-19',
      status: 'completed',
      overtime: {
        duration_minutes: 90,
        hourly_rate: 100,
        employee_ids: ['employee-2'],
        amount: 150,
      },
    },
  });

  await submit(renderer);
  expect(onSubmit).toHaveBeenCalledWith(
    expect.objectContaining({ amount: 650 }),
  );

  await ReactTestRenderer.act(async () => renderer.unmount());
});

test('validează selecția și permite revenirea la Nu fără sume suplimentare', async () => {
  const onSubmit = jest.fn();
  const renderer = await renderForm(onSubmit);
  const save = renderer.root
    .findAllByProps({ label: 'Salvează' })
    .find(node => typeof node.props.onPress === 'function');

  await ReactTestRenderer.act(async () => save?.props.onPress());
  await selectField(renderer, 'A fost prelungire?', ['yes']);
  await enterText(renderer, 'Câte ore a durat prelungirea?', '1');
  await enterText(renderer, 'Tarif client pe oră / animator (lei)', '150');
  await selectField(renderer, 'Cine a participat la prelungire?', ['selected']);
  await saveOvertime(renderer);
  expect(onSubmit).not.toHaveBeenCalled();

  await selectField(renderer, 'A fost prelungire?', ['no']);
  await saveOvertime(renderer);
  expect(onSubmit).toHaveBeenCalledWith(
    expect.objectContaining({ amount: 500, overtime: null }),
  );

  await ReactTestRenderer.act(async () => renderer.unmount());
});

import ReactTestRenderer from 'react-test-renderer';
import { FormModalFrame } from '@/shared/components/FormModalFrame';
import {
  renderForm,
  press,
  selectSettlement,
  submit,
} from '@/features/events/components/paymentForm.testUtils';

test('sends the event rating with a full settlement', async () => {
  const onSubmit = jest.fn();
  const renderer = await renderForm(onSubmit);
  expect(renderer.root.findByType(FormModalFrame).props.progress).toEqual({
    current: 1,
    total: 2,
  });

  await press(renderer, 'Notă eveniment');
  await press(renderer, '4 stele');
  await press(renderer, 'Salvează');
  expect(renderer.root.findByType(FormModalFrame).props.progress).toEqual({
    current: 2,
    total: 2,
  });
  await press(renderer, 'Salvează plata');

  expect(onSubmit).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'incoming',
      category: 'full',
      amount: 500,
      rating: 4,
    }),
  );

  await ReactTestRenderer.act(async () => {
    renderer.unmount();
  });
});

test('alege metoda de plată dintr-o listă fixă', async () => {
  const onSubmit = jest.fn();
  const renderer = await renderForm(onSubmit);

  await press(renderer, 'Metodă');

  const options = renderer.root
    .findAll(node => typeof node.props.onPress === 'function')
    .map(node => node.props.accessibilityLabel)
    .filter(Boolean);

  expect(options).toEqual(expect.arrayContaining(['Cash', 'Card', 'Transfer']));

  await press(renderer, 'Card');
  await submit(renderer);

  expect(onSubmit).toHaveBeenCalledWith(
    expect.objectContaining({ method: 'card' }),
  );

  await ReactTestRenderer.act(async () => {
    renderer.unmount();
  });
});

test('keeps the rating out of a partial settlement', async () => {
  const onSubmit = jest.fn();
  const renderer = await renderForm(onSubmit);

  await selectSettlement(renderer, 1);
  expect(
    renderer.root.findByType(FormModalFrame).props.progress,
  ).toBeUndefined();

  expect(
    renderer.root.findAllByProps({ accessibilityLabel: 'Notă eveniment' }),
  ).toHaveLength(0);

  await submit(renderer);

  expect(onSubmit).toHaveBeenCalledWith(
    expect.objectContaining({ category: 'partial' }),
  );
  expect(onSubmit.mock.calls[0][0]).not.toHaveProperty('rating');

  await ReactTestRenderer.act(async () => {
    renderer.unmount();
  });
});

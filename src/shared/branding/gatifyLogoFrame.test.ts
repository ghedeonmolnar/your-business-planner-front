import { gatifyLogoData } from '@/shared/branding/gatifyLogoData';
import { gatifyLogoFrame } from '@/shared/branding/gatifyLogoFrame';

test('pastreaza ciclul de opt secunde si monograma GT de la inceput si sfarsit', () => {
  expect(gatifyLogoData.durationMs).toBe(8000);
  const [g, a, t, i, f, y, shine] = gatifyLogoData.shapes;
  expect(gatifyLogoFrame(g, 0).matrix[4]).toBe(414);
  expect(gatifyLogoFrame(t, 0).matrix[4]).toBe(140);
  for (const shape of [a, i, f, y, shine]) {
    expect(gatifyLogoFrame(shape, 0).opacity).toBe(0);
    expect(gatifyLogoFrame(shape, 1).opacity).toBe(0);
  }
  for (const shape of [g, t])
    expect(gatifyLogoFrame(shape, 1)).toEqual(gatifyLogoFrame(shape, 0));
});

test('cadrul pentru miscare redusa afiseaza cuvantul complet fara comprimare sau reflexie', () => {
  for (const shape of gatifyLogoData.shapes.filter(
    value => value.name !== 'shine',
  )) {
    expect(gatifyLogoFrame(shape, 0.5)).toEqual({
      opacity: 1,
      matrix: [1, 0, 0, 1, 0, 0],
    });
  }
  expect(gatifyLogoFrame(gatifyLogoData.shapes[6], 0.5).opacity).toBe(0);
});

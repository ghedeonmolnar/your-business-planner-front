import {
  compactMascotLabel,
  compactMascotName,
  compactMascotNames,
} from '@/features/mascots/utils/compactMascotNames';

test.each([
  ['Mickey Mouse', 'Mickey'],
  ['Minnie Mouse', 'Minnie'],
  ['Spider-Man', 'Spider'],
  ['Spiderman', 'Spider'],
  ['Alba ca Zapada', 'Alba'],
  ['Winnie The Pooh', 'Winnie'],
  ['Luny Unicornul', 'Luny'],
  ['Elsa', 'Elsa'],
])('compacts the mascot name %s', (name, expectedName) => {
  expect(compactMascotName(name)).toBe(expectedName);
});

test('compacts multiple mascot names into one label without duplicates', () => {
  expect(
    compactMascotNames(['Mickey Mouse', 'Spider-Man', 'Mickey Mouse']),
  ).toBe('Mickey, Spider');
  expect(compactMascotLabel('Minnie Mouse, Winnie The Pooh')).toBe(
    'Minnie, Winnie',
  );
});

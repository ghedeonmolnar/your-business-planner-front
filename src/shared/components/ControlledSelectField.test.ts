import { filterSelectOptions } from '@/shared/components/ControlledSelectField';

const localityOptions = [
  { id: 'abram', name: 'Abram' },
  { id: 'abramut', name: 'Abrămuț' },
  { id: 'adoni', name: 'Adoni' },
  { id: 'albesti', name: 'Albești' },
];

test('filters select options live without requiring Romanian diacritics', () => {
  expect(filterSelectOptions(localityOptions, 'abram')).toEqual([
    localityOptions[0],
    localityOptions[1],
  ]);
  expect(filterSelectOptions(localityOptions, 'albe')).toEqual([
    localityOptions[3],
  ]);
});

test('returns the complete option list for an empty search', () => {
  expect(filterSelectOptions(localityOptions, '  ')).toEqual(localityOptions);
});

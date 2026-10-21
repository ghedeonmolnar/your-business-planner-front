import { suggestionUpdates } from '@/features/events/utils/clientSuggestion';

const suggestion = { location: 'Oradea', address: 'Rasaritului nr20' };

test('completează doar câmpurile rămase goale', () => {
  expect(suggestionUpdates(suggestion, {}, {})).toEqual({
    location: 'Oradea',
    address: 'Rasaritului nr20',
  });
});

test('nu atinge niciodată ce a completat utilizatorul', () => {
  expect(
    suggestionUpdates(suggestion, { location: 'Salonta' }, {}),
  ).toEqual({ address: 'Rasaritului nr20' });
});

test('înlocuiește doar propria propunere anterioară', () => {
  expect(
    suggestionUpdates(
      suggestion,
      { location: 'Alesd', address: 'Bona Villa' },
      { location: 'Alesd' },
    ),
  ).toEqual({ location: 'Oradea' });
});

test('ignoră propunerile lipsă sau identice', () => {
  expect(suggestionUpdates(null, {}, {})).toEqual({});
  expect(
    suggestionUpdates({ location: 'Oradea', address: null }, {}, {}),
  ).toEqual({ location: 'Oradea' });
  expect(
    suggestionUpdates(suggestion, { location: 'Oradea' }, {}),
  ).toEqual({ address: 'Rasaritului nr20' });
});

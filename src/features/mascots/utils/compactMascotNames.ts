const compactNameByNormalizedName: Record<string, string> = {
  'alba ca zapada': 'Alba',
  'luny unicornul': 'Luny',
  'mickey mouse': 'Mickey',
  'minnie mouse': 'Minnie',
  'spider man': 'Spider',
  spiderman: 'Spider',
  'winnie the pooh': 'Winnie',
};

const normalizeMascotName = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

export const compactMascotName = (name: string) => {
  const trimmedName = name.trim();

  return (
    compactNameByNormalizedName[normalizeMascotName(trimmedName)] ?? trimmedName
  );
};

export const compactMascotNames = (names: readonly string[]) =>
  names
    .map(compactMascotName)
    .filter(Boolean)
    .filter((name, index, compactNames) => compactNames.indexOf(name) === index)
    .join(', ');

export const compactMascotLabel = (label: string) =>
  compactMascotNames(label.split(','));

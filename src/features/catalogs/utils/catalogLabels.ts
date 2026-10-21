import { CatalogOption } from '@/features/catalogs/types';

export const createCatalogLabelMap = (options: CatalogOption[] = []) =>
  new Map(options.map((option) => [option.id, option.name]));

export const getCatalogLabel = (
  labels: ReadonlyMap<string, string>,
  value: string | null | undefined,
) => {
  if (!value) {
    return '';
  }

  return labels.get(value) ?? value;
};

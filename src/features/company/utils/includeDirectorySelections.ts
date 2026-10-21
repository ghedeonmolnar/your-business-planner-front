import { DirectoryItem } from '@/features/company/types';

export const includeDirectorySelections = (
  items: DirectoryItem[],
  selected: DirectoryItem[],
) =>
  Array.from(
    new Map([...selected, ...items].map(item => [item.id, item])).values(),
  );

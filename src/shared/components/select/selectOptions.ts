export type SelectValue = string | number;

export type SelectOptionsState = {
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void | Promise<unknown>;
  pagination?: {
    hasMore: boolean;
    loading: boolean;
    error?: unknown;
    onLoadMore: () => void | Promise<unknown>;
  };
};

export type SelectOption<T extends SelectValue = SelectValue> = {
  id: T;
  name: string;
  description?: string;
  disabled?: boolean;
};

const normalizeSearchText = (value: string) =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('ro-RO').trim();

export const filterSelectOptions = <TValue extends SelectValue>(
  options: SelectOption<TValue>[],
  query: string,
) => {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return options;
  }

  return options.filter(option =>
    normalizeSearchText(option.name).includes(normalizedQuery),
  );
};

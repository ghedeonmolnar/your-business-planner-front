import { useQuery } from '@tanstack/react-query';
import { getCatalogsApi } from '@/features/catalogs/api/catalogsApi';
import { queryKeys } from '@/shared/api/queryKeys';

export const useCatalogs = () =>
  useQuery({
    queryKey: queryKeys.catalogs,
    queryFn: getCatalogsApi,
    staleTime: 5 * 60 * 1000,
  });

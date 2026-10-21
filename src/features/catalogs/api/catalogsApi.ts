import { apiRequest } from '@/shared/api/client';
import { Catalogs } from '@/features/catalogs/types';
import { catalogsSchema } from '@/features/catalogs/schemas/catalogApiSchemas';

export const getCatalogsApi = () =>
  apiRequest<Catalogs>('/catalogs', { schema: catalogsSchema });

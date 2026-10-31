import { DirectoryFormValues } from '@/features/company/schemas/directorySchema';
import {
  DirectoryItem,
  DirectoryKind,
  DirectoryPayload,
} from '@/features/company/types';

export const directoryFormValues = (
  kind: DirectoryKind,
  item?: Partial<DirectoryItem> | DirectoryPayload,
): DirectoryFormValues => ({
  kind,
  name: item?.name ?? '',
  phone: item?.phone ?? '',
  notes: item?.notes ?? '',
  job_role: item?.job_role ?? 'other',
  hourly_rate: String(item?.hourly_rate ?? (kind === 'employees' ? '' : 0)),
  capacity: String(item?.capacity ?? ''),
  address: item?.address ?? '',
  active: item?.is_active === false ? 'no' : 'yes',
});

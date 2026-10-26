import { z } from 'zod';
import { apiPageRequest, apiRequest } from '@/shared/api/client';
import { authUserSchema } from '@/features/auth/schemas/authApiSchemas';
import {
  companyProfileSchema,
  FiscalProfile,
} from '@/features/company/schemas/companyProfileSchemas';
import {
  DirectoryItem,
  DirectoryKind,
  DirectoryPayload,
} from '@/features/company/types';

const directorySchema = z.object({
  id: z.string(),
  version: z.number().int().positive().optional(),
  name: z.string(),
  phone: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  job_role: z.string().optional(),
  hourly_rate: z.number().nullable().optional(),
  is_active: z.boolean().optional(),
  is_available: z.boolean().optional(),
  capacity: z.number().optional(),
  minimum_guests: z.number().int().positive().nullable().optional(),
  address: z.string().nullable().optional(),
});
const versionedDirectorySchema = directorySchema.extend({
  version: z.number().int().positive(),
});
export const getEmployeeDirectoryApi = (id: string) =>
  apiRequest('/employees/' + id, { schema: versionedDirectorySchema });
export const getDirectoryApi = (
  kind: DirectoryKind,
  page: number,
  signal?: AbortSignal,
  search = '',
) =>
  apiPageRequest<DirectoryItem>(
    '/' + kind + '?search=' + encodeURIComponent(search),
    page,
    undefined,
    {
      signal,
      itemSchema:
        kind === 'employees' ? versionedDirectorySchema : directorySchema,
    },
  );
export const saveDirectoryApi = ({
  kind,
  id,
  payload,
}: {
  kind: DirectoryKind;
  id?: string;
  payload: DirectoryPayload;
}) =>
  apiRequest('/' + kind + (id ? '/' + id : ''), {
    method: id ? 'PUT' : 'POST',
    body: payload,
    schema: kind === 'employees' ? versionedDirectorySchema : directorySchema,
  });
export const getTeamApi = (page: number, signal?: AbortSignal) =>
  apiPageRequest('/team', page, undefined, {
    signal,
    itemSchema: authUserSchema,
  });
export const inviteAccountApi = (payload: {
  name: string;
  email: string;
  role: 'admin' | 'employee';
  employee_id: string | null;
}) =>
  apiRequest('/invitations', {
    method: 'POST',
    body: payload,
    schema: z.object({
      id: z.string(),
      email: z.string(),
      expires_at: z.string(),
    }),
  });
export const blockAccountApi = (id: string) =>
  apiRequest('/team/' + id + '/block', {
    method: 'POST',
    schema: z.object({ status: z.literal('blocked') }),
  });
export const overviewSchema = z.object({
  occupied_hall_days: z.number(),
  available_hall_days: z.number(),
  occupancy_basis_points: z.number(),
  confirmed_count: z.number(),
  tentative_count: z.number(),
  halls_count: z.number(),
  contracted_amount: z.string(),
  estimated_staff_cost: z.string(),
  balance_due: z.string(),
  received_amount: z.string(),
  outgoing_amount: z.string(),
  cash_profit_amount: z.string(),
  monthly: z.array(
    z.object({
      month: z.string(),
      events_count: z.number(),
      contracted_amount: z.string(),
      staff_cost: z.string(),
    }),
  ),
});
export const getOverviewApi = (
  from: string,
  to: string,
  signal?: AbortSignal,
) =>
  apiRequest(
    '/overview?date_from=' +
      encodeURIComponent(from) +
      '&date_to=' +
      encodeURIComponent(to),
    { signal, schema: overviewSchema },
  );

export const getStaffAvailabilityApi = (
  startsAt: string,
  endsAt: string,
  eventId: string | undefined,
  page: number,
  signal?: AbortSignal,
) =>
  apiPageRequest<DirectoryItem>(
    '/staff-availability?starts_at=' +
      encodeURIComponent(startsAt) +
      '&ends_at=' +
      encodeURIComponent(endsAt) +
      (eventId ? '&exclude_event_id=' + eventId : ''),
    page,
    undefined,
    { signal, itemSchema: directorySchema },
  );

export const saveCompanySettingsApi = (payload: {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  billing_profile?: FiscalProfile | null;
}) =>
  apiRequest('/company', {
    method: 'PUT',
    body: payload,
    schema: companyProfileSchema,
  });

export const getAccountInvitationsApi = (page: number, signal?: AbortSignal) =>
  apiPageRequest('/invitations', page, undefined, {
    signal,
    itemSchema: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      role: z.string(),
      expires_at: z.string(),
      expired: z.boolean(),
      delivery_status: z
        .enum(['pending', 'sent', 'failed', 'expired', 'cancelled'])
        .nullable()
        .optional(),
    }),
  });
export const revokeInvitationApi = (id: string) =>
  apiRequest('/invitations/' + id, {
    method: 'DELETE',
    schema: z.object({ status: z.literal('revoked') }),
  });
export const unblockAccountApi = (id: string) =>
  apiRequest('/team/' + id + '/unblock', {
    method: 'POST',
    schema: z.object({ status: z.literal('unblocked') }),
  });

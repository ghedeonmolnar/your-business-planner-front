import { z } from 'zod';
import {
  Client,
  ClientContact,
  ClientLocation,
  ClientLookup,
} from '@/features/clients/types';

const clientContactSchema: z.ZodType<ClientContact> = z.object({
  id: z.string().min(1),
  kind: z.enum(['phone', 'email', 'facebook', 'instagram', 'tiktok', 'olx']),
  value: z.string(),
});

const clientLocationSchema: z.ZodType<ClientLocation> = z.object({
  id: z.string().min(1),
  location: z.string().nullable(),
  address: z.string().nullable(),
  last_event_date: z.string().nullable(),
});

export const clientSchema: z.ZodType<Client> = z.object({
  id: z.string().min(1),
  name: z.string(),
  phone: z.string().nullable(),
  judet: z.string().nullable(),
  oras: z.string().nullable(),
  strada: z.string().nullable(),
  source: z.string().nullable(),
  is_consent_placeholder: z.boolean().optional(),
  notes: z.string().nullable(),
  last_contract_date: z.string().nullable().optional(),
  primary_contact: clientContactSchema.nullable().optional(),
  latest_location: clientLocationSchema.nullable().optional(),
  contacts: z.array(clientContactSchema).optional(),
  locations: z.array(clientLocationSchema).optional(),
});

export const clientLookupSchema: z.ZodType<ClientLookup> = z.object({
  matched: z.boolean(),
  events_count: z.number().int().nonnegative(),
  client: clientSchema.nullable(),
  suggestion: z
    .object({
      location: z.string().nullable(),
      address: z.string().nullable(),
    })
    .nullable(),
});

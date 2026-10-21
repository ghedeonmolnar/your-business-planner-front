import { z } from 'zod';

export const ownerProfileSchema = z.object({
  name: z.string().trim().min(1, 'Completează numele tău.').max(255),
});
export type OwnerProfileValues = z.infer<typeof ownerProfileSchema>;

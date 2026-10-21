import { z } from 'zod';

export const invitationSchema = z.object({
  email: z.string().trim().email('Introdu o adresă de email validă.'),
});

export type InvitationFormValues = z.infer<typeof invitationSchema>;

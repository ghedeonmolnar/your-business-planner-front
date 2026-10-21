import { AuthUser } from '@/features/auth/types';

export type CompanyFeature = 'staff' | 'documents' | 'finance' | 'reminders';

export function hasCompanyFeature(
  user: AuthUser | null | undefined,
  feature: CompanyFeature,
): boolean {
  return Boolean(user && (user.features?.includes(feature) ?? true));
}

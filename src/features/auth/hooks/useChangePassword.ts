import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthProvider';
import { changePasswordApi } from '@/features/auth/api/authApi';
import { ChangePasswordValues } from '@/features/auth/schemas/changePasswordSchema';
import { getSessionGeneration } from '@/shared/api/sessionExpiry';
import { showMessage } from '@/shared/feedback/showMessage';

export function useChangePassword() {
  const { signOut } = useAuth();
  return useMutation({
    mutationFn: async (values: ChangePasswordValues) => {
      const generation = getSessionGeneration();
      await changePasswordApi(values);
      return generation;
    },
    onSuccess: async generation => {
      if (generation !== getSessionGeneration()) return;
      const cleanup = signOut({ remote: false });
      const signedOutGeneration = getSessionGeneration();
      await cleanup;
      if (signedOutGeneration === getSessionGeneration())
        showMessage('Parolă schimbată', 'Autentifică-te cu parola nouă.');
    },
    gcTime: 0,
  });
}

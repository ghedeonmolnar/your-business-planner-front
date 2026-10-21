import { useMutation } from '@tanstack/react-query';
import {
  forgotPasswordApi,
  loginApi,
  registerEmployeeApi,
  resetPasswordApi,
} from '@/features/auth/api/authApi';
import { useAuth } from '@/features/auth/AuthProvider';

export const useLogin = () => {
  const { signIn } = useAuth();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: response => signIn(response.token, response.user),
  });
};

export const useForgotPassword = () =>
  useMutation({
    mutationFn: forgotPasswordApi,
  });

export const useResetPassword = () =>
  useMutation({
    mutationFn: resetPasswordApi,
  });

export const useEmployeeRegistration = () => {
  const { signIn } = useAuth();

  return useMutation({
    mutationFn: registerEmployeeApi,
    onSuccess: response => signIn(response.token, response.user),
  });
};

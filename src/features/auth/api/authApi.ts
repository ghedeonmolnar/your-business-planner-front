import { apiRequest } from '@/shared/api/client';
import {
  ForgotPasswordPayload,
  AuthUser,
  EmployeeRegistrationPayload,
  LoginResponse,
  MessageResponse,
  ResetPasswordPayload,
} from '@/features/auth/types';
import {
  authMessageResponseSchema,
  authUserSchema,
  loginResponseSchema,
} from '@/features/auth/schemas/authApiSchemas';

export type LoginPayload = {
  username: string;
  password: string;
};

export const loginApi = (payload: LoginPayload) =>
  apiRequest<LoginResponse>('/login', {
    method: 'POST',
    body: payload,
    auth: false,
    schema: loginResponseSchema,
  });

export const getMeApi = () =>
  apiRequest<AuthUser>('/me', { schema: authUserSchema });

export const registerEmployeeApi = (payload: EmployeeRegistrationPayload) =>
  apiRequest<LoginResponse>('/invitations/accept', {
    method: 'POST',
    body: payload,
    auth: false,
    schema: loginResponseSchema,
  });

export const logoutApi = () =>
  apiRequest<{ message: string }>('/logout', {
    method: 'POST',
    schema: authMessageResponseSchema,
  });

export const forgotPasswordApi = (payload: ForgotPasswordPayload) =>
  apiRequest<MessageResponse>('/password/forgot', {
    method: 'POST',
    body: payload,
    auth: false,
    schema: authMessageResponseSchema,
  });

export const resetPasswordApi = (payload: ResetPasswordPayload) =>
  apiRequest<MessageResponse>('/password/reset', {
    method: 'POST',
    body: payload,
    auth: false,
    schema: authMessageResponseSchema,
  });

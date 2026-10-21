export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'employee';
  company?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
  } | null;
  subscription?: {
    active: boolean;
    ends_at: string | null;
    suspended: boolean;
  } | null;
  blocked?: boolean;
  support_email?: string | null;
  support_phone?: string | null;
  employee_id: string | null;
};

export type LoginResponse = {
  token: string;
  user?: AuthUser;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type EmployeeRegistrationPayload = {
  email: string;
  code: string;
  password: string;
  password_confirmation: string;
};

export type ResetPasswordPayload = {
  email: string;
  code: string;
  password: string;
  password_confirmation: string;
};

export type MessageResponse = {
  message: string;
};

export type SignOutOptions = {
  remote?: boolean;
};

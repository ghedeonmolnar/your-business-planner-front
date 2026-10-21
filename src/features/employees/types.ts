export type EmployeeGender = 'male' | 'female';

export type Employee = {
  id: string;
  name: string;
  gender: EmployeeGender | null;
  hourly_rate: number | null;
  birth_date: string;
  is_active: boolean;
};

export type EmployeeProfileEvent = {
  id: string;
  date: string;
  location: string | null;
  address: string | null;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number;
  earnings: number;
  mascot_names: string[];
};

export type EmployeeProfile = Employee & {
  created_at: string;
  total_earnings: number;
  events: EmployeeProfileEvent[];
  account: {
    status: 'not_invited' | 'pending' | 'expired' | 'active' | 'blocked';
    email: string | null;
    expires_at: string | null;
  };
};

export type EmployeeInvitation = {
  status: 'pending';
  email: string;
  expires_at: string;
};

export type EmployeeAccessChange = {
  status: 'active' | 'blocked';
  email: string;
};

export type EmployeePayload = {
  name: string;
  gender: EmployeeGender;
  hourly_rate: number | null;
  birth_date: string;
  is_active?: boolean;
};

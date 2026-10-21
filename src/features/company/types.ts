export type DirectoryKind = 'clients' | 'employees' | 'halls';
export type DirectoryItem = {
  id: string;
  name: string;
  phone?: string | null;
  notes?: string | null;
  job_role?: string;
  hourly_rate?: number | null;
  is_active?: boolean;
  is_available?: boolean;
  capacity?: number;
  address?: string | null;
};
export type DirectoryPayload = {
  name: string;
  phone?: string | null;
  notes?: string | null;
  job_role?: string;
  hourly_rate?: string;
  is_active?: boolean;
  capacity?: number;
  address?: string | null;
};

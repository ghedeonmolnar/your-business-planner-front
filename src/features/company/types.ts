export type DirectoryKind = 'clients' | 'employees' | 'halls';
export type CustomerSort = 'name_asc' | 'name_desc' | 'bookings_desc';
export type CustomerFilters = {
  search?: string;
  date_from?: string;
  date_to?: string;
  sort?: CustomerSort;
};
export type CustomerListItem = DirectoryItem & { bookings_count: number };
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

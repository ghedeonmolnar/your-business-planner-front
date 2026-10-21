export type Mascot = {
  id: string;
  name: string;
  slug: string;
  image_path?: string | null;
  image_url?: string | null;
  price_per_hour: number;
  is_active: boolean;
};

export type MascotProfileEvent = {
  id: string;
  date: string;
  location: string | null;
  address: string | null;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number;
  earnings: number;
  employee_names: string[];
};

export type MascotProfile = Mascot & {
  created_at: string;
  total_earnings: number;
  events: MascotProfileEvent[];
};

export type MascotPayload = FormData;

export type MascotImageValue = {
  uri: string;
  fileName?: string | null;
  type?: string | null;
};

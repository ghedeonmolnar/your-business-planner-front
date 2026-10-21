export type ClientContact = {
  id: string;
  kind: 'phone' | 'email' | 'facebook' | 'instagram' | 'tiktok' | 'olx';
  value: string;
};

export type ClientLocation = {
  id: string;
  location: string | null;
  address: string | null;
  last_event_date: string | null;
};

export type Client = {
  id: string;
  name: string;
  phone: string | null;
  judet: string | null;
  oras: string | null;
  strada: string | null;
  source: string | null;
  is_consent_placeholder?: boolean;
  notes: string | null;
  last_contract_date?: string | null;
  primary_contact?: ClientContact | null;
  latest_location?: ClientLocation | null;
  contacts?: ClientContact[];
  locations?: ClientLocation[];
};

export type ClientLookup = {
  matched: boolean;
  events_count: number;
  client: Client | null;
  suggestion: {
    location: string | null;
    address: string | null;
  } | null;
};

export type ClientPayload = {
  name: string;
  phone?: string;
  judet?: string;
  oras?: string;
  strada?: string;
  source?: string;
  notes?: string;
  last_contract_date?: string | null;
};

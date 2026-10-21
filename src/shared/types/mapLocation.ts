type Confirmation = { confirmed: boolean; confirmed_at: string | null };

export type MapLocation = Confirmation &
  (
    | {
        kind: 'google_place';
        place_id: string;
        latitude: null;
        longitude: null;
      }
    | {
        kind: 'manual_pin';
        place_id: null;
        latitude: number;
        longitude: number;
      }
  );

export type MapSelection =
  { place_id: string } | { latitude: number; longitude: number };
export type MapCoordinates = { latitude: number; longitude: number };
export type EventMapFields = {
  map_location?: MapLocation | null;
  location: string | null;
  address?: string | null;
};

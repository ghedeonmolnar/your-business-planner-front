import { IconName } from '@/shared/types/icon';

export const hallWeekdays = [
  'Luni',
  'Marți',
  'Miercuri',
  'Joi',
  'Vineri',
  'Sâmbătă',
  'Duminică',
];
export const hallAmenityOptions: { name: string; icon: IconName }[] = [
  { name: 'Aer condiționat', icon: 'snow-outline' },
  { name: 'Scenă', icon: 'albums-outline' },
  { name: 'Ring de dans', icon: 'musical-notes-outline' },
  { name: 'Sistem audio', icon: 'volume-high-outline' },
  { name: 'Videoproiector', icon: 'videocam-outline' },
  { name: 'Parcare', icon: 'car-outline' },
  { name: 'Terasă', icon: 'leaf-outline' },
  { name: 'Cameră miri', icon: 'people-outline' },
];
export const hallAmenityIcon = (name: string): IconName =>
  hallAmenityOptions.find(option => option.name === name)?.icon ??
  'checkmark-circle-outline';
export const hallNumber = (value: string | number | null) =>
  value === null ? 'Nespecificat' : Number(value).toLocaleString('ro-RO');

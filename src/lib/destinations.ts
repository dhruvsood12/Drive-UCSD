export interface Destination {
  name: string;
  coords: [number, number];
  icon: string;
  category: 'beach' | 'downtown' | 'nature' | 'shopping' | 'transport';
}

export const DESTINATIONS: Destination[] = [
  { name: 'Pacific Beach', coords: [-117.2536, 32.7937], icon: '🏖️', category: 'beach' },
  { name: 'La Jolla Cove', coords: [-117.2725, 32.8500], icon: '🌊', category: 'beach' },
  { name: 'Gaslamp', coords: [-117.1611, 32.7114], icon: '🌃', category: 'downtown' },
  { name: 'Torrey Pines', coords: [-117.2537, 32.9200], icon: '🌲', category: 'nature' },
  { name: 'Costco', coords: [-117.1800, 32.8100], icon: '🛒', category: 'shopping' },
  { name: 'IKEA', coords: [-117.1922, 32.8882], icon: '🪑', category: 'shopping' },
  { name: 'Airport', coords: [-117.1933, 32.7338], icon: '✈️', category: 'transport' },
  { name: 'Downtown', coords: [-117.1611, 32.7157], icon: '🏙️', category: 'downtown' },
  { name: 'Grocery', coords: [-117.2100, 32.8600], icon: '🛍️', category: 'shopping' },
];

export const DESTINATION_NAMES = DESTINATIONS.map(d => d.name);

export const TRIP_VIBES = [
  { value: 'study', label: '📚 Study Ride', color: 'bg-info/15 text-info' },
  { value: 'sunset', label: '🌅 Sunset Run', color: 'bg-warning/15 text-warning' },
  { value: 'beach', label: '🏖️ Beach Hang', color: 'bg-info/15 text-info' },
  { value: 'downtown', label: '🌃 Downtown Night', color: 'bg-primary/15 text-primary' },
  { value: 'grocery', label: '🛒 Grocery Run', color: 'bg-success/15 text-success' },
  { value: 'airport', label: '✈️ Airport Drop', color: 'bg-muted text-muted-foreground' },
  { value: 'custom', label: '✨ Custom Vibe', color: 'bg-secondary/15 text-secondary' },
] as const;

export type TripVibe = typeof TRIP_VIBES[number]['value'];

export const CAMPUSES = [
  { value: 'UCSD', label: 'UC San Diego', active: true },
  { value: 'UCLA', label: 'UCLA', active: false },
  { value: 'UCSB', label: 'UC Santa Barbara', active: false },
  { value: 'SDSU', label: 'San Diego State', active: false },
];

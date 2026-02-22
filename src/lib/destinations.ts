export interface Destination {
  name: string;
  coords: [number, number];
  icon: string;
  category: 'beach' | 'nightlife' | 'outdoors' | 'shopping' | 'travel';
}

export const DESTINATIONS: Destination[] = [
  // Beaches
  { name: 'Pacific Beach', coords: [-117.2536, 32.7937], icon: '🏖️', category: 'beach' },
  { name: 'Mission Beach', coords: [-117.2528, 32.7710], icon: '🌊', category: 'beach' },
  { name: 'Ocean Beach', coords: [-117.2538, 32.7485], icon: '🐚', category: 'beach' },
  { name: 'La Jolla Shores', coords: [-117.2571, 32.8574], icon: '🏄', category: 'beach' },
  { name: 'Del Mar Beach', coords: [-117.2652, 32.9594], icon: '☀️', category: 'beach' },
  // Nightlife
  { name: 'Gaslamp Quarter', coords: [-117.1611, 32.7114], icon: '🌃', category: 'nightlife' },
  { name: 'North Park', coords: [-117.1297, 32.7471], icon: '🍻', category: 'nightlife' },
  { name: 'Little Italy', coords: [-117.1683, 32.7228], icon: '🍝', category: 'nightlife' },
  { name: 'PB Bars', coords: [-117.2500, 32.7960], icon: '🍹', category: 'nightlife' },
  { name: 'Hillcrest', coords: [-117.1614, 32.7481], icon: '🎭', category: 'nightlife' },
  // Outdoors
  { name: 'Torrey Pines', coords: [-117.2537, 32.9200], icon: '🌲', category: 'outdoors' },
  { name: 'Sunset Cliffs', coords: [-117.2547, 32.7195], icon: '🌅', category: 'outdoors' },
  { name: 'Cowles Mountain', coords: [-117.0315, 32.8100], icon: '⛰️', category: 'outdoors' },
  { name: 'Balboa Park', coords: [-117.1468, 32.7343], icon: '🌳', category: 'outdoors' },
  // Shopping
  { name: 'UTC Mall', coords: [-117.2059, 32.8699], icon: '🛍️', category: 'shopping' },
  { name: 'Fashion Valley', coords: [-117.1690, 32.7666], icon: '👗', category: 'shopping' },
  { name: 'Costco', coords: [-117.1800, 32.8100], icon: '🛒', category: 'shopping' },
  { name: 'IKEA', coords: [-117.1922, 32.8882], icon: '🪑', category: 'shopping' },
  { name: 'Target La Jolla', coords: [-117.2101, 32.8540], icon: '🎯', category: 'shopping' },
  // Travel
  { name: 'SAN Airport', coords: [-117.1933, 32.7338], icon: '✈️', category: 'travel' },
  { name: 'Santa Fe Depot', coords: [-117.1711, 32.7162], icon: '🚂', category: 'travel' },
  { name: 'Old Town Transit', coords: [-117.1968, 32.7543], icon: '🚌', category: 'travel' },
];

export const DESTINATION_NAMES = DESTINATIONS.map(d => d.name);

export const DESTINATION_CATEGORIES = [
  { key: 'beach', label: '🏖️ Beaches', icon: '🏖️' },
  { key: 'nightlife', label: '🌃 Nightlife', icon: '🌃' },
  { key: 'outdoors', label: '🌲 Outdoors', icon: '🌲' },
  { key: 'shopping', label: '🛍️ Shopping', icon: '🛍️' },
  { key: 'travel', label: '✈️ Travel', icon: '✈️' },
] as const;

export const TRIP_VIBES = [
  { value: 'study', label: '📚 Study Ride', color: 'bg-info/15 text-info', category: 'academic' },
  { value: 'sunset', label: '🌅 Sunset Run', color: 'bg-warning/15 text-warning', category: 'social' },
  { value: 'beach', label: '🏖️ Beach Hang', color: 'bg-info/15 text-info', category: 'social' },
  { value: 'downtown', label: '🌃 Downtown Night', color: 'bg-primary/15 text-primary', category: 'social' },
  { value: 'grocery', label: '🛒 Grocery Run', color: 'bg-success/15 text-success', category: 'errands' },
  { value: 'airport', label: '✈️ Airport Drop', color: 'bg-muted text-muted-foreground', category: 'travel' },
  { value: 'gym', label: '💪 Gym Trip', color: 'bg-destructive/15 text-destructive', category: 'errands' },
  { value: 'hike', label: '🥾 Hike & Explore', color: 'bg-success/15 text-success', category: 'adventure' },
  { value: 'food', label: '🍕 Food Run', color: 'bg-warning/15 text-warning', category: 'errands' },
  { value: 'custom', label: '✨ Custom Vibe', color: 'bg-secondary/15 text-secondary', category: 'social' },
] as const;

export const VIBE_CATEGORIES = [
  { key: 'academic', label: 'Academic' },
  { key: 'social', label: 'Social' },
  { key: 'errands', label: 'Errands' },
  { key: 'travel', label: 'Travel' },
  { key: 'adventure', label: 'Adventure' },
] as const;

export type TripVibe = typeof TRIP_VIBES[number]['value'];

export const CAMPUSES = [
  { value: 'UCSD', label: 'UC San Diego', active: true },
  { value: 'UCLA', label: 'UCLA', active: false },
  { value: 'UCSB', label: 'UC Santa Barbara', active: false },
  { value: 'SDSU', label: 'San Diego State', active: false },
];

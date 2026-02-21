// UCSD Campus region model — fake coordinate system 0–100
export interface CampusRegion {
  id: string;
  label: string;
  // SVG polygon points in 0-100 coordinate space
  polygon: string;
  // center for label placement
  cx: number;
  cy: number;
  // HSL fill color (light mode)
  fill: string;
}

export const CAMPUS_REGIONS: CampusRegion[] = [
  { id: 'revelle',     label: 'Revelle',       polygon: '5,55 20,52 22,65 8,68',       cx: 13, cy: 60, fill: 'hsl(213 60% 85%)' },
  { id: 'muir',        label: 'Muir',          polygon: '20,52 35,48 38,60 22,65',      cx: 28, cy: 56, fill: 'hsl(170 45% 85%)' },
  { id: 'marshall',    label: 'Marshall',       polygon: '35,48 52,44 55,56 38,60',      cx: 45, cy: 52, fill: 'hsl(38 60% 87%)' },
  { id: 'erc',         label: 'ERC',           polygon: '52,44 70,40 73,52 55,56',      cx: 62, cy: 48, fill: 'hsl(280 35% 88%)' },
  { id: 'sixth',       label: 'Sixth',         polygon: '5,35 22,32 20,52 5,55',        cx: 13, cy: 43, fill: 'hsl(200 50% 87%)' },
  { id: 'seventh',     label: 'Seventh',       polygon: '22,32 40,28 35,48 20,52',      cx: 29, cy: 40, fill: 'hsl(150 40% 86%)' },
  { id: 'warren',      label: 'Warren',        polygon: '70,40 88,36 92,48 73,52',      cx: 80, cy: 44, fill: 'hsl(15 50% 88%)' },
  { id: 'geisel',      label: 'Geisel / Library Walk', polygon: '35,60 55,56 58,68 38,72', cx: 46, cy: 64, fill: 'hsl(44 70% 90%)' },
  { id: 'price',       label: 'Price Center',  polygon: '38,72 58,68 60,78 40,82',      cx: 49, cy: 75, fill: 'hsl(330 40% 89%)' },
  { id: 'rimac',       label: 'RIMAC',         polygon: '60,25 78,22 82,34 64,37',      cx: 71, cy: 30, fill: 'hsl(100 35% 86%)' },
];

// Major roads/paths as SVG path strings in 0-100 space
export const CAMPUS_ROADS = [
  // Gilman Drive (horizontal, upper)
  'M 0,30 Q 20,28 50,32 T 100,30',
  // Library Walk (horizontal, mid)
  'M 10,65 Q 35,62 60,66 T 95,64',
  // North Torrey Pines (vertical, left-center)
  'M 18,10 Q 20,40 22,70 T 20,95',
  // Voigt Dr (vertical, center)
  'M 50,8 Q 48,35 52,60 T 50,95',
  // La Jolla Village Dr (horizontal, top)
  'M 0,15 Q 30,12 60,16 T 100,14',
  // Ridge Walk (diagonal)
  'M 30,45 Q 45,50 60,55 T 80,60',
  // RIMAC connector
  'M 62,28 Q 65,40 58,55',
  // Scholars Dr
  'M 75,18 Q 82,30 88,42 T 92,55',
];

// Map a driver's college to a campus region center, with stable per-trip jitter
export function tripToCampusPos(tripId: string, driverCollege: string): { x: number; y: number } {
  const region = CAMPUS_REGIONS.find(
    r => r.label.toLowerCase() === driverCollege.toLowerCase()
  );
  // Stable hash from tripId for jitter
  let hash = 0;
  for (let i = 0; i < tripId.length; i++) {
    hash = ((hash << 5) - hash + tripId.charCodeAt(i)) | 0;
  }
  const jx = ((hash % 7) - 3) * 1.2;
  const jy = (((hash >> 3) % 7) - 3) * 1.2;

  if (region) {
    return { x: region.cx + jx, y: region.cy + jy };
  }
  // Fallback: Price Center area
  return { x: 49 + jx, y: 75 + jy };
}

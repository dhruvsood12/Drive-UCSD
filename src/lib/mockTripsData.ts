/**
 * Rich mock trip data for the demo feed & map.
 * Every driver has a full profile with avatar, ratings, etc.
 */
import type { DbTrip } from '@/hooks/useTrips';

const now = new Date();
const h = (hours: number) => new Date(now.getTime() + hours * 3600000).toISOString();

const avatar = (seed: string) => `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

const drivers: Record<string, DbTrip['driver']> = {
  d1: {
    id: 'd1', preferred_name: 'Alex Chen', college: 'Sixth', year: '3rd', major: 'Computer Science',
    interests: ['surfing', 'coding', 'boba', 'photography', 'hiking', 'gaming'],
    clubs: ['ACM', 'Surf Club', 'Photography Club'], music_tag: 'indie',
    avatar_url: avatar('alex-chen'), rating: 4.9,
  },
  d2: {
    id: 'd2', preferred_name: 'Maya Patel', college: 'Muir', year: '2nd', major: 'Data Science',
    interests: ['hiking', 'boba', 'anime', 'cooking', 'photography', 'yoga'],
    clubs: ['DS3', 'Hiking Club', 'Cooking Club'], music_tag: 'k-pop',
    avatar_url: avatar('maya-patel'), rating: 4.8,
  },
  d3: {
    id: 'd3', preferred_name: 'Jordan Lee', college: 'Marshall', year: '4th', major: 'Economics',
    interests: ['basketball', 'coding', 'music', 'finance', 'podcasts', 'running'],
    clubs: ['Econ Society', 'Intramurals', 'Finance Club'], music_tag: 'hip-hop',
    avatar_url: avatar('jordan-lee'), rating: 4.7,
  },
  d4: {
    id: 'd4', preferred_name: 'Sofia Rivera', college: 'Revelle', year: '1st', major: 'Biology',
    interests: ['surfing', 'yoga', 'cooking', 'art', 'meditation', 'reading'],
    clubs: ['Pre-Med Society', 'Surf Club'], music_tag: 'indie',
    avatar_url: avatar('sofia-rivera'), rating: 4.9,
  },
  d5: {
    id: 'd5', preferred_name: 'Ethan Kim', college: 'Warren', year: '3rd', major: 'Mechanical Eng',
    interests: ['gaming', 'anime', 'boba', '3D printing', 'robotics', 'music'],
    clubs: ['IEEE', 'Esports', 'Robotics Club'], music_tag: 'lo-fi',
    avatar_url: avatar('ethan-kim'), rating: 4.6,
  },
  d6: {
    id: 'd6', preferred_name: 'Priya Sharma', college: 'Sixth', year: '2nd', major: 'Cognitive Science',
    interests: ['hiking', 'photography', 'music', 'design', 'writing', 'boba'],
    clubs: ['Photography Club', 'CogSci Society', 'Design Lab'], music_tag: 'indie',
    avatar_url: avatar('priya-sharma'), rating: 4.9,
  },
  d7: {
    id: 'd7', preferred_name: 'Nina Gonzalez', college: 'ERC', year: '3rd', major: 'Political Science',
    interests: ['debate', 'boba', 'running', 'volunteering', 'cooking', 'travel'],
    clubs: ['Model UN', 'Track & Field', 'Volunteer Club'], music_tag: 'pop',
    avatar_url: avatar('nina-gonzalez'), rating: 4.8,
  },
  d8: {
    id: 'd8', preferred_name: 'Carlos Martinez', college: 'Seventh', year: '2nd', major: 'Math-CS',
    interests: ['coding', 'chess', 'music', 'math', 'boba', 'hiking'],
    clubs: ['ACM', 'Chess Club', 'Math Club'], music_tag: 'jazz',
    avatar_url: avatar('carlos-martinez'), rating: 4.7,
  },
  d9: {
    id: 'd9', preferred_name: 'Lily Nguyen', college: 'Warren', year: '4th', major: 'Bioengineering',
    interests: ['hiking', 'cooking', 'anime', 'research', 'piano', 'running'],
    clubs: ['BMES', 'Cooking Club', 'Research Lab'], music_tag: 'lo-fi',
    avatar_url: avatar('lily-nguyen'), rating: 4.8,
  },
  d10: {
    id: 'd10', preferred_name: 'Sam Okafor', college: 'Muir', year: '1st', major: 'Psychology',
    interests: ['surfing', 'photography', 'yoga', 'film', 'meditation', 'writing'],
    clubs: ['Psych Club', 'Surf Club', 'Film Club'], music_tag: 'indie',
    avatar_url: avatar('sam-okafor'), rating: 4.9,
  },
};

// Extra metadata keyed by driver id (not part of DbTrip type)
export const DRIVER_META: Record<string, { rides: number; badges: string[] }> = {
  d1: { rides: 24, badges: ['🏖️ Beach Explorer', '💻 Code Cruiser'] },
  d2: { rides: 18, badges: ['🌅 Sunset Chaser', '🛒 Grocery Hero'] },
  d3: { rides: 31, badges: ['🏀 Hoops Hauler', '🎵 DJ Rider'] },
  d4: { rides: 12, badges: ['🏄 Wave Rider'] },
  d5: { rides: 15, badges: ['🎮 Gamer Gang', '🤖 Tech Transfer'] },
  d6: { rides: 22, badges: ['📸 Scenic Route', '🌅 Sunset Chaser'] },
  d7: { rides: 19, badges: ['🏃 Speed Demon', '🌎 Globetrotter'] },
  d8: { rides: 11, badges: ['♟️ Strategic Driver', '🎵 Jazz Cruiser'] },
  d9: { rides: 27, badges: ['🧬 Lab to Beach', '🍳 Chef\'s Ride'] },
  d10: { rides: 8, badges: ['🏖️ Beach Explorer', '🎬 Scene Setter'] },
};

export const MOCK_DB_TRIPS: DbTrip[] = [
  { id: 'mock-1', driver_id: 'd1', from_location: 'Geisel Library', to_location: 'Pacific Beach', departure_time: h(0.5), seats_total: 4, seats_available: 2, comp_rate: 5, notes: 'Chill beach trip, AUX cord open 🎵', vibe: 'chill', coordinates: { lat: 32.7946, lng: -117.2535 }, created_at: now.toISOString(), driver: drivers.d1 },
  { id: 'mock-2', driver_id: 'd2', from_location: 'Price Center', to_location: 'Convoy St', departure_time: h(1), seats_total: 3, seats_available: 1, comp_rate: 6, notes: 'Ramen night at Menya Ultra 🍜', vibe: 'social', coordinates: { lat: 32.8208, lng: -117.1545 }, created_at: now.toISOString(), driver: drivers.d2 },
  { id: 'mock-3', driver_id: 'd3', from_location: 'Sixth College', to_location: 'Downtown Gaslamp', departure_time: h(0.25), seats_total: 4, seats_available: 3, comp_rate: 8, notes: 'Padres game tonight ⚾ Let\'s goooo', vibe: 'hype', coordinates: { lat: 32.7157, lng: -117.1611 }, created_at: now.toISOString(), driver: drivers.d3 },
  { id: 'mock-4', driver_id: 'd1', from_location: 'Warren Apartments', to_location: 'San Diego Airport', departure_time: h(3), seats_total: 4, seats_available: 4, comp_rate: 15, notes: 'SAN Terminal 2, trunk space for luggage ✈️', vibe: 'quiet', coordinates: { lat: 32.7338, lng: -117.1933 }, created_at: now.toISOString(), driver: drivers.d1 },
  { id: 'mock-5', driver_id: 'd6', from_location: 'Pepper Canyon', to_location: 'La Jolla Cove', departure_time: h(2), seats_total: 3, seats_available: 2, comp_rate: 4, notes: 'Golden hour photography session 📸', vibe: 'chill', coordinates: { lat: 32.8490, lng: -117.2726 }, created_at: now.toISOString(), driver: drivers.d6 },
  { id: 'mock-6', driver_id: 'd3', from_location: 'Marshall College', to_location: 'Hillcrest', departure_time: h(4), seats_total: 4, seats_available: 3, comp_rate: 7, notes: 'Brunch at Snooze then thrifting 🥞', vibe: 'social', coordinates: { lat: 32.7479, lng: -117.1611 }, created_at: now.toISOString(), driver: drivers.d3 },
  { id: 'mock-7', driver_id: 'd5', from_location: 'Warren Lecture Hall', to_location: 'UTC Westfield', departure_time: h(1.5), seats_total: 3, seats_available: 2, comp_rate: 3, notes: 'Costco + Target run, bring bags! 🛍️', vibe: 'chill', coordinates: { lat: 32.8716, lng: -117.2125 }, created_at: now.toISOString(), driver: drivers.d5 },
  { id: 'mock-8', driver_id: 'd4', from_location: 'Revelle Plaza', to_location: 'Blacks Beach', departure_time: h(5), seats_total: 2, seats_available: 1, comp_rate: 4, notes: 'Dawn patrol surf check 🏄 4:45am meet', vibe: 'chill', coordinates: { lat: 32.8812, lng: -117.2530 }, created_at: now.toISOString(), driver: drivers.d4 },
  { id: 'mock-9', driver_id: 'd7', from_location: 'ERC Dining Hall', to_location: 'North Park', departure_time: h(0.75), seats_total: 4, seats_available: 3, comp_rate: 6, notes: 'Coffee crawl ☕ hitting 3 spots', vibe: 'social', coordinates: { lat: 32.7467, lng: -117.1296 }, created_at: now.toISOString(), driver: drivers.d7 },
  { id: 'mock-10', driver_id: 'd8', from_location: 'Seventh College', to_location: 'San Diego Airport', departure_time: h(6), seats_total: 3, seats_available: 3, comp_rate: 14, notes: 'Red-eye flight, leaving 10pm sharp 🌙', vibe: 'quiet', coordinates: { lat: 32.7338, lng: -117.1933 }, created_at: now.toISOString(), driver: drivers.d8 },
  { id: 'mock-11', driver_id: 'd9', from_location: 'Warren Bear', to_location: '99 Ranch Market', departure_time: h(0.5), seats_total: 3, seats_available: 2, comp_rate: 4, notes: 'Hotpot supplies run + boba stop 🧋', vibe: 'social', coordinates: { lat: 32.8400, lng: -117.1530 }, created_at: now.toISOString(), driver: drivers.d9 },
  { id: 'mock-12', driver_id: 'd10', from_location: 'Muir Quad', to_location: 'Mission Beach', departure_time: h(1.25), seats_total: 4, seats_available: 4, comp_rate: 5, notes: 'Beach volleyball + sunset vibes 🏐', vibe: 'hype', coordinates: { lat: 32.7700, lng: -117.2520 }, created_at: now.toISOString(), driver: drivers.d10 },
  { id: 'mock-13', driver_id: 'd2', from_location: 'Muir Woods', to_location: 'H Mart Convoy', departure_time: h(2.5), seats_total: 2, seats_available: 1, comp_rate: 5, notes: 'K-BBQ dinner + karaoke after? 🎤', vibe: 'social', coordinates: { lat: 32.8208, lng: -117.1545 }, created_at: now.toISOString(), driver: drivers.d2 },
  { id: 'mock-14', driver_id: 'd7', from_location: 'ERC West', to_location: 'Balboa Park', departure_time: h(7), seats_total: 4, seats_available: 2, comp_rate: 6, notes: 'Free museum day! Bringing snacks 🎨', vibe: 'chill', coordinates: { lat: 32.7341, lng: -117.1441 }, created_at: now.toISOString(), driver: drivers.d7 },
  { id: 'mock-15', driver_id: 'd8', from_location: 'Seventh Res Halls', to_location: 'Ocean Beach', departure_time: h(3.5), seats_total: 3, seats_available: 3, comp_rate: 5, notes: 'OB sunset cliffs + fish tacos 🌮', vibe: 'chill', coordinates: { lat: 32.7498, lng: -117.2492 }, created_at: now.toISOString(), driver: drivers.d8 },
  { id: 'mock-16', driver_id: 'd9', from_location: 'Warren Apartments', to_location: 'San Diego Airport', departure_time: h(1), seats_total: 4, seats_available: 2, comp_rate: 14, notes: 'Southwest terminal, can fit 2 suitcases 🧳', vibe: 'quiet', coordinates: { lat: 32.7338, lng: -117.1933 }, created_at: now.toISOString(), driver: drivers.d9 },
  { id: 'mock-17', driver_id: 'd4', from_location: 'Revelle Parking', to_location: 'Little Italy', departure_time: h(5.5), seats_total: 3, seats_available: 2, comp_rate: 7, notes: 'Pizza + gelato crawl 🍕🍦', vibe: 'social', coordinates: { lat: 32.7262, lng: -117.1697 }, created_at: now.toISOString(), driver: drivers.d4 },
  { id: 'mock-18', driver_id: 'd10', from_location: 'Muir Parking', to_location: 'Target UTC', departure_time: h(0.3), seats_total: 2, seats_available: 1, comp_rate: 3, notes: 'Quick dorm essentials run 🎯', vibe: 'chill', coordinates: { lat: 32.8716, lng: -117.2125 }, created_at: now.toISOString(), driver: drivers.d10 },
  { id: 'mock-19', driver_id: 'd5', from_location: 'Warren College', to_location: 'Torrey Pines', departure_time: h(4.5), seats_total: 3, seats_available: 2, comp_rate: 4, notes: 'Sunset hike + bonfire on the beach 🔥', vibe: 'chill', coordinates: { lat: 32.9001, lng: -117.2512 }, created_at: now.toISOString(), driver: drivers.d5 },
  { id: 'mock-20', driver_id: 'd6', from_location: 'Sixth College', to_location: 'Encinitas', departure_time: h(8), seats_total: 4, seats_available: 4, comp_rate: 10, notes: 'Moonlight beach day trip! Pack lunch 🌊', vibe: 'hype', coordinates: { lat: 33.0370, lng: -117.2920 }, created_at: now.toISOString(), driver: drivers.d6 },
];

// ——— Demo Chat Data ———
export interface DemoChatThread {
  tripId: string;
  destination: string;
  driverName: string;
  driverAvatar: string;
  lastMessage: string;
  lastMessageAt: string;
  participants: number;
  unread: number;
  isPast: boolean;
  isActiveRide: boolean;
}

export const DEMO_CHAT_THREADS: DemoChatThread[] = [
  { tripId: 'mock-1', destination: 'Pacific Beach', driverName: 'Alex Chen', driverAvatar: avatar('alex-chen'), lastMessage: 'Leaving in 10! Meet at Geisel loop 🚗', lastMessageAt: new Date(now.getTime() - 5 * 60000).toISOString(), participants: 3, unread: 2, isPast: false, isActiveRide: true },
  { tripId: 'mock-2', destination: 'Convoy St', driverName: 'Maya Patel', driverAvatar: avatar('maya-patel'), lastMessage: 'Should we try the new ramen place?', lastMessageAt: new Date(now.getTime() - 45 * 60000).toISOString(), participants: 3, unread: 0, isPast: false, isActiveRide: false },
  { tripId: 'mock-3', destination: 'Downtown Gaslamp', driverName: 'Jordan Lee', driverAvatar: avatar('jordan-lee'), lastMessage: 'Got extra tickets if anyone needs!', lastMessageAt: new Date(now.getTime() - 2 * 3600000).toISOString(), participants: 4, unread: 1, isPast: false, isActiveRide: false },
  { tripId: 'mock-9', destination: 'North Park', driverName: 'Nina Gonzalez', driverAvatar: avatar('nina-gonzalez'), lastMessage: 'Dark Horse Coffee was amazing ☕', lastMessageAt: new Date(now.getTime() - 24 * 3600000).toISOString(), participants: 4, unread: 0, isPast: true, isActiveRide: false },
  { tripId: 'mock-12', destination: 'Mission Beach', driverName: 'Sam Okafor', driverAvatar: avatar('sam-okafor'), lastMessage: 'Thanks for the ride! Great sunset 🌅', lastMessageAt: new Date(now.getTime() - 48 * 3600000).toISOString(), participants: 3, unread: 0, isPast: true, isActiveRide: false },
  { tripId: 'mock-7', destination: 'UTC Westfield', driverName: 'Ethan Kim', driverAvatar: avatar('ethan-kim'), lastMessage: 'Split the Costco membership? 😂', lastMessageAt: new Date(now.getTime() - 72 * 3600000).toISOString(), participants: 3, unread: 0, isPast: true, isActiveRide: false },
];

// ——— Demo Wallet Transactions ———
export interface DemoTransaction {
  id: string;
  isOutgoing: boolean;
  amount: number;
  description: string;
  date: string;
  otherParty: string;
}

export const DEMO_TRANSACTIONS: DemoTransaction[] = [
  { id: 'tx-1', isOutgoing: true, amount: 5, description: 'Trip to Pacific Beach', date: new Date(now.getTime() - 2 * 3600000).toISOString(), otherParty: 'Alex Chen' },
  { id: 'tx-2', isOutgoing: false, amount: 8, description: 'Ride to Downtown Gaslamp', date: new Date(now.getTime() - 24 * 3600000).toISOString(), otherParty: 'Jordan Lee' },
  { id: 'tx-3', isOutgoing: true, amount: 6, description: 'Trip to Convoy St', date: new Date(now.getTime() - 36 * 3600000).toISOString(), otherParty: 'Maya Patel' },
  { id: 'tx-4', isOutgoing: false, amount: 12, description: 'Airport shuttle earnings', date: new Date(now.getTime() - 48 * 3600000).toISOString(), otherParty: 'Lily Nguyen' },
  { id: 'tx-5', isOutgoing: true, amount: 3, description: 'UTC Target run', date: new Date(now.getTime() - 72 * 3600000).toISOString(), otherParty: 'Sam Okafor' },
  { id: 'tx-6', isOutgoing: false, amount: 5, description: 'Beach ride earnings', date: new Date(now.getTime() - 96 * 3600000).toISOString(), otherParty: 'Sofia Rivera' },
  { id: 'tx-7', isOutgoing: true, amount: 7, description: 'Trip to Hillcrest', date: new Date(now.getTime() - 120 * 3600000).toISOString(), otherParty: 'Jordan Lee' },
  { id: 'tx-8', isOutgoing: false, amount: 4, description: 'Grocery run earnings', date: new Date(now.getTime() - 144 * 3600000).toISOString(), otherParty: 'Ethan Kim' },
  { id: 'tx-9', isOutgoing: true, amount: 10, description: 'Airport trip', date: new Date(now.getTime() - 168 * 3600000).toISOString(), otherParty: 'Carlos Martinez' },
  { id: 'tx-10', isOutgoing: false, amount: 6, description: 'North Park ride', date: new Date(now.getTime() - 192 * 3600000).toISOString(), otherParty: 'Nina Gonzalez' },
];

// ——— Demo Driver Dashboard Data ———
export const DEMO_WEEKLY_EARNINGS = [
  { day: 'Mon', amount: 18 },
  { day: 'Tue', amount: 12 },
  { day: 'Wed', amount: 25 },
  { day: 'Thu', amount: 8 },
  { day: 'Fri', amount: 32 },
  { day: 'Sat', amount: 45 },
  { day: 'Sun', amount: 22 },
];

/**
 * Centralized demo data for Drive UCSD.
 * All demo screens read from this file when in demo mode.
 */

const avatar = (seed: string) =>
  `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

// ——— Demo User Profile ———
export const DEMO_USER_PROFILE = {
  id: 'demo-user',
  email: 'demo@ucsd.edu',
  preferred_name: 'Jamie Torres',
  role: 'rider',
  college: 'Sixth',
  year: '3rd',
  major: 'Cognitive Science',
  interests: ['surfing', 'boba', 'hiking', 'photography', 'coding', 'yoga', 'cooking', 'anime', 'music', 'travel'],
  clubs: ['CogSci Society', 'Surf Club', 'Photography Club'],
  age: 21,
  gender: null,
  avatar_url: avatar('jamie-torres'),
  music_tag: 'indie',
  onboarding_complete: true,
  created_at: new Date(Date.now() - 90 * 24 * 3600000).toISOString(),
  personality_talk: 'depends',
  personality_music: 'either',
  personality_schedule: 'flexible',
  personality_social: 'balanced',
  clean_car_pref: 'medium',
  campus: 'UCSD',
  suspended: false,
  suspended_at: null,
  suspended_by: null,
};

// ——— Extended Demo Profile Stats (not in DB) ———
export const DEMO_USER_STATS = {
  rating: 4.8,
  totalRatings: 14,
  totalRides: 9,
  connectionsMade: 11,
  memberSince: new Date(Date.now() - 90 * 24 * 3600000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
  badges: ['🏖️ Beach Explorer', '📸 Scenic Route', '🧋 Boba Runner'],
  topDestination: 'Pacific Beach',
  commonCoRiders: ['Alex Chen', 'Maya Patel', 'Nina Gonzalez'],
  bio: 'CogSci major who loves sunset surf sessions and boba runs. Always down for a beach trip or a late-night Convoy food crawl 🏄‍♂️🧋',
};

// ——— Demo Ride History ———
export interface DemoRide {
  id: string;
  destination: string;
  from: string;
  date: string;
  driverName: string;
  driverAvatar: string;
  rating: number;
  cost: number;
  coRiders: number;
  vibe: string;
}

const now = new Date();
const ago = (days: number) => new Date(now.getTime() - days * 24 * 3600000).toISOString();

export const DEMO_RIDE_HISTORY: DemoRide[] = [
  { id: 'rh-1', destination: 'Pacific Beach', from: 'Geisel Library', date: ago(1), driverName: 'Alex Chen', driverAvatar: avatar('alex-chen'), rating: 5, cost: 5, coRiders: 2, vibe: 'chill' },
  { id: 'rh-2', destination: 'Convoy St', from: 'Price Center', date: ago(3), driverName: 'Maya Patel', driverAvatar: avatar('maya-patel'), rating: 5, cost: 6, coRiders: 2, vibe: 'social' },
  { id: 'rh-3', destination: 'Downtown Gaslamp', from: 'Sixth College', date: ago(5), driverName: 'Jordan Lee', driverAvatar: avatar('jordan-lee'), rating: 4, cost: 8, coRiders: 3, vibe: 'hype' },
  { id: 'rh-4', destination: 'North Park', from: 'ERC Dining Hall', date: ago(8), driverName: 'Nina Gonzalez', driverAvatar: avatar('nina-gonzalez'), rating: 5, cost: 6, coRiders: 3, vibe: 'social' },
  { id: 'rh-5', destination: 'Mission Beach', from: 'Muir Quad', date: ago(12), driverName: 'Sam Okafor', driverAvatar: avatar('sam-okafor'), rating: 5, cost: 5, coRiders: 3, vibe: 'hype' },
  { id: 'rh-6', destination: 'UTC Westfield', from: 'Warren Lecture Hall', date: ago(15), driverName: 'Ethan Kim', driverAvatar: avatar('ethan-kim'), rating: 4, cost: 3, coRiders: 2, vibe: 'chill' },
  { id: 'rh-7', destination: 'La Jolla Cove', from: 'Pepper Canyon', date: ago(20), driverName: 'Priya Sharma', driverAvatar: avatar('priya-sharma'), rating: 5, cost: 4, coRiders: 1, vibe: 'chill' },
  { id: 'rh-8', destination: 'San Diego Airport', from: 'Warren Apartments', date: ago(30), driverName: 'Carlos Martinez', driverAvatar: avatar('carlos-martinez'), rating: 5, cost: 14, coRiders: 2, vibe: 'quiet' },
  { id: 'rh-9', destination: 'Hillcrest', from: 'Marshall College', date: ago(35), driverName: 'Jordan Lee', driverAvatar: avatar('jordan-lee'), rating: 4, cost: 7, coRiders: 3, vibe: 'social' },
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
  { id: 'tx-1', isOutgoing: true, amount: 5, description: 'Trip to Pacific Beach', date: ago(0.08), otherParty: 'Alex Chen' },
  { id: 'tx-2', isOutgoing: false, amount: 8, description: 'Ride to Downtown Gaslamp', date: ago(1), otherParty: 'Jordan Lee' },
  { id: 'tx-3', isOutgoing: true, amount: 6, description: 'Trip to Convoy St', date: ago(1.5), otherParty: 'Maya Patel' },
  { id: 'tx-4', isOutgoing: false, amount: 12, description: 'Airport shuttle earnings', date: ago(2), otherParty: 'Lily Nguyen' },
  { id: 'tx-5', isOutgoing: true, amount: 3, description: 'UTC Target run', date: ago(3), otherParty: 'Sam Okafor' },
  { id: 'tx-6', isOutgoing: false, amount: 5, description: 'Beach ride earnings', date: ago(4), otherParty: 'Sofia Rivera' },
  { id: 'tx-7', isOutgoing: true, amount: 7, description: 'Trip to Hillcrest', date: ago(5), otherParty: 'Jordan Lee' },
  { id: 'tx-8', isOutgoing: false, amount: 4, description: 'Grocery run earnings', date: ago(6), otherParty: 'Ethan Kim' },
  { id: 'tx-9', isOutgoing: true, amount: 10, description: 'Airport trip', date: ago(7), otherParty: 'Carlos Martinez' },
  { id: 'tx-10', isOutgoing: false, amount: 6, description: 'North Park ride', date: ago(8), otherParty: 'Nina Gonzalez' },
  { id: 'tx-11', isOutgoing: true, amount: 4, description: 'La Jolla Cove trip', date: ago(10), otherParty: 'Priya Sharma' },
  { id: 'tx-12', isOutgoing: false, amount: 5, description: 'Mission Beach ride', date: ago(12), otherParty: 'Sam Okafor' },
];

// ——— Demo Chat Threads ———
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
  { tripId: 'mock-9', destination: 'North Park', driverName: 'Nina Gonzalez', driverAvatar: avatar('nina-gonzalez'), lastMessage: 'Dark Horse Coffee was amazing ☕', lastMessageAt: ago(1), participants: 4, unread: 0, isPast: true, isActiveRide: false },
  { tripId: 'mock-12', destination: 'Mission Beach', driverName: 'Sam Okafor', driverAvatar: avatar('sam-okafor'), lastMessage: 'Thanks for the ride! Great sunset 🌅', lastMessageAt: ago(2), participants: 3, unread: 0, isPast: true, isActiveRide: false },
  { tripId: 'mock-7', destination: 'UTC Westfield', driverName: 'Ethan Kim', driverAvatar: avatar('ethan-kim'), lastMessage: 'Split the Costco membership? 😂', lastMessageAt: ago(3), participants: 3, unread: 0, isPast: true, isActiveRide: false },
];

// ——— Demo Chat Messages (for chat detail) ———
export interface DemoChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  createdAt: string;
  isMe: boolean;
}

export const DEMO_CHAT_MESSAGES: Record<string, DemoChatMessage[]> = {
  'mock-1': [
    { id: 'cm-1', senderId: 'd1', senderName: 'Alex Chen', senderAvatar: avatar('alex-chen'), content: 'Hey! Beach trip is still on for today 🏖️', createdAt: new Date(now.getTime() - 30 * 60000).toISOString(), isMe: false },
    { id: 'cm-2', senderId: 'demo-user', senderName: 'Jamie Torres', senderAvatar: avatar('jamie-torres'), content: 'Awesome! Should I bring a volleyball?', createdAt: new Date(now.getTime() - 25 * 60000).toISOString(), isMe: true },
    { id: 'cm-3', senderId: 'd1', senderName: 'Alex Chen', senderAvatar: avatar('alex-chen'), content: 'Yesss! I have the net already 🏐', createdAt: new Date(now.getTime() - 20 * 60000).toISOString(), isMe: false },
    { id: 'cm-4', senderId: 'demo-user', senderName: 'Jamie Torres', senderAvatar: avatar('jamie-torres'), content: 'Perfect, see you at Geisel!', createdAt: new Date(now.getTime() - 15 * 60000).toISOString(), isMe: true },
    { id: 'cm-5', senderId: 'd1', senderName: 'Alex Chen', senderAvatar: avatar('alex-chen'), content: 'Leaving in 10! Meet at Geisel loop 🚗', createdAt: new Date(now.getTime() - 5 * 60000).toISOString(), isMe: false },
  ],
  'mock-2': [
    { id: 'cm-6', senderId: 'd2', senderName: 'Maya Patel', senderAvatar: avatar('maya-patel'), content: 'Convoy run tonight — who\'s in? 🍜', createdAt: new Date(now.getTime() - 2 * 3600000).toISOString(), isMe: false },
    { id: 'cm-7', senderId: 'demo-user', senderName: 'Jamie Torres', senderAvatar: avatar('jamie-torres'), content: 'Me! I\'ve been craving ramen all week', createdAt: new Date(now.getTime() - 90 * 60000).toISOString(), isMe: true },
    { id: 'cm-8', senderId: 'd2', senderName: 'Maya Patel', senderAvatar: avatar('maya-patel'), content: 'Should we try the new ramen place?', createdAt: new Date(now.getTime() - 45 * 60000).toISOString(), isMe: false },
  ],
  'mock-3': [
    { id: 'cm-9', senderId: 'd3', senderName: 'Jordan Lee', senderAvatar: avatar('jordan-lee'), content: 'Padres game tonight! Anyone need a ride downtown?', createdAt: new Date(now.getTime() - 5 * 3600000).toISOString(), isMe: false },
    { id: 'cm-10', senderId: 'demo-user', senderName: 'Jamie Torres', senderAvatar: avatar('jamie-torres'), content: 'Count me in 🙌', createdAt: new Date(now.getTime() - 4 * 3600000).toISOString(), isMe: true },
    { id: 'cm-11', senderId: 'd3', senderName: 'Jordan Lee', senderAvatar: avatar('jordan-lee'), content: 'Got extra tickets if anyone needs!', createdAt: new Date(now.getTime() - 2 * 3600000).toISOString(), isMe: false },
  ],
};

// ——— Demo Driver Dashboard ———
export const DEMO_WEEKLY_EARNINGS = [
  { day: 'Mon', amount: 18 },
  { day: 'Tue', amount: 12 },
  { day: 'Wed', amount: 25 },
  { day: 'Thu', amount: 8 },
  { day: 'Fri', amount: 32 },
  { day: 'Sat', amount: 45 },
  { day: 'Sun', amount: 22 },
];

export const DEMO_DRIVER_STATS = {
  weeklyTotal: 162,
  completionRate: 96,
  totalRides: 24,
  avgRating: 4.9,
};

export const DEMO_NEXT_RIDE = {
  destination: 'Pacific Beach',
  departureTime: new Date(now.getTime() + 2 * 3600000).toISOString(),
  riders: 2,
  earnings: 10,
};

export const DEMO_GROWTH_TIPS = [
  '🕐 Peak hours: Fri 4–7pm, Sat 11am–2pm — drive then for 2–3x more requests',
  '🏖️ Beach destinations have the highest demand on weekends',
  '⭐ Your 4.9 rating qualifies you for priority matching',
  '📈 Complete 30 rides to unlock Gold Driver status',
];

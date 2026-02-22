/**
 * Shared rich mock trip data used as fallback by both the Feed and Map
 * when the database has no/few trips.
 */
import type { DbTrip } from '@/hooks/useTrips';

const now = new Date();
const h = (hours: number) => new Date(now.getTime() + hours * 3600000).toISOString();

const drivers: Record<string, DbTrip['driver']> = {
  d1: { id: 'd1', preferred_name: 'Alex', college: 'Sixth', year: '3rd', major: 'Computer Science', interests: ['surfing', 'coding', 'boba'], clubs: ['ACM', 'Surf Club'], music_tag: 'indie', avatar_url: null },
  d2: { id: 'd2', preferred_name: 'Maya', college: 'Muir', year: '2nd', major: 'Data Science', interests: ['hiking', 'boba', 'anime'], clubs: ['DS3', 'Hiking Club'], music_tag: 'k-pop', avatar_url: null },
  d3: { id: 'd3', preferred_name: 'Jordan', college: 'Marshall', year: '4th', major: 'Economics', interests: ['basketball', 'coding', 'music'], clubs: ['Econ Society', 'Intramurals'], music_tag: 'hip-hop', avatar_url: null },
  d4: { id: 'd4', preferred_name: 'Sofia', college: 'Revelle', year: '1st', major: 'Biology', interests: ['surfing', 'yoga', 'cooking'], clubs: ['Pre-Med Society', 'Surf Club'], music_tag: 'indie', avatar_url: null },
  d5: { id: 'd5', preferred_name: 'Ethan', college: 'Warren', year: '3rd', major: 'Mechanical Eng', interests: ['gaming', 'anime', 'boba'], clubs: ['IEEE', 'Esports'], music_tag: 'lo-fi', avatar_url: null },
  d6: { id: 'd6', preferred_name: 'Priya', college: 'Sixth', year: '2nd', major: 'Cognitive Science', interests: ['hiking', 'photography', 'music'], clubs: ['Photo Club', 'CogSci Society'], music_tag: 'indie', avatar_url: null },
  d7: { id: 'd7', preferred_name: 'Nina', college: 'ERC', year: '3rd', major: 'Political Science', interests: ['debate', 'boba', 'running'], clubs: ['Model UN', 'Track'], music_tag: 'pop', avatar_url: null },
  d8: { id: 'd8', preferred_name: 'Carlos', college: 'Seventh', year: '2nd', major: 'Math-CS', interests: ['coding', 'chess', 'music'], clubs: ['ACM', 'Chess Club'], music_tag: 'jazz', avatar_url: null },
  d9: { id: 'd9', preferred_name: 'Lily', college: 'Warren', year: '4th', major: 'Bioengineering', interests: ['hiking', 'cooking', 'anime'], clubs: ['BMES', 'Cooking Club'], music_tag: 'lo-fi', avatar_url: null },
  d10: { id: 'd10', preferred_name: 'Sam', college: 'Muir', year: '1st', major: 'Psychology', interests: ['surfing', 'photography', 'yoga'], clubs: ['Psych Club', 'Surf Club'], music_tag: 'indie', avatar_url: null },
};

export const MOCK_DB_TRIPS: DbTrip[] = [
  { id: 'mock-1', driver_id: 'd1', from_location: 'UC San Diego', to_location: 'Pacific Beach', departure_time: h(0.5), seats_total: 4, seats_available: 3, comp_rate: 5, notes: 'Chill beach trip, music on 🎵', coordinates: {}, created_at: now.toISOString(), driver: drivers.d1 },
  { id: 'mock-2', driver_id: 'd2', from_location: 'UC San Diego', to_location: 'Downtown', departure_time: h(1), seats_total: 3, seats_available: 2, comp_rate: 7, notes: 'Heading to Gaslamp for dinner 🍜', coordinates: {}, created_at: now.toISOString(), driver: drivers.d2 },
  { id: 'mock-3', driver_id: 'd3', from_location: 'UC San Diego', to_location: 'Grocery', departure_time: h(0.25), seats_total: 2, seats_available: 1, comp_rate: 3, notes: "Quick Trader Joe's run 🛒", coordinates: {}, created_at: now.toISOString(), driver: drivers.d3 },
  { id: 'mock-4', driver_id: 'd1', from_location: 'UC San Diego', to_location: 'Airport', departure_time: h(3), seats_total: 4, seats_available: 4, comp_rate: 15, notes: 'SAN drop-off, trunk space available ✈️', coordinates: {}, created_at: now.toISOString(), driver: drivers.d1 },
  { id: 'mock-5', driver_id: 'd6', from_location: 'UC San Diego', to_location: 'Pacific Beach', departure_time: h(2), seats_total: 3, seats_available: 2, comp_rate: 5, notes: 'Sunset session 🌅', coordinates: {}, created_at: now.toISOString(), driver: drivers.d6 },
  { id: 'mock-6', driver_id: 'd3', from_location: 'UC San Diego', to_location: 'Downtown', departure_time: h(4), seats_total: 4, seats_available: 3, comp_rate: 8, notes: 'Concert tonight at SOMA 🎸', coordinates: {}, created_at: now.toISOString(), driver: drivers.d3 },
  { id: 'mock-7', driver_id: 'd5', from_location: 'UC San Diego', to_location: 'Grocery', departure_time: h(1.5), seats_total: 3, seats_available: 2, comp_rate: 3, notes: 'Costco run, bring bags! 🛍️', coordinates: {}, created_at: now.toISOString(), driver: drivers.d5 },
  { id: 'mock-8', driver_id: 'd4', from_location: 'UC San Diego', to_location: 'Pacific Beach', departure_time: h(5), seats_total: 2, seats_available: 1, comp_rate: 5, notes: 'Morning surf check 🏄', coordinates: {}, created_at: now.toISOString(), driver: drivers.d4 },
  { id: 'mock-9', driver_id: 'd7', from_location: 'UC San Diego', to_location: 'Downtown', departure_time: h(0.75), seats_total: 4, seats_available: 3, comp_rate: 7, notes: 'Horton Plaza shopping trip 🛍️', coordinates: {}, created_at: now.toISOString(), driver: drivers.d7 },
  { id: 'mock-10', driver_id: 'd8', from_location: 'UC San Diego', to_location: 'Airport', departure_time: h(6), seats_total: 3, seats_available: 3, comp_rate: 12, notes: 'Red-eye flight pickup, leaving at 10pm', coordinates: {}, created_at: now.toISOString(), driver: drivers.d8 },
  { id: 'mock-11', driver_id: 'd9', from_location: 'UC San Diego', to_location: 'Grocery', departure_time: h(0.5), seats_total: 3, seats_available: 2, comp_rate: 4, notes: 'H-Mart snack run 🍙', coordinates: {}, created_at: now.toISOString(), driver: drivers.d9 },
  { id: 'mock-12', driver_id: 'd10', from_location: 'UC San Diego', to_location: 'Pacific Beach', departure_time: h(1.25), seats_total: 4, seats_available: 4, comp_rate: 5, notes: 'Beach volleyball anyone? 🏐', coordinates: {}, created_at: now.toISOString(), driver: drivers.d10 },
  { id: 'mock-13', driver_id: 'd2', from_location: 'UC San Diego', to_location: 'Grocery', departure_time: h(2.5), seats_total: 2, seats_available: 1, comp_rate: 3, notes: '99 Ranch run for hotpot supplies 🍲', coordinates: {}, created_at: now.toISOString(), driver: drivers.d2 },
  { id: 'mock-14', driver_id: 'd7', from_location: 'UC San Diego', to_location: 'Downtown', departure_time: h(7), seats_total: 4, seats_available: 2, comp_rate: 8, notes: 'Padres game tonight ⚾', coordinates: {}, created_at: now.toISOString(), driver: drivers.d7 },
  { id: 'mock-15', driver_id: 'd8', from_location: 'UC San Diego', to_location: 'Pacific Beach', departure_time: h(3.5), seats_total: 3, seats_available: 3, comp_rate: 5, notes: 'Taco Tuesday at PB 🌮', coordinates: {}, created_at: now.toISOString(), driver: drivers.d8 },
  { id: 'mock-16', driver_id: 'd9', from_location: 'UC San Diego', to_location: 'Airport', departure_time: h(1), seats_total: 4, seats_available: 2, comp_rate: 14, notes: 'Southwest terminal, can fit luggage 🧳', coordinates: {}, created_at: now.toISOString(), driver: drivers.d9 },
  { id: 'mock-17', driver_id: 'd4', from_location: 'UC San Diego', to_location: 'Downtown', departure_time: h(5.5), seats_total: 3, seats_available: 2, comp_rate: 7, notes: 'Little Italy dinner crawl 🍕', coordinates: {}, created_at: now.toISOString(), driver: drivers.d4 },
  { id: 'mock-18', driver_id: 'd10', from_location: 'UC San Diego', to_location: 'Grocery', departure_time: h(0.3), seats_total: 2, seats_available: 1, comp_rate: 3, notes: "Quick Target run 🎯", coordinates: {}, created_at: now.toISOString(), driver: drivers.d10 },
  { id: 'mock-19', driver_id: 'd5', from_location: 'UC San Diego', to_location: 'Pacific Beach', departure_time: h(4.5), seats_total: 3, seats_available: 2, comp_rate: 5, notes: 'Bonfire on the beach tonight 🔥', coordinates: {}, created_at: now.toISOString(), driver: drivers.d5 },
  { id: 'mock-20', driver_id: 'd6', from_location: 'UC San Diego', to_location: 'Airport', departure_time: h(8), seats_total: 4, seats_available: 4, comp_rate: 13, notes: 'Spring break airport shuttle! ✈️🌴', coordinates: {}, created_at: now.toISOString(), driver: drivers.d6 },
];

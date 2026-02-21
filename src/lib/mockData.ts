import { User, Trip, RideRequest, Destination } from '@/types';

export const DESTINATIONS: { name: Destination; coordinates: { lat: number; lng: number } }[] = [
  { name: 'UCSD', coordinates: { lat: 32.8801, lng: -117.2340 } },
  { name: 'Pacific Beach', coordinates: { lat: 32.7937, lng: -117.2536 } },
  { name: 'Downtown', coordinates: { lat: 32.7157, lng: -117.1611 } },
  { name: 'Grocery', coordinates: { lat: 32.8600, lng: -117.2100 } },
  { name: 'Airport', coordinates: { lat: 32.7338, lng: -117.1933 } },
];

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alex Chen', preferredName: 'Alex', email: 'achen@ucsd.edu', year: '3rd', major: 'Computer Science', rating: 4.8, interests: ['surfing', 'coding', 'boba'], clubs: ['ACM', 'Surf Club'], college: 'Sixth', musicTag: 'indie', ageRange: '21-23' },
  { id: 'u2', name: 'Maya Patel', preferredName: 'Maya', email: 'mpatel@ucsd.edu', year: '2nd', major: 'Data Science', rating: 4.9, interests: ['hiking', 'boba', 'anime'], clubs: ['DS3', 'Hiking Club'], college: 'Muir', musicTag: 'k-pop', ageRange: '18-20' },
  { id: 'u3', name: 'Jordan Lee', preferredName: 'Jordan', email: 'jlee@ucsd.edu', year: '4th', major: 'Economics', rating: 4.6, interests: ['basketball', 'coding', 'music'], clubs: ['Econ Society', 'Intramurals'], college: 'Marshall', musicTag: 'hip-hop', ageRange: '21-23' },
  { id: 'u4', name: 'Sofia Rivera', preferredName: 'Sofia', email: 'srivera@ucsd.edu', year: '1st', major: 'Biology', rating: 4.7, interests: ['surfing', 'yoga', 'cooking'], clubs: ['Pre-Med Society', 'Surf Club'], college: 'Revelle', musicTag: 'indie', ageRange: '18-20' },
  { id: 'u5', name: 'Ethan Kim', preferredName: 'Ethan', email: 'ekim@ucsd.edu', year: '3rd', major: 'Mechanical Eng', rating: 4.5, interests: ['gaming', 'anime', 'boba'], clubs: ['IEEE', 'Esports'], college: 'Warren', musicTag: 'lo-fi', ageRange: '21-23' },
  { id: 'u6', name: 'Priya Sharma', preferredName: 'Priya', email: 'psharma@ucsd.edu', year: '2nd', major: 'Cognitive Science', rating: 4.9, interests: ['hiking', 'photography', 'music'], clubs: ['Photography Club', 'CogSci Society'], college: 'Sixth', musicTag: 'indie', ageRange: '18-20' },
];

const now = new Date();
const h = (hours: number) => new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();

export const MOCK_TRIPS: Trip[] = [
  { id: 't1', driverId: 'u1', destination: 'Pacific Beach', departureTime: h(0.5), seatsAvailable: 3, totalSeats: 4, compensationRate: 5, notes: 'Chill beach trip, music on 🎵', coordinates: DESTINATIONS[1].coordinates },
  { id: 't2', driverId: 'u2', destination: 'Downtown', departureTime: h(1), seatsAvailable: 2, totalSeats: 3, compensationRate: 7, notes: 'Heading to Gaslamp for dinner', coordinates: DESTINATIONS[2].coordinates },
  { id: 't3', driverId: 'u3', destination: 'Grocery', departureTime: h(0.25), seatsAvailable: 1, totalSeats: 2, compensationRate: 3, notes: 'Quick Trader Joe\'s run', coordinates: DESTINATIONS[3].coordinates },
  { id: 't4', driverId: 'u1', destination: 'Airport', departureTime: h(3), seatsAvailable: 4, totalSeats: 4, compensationRate: 15, notes: 'SAN airport drop-off, trunk space available', coordinates: DESTINATIONS[4].coordinates },
  { id: 't5', driverId: 'u2', destination: 'Pacific Beach', departureTime: h(2), seatsAvailable: 2, totalSeats: 3, compensationRate: 5, notes: 'Sunset session 🌅', coordinates: DESTINATIONS[1].coordinates },
  { id: 't6', driverId: 'u3', destination: 'Downtown', departureTime: h(4), seatsAvailable: 3, totalSeats: 4, compensationRate: 8, notes: 'Concert tonight at SOMA', coordinates: DESTINATIONS[2].coordinates },
  { id: 't7', driverId: 'u6', destination: 'Grocery', departureTime: h(1.5), seatsAvailable: 2, totalSeats: 3, compensationRate: 3, notes: 'Costco run, bring bags!', coordinates: DESTINATIONS[3].coordinates },
  { id: 't8', driverId: 'u6', destination: 'Pacific Beach', departureTime: h(5), seatsAvailable: 1, totalSeats: 2, compensationRate: 5, notes: 'Morning surf check 🏄', coordinates: DESTINATIONS[1].coordinates },
];

export const MOCK_REQUESTS: RideRequest[] = [
  { id: 'r1', tripId: 't1', riderId: 'u4', status: 'pending', createdAt: new Date().toISOString() },
  { id: 'r2', tripId: 't2', riderId: 'u5', status: 'confirmed', createdAt: new Date().toISOString() },
  { id: 'r3', tripId: 't3', riderId: 'u4', status: 'pending', createdAt: new Date().toISOString() },
];

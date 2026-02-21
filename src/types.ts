export type Role = 'rider' | 'driver';

export type RequestStatus = 'pending' | 'confirmed' | 'declined';

export type Destination = 'Pacific Beach' | 'Downtown' | 'Grocery' | 'Airport' | 'UCSD';

export interface User {
  id: string;
  name: string;
  preferredName?: string;
  email: string;
  year: string;
  major: string;
  rating: number;
  interests: string[];
  clubs: string[];
  college: string;
  musicTag?: string;
  gender?: string;
  avatarUrl?: string;
  ageRange?: '18-20' | '21-23' | '24+';
}

export interface Trip {
  id: string;
  driverId: string;
  destination: Destination;
  departureTime: string; // ISO string
  seatsAvailable: number;
  totalSeats: number;
  compensationRate: number;
  notes: string;
  coordinates: { lat: number; lng: number };
}

export interface RideRequest {
  id: string;
  tripId: string;
  riderId: string;
  status: RequestStatus;
  createdAt: string;
}

export interface CompatibilityResult {
  score: number;
  reasons: string[];
}

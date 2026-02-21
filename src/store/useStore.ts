import { create } from 'zustand';
import { User, Trip, RideRequest, Role, RequestStatus, Destination } from '@/types';
import { MOCK_USERS, MOCK_TRIPS, MOCK_REQUESTS } from '@/lib/mockData';

interface Filters {
  destination: Destination | null;
  timeWindow: 'now' | '1hr' | 'today' | null;
}

type SortMode = 'soonest' | 'bestMatch';

interface StoreState {
  currentUser: User | null;
  users: User[];
  role: Role;
  trips: Trip[];
  requests: RideRequest[];
  selectedTripId: string | null;
  hoveredTripId: string | null;
  filters: Filters;
  sortMode: SortMode;
  activeTab: 'feed' | 'map';

  setCurrentUser: (user: User) => void;
  updateCurrentUser: (payload: Partial<User>) => void;
  setRole: (role: Role) => void;
  setActiveTab: (tab: 'feed' | 'map') => void;
  setSelectedTripId: (id: string | null) => void;
  setHoveredTripId: (id: string | null) => void;
  setFilters: (filters: Partial<Filters>) => void;
  setSortMode: (mode: SortMode) => void;
  addTrip: (trip: Trip) => void;
  addRequest: (request: RideRequest) => void;
  updateRequestStatus: (requestId: string, status: RequestStatus) => void;
  getUserById: (id: string) => User | undefined;
  getRequestsForTrip: (tripId: string) => RideRequest[];
  getFilteredTrips: () => Trip[];
}

export const useStore = create<StoreState>((set, get) => ({
  currentUser: MOCK_USERS[3], // Default demo rider
  users: MOCK_USERS,
  role: 'rider',
  trips: MOCK_TRIPS,
  requests: MOCK_REQUESTS,
  selectedTripId: null,
  hoveredTripId: null,
  filters: { destination: null, timeWindow: null },
  sortMode: 'soonest',
  activeTab: 'feed',

  setCurrentUser: (user) => set({ currentUser: user }),
  updateCurrentUser: (payload) => set((s) => {
    if (!s.currentUser) return {};
    const updated = { ...s.currentUser, ...payload };
    return {
      currentUser: updated,
      users: s.users.map(u => u.id === updated.id ? updated : u),
    };
  }),
  setRole: (role) => set({ role }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedTripId: (id) => set({ selectedTripId: id }),
  setHoveredTripId: (id) => set({ hoveredTripId: id }),
  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  setSortMode: (mode) => set({ sortMode: mode }),

  addTrip: (trip) => set((s) => ({ trips: [trip, ...s.trips] })),

  addRequest: (request) => set((s) => ({ requests: [...s.requests, request] })),

  updateRequestStatus: (requestId, status) =>
    set((s) => {
      const requests = s.requests.map((r) =>
        r.id === requestId ? { ...r, status } : r
      );
      // If confirmed, decrement seat
      if (status === 'confirmed') {
        const req = s.requests.find((r) => r.id === requestId);
        if (req) {
          const trips = s.trips.map((t) =>
            t.id === req.tripId && t.seatsAvailable > 0
              ? { ...t, seatsAvailable: t.seatsAvailable - 1 }
              : t
          );
          return { requests, trips };
        }
      }
      return { requests };
    }),

  getUserById: (id) => get().users.find((u) => u.id === id),
  getRequestsForTrip: (tripId) => get().requests.filter((r) => r.tripId === tripId),

  getFilteredTrips: () => {
    const { trips, filters, sortMode } = get();
    let filtered = [...trips];

    if (filters.destination) {
      filtered = filtered.filter((t) => t.destination === filters.destination);
    }

    if (filters.timeWindow) {
      const now = Date.now();
      filtered = filtered.filter((t) => {
        const dep = new Date(t.departureTime).getTime();
        if (filters.timeWindow === 'now') return dep - now < 30 * 60 * 1000;
        if (filters.timeWindow === '1hr') return dep - now < 60 * 60 * 1000;
        return dep - now < 24 * 60 * 60 * 1000;
      });
    }

    if (sortMode === 'soonest') {
      filtered.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());
    }

    return filtered;
  },
}));

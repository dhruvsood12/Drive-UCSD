import { Trip, RideRequest, User } from '@/types';
import { useStore } from '@/store/useStore';

// Tiny API wrapper — all UI calls go through here.
// Replace these stubs with real fetch calls when backend is ready.

let requestCounter = 100;
let tripCounter = 100;

export const api = {
  demoLogin(email: string, name: string) {
    const store = useStore.getState();
    const user = store.users.find(u => u.email === email);
    if (user) {
      store.setCurrentUser(user);
    } else {
      const newUser: User = {
        id: `u_${Date.now()}`,
        name,
        preferredName: name,
        email,
        year: '2nd',
        major: 'Undeclared',
        rating: 5.0,
        interests: [],
        clubs: [],
        college: 'Sixth',
      };
      store.setCurrentUser(newUser);
    }
  },

  getMe(userId: string) {
    return useStore.getState().users.find(u => u.id === userId) || null;
  },

  updateMe(payload: Partial<User>) {
    const store = useStore.getState();
    store.updateCurrentUser(payload);
  },

  getTrips(): Trip[] {
    return useStore.getState().trips;
  },

  createTrip(payload: Omit<Trip, 'id'>) {
    const store = useStore.getState();
    const newTrip: Trip = { ...payload, id: `t${++tripCounter}` };
    store.addTrip(newTrip);
    return newTrip;
  },

  requestSeat(tripId: string, riderId: string) {
    const store = useStore.getState();
    const req: RideRequest = {
      id: `r${++requestCounter}`,
      tripId,
      riderId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    store.addRequest(req);
    return req;
  },

  acceptRequest(requestId: string, _driverId: string) {
    const store = useStore.getState();
    store.updateRequestStatus(requestId, 'confirmed');
  },

  declineRequest(requestId: string, _driverId: string) {
    const store = useStore.getState();
    store.updateRequestStatus(requestId, 'declined');
  },
};

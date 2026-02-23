import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface RideRequestRow {
  id: string;
  trip_id: string;
  rider_id: string;
  status: string;
  message: string;
  created_at: string;
  rider?: {
    id: string;
    preferred_name: string | null;
    college: string | null;
    year: string | null;
    major: string | null;
    interests: string[];
    clubs: string[];
    avatar_url: string | null;
    music_tag: string | null;
  };
  trip?: {
    id: string;
    to_location: string;
    departure_time: string;
    seats_available: number;
    seats_total: number;
    comp_rate: number;
    driver_id: string;
  };
}

/** Fetch all requests for a specific trip */
export function useRequestsForTrip(tripId: string) {
  const [requests, setRequests] = useState<RideRequestRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('ride_requests')
      .select('*, rider:profiles!ride_requests_rider_id_fkey(id, preferred_name, college, year, major, interests, clubs, avatar_url, music_tag)')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false });
    setRequests((data || []) as unknown as RideRequestRow[]);
    setLoading(false);
  }, [tripId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { requests, loading, refetch: fetch };
}

/** Fetch all requests where the current user is the driver (via trips table) */
export function useDriverRequests() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<RideRequestRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!profile) { setLoading(false); return; }

    const { data } = await supabase
      .from('ride_requests')
      .select('*, rider:profiles!ride_requests_rider_id_fkey(id, preferred_name, college, year, major, interests, clubs, avatar_url, music_tag), trip:trips!ride_requests_trip_id_fkey(id, to_location, departure_time, seats_available, seats_total, comp_rate, driver_id)')
      .order('created_at', { ascending: false });

    // Filter client-side to only show requests for this driver's trips
    const filtered = ((data || []) as unknown as RideRequestRow[]).filter(
      r => r.trip?.driver_id === profile.id
    );
    setRequests(filtered);
    setLoading(false);
  }, [profile?.id]);

  useEffect(() => { fetch(); }, [fetch]);

  // Realtime subscription
  useEffect(() => {
    if (!profile) return;
    const channel = supabase
      .channel('driver-requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ride_requests' }, () => {
        fetch();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile?.id, fetch]);

  return { requests, loading, refetch: fetch };
}

/** Fetch all requests where the current user is the rider */
export function useMyRequests() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<RideRequestRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!profile) { setLoading(false); return; }

    const { data } = await supabase
      .from('ride_requests')
      .select('*, trip:trips!ride_requests_trip_id_fkey(id, to_location, departure_time, seats_available, seats_total, comp_rate, driver_id)')
      .eq('rider_id', profile.id)
      .order('created_at', { ascending: false });

    setRequests((data || []) as unknown as RideRequestRow[]);
    setLoading(false);
  }, [profile?.id]);

  useEffect(() => { fetch(); }, [fetch]);

  // Realtime
  useEffect(() => {
    if (!profile) return;
    const channel = supabase
      .channel('my-requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ride_requests', filter: `rider_id=eq.${profile.id}` }, () => {
        fetch();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile?.id, fetch]);

  return { requests, loading, refetch: fetch };
}

/** Request a seat on a trip */
export async function requestSeat(tripId: string, riderId: string, message?: string) {
  const { error } = await supabase.from('ride_requests').insert({
    trip_id: tripId,
    rider_id: riderId,
    status: 'pending',
    message: message || '',
  } as any);
  return { error };
}

/** Accept a ride request */
export async function acceptRequest(requestId: string, tripId: string) {
  const { error: updateErr } = await supabase
    .from('ride_requests')
    .update({ status: 'accepted' } as any)
    .eq('id', requestId);
  if (updateErr) return { error: updateErr };

  // Decrement seats
  const { data: tripData } = await supabase.from('trips').select('seats_available').eq('id', tripId).single();
  if (tripData && (tripData as any).seats_available > 0) {
    await supabase.from('trips').update({ seats_available: (tripData as any).seats_available - 1 } as any).eq('id', tripId);
  }
  return { error: null };
}

/** Send a system message to a trip chat */
export async function sendSystemMessage(tripId: string, content: string) {
  const SYSTEM_SENDER = '00000000-0000-0000-0000-000000000000';
  // System messages bypass RLS — use edge function or service role if needed
  // For demo, insert directly (will work if user is a trip participant)
  await supabase.from('chat_messages').insert({
    trip_id: tripId,
    sender_id: SYSTEM_SENDER,
    content,
  } as any);
}

/** Start a ride (driver action) */
export async function startRide(tripId: string) {
  const { error } = await supabase.from('trips').update({
    status: 'active',
    started_at: new Date().toISOString(),
  } as any).eq('id', tripId);
  if (!error) {
    await sendSystemMessage(tripId, '🚗 Ride has begun!');
  }
  return { error };
}

/** Complete a ride */
export async function completeRide(tripId: string) {
  const { error } = await supabase.from('trips').update({
    status: 'completed',
    completed_at: new Date().toISOString(),
  } as any).eq('id', tripId);
  if (!error) {
    await sendSystemMessage(tripId, '✅ Ride completed! Thanks for riding together.');
  }
  return { error };
}

/** Deny a ride request */
export async function denyRequest(requestId: string) {
  const { error } = await supabase
    .from('ride_requests')
    .update({ status: 'denied' } as any)
    .eq('id', requestId);
  return { error };
}

/** Check if user already has a request for a trip */
export async function getMyRequestForTrip(tripId: string, riderId: string) {
  const { data } = await supabase
    .from('ride_requests')
    .select('id, status')
    .eq('trip_id', tripId)
    .eq('rider_id', riderId)
    .maybeSingle();
  return data as { id: string; status: string } | null;
}

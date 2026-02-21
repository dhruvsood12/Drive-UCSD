import { useState } from 'react';
import { useTrips } from '@/hooks/useTrips';
import MapboxMap, { MapTrip } from './MapboxMap';

const DESTINATIONS = ['Pacific Beach', 'Downtown', 'Grocery', 'Airport'];
const TIME_WINDOWS = [
  { value: 'now', label: 'Now' },
  { value: '1hr', label: '< 1 hr' },
  { value: 'today', label: 'Today' },
];

const RealMapPage = () => {
  const [destination, setDestination] = useState<string | null>(null);
  const [timeWindow, setTimeWindow] = useState<string | null>(null);
  const { trips, loading } = useTrips({ destination, timeWindow });

  const mapTrips: MapTrip[] = trips.map(t => ({
    id: t.id,
    to_location: t.to_location,
    departure_time: t.departure_time,
    seats_available: t.seats_available,
    seats_total: t.seats_total,
    comp_rate: Number(t.comp_rate),
    notes: t.notes,
    coordinates: t.coordinates,
    driver_id: t.driver_id,
    driver: t.driver ? {
      preferred_name: t.driver.preferred_name,
      college: t.driver.college,
      year: t.driver.year,
      major: t.driver.major,
      interests: t.driver.interests,
      clubs: t.driver.clubs,
      music_tag: t.driver.music_tag,
    } : undefined,
  }));

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 shrink-0">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setDestination(null)} className={`chip ${!destination ? 'chip-active' : 'chip-inactive'}`}>All</button>
          {DESTINATIONS.map(d => (
            <button key={d} onClick={() => setDestination(destination === d ? null : d)} className={`chip ${destination === d ? 'chip-active' : 'chip-inactive'}`}>{d}</button>
          ))}
        </div>
        <select
          value={timeWindow || ''}
          onChange={e => setTimeWindow(e.target.value || null)}
          className="h-9 px-3 rounded-lg border border-border bg-card text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Any time</option>
          {TIME_WINDOWS.map(tw => <option key={tw.value} value={tw.value}>{tw.label}</option>)}
        </select>
      </div>

      {/* Map fills remaining space */}
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <MapboxMap trips={mapTrips} />
        )}
      </div>
    </div>
  );
};

export default RealMapPage;

import { useState, useCallback, useRef } from 'react';
import { useTrips } from '@/hooks/useTrips';
import MapboxMap, { MapTrip } from './MapboxMap';
import { DESTINATIONS } from '@/lib/destinations';
import { Search, X, ArrowDownLeft, ArrowUpRight, Shuffle, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DIRECTION_FILTERS = [
  { key: 'all' as const, label: 'All Rides', icon: <Shuffle className="w-3.5 h-3.5" /> },
  { key: 'to_campus' as const, label: 'To Campus', icon: <ArrowDownLeft className="w-3.5 h-3.5" /> },
  { key: 'from_campus' as const, label: 'From Campus', icon: <ArrowUpRight className="w-3.5 h-3.5" /> },
];

const TIME_WINDOWS = [
  { value: 'now', label: 'Now' },
  { value: '1hr', label: '< 1 hr' },
  { value: 'today', label: 'Today' },
];

const RealMapPage = () => {
  const [destination, setDestination] = useState<string | null>(null);
  const [timeWindow, setTimeWindow] = useState<string | null>(null);
  const [directionFilter, setDirectionFilter] = useState<'all' | 'to_campus' | 'from_campus'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const { trips, loading } = useTrips({ destination, timeWindow });

  const mapTrips: MapTrip[] = trips.map(t => ({
    id: t.id,
    to_location: t.to_location,
    from_location: (t as any).from_location,
    departure_time: t.departure_time,
    seats_available: t.seats_available,
    seats_total: t.seats_total,
    comp_rate: Number(t.comp_rate),
    notes: t.notes,
    coordinates: t.coordinates,
    driver_id: t.driver_id,
    status: (t as any).status,
    driver: t.driver ? {
      id: t.driver.id,
      preferred_name: t.driver.preferred_name,
      college: t.driver.college,
      year: t.driver.year,
      major: t.driver.major,
      interests: t.driver.interests,
      clubs: t.driver.clubs,
      music_tag: t.driver.music_tag,
      avatar_url: t.driver.avatar_url,
    } : undefined,
  }));

  // Autocomplete suggestions
  const suggestions = searchQuery.length > 0
    ? DESTINATIONS.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // search applied via prop to MapboxMap
    }, 200);
  }, []);

  const handleSelectSuggestion = (name: string) => {
    setSearchQuery(name);
    setDestination(name);
    setSearchFocused(false);
    searchRef.current?.blur();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Floating search + filter bar */}
      <div className="relative z-20 mb-3 flex flex-col gap-2">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            ref={searchRef}
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
            placeholder="Where are you going?"
            className="w-full h-11 pl-10 pr-10 rounded-xl border border-border bg-card text-foreground text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setDestination(null); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Autocomplete dropdown */}
          <AnimatePresence>
            {searchFocused && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute top-full left-0 right-0 mt-1 bg-card rounded-xl border border-border shadow-lg overflow-hidden z-50"
              >
                {suggestions.map(d => (
                  <button
                    key={d.name}
                    onMouseDown={() => handleSelectSuggestion(d.name)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-left"
                  >
                    <span className="text-base">{d.icon}</span>
                    <span className="text-foreground font-medium">{d.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto capitalize">{d.category}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Direction filter + time */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {DIRECTION_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setDirectionFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                directionFilter === f.key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {f.icon}
              {f.label}
            </button>
          ))}

          <div className="w-px h-5 bg-border shrink-0" />

          <select
            value={timeWindow || ''}
            onChange={e => setTimeWindow(e.target.value || null)}
            className="h-8 px-2.5 rounded-full border border-border bg-card text-muted-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring shrink-0"
          >
            <option value="">Any time</option>
            {TIME_WINDOWS.map(tw => <option key={tw.value} value={tw.value}>{tw.label}</option>)}
          </select>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <MapboxMap
            trips={mapTrips}
            directionFilter={directionFilter}
            searchQuery={searchQuery}
          />
        )}
      </div>
    </div>
  );
};

export default RealMapPage;

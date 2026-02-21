import { useStore } from '@/store/useStore';
import { Destination } from '@/types';

const DESTINATIONS: Destination[] = ['Pacific Beach', 'Downtown', 'Grocery', 'Airport'];
const TIME_WINDOWS = [
  { value: 'now' as const, label: 'Now' },
  { value: '1hr' as const, label: '< 1 hr' },
  { value: 'today' as const, label: 'Today' },
];

const FiltersBar = () => {
  const { filters, setFilters, sortMode, setSortMode } = useStore();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
      {/* Destination chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilters({ destination: null })}
          className={`chip ${!filters.destination ? 'chip-active' : 'chip-inactive'}`}
        >
          All
        </button>
        {DESTINATIONS.map((d) => (
          <button
            key={d}
            onClick={() => setFilters({ destination: filters.destination === d ? null : d })}
            className={`chip ${filters.destination === d ? 'chip-active' : 'chip-inactive'}`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Time window */}
      <div className="flex items-center gap-2">
        <select
          value={filters.timeWindow || ''}
          onChange={(e) => setFilters({ timeWindow: (e.target.value || null) as any })}
          className="h-9 px-3 rounded-lg border border-border bg-card text-card-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Any time</option>
          {TIME_WINDOWS.map((tw) => (
            <option key={tw.value} value={tw.value}>{tw.label}</option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div className="flex items-center gap-1 ml-auto bg-muted rounded-lg p-1">
        {(['soonest', 'bestMatch'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setSortMode(mode)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-150 ${
              sortMode === mode
                ? 'bg-card text-card-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {mode === 'soonest' ? 'Soonest' : 'Best Match'}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FiltersBar;

import { useState, useMemo } from 'react';
import { CAR_MAKES, CAR_MODELS, CAR_YEARS, CAR_COLORS } from '@/lib/carData';
import { Search, Car } from 'lucide-react';

interface DriverVehicleFormProps {
  carMake: string;
  carModel: string;
  carYear: number | '';
  carColor: string;
  licensePlate: string;
  onChangeCarMake: (v: string) => void;
  onChangeCarModel: (v: string) => void;
  onChangeCarYear: (v: number | '') => void;
  onChangeCarColor: (v: string) => void;
  onChangeLicensePlate: (v: string) => void;
}

const DriverVehicleForm = ({
  carMake, carModel, carYear, carColor, licensePlate,
  onChangeCarMake, onChangeCarModel, onChangeCarYear, onChangeCarColor, onChangeLicensePlate,
}: DriverVehicleFormProps) => {
  const [makeSearch, setMakeSearch] = useState('');
  const [showMakeDropdown, setShowMakeDropdown] = useState(false);
  const [modelSearch, setModelSearch] = useState('');
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const filteredMakes = useMemo(() => {
    if (!makeSearch.trim()) return CAR_MAKES.slice(0, 10);
    return CAR_MAKES.filter(m => m.toLowerCase().includes(makeSearch.toLowerCase())).slice(0, 10);
  }, [makeSearch]);

  const availableModels = CAR_MODELS[carMake] || [];
  const filteredModels = useMemo(() => {
    if (!modelSearch.trim()) return availableModels.slice(0, 10);
    return availableModels.filter(m => m.toLowerCase().includes(modelSearch.toLowerCase())).slice(0, 10);
  }, [modelSearch, carMake]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Car className="w-5 h-5 text-primary" />
        <h4 className="font-display text-base font-bold text-foreground">Vehicle Information</h4>
      </div>

      {/* Car Make */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Car Make *</label>
        <div className="relative">
          <div className="flex items-center border border-border rounded-lg bg-background px-3">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              value={carMake || makeSearch}
              onChange={e => { onChangeCarMake(''); onChangeCarModel(''); setMakeSearch(e.target.value); setShowMakeDropdown(true); }}
              onFocus={() => setShowMakeDropdown(true)}
              onBlur={() => setTimeout(() => setShowMakeDropdown(false), 200)}
              placeholder="Search car makes..."
              className="flex-1 h-10 px-2 bg-transparent text-sm text-foreground outline-none"
            />
          </div>
          {showMakeDropdown && filteredMakes.length > 0 && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredMakes.map(m => (
                <button
                  key={m}
                  onMouseDown={() => { onChangeCarMake(m); onChangeCarModel(''); setMakeSearch(''); setShowMakeDropdown(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Car Model */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Car Model *</label>
        <div className="relative">
          <div className="flex items-center border border-border rounded-lg bg-background px-3">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              value={carModel || modelSearch}
              onChange={e => { onChangeCarModel(''); setModelSearch(e.target.value); setShowModelDropdown(true); }}
              onFocus={() => setShowModelDropdown(true)}
              onBlur={() => setTimeout(() => setShowModelDropdown(false), 200)}
              placeholder={carMake ? `Search ${carMake} models...` : 'Select make first'}
              disabled={!carMake}
              className="flex-1 h-10 px-2 bg-transparent text-sm text-foreground outline-none disabled:opacity-50"
            />
          </div>
          {showModelDropdown && filteredModels.length > 0 && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredModels.map(m => (
                <button
                  key={m}
                  onMouseDown={() => { onChangeCarModel(m); setModelSearch(''); setShowModelDropdown(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Year */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Year *</label>
          <select
            value={carYear}
            onChange={e => onChangeCarYear(e.target.value ? Number(e.target.value) : '')}
            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm"
          >
            <option value="">Select year</option>
            {CAR_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Color</label>
          <select
            value={carColor}
            onChange={e => onChangeCarColor(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm"
          >
            <option value="">Select color</option>
            {CAR_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* License Plate */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">License Plate *</label>
        <input
          value={licensePlate}
          onChange={e => onChangeLicensePlate(e.target.value.toUpperCase())}
          placeholder="e.g. 8ABC123"
          maxLength={10}
          className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-ring uppercase"
        />
      </div>
    </div>
  );
};

export default DriverVehicleForm;

import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Car, X, Upload, Search, Check } from 'lucide-react';
import { UCSD_CLUBS, INTEREST_OPTIONS } from '@/lib/ucsdClubs';
import { UCSD_MAJORS as UCSD_MAJORS_LIST } from '@/lib/ucsdMajors';

const COLLEGES = ['Revelle', 'Muir', 'Marshall', 'Warren', 'Sixth', 'Seventh', 'ERC'];
const YEARS = ['1st', '2nd', '3rd', '4th', '5th+', 'Grad'];
const GENDERS = ['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say'];
const TOTAL_STEPS = 4;

const Onboarding = () => {
  const { session, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1 - Role
  const [role, setRole] = useState<string>('rider');

  // Step 2 - Profile
  const [preferredName, setPreferredName] = useState('');
  const [college, setCollege] = useState('');
  const [year, setYear] = useState('');
  const [major, setMajor] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Step 3 - Personality
  const [personalityTalk, setPersonalityTalk] = useState('');
  const [personalityMusic, setPersonalityMusic] = useState('');
  const [personalitySchedule, setPersonalitySchedule] = useState('');
  const [personalitySocial, setPersonalitySocial] = useState('');
  const [cleanCarPref, setCleanCarPref] = useState('');

  // Step 4 - Interests & Clubs
  const [interests, setInterests] = useState<string[]>([]);
  const [clubs, setClubs] = useState<string[]>([]);
  const [clubSearch, setClubSearch] = useState('');
  const [showClubDropdown, setShowClubDropdown] = useState(false);

  const filteredClubs = useMemo(() => {
    if (!clubSearch.trim()) return [];
    const q = clubSearch.toLowerCase();
    return UCSD_CLUBS.filter(c => c.toLowerCase().includes(q) && !clubs.includes(c)).slice(0, 8);
  }, [clubSearch, clubs]);

  if (!session) return <Navigate to="/login" replace />;
  if (profile?.onboarding_complete) return <Navigate to="/" replace />;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : prev.length < 15 ? [...prev, interest] : prev
    );
  };

  const validateStep = (s: number): boolean => {
    if (s === 2 && (!preferredName || !college || !year || !major || !age)) {
      toast.error('Please fill in all required fields');
      return false;
    }
    if (s === 3 && (!personalityTalk || !personalityMusic || !personalitySchedule || !personalitySocial || !cleanCarPref)) {
      toast.error('Please answer all personality questions');
      return false;
    }
    if (s === 4 && interests.length < 3) {
      toast.error('Please select at least 3 interests');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep(s => Math.min(s + 1, TOTAL_STEPS));
  };

  const handleFinish = async () => {
    if (!validateStep(4)) return;

    setSaving(true);
    let avatarUrl: string | null = null;

    if (avatarFile && session.user) {
      const ext = avatarFile.name.split('.').pop();
      const path = `${session.user.id}/avatar.${ext}`;
      const { error } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true });
      if (!error) {
        const { data } = supabase.storage.from('avatars').getPublicUrl(path);
        avatarUrl = data.publicUrl;
      }
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        preferred_name: preferredName,
        role,
        college,
        year,
        major,
        interests,
        clubs,
        age: Number(age),
        gender: gender || null,
        avatar_url: avatarUrl,
        personality_talk: personalityTalk,
        personality_music: personalityMusic,
        personality_schedule: personalitySchedule,
        personality_social: personalitySocial,
        clean_car_pref: cleanCarPref,
        onboarding_complete: true,
      } as any)
      .eq('id', session.user.id);

    if (error) {
      toast.error('Failed to save profile');
      console.error(error);
    } else {
      await refreshProfile();
      toast.success('Profile complete! 🎉');
      navigate('/');
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-lg ucsd-gradient flex items-center justify-center">
            <Car className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">Setup your profile</span>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(s => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-lg">

          {/* STEP 1 — Role */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground mb-1">How will you use Drive UCSD?</h3>
                <p className="text-sm text-muted-foreground">You can change this anytime</p>
              </div>
              <div className="space-y-2">
                {(['rider', 'driver', 'both'] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`w-full py-3 rounded-lg border text-sm font-semibold capitalize transition-all ${
                      role === r ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground hover:bg-muted'
                    }`}
                  >
                    {r === 'both' ? 'Both (Driver & Rider)' : r}
                  </button>
                ))}
              </div>
              <button onClick={nextStep} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all">
                Next
              </button>
            </div>
          )}

          {/* STEP 2 — Profile basics */}
          {step === 2 && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground mb-1">Your UCSD Profile</h3>
                <p className="text-sm text-muted-foreground">Fields marked with * are required</p>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <label className="cursor-pointer">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
                    {avatarPreview ? (
                      <img src={avatarPreview} className="w-full h-full object-cover" alt="Avatar" />
                    ) : (
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
                <span className="text-sm text-muted-foreground">Upload profile photo</span>
              </div>

              <Field label="Preferred Name *" value={preferredName} onChange={setPreferredName} placeholder="What should we call you?" />

              <SelectField label="College *" value={college} onChange={setCollege} options={COLLEGES} placeholder="Select college" />
              <SelectField label="Year *" value={year} onChange={setYear} options={YEARS} placeholder="Select year" />
              <SearchableField label="Major *" value={major} onChange={setMajor} options={UCSD_MAJORS_LIST} placeholder="Search UCSD majors..." />

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Age *</label>
                <input
                  type="number"
                  min={16}
                  max={99}
                  value={age}
                  onChange={e => setAge(e.target.value ? Number(e.target.value) : '')}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <SelectField label="Gender (optional)" value={gender} onChange={setGender} options={GENDERS} placeholder="Prefer not to say" />

              <div className="flex gap-2 pt-2">
                <button onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">Back</button>
                <button onClick={nextStep} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all">Next</button>
              </div>
            </div>
          )}

          {/* STEP 3 — Personality */}
          {step === 3 && (
            <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground mb-1">Your Ride Personality</h3>
                <p className="text-sm text-muted-foreground">We use this to match you with compatible riders & drivers</p>
              </div>

              <PersonalityQuestion
                label="Are you talkative or quiet?"
                value={personalityTalk}
                onChange={setPersonalityTalk}
                options={[
                  { value: 'talkative', label: '🗣️ Talkative' },
                  { value: 'quiet', label: '🤫 Quiet' },
                  { value: 'depends', label: '🤷 Depends on the vibe' },
                ]}
              />
              <PersonalityQuestion
                label="Music preference?"
                value={personalityMusic}
                onChange={setPersonalityMusic}
                options={[
                  { value: 'music', label: '🎵 Music on' },
                  { value: 'no_music', label: '🔇 No music' },
                  { value: 'either', label: '🎧 Either way' },
                ]}
              />
              <PersonalityQuestion
                label="Early bird or night owl?"
                value={personalitySchedule}
                onChange={setPersonalitySchedule}
                options={[
                  { value: 'early', label: '🌅 Early bird' },
                  { value: 'night', label: '🦉 Night owl' },
                  { value: 'flexible', label: '⏰ Flexible' },
                ]}
              />
              <PersonalityQuestion
                label="Study-focused or social?"
                value={personalitySocial}
                onChange={setPersonalitySocial}
                options={[
                  { value: 'study', label: '📚 Study-focused' },
                  { value: 'social', label: '🎉 Social butterfly' },
                  { value: 'balanced', label: '⚖️ Balanced' },
                ]}
              />
              <PersonalityQuestion
                label="Clean car preference?"
                value={cleanCarPref}
                onChange={setCleanCarPref}
                options={[
                  { value: 'high', label: '✨ Spotless' },
                  { value: 'medium', label: '👍 Reasonable' },
                  { value: 'low', label: '🤷 Don\'t care' },
                ]}
              />

              <div className="flex gap-2 pt-2">
                <button onClick={() => setStep(2)} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">Back</button>
                <button onClick={nextStep} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all">Next</button>
              </div>
            </div>
          )}

          {/* STEP 4 — Interests & Clubs */}
          {step === 4 && (
            <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground mb-1">Interests & Clubs</h3>
                <p className="text-sm text-muted-foreground">Select at least 3 interests. Clubs use the official UCSD list.</p>
              </div>

              {/* Interests - multi-select chips */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Interests * ({interests.length}/15 selected)</label>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                  {INTEREST_OPTIONS.map(interest => {
                    const active = interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`chip text-xs ${active ? 'chip-active' : 'chip-inactive'}`}
                      >
                        {active && <Check className="w-3 h-3 mr-0.5" />}
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clubs - searchable autocomplete */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">UCSD Clubs (optional)</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {clubs.map(club => (
                    <span key={club} className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground flex items-center gap-1">
                      {club}
                      <button onClick={() => setClubs(clubs.filter(c => c !== club))}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <div className="flex items-center border border-border rounded-lg bg-background px-3">
                    <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input
                      value={clubSearch}
                      onChange={e => { setClubSearch(e.target.value); setShowClubDropdown(true); }}
                      onFocus={() => setShowClubDropdown(true)}
                      onBlur={() => setTimeout(() => setShowClubDropdown(false), 200)}
                      placeholder="Search official UCSD clubs..."
                      className="flex-1 h-9 px-2 bg-transparent text-sm text-foreground outline-none"
                    />
                  </div>
                  {showClubDropdown && filteredClubs.length > 0 && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {filteredClubs.map(club => (
                        <button
                          key={club}
                          onMouseDown={() => {
                            setClubs(prev => [...prev, club]);
                            setClubSearch('');
                            setShowClubDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        >
                          {club}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={() => setStep(3)} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">Back</button>
                <button
                  onClick={handleFinish}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Complete Setup'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Reusable components
const Field = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
  </div>
);

const SearchableField = ({ label, value, onChange, options, placeholder }: { label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder: string }) => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const filtered = useMemo(() => {
    if (!search.trim()) return [];
    return options.filter(o => o.toLowerCase().includes(search.toLowerCase())).slice(0, 8);
  }, [search, options]);
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
      <div className="relative">
        <input
          value={value || search}
          onChange={e => { onChange(''); setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder={placeholder}
          className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {open && filtered.length > 0 && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filtered.map(o => (
              <button key={o} onMouseDown={() => { onChange(o); setSearch(''); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">{o}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SelectField = ({ label, value, onChange, options, placeholder }: { label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder: string }) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm">
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const PersonalityQuestion = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
    <div className="flex gap-2">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-all ${
            value === opt.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground hover:bg-muted'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

export default Onboarding;

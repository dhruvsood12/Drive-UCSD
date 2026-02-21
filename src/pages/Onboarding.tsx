import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Car, X, Upload } from 'lucide-react';

const COLLEGES = ['Revelle', 'Muir', 'Marshall', 'Warren', 'Sixth', 'Seventh', 'ERC'];
const YEARS = ['1st', '2nd', '3rd', '4th', 'Grad'];
const GENDERS = ['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say'];

const Onboarding = () => {
  const { session, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1
  const [role, setRole] = useState<string>('rider');

  // Step 2
  const [preferredName, setPreferredName] = useState('');
  const [college, setCollege] = useState('');
  const [year, setYear] = useState('');
  const [major, setMajor] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [clubs, setClubs] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [newClub, setNewClub] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  if (!session) return <Navigate to="/login" replace />;
  if (profile?.onboarding_complete) return <Navigate to="/" replace />;

  const addTag = (list: string[], setList: (v: string[]) => void, val: string, setVal: (v: string) => void) => {
    const trimmed = val.trim();
    if (trimmed && !list.includes(trimmed) && list.length < 10) {
      setList([...list, trimmed]);
    }
    setVal('');
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleFinish = async () => {
    if (!preferredName || !college || !year || !major || !age) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (interests.length < 3) {
      toast.error('Please add at least 3 interests');
      return;
    }

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
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-lg ucsd-gradient flex items-center justify-center">
            <Car className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">Setup your profile</span>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {[1, 2].map(s => (
            <div key={s} className={`flex-1 h-1.5 rounded-full ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-lg">
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
              <button
                onClick={() => setStep(2)}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all"
              >
                Next
              </button>
            </div>
          )}

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
                      <img src={avatarPreview} className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
                <span className="text-sm text-muted-foreground">Upload profile photo</span>
              </div>

              <Field label="Preferred Name *" value={preferredName} onChange={setPreferredName} placeholder="What should we call you?" />

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">College *</label>
                <select value={college} onChange={e => setCollege(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm">
                  <option value="">Select college</option>
                  {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Year *</label>
                <select value={year} onChange={e => setYear(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm">
                  <option value="">Select year</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              <Field label="Major *" value={major} onChange={setMajor} placeholder="e.g. Computer Science" />

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

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Gender (optional)</label>
                <select value={gender} onChange={e => setGender(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm">
                  <option value="">Prefer not to say</option>
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              {/* Interests */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Interests * (at least 3)</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {interests.map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground flex items-center gap-1">
                      {tag}
                      <button onClick={() => setInterests(interests.filter(t => t !== tag))}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={newInterest}
                    onChange={e => setNewInterest(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(interests, setInterests, newInterest, setNewInterest))}
                    placeholder="Add interest..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none"
                  />
                  <button onClick={() => addTag(interests, setInterests, newInterest, setNewInterest)} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">Add</button>
                </div>
              </div>

              {/* Clubs */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Clubs / Activities (optional)</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {clubs.map(club => (
                    <span key={club} className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground flex items-center gap-1">
                      {club}
                      <button onClick={() => setClubs(clubs.filter(c => c !== club))}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={newClub}
                    onChange={e => setNewClub(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(clubs, setClubs, newClub, setNewClub))}
                    placeholder="Add club..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none"
                  />
                  <button onClick={() => addTag(clubs, setClubs, newClub, setNewClub)} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">Add</button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">Back</button>
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

const Field = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    />
  </div>
);

export default Onboarding;

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { computeCompatibility, profileToCompatibility, CompatibilityProfile } from '@/lib/compatibility';
import { UCSD_CLUBS, INTEREST_OPTIONS } from '@/lib/ucsdClubs';
import { UCSD_MAJORS } from '@/lib/ucsdMajors';
import { TRIP_VIBES } from '@/lib/destinations';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Star, MapPin, GraduationCap, Calendar, Music, Users, Sparkles, MessageCircle, Flag, Share2, Pencil, Upload, X, Search, Check, Award, Ban, Car, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import ReportModal from '@/components/ReportModal';
import WalletCard from '@/components/WalletCard';
import { useBlocking } from '@/hooks/useBlocking';

interface DbProfile {
  id: string;
  email: string;
  preferred_name: string | null;
  college: string | null;
  year: string | null;
  major: string | null;
  interests: string[];
  clubs: string[];
  age: number | null;
  gender: string | null;
  avatar_url: string | null;
  music_tag: string | null;
  personality_talk: string | null;
  personality_music: string | null;
  personality_schedule: string | null;
  personality_social: string | null;
  clean_car_pref: string | null;
  onboarding_complete: boolean;
  created_at: string;
}

const COLLEGES = ['Revelle', 'Muir', 'Marshall', 'Warren', 'Sixth', 'Seventh', 'ERC'];
const YEARS = ['1st', '2nd', '3rd', '4th', '5th+', 'Grad'];

const PERSONALITY_LABELS: Record<string, Record<string, string>> = {
  talk: { talkative: '🗣️ Talkative', quiet: '🤫 Quiet', depends: '🤷 Depends on the vibe' },
  music: { music: '🎵 Music on', no_music: '🔇 No music', either: '🎧 Either way' },
  schedule: { early: '🌅 Early bird', night: '🦉 Night owl', flexible: '⏰ Flexible' },
  social: { study: '📚 Study-focused', social: '🎉 Social butterfly', balanced: '⚖️ Balanced' },
};

// Ride badges based on simple heuristics
const RIDE_BADGES = [
  { icon: '🏖️', label: 'Beach Explorer', condition: (interests: string[]) => interests.some(i => i.toLowerCase().includes('beach') || i.toLowerCase().includes('surf')) },
  { icon: '🛒', label: 'Grocery Hero', condition: (_: string[], clubs: string[]) => true }, // placeholder
  { icon: '🌅', label: 'Sunset Chaser', condition: (interests: string[]) => interests.some(i => i.toLowerCase().includes('hiking') || i.toLowerCase().includes('beach')) },
  { icon: '🎵', label: 'DJ Rider', condition: (interests: string[]) => interests.some(i => i.toLowerCase().includes('music')) },
  { icon: '💪', label: 'Fitness Cruiser', condition: (interests: string[]) => interests.some(i => i.toLowerCase().includes('fitness') || i.toLowerCase().includes('gym') || i.toLowerCase().includes('running')) },
];

const ProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { profile: myProfile, user, refreshProfile } = useAuth();
  const [profileData, setProfileData] = useState<DbProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [rideCount, setRideCount] = useState(0);
  const [avgRating, setAvgRating] = useState(5.0);
  const [reportOpen, setReportOpen] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState<{ car_make: string; car_model: string; car_year: number; car_color: string | null; license_plate: string } | null>(null);
  const { blockUser, unblockUser, isBlocked } = useBlocking();

  const isOwnProfile = userId === user?.id || userId === 'me';
  const targetId = isOwnProfile ? user?.id : userId;

  useEffect(() => {
    if (!targetId) return;
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase.from('profiles').select('*').eq('id', targetId).single();
      if (data) setProfileData(data as unknown as DbProfile);

      // ride count
      const { count } = await supabase.from('trip_participants').select('*', { count: 'exact', head: true }).eq('user_id', targetId);
      setRideCount(count || 0);

      // avg rating
      const { data: ratings } = await supabase.from('ratings').select('score').eq('rated_id', targetId);
      if (ratings && ratings.length > 0) {
        setAvgRating(Math.round((ratings.reduce((s, r) => s + r.score, 0) / ratings.length) * 10) / 10);
      }

      // Vehicle info
      const { data: vehicle } = await supabase.from('driver_vehicles').select('car_make, car_model, car_year, car_color, license_plate').eq('user_id', targetId).maybeSingle();
      if (vehicle) setVehicleInfo(vehicle as any);

      setLoading(false);
    };
    fetch();
  }, [targetId]);

  const compatibility = useMemo(() => {
    if (!myProfile || !profileData || isOwnProfile) return null;
    const a = profileToCompatibility(myProfile as any);
    const b = profileToCompatibility(profileData as any);
    return computeCompatibility(a, b);
  }, [myProfile, profileData, isOwnProfile]);

  // Mutuals
  const mutuals = useMemo(() => {
    if (!myProfile || !profileData || isOwnProfile) return { interests: [], clubs: [] };
    return {
      interests: (myProfile.interests || []).filter(i => (profileData.interests || []).includes(i)),
      clubs: (myProfile.clubs || []).filter(c => (profileData.clubs || []).includes(c)),
    };
  }, [myProfile, profileData, isOwnProfile]);

  // Vibe summary
  const vibeSummary = useMemo(() => {
    if (!profileData) return '';
    const parts: string[] = [];
    if (profileData.personality_talk) parts.push(PERSONALITY_LABELS.talk[profileData.personality_talk]?.replace(/^.+\s/, '') || '');
    if (profileData.personality_music) parts.push(PERSONALITY_LABELS.music[profileData.personality_music]?.replace(/^.+\s/, '') || '');
    if (profileData.personality_schedule) parts.push(PERSONALITY_LABELS.schedule[profileData.personality_schedule]?.replace(/^.+\s/, '') || '');
    return parts.filter(Boolean).join(' • ');
  }, [profileData]);

  // Earned badges
  const earnedBadges = useMemo(() => {
    if (!profileData) return [];
    return RIDE_BADGES.filter(b => b.condition(profileData.interests || [], profileData.clubs || []));
  }, [profileData]);

  // Conversation starters
  const conversationStarters = useMemo(() => {
    if (mutuals.interests.length === 0 && mutuals.clubs.length === 0) return [];
    const starters: string[] = [];
    if (mutuals.interests.length > 0) starters.push(`Ask about ${mutuals.interests[0]}!`);
    if (mutuals.clubs.length > 0) starters.push(`You're both in ${mutuals.clubs[0]}`);
    if (mutuals.interests.length > 1) starters.push(`Talk about ${mutuals.interests[1]} on the ride`);
    return starters.slice(0, 3);
  }, [mutuals]);

  // Profile completeness
  const completeness = useMemo(() => {
    if (!profileData) return 0;
    const fields = [
      !!profileData.preferred_name, !!profileData.college, !!profileData.year, !!profileData.major,
      !!profileData.avatar_url, (profileData.interests?.length || 0) > 0, (profileData.clubs?.length || 0) > 0,
      !!profileData.music_tag, !!profileData.gender, !!profileData.personality_talk,
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [profileData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto p-4">
          <div className="h-10 w-10 skeleton rounded-full mb-6" />
          <div className="h-48 skeleton rounded-2xl mb-4" />
          <div className="h-24 skeleton rounded-xl mb-4" />
          <div className="h-32 skeleton rounded-xl mb-4" />
          <div className="h-24 skeleton rounded-xl" />
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">Profile not found</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-sm text-primary font-medium hover:underline">Go back</button>
        </div>
      </div>
    );
  }

  if (editing && isOwnProfile) {
    return <EditProfilePage profile={profileData} onDone={() => { setEditing(false); refreshProfile(); }} />;
  }

  const p = profileData;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="font-display text-sm font-bold text-foreground">Profile</span>
          <div className="w-9" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Hero */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
          <div className="ucsd-gradient p-8 pb-20">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-4xl font-bold shadow-xl overflow-hidden ring-4 ring-primary-foreground/20">
                {p.avatar_url ? (
                  <img src={p.avatar_url} className="w-full h-full object-cover" alt="" />
                ) : (
                  (p.preferred_name || p.email).charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-2xl font-extrabold text-primary-foreground truncate">
                  {p.preferred_name || p.email.split('@')[0]}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  {p.email.endsWith('@ucsd.edu') && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-secondary">
                      <Shield className="w-3.5 h-3.5" /> UCSD Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-sm text-primary-foreground/80">
                    <Star className="w-3.5 h-3.5 text-secondary fill-secondary" /> {avgRating}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-primary-foreground/80">
                    <MapPin className="w-3.5 h-3.5" /> {rideCount} rides
                  </span>
                </div>
                {vibeSummary && (
                  <p className="text-xs text-primary-foreground/60 mt-1.5 italic">"{vibeSummary}"</p>
                )}
              </div>
            </div>
          </div>

          {/* Floating compatibility card */}
          {compatibility && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mx-4 -mt-12 p-5 bg-card rounded-2xl border border-border shadow-xl relative z-10"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                    <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--primary))" strokeWidth="4"
                      strokeDasharray={`${compatibility.score * 1.76} 176`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-display font-extrabold text-primary">
                    {compatibility.score}%
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">Compatibility Score</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Based on your shared traits & personality</p>
                </div>
              </div>

              {/* Breakdown bars */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
                {[
                  { label: 'Interests', value: compatibility.breakdown.sharedInterests },
                  { label: 'College', value: compatibility.breakdown.sameCollege },
                  { label: 'Major', value: compatibility.breakdown.sameMajor },
                  { label: 'Clubs', value: compatibility.breakdown.overlappingClubs },
                  { label: 'Year', value: compatibility.breakdown.yearProximity },
                  { label: 'Personality', value: compatibility.breakdown.personalitySimilarity },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                      <span>{item.label}</span>
                      <span>{item.value}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Reason chips */}
              <div className="flex flex-wrap gap-1.5">
                {compatibility.reasons.map((r, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">{r}</span>
                ))}
              </div>

              {/* Conversation starters */}
              {conversationStarters.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">💬 Conversation starters</p>
                  <div className="flex flex-col gap-1">
                    {conversationStarters.map((s, i) => (
                      <p key={i} className="text-xs text-foreground bg-muted px-2.5 py-1.5 rounded-lg">{s}</p>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        <div className="px-4 space-y-4 mt-4">
          {/* Profile completeness (own profile only) */}
          {isOwnProfile && completeness < 100 && (
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-foreground">Profile completeness</p>
                <span className="text-xs font-bold text-primary">{completeness}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${completeness}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">Complete your profile to improve match quality</p>
            </div>
          )}

          {/* About */}
          <Section title="About">
            <p className="text-sm text-foreground leading-relaxed">
              {p.year} year {p.major} student at {p.college} College.
              {p.interests.length > 0 && ` Into ${p.interests.slice(0, 3).join(', ')}.`}
            </p>
          </Section>

          {/* Academic */}
          <Section title="Academic">
            <div className="grid grid-cols-2 gap-3">
              <InfoCard icon={<GraduationCap className="w-4 h-4" />} label="College" value={p.college || '—'} />
              <InfoCard icon={<Calendar className="w-4 h-4" />} label="Year" value={p.year || '—'} />
              <InfoCard icon={<GraduationCap className="w-4 h-4" />} label="Major" value={p.major || '—'} />
              {p.age && <InfoCard label="Age" value={String(p.age)} />}
            </div>
          </Section>

          {/* Clubs */}
          <Section title="Clubs & Activities">
            {(p.clubs?.length || 0) > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {p.clubs.map(c => (
                  <span key={c} className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    mutuals.clubs.includes(c) ? 'bg-primary/15 text-primary ring-1 ring-primary/30' : 'bg-accent/15 text-accent-foreground'
                  }`}>
                    {mutuals.clubs.includes(c) && '✓ '}{c}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No clubs added yet</p>
            )}
          </Section>

          {/* Interests */}
          <Section title="Interests">
            {(p.interests?.length || 0) > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {p.interests.map(i => (
                  <span key={i} className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    mutuals.interests.includes(i) ? 'bg-primary/15 text-primary ring-1 ring-primary/30' : 'bg-muted text-muted-foreground'
                  }`}>
                    {mutuals.interests.includes(i) && '✓ '}{i}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No interests added yet</p>
            )}
          </Section>

          {/* Personality */}
          <Section title="Ride Personality">
            <div className="grid grid-cols-2 gap-2">
              {p.personality_talk && <PersonalityChip label={PERSONALITY_LABELS.talk[p.personality_talk]} />}
              {p.personality_music && <PersonalityChip label={PERSONALITY_LABELS.music[p.personality_music]} />}
              {p.personality_schedule && <PersonalityChip label={PERSONALITY_LABELS.schedule[p.personality_schedule]} />}
              {p.personality_social && <PersonalityChip label={PERSONALITY_LABELS.social[p.personality_social]} />}
            </div>
            {!p.personality_talk && <p className="text-xs text-muted-foreground">Not set yet</p>}
          </Section>

          {/* Ride Badges */}
          {earnedBadges.length > 0 && (
            <Section title="Ride Badges">
              <div className="flex flex-wrap gap-2">
                {earnedBadges.map(b => (
                  <div key={b.label} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/10 border border-secondary/20">
                    <span className="text-lg">{b.icon}</span>
                    <span className="text-xs font-semibold text-foreground">{b.label}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Mutuals */}
          {!isOwnProfile && (mutuals.interests.length > 0 || mutuals.clubs.length > 0) && (
            <Section title={`Mutuals (${mutuals.interests.length + mutuals.clubs.length})`}>
              <div className="flex flex-wrap gap-1.5">
                {mutuals.interests.map(i => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">🎯 {i}</span>
                ))}
                {mutuals.clubs.map(c => (
                  <span key={c} className="text-xs px-2.5 py-1 rounded-full bg-secondary/10 text-secondary font-medium">🏛️ {c}</span>
                ))}
              </div>
            </Section>
          )}

          {/* Safety & Trust */}
          <Section title="Safety & Trust">
            <div className="flex flex-wrap gap-2">
              {p.email.endsWith('@ucsd.edu') && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-semibold">
                  <Shield className="w-3.5 h-3.5" /> UCSD Verified
                </span>
              )}
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                <Star className="w-3.5 h-3.5" /> {avgRating} rating
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                <MapPin className="w-3.5 h-3.5" /> {rideCount} rides
              </span>
            </div>
          </Section>

          {/* Actions */}
          <div className="flex gap-2 pt-2 pb-8">
            {isOwnProfile ? (
              <button
                onClick={() => setEditing(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all"
              >
                <Pencil className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={() => toast.info('Messaging coming soon')}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all"
                >
                  <MessageCircle className="w-4 h-4" /> Message
                </button>
                <button
                  onClick={async () => {
                    if (targetId && isBlocked(targetId)) {
                      await unblockUser(targetId);
                      toast.success('User unblocked');
                    } else if (targetId) {
                      await blockUser(targetId);
                      toast.success('User blocked');
                    }
                  }}
                  className="p-3 rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
                  title={targetId && isBlocked(targetId) ? 'Unblock' : 'Block'}
                >
                  <Ban className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setReportOpen(true)}
                  className="p-3 rounded-xl border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Wallet (own profile only) */}
          {isOwnProfile && (
            <div className="pb-8">
              <WalletCard />
            </div>
          )}

          {/* Vehicle info */}
          {vehicleInfo && (
            <Section title="Vehicle">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Car className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {vehicleInfo.car_year} {vehicleInfo.car_make} {vehicleInfo.car_model}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {vehicleInfo.car_color && `${vehicleInfo.car_color} • `}Plate: {vehicleInfo.license_plate}
                  </p>
                </div>
              </div>
            </Section>
          )}

          {/* Report Modal */}
          {targetId && (
            <ReportModal
              open={reportOpen}
              onClose={() => setReportOpen(false)}
              reportedId={targetId}
              reportedName={p.preferred_name || p.email.split('@')[0]}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-card rounded-xl border border-border p-4">
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{title}</p>
    {children}
  </div>
);

const InfoCard = ({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50">
    {icon && <div className="text-primary/60 mt-0.5">{icon}</div>}
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  </div>
);

const PersonalityChip = ({ label }: { label: string | undefined }) => {
  if (!label) return null;
  return (
    <div className="px-3 py-2 rounded-lg bg-muted/50 text-sm text-foreground font-medium">{label}</div>
  );
};

// ─── Edit Profile Full Page ───
const EditProfilePage = ({ profile: p, onDone }: { profile: DbProfile; onDone: () => void }) => {
  const { user } = useAuth();
  const [preferredName, setPreferredName] = useState(p.preferred_name || '');
  const [college, setCollege] = useState(p.college || '');
  const [year, setYear] = useState(p.year || '');
  const [major, setMajor] = useState(p.major || '');
  const [age, setAge] = useState(p.age || '');
  const [gender, setGender] = useState(p.gender || '');
  const [interests, setInterests] = useState<string[]>(p.interests || []);
  const [clubs, setClubs] = useState<string[]>(p.clubs || []);
  const [clubSearch, setClubSearch] = useState('');
  const [majorSearch, setMajorSearch] = useState('');
  const [showMajorDropdown, setShowMajorDropdown] = useState(false);
  const [showClubDropdown, setShowClubDropdown] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(p.avatar_url);
  const [saving, setSaving] = useState(false);

  const filteredMajors = useMemo(() => {
    if (!majorSearch.trim()) return [];
    return UCSD_MAJORS.filter(m => m.toLowerCase().includes(majorSearch.toLowerCase())).slice(0, 8);
  }, [majorSearch]);

  const filteredClubs = useMemo(() => {
    if (!clubSearch.trim()) return [];
    return UCSD_CLUBS.filter(c => c.toLowerCase().includes(clubSearch.toLowerCase()) && !clubs.includes(c)).slice(0, 8);
  }, [clubSearch, clubs]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    let avatarUrl = p.avatar_url;
    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true });
      if (!error) {
        const { data } = supabase.storage.from('avatars').getPublicUrl(path);
        avatarUrl = data.publicUrl;
      }
    }

    const { error } = await supabase.from('profiles').update({
      preferred_name: preferredName, college, year, major, interests, clubs,
      age: age ? Number(age) : null, gender: gender || null, avatar_url: avatarUrl,
    } as any).eq('id', user.id);

    if (error) toast.error('Failed to save');
    else toast.success('Profile updated! 🎉');
    setSaving(false);
    onDone();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={onDone} className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="font-display text-sm font-bold text-foreground">Edit Profile</span>
          <button onClick={handleSave} disabled={saving} className="text-sm font-semibold text-primary disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <label className="cursor-pointer">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
              {avatarPreview ? (
                <img src={avatarPreview} className="w-full h-full object-cover" alt="" />
              ) : (
                <Upload className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <input type="file" accept="image/*" onChange={e => {
              const file = e.target.files?.[0];
              if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)); }
            }} className="hidden" />
          </label>
          <span className="text-sm text-muted-foreground">Tap to change photo</span>
        </div>

        <Field label="Preferred Name" value={preferredName} onChange={setPreferredName} />

        <SelectField label="College" value={college} onChange={setCollege} options={COLLEGES} placeholder="Select college" />
        <SelectField label="Year" value={year} onChange={setYear} options={YEARS} placeholder="Select year" />

        {/* Major - searchable */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Major</label>
          <div className="relative">
            <input
              value={major ? major : majorSearch}
              onChange={e => { setMajor(''); setMajorSearch(e.target.value); setShowMajorDropdown(true); }}
              onFocus={() => setShowMajorDropdown(true)}
              onBlur={() => setTimeout(() => setShowMajorDropdown(false), 200)}
              placeholder="Search UCSD majors..."
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {showMajorDropdown && filteredMajors.length > 0 && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredMajors.map(m => (
                  <button key={m} onMouseDown={() => { setMajor(m); setMajorSearch(''); setShowMajorDropdown(false); }}
                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Age</label>
            <input type="number" min={16} max={99} value={age} onChange={e => setAge(e.target.value ? Number(e.target.value) : '')}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <SelectField label="Gender" value={gender} onChange={setGender} options={['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say']} placeholder="Optional" />
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Interests ({interests.length}/15)</label>
          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
            {INTEREST_OPTIONS.map(interest => {
              const active = interests.includes(interest);
              return (
                <button key={interest} onClick={() => setInterests(prev =>
                  prev.includes(interest) ? prev.filter(i => i !== interest) : prev.length < 15 ? [...prev, interest] : prev
                )} className={`chip text-xs ${active ? 'chip-active' : 'chip-inactive'}`}>
                  {active && <Check className="w-3 h-3 mr-0.5" />}{interest}
                </button>
              );
            })}
          </div>
        </div>

        {/* Clubs */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">UCSD Clubs</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {clubs.map(club => (
              <span key={club} className="text-xs px-2 py-1 rounded-full bg-accent/15 text-accent-foreground flex items-center gap-1">
                {club} <button onClick={() => setClubs(clubs.filter(c => c !== club))}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
          <div className="relative">
            <div className="flex items-center border border-border rounded-lg bg-background px-3">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input value={clubSearch} onChange={e => { setClubSearch(e.target.value); setShowClubDropdown(true); }}
                onFocus={() => setShowClubDropdown(true)} onBlur={() => setTimeout(() => setShowClubDropdown(false), 200)}
                placeholder="Search official UCSD clubs..." className="flex-1 h-9 px-2 bg-transparent text-sm text-foreground outline-none" />
            </div>
            {showClubDropdown && filteredClubs.length > 0 && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {filteredClubs.map(club => (
                  <button key={club} onMouseDown={() => { setClubs(prev => [...prev, club]); setClubSearch(''); setShowClubDropdown(false); }}
                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                    {club}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
  </div>
);

const SelectField = ({ label, value, onChange, options, placeholder }: { label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder: string }) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm">
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

export default ProfilePage;

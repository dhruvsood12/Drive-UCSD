import { User } from '@/types';
import { useStore } from '@/store/useStore';
import { computeCompatibility } from '@/lib/utils-drive';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Star, Shield, MessageCircle, Pencil, Music, Calendar, GraduationCap, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface Props {
  user: User;
  open: boolean;
  onClose: () => void;
}

const ProfileOverlay = ({ user, open, onClose }: Props) => {
  const { currentUser } = useStore();
  const [editing, setEditing] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const isOwnProfile = currentUser?.id === user.id;
  const compatibility = currentUser && !isOwnProfile ? computeCompatibility(currentUser, user) : null;

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{user.preferredName || user.name}</DialogTitle>
            <DialogDescription>Profile details</DialogDescription>
          </DialogHeader>

          {/* Header */}
          <div className="ucsd-gradient p-8 pb-12 rounded-t-lg">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-3xl font-bold shadow-lg">
                {(user.preferredName || user.name).charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-primary-foreground">
                  {user.preferredName || user.name}
                </h2>
                <p className="text-sm text-primary-foreground/70">{user.name}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Shield className="w-3.5 h-3.5 text-secondary" />
                  <span className="text-xs font-medium text-secondary">UCSD Verified</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Star className="w-4 h-4 text-secondary fill-secondary" />
              <span className="text-sm font-semibold text-primary-foreground">{user.rating}</span>
              <span className="text-xs text-primary-foreground/60">rating</span>
            </div>
          </div>

          {/* Compatibility card */}
          {compatibility && (
            <div className="mx-6 -mt-6 p-4 bg-card rounded-xl border border-border shadow-lg relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl font-display font-bold text-primary">{compatibility.score}%</div>
                <span className="text-sm font-medium text-muted-foreground">match</span>
              </div>
              <p className="text-xs text-muted-foreground mb-1.5">Why this score?</p>
              <div className="flex flex-wrap gap-1.5">
                {compatibility.reasons.map((reason, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    {reason}
                  </span>
                ))}
                {compatibility.reasons.length === 0 && (
                  <span className="text-xs text-muted-foreground">No shared traits yet</span>
                )}
              </div>
            </div>
          )}

          {/* Body */}
          {editing ? (
            <EditProfileForm user={user} onDone={() => setEditing(false)} />
          ) : (
            <div className="p-6 space-y-5">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">About</p>
                <p className="text-sm text-foreground">
                  {user.year} year {user.major} student at {user.college} College.
                  {user.interests.length > 0 && ` Into ${user.interests.slice(0, 3).join(', ')}.`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InfoRow icon={<GraduationCap className="w-4 h-4 text-primary/60" />} label="College" value={user.college} />
                <InfoRow icon={<Calendar className="w-4 h-4 text-primary/60" />} label="Year" value={user.year} />
                <InfoRow icon={<GraduationCap className="w-4 h-4 text-primary/60" />} label="Major" value={user.major} />
                {user.ageRange && <InfoRow label="Age" value={user.ageRange} />}
                {user.musicTag && <InfoRow icon={<Music className="w-4 h-4 text-primary/60" />} label="Music Vibe" value={user.musicTag} />}
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Interests</p>
                <div className="flex flex-wrap gap-1.5">
                  {user.interests.map((tag) => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">{tag}</span>
                  ))}
                  {user.interests.length === 0 && <span className="text-xs text-muted-foreground">None added yet</span>}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Clubs</p>
                <div className="flex flex-wrap gap-1.5">
                  {(user.clubs || []).map((club) => (
                    <span key={club} className="text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground">{club}</span>
                  ))}
                  {(!user.clubs || user.clubs.length === 0) && <span className="text-xs text-muted-foreground">None added yet</span>}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {isOwnProfile && (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <Pencil className="w-4 h-4" /> Edit Profile
                  </button>
                )}
                {!isOwnProfile && (
                  <button
                    onClick={() => setShowMessage(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" /> Message
                  </button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Message Modal */}
      <Dialog open={showMessage} onOpenChange={(v) => { if (!v) setShowMessage(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Message {user.preferredName || user.name}</DialogTitle>
            <DialogDescription>Choose a platform to reach out:</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            {['iMessage', 'Instagram DM', 'Discord'].map((platform) => (
              <button
                key={platform}
                onClick={() => { toast.info(`${platform} (demo only)`); setShowMessage(false); }}
                className="w-full py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                {platform}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const InfoRow = ({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-start gap-2">
    {icon && <div className="mt-0.5">{icon}</div>}
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-medium text-foreground capitalize">{value}</p>
    </div>
  </div>
);

const COLLEGES = ['Revelle', 'Muir', 'Marshall', 'Warren', 'Sixth', 'Seventh', 'ERC'];
const YEARS = ['1st', '2nd', '3rd', '4th'];

const EditProfileForm = ({ user, onDone }: { user: User; onDone: () => void }) => {
  const [preferredName, setPreferredName] = useState(user.preferredName || user.name);
  const [college, setCollege] = useState(user.college);
  const [year, setYear] = useState(user.year);
  const [major, setMajor] = useState(user.major);
  const [interests, setInterests] = useState<string[]>([...user.interests]);
  const [clubs, setClubs] = useState<string[]>([...(user.clubs || [])]);
  const [newInterest, setNewInterest] = useState('');
  const [newClub, setNewClub] = useState('');

  const addTag = (list: string[], setList: (v: string[]) => void, val: string, setVal: (v: string) => void) => {
    const trimmed = val.trim();
    if (trimmed && !list.includes(trimmed)) setList([...list, trimmed]);
    setVal('');
  };

  const removeTag = (list: string[], setList: (v: string[]) => void, tag: string) => {
    setList(list.filter(t => t !== tag));
  };

  const handleSave = () => {
    api.updateMe({ preferredName, college, year, major, interests, clubs });
    toast.success('Profile updated! 🎉');
    onDone();
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preferred Name</label>
        <input value={preferredName} onChange={e => setPreferredName(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-ring outline-none" />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">College</label>
        <select value={college} onChange={e => setCollege(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground">
          {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Year</label>
        <select value={year} onChange={e => setYear(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground">
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Major</label>
        <input value={major} onChange={e => setMajor(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-ring outline-none" />
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Interests</label>
        <div className="flex flex-wrap gap-1.5 mt-1 mb-2">
          {interests.map(tag => (
            <span key={tag} className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground flex items-center gap-1">
              {tag}
              <button onClick={() => removeTag(interests, setInterests, tag)} className="hover:text-destructive"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newInterest} onChange={e => setNewInterest(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(interests, setInterests, newInterest, setNewInterest))} placeholder="Add interest..." className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none" />
          <button onClick={() => addTag(interests, setInterests, newInterest, setNewInterest)} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">Add</button>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Clubs</label>
        <div className="flex flex-wrap gap-1.5 mt-1 mb-2">
          {clubs.map(club => (
            <span key={club} className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground flex items-center gap-1">
              {club}
              <button onClick={() => removeTag(clubs, setClubs, club)} className="hover:text-destructive"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newClub} onChange={e => setNewClub(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(clubs, setClubs, newClub, setNewClub))} placeholder="Add club..." className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none" />
          <button onClick={() => addTag(clubs, setClubs, newClub, setNewClub)} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">Add</button>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={onDone} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">Cancel</button>
        <button onClick={handleSave} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all">Save</button>
      </div>
    </div>
  );
};

export default ProfileOverlay;

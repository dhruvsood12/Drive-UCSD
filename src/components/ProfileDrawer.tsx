import { User } from '@/types';
import { useStore } from '@/store/useStore';
import { computeCompatibility } from '@/lib/utils-drive';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Shield, MessageCircle, Pencil } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface Props {
  user: User;
  open: boolean;
  onClose: () => void;
}

const ProfileDrawer = ({ user, open, onClose }: Props) => {
  const { currentUser } = useStore();
  const [editing, setEditing] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const isOwnProfile = currentUser?.id === user.id;
  const compatibility = currentUser && !isOwnProfile ? computeCompatibility(currentUser, user) : null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex justify-end bg-foreground/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="w-full max-w-md bg-card border-l border-border h-full overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="ucsd-gradient p-6 relative">
              <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 transition-colors">
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-2xl font-bold">
                  {(user.preferredName || user.name).charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-primary-foreground">
                    {user.preferredName || user.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Shield className="w-3.5 h-3.5 text-secondary" />
                    <span className="text-xs font-medium text-secondary">UCSD Verified</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <Star className="w-4 h-4 text-secondary fill-secondary" />
                <span className="text-sm font-semibold text-primary-foreground">{user.rating}</span>
                <span className="text-xs text-primary-foreground/60">rating</span>
              </div>
            </div>

            {/* Compatibility */}
            {compatibility && (
              <div className="mx-6 -mt-4 p-4 bg-card rounded-xl border border-border shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl font-display font-bold text-primary">{compatibility.score}%</div>
                  <span className="text-sm font-medium text-muted-foreground">match</span>
                </div>
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

            {/* Details */}
            {editing ? (
              <EditProfileForm user={user} onDone={() => setEditing(false)} />
            ) : (
              <div className="p-6 space-y-5">
                <InfoRow label="College" value={user.college} />
                <InfoRow label="Year" value={user.year} />
                <InfoRow label="Major" value={user.major} />

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Interests</p>
                  <div className="flex flex-wrap gap-1.5">
                    {user.interests.map((tag) => (
                      <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">{tag}</span>
                    ))}
                    {user.interests.length === 0 && <span className="text-xs text-muted-foreground">None</span>}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Clubs</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(user.clubs || []).map((club) => (
                      <span key={club} className="text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground">{club}</span>
                    ))}
                    {(!user.clubs || user.clubs.length === 0) && <span className="text-xs text-muted-foreground">None</span>}
                  </div>
                </div>

                {user.musicTag && <InfoRow label="Music Vibe" value={user.musicTag} />}

                {/* Actions */}
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
          </motion.div>

          {/* Message Modal */}
          <AnimatePresence>
            {showMessage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
                onClick={() => setShowMessage(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-xl border border-border"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">Message {user.preferredName || user.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">Choose a platform to reach out:</p>
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
                  <button onClick={() => setShowMessage(false)} className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Close
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
    <p className="text-sm font-medium text-foreground capitalize">{value}</p>
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
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
    }
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
        <input value={preferredName} onChange={e => setPreferredName(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/40 outline-none" />
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
        <input value={major} onChange={e => setMajor(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary/40 outline-none" />
      </div>

      {/* Interests chips */}
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

      {/* Clubs chips */}
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

export default ProfileDrawer;

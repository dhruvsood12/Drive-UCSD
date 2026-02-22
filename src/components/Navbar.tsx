import { useAuth } from '@/contexts/AuthContext';
import { useDriverRequests } from '@/hooks/useRideRequests';
import EarningsPage from './EarningsPage';
import RideHistoryPage from './RideHistoryPage';
import SafetyPage from './SafetyPage';
import { Car, Plus, LogOut, Shield, History, DollarSign, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import ProfileOverlay from './ProfileOverlay';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CAMPUSES } from '@/lib/destinations';

type Tab = 'feed' | 'map' | 'requests' | 'earnings' | 'history' | 'safety';

const Navbar = () => {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [role, setRole] = useState<'rider' | 'driver'>(
    profile?.role === 'driver' ? 'driver' : 'rider'
  );
  const [showProfile, setShowProfile] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [campus, setCampus] = useState('UCSD');
  const navigate = useNavigate();

  const { requests } = useDriverRequests();
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  // Expose tab/role state via window for child components
  (window as any).__driveState = { activeTab, setActiveTab, role, setRole };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const primaryTabs: { key: Tab; label: string; driverOnly?: boolean }[] = [
    { key: 'feed', label: 'Feed' },
    { key: 'map', label: 'Map' },
    ...(role === 'driver' ? [{ key: 'requests' as Tab, label: 'Requests' }] : []),
  ];

  const moreTabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    ...(role === 'driver' ? [{ key: 'earnings' as Tab, label: 'Earnings', icon: <DollarSign className="w-4 h-4" /> }] : []),
    { key: 'history', label: 'Ride History', icon: <History className="w-4 h-4" /> },
    { key: 'safety', label: 'Safety', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <nav className="sticky top-0 z-50 ucsd-gradient border-b border-primary/20 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo + campus */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
            <Car className="w-5 h-5 text-secondary-foreground" />
          </div>
          <div>
            <span className="font-display text-lg font-bold text-primary-foreground tracking-tight">
              TRITON RIDESHARE
            </span>
            <select
              value={campus}
              onChange={e => setCampus(e.target.value)}
              className="block text-[10px] text-primary-foreground/60 bg-transparent border-none outline-none -mt-0.5 cursor-pointer"
            >
              {CAMPUSES.map(c => (
                <option key={c.value} value={c.value} disabled={!c.active} className="text-foreground">
                  {c.label}{!c.active ? ' (Coming soon)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Primary tabs */}
        <div className="flex items-center bg-primary-foreground/10 rounded-full p-1">
          {primaryTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setShowMore(false); }}
              className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-primary-foreground text-primary'
                  : 'text-primary-foreground/70 hover:text-primary-foreground'
              }`}
            >
              {tab.label}
              {tab.key === 'requests' && pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-xs font-bold flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
          {/* More dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMore(!showMore)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                moreTabs.some(t => t.key === activeTab)
                  ? 'bg-primary-foreground text-primary'
                  : 'text-primary-foreground/70 hover:text-primary-foreground'
              }`}
            >
              More <ChevronDown className="w-3 h-3 inline ml-0.5" />
            </button>
            {showMore && (
              <div className="absolute top-full right-0 mt-1 bg-card rounded-lg border border-border shadow-lg py-1 min-w-[160px] z-50">
                {moreTabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => { setActiveTab(tab.key); setShowMore(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                      activeTab === tab.key ? 'text-primary bg-primary/5' : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-primary-foreground/10 rounded-full p-1">
            {(['rider', 'driver'] as const).map((r) => (
              <button
                key={r}
                onClick={() => { setRole(r); if (r === 'rider' && (activeTab === 'requests' || activeTab === 'earnings')) setActiveTab('feed'); }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 capitalize ${
                  role === r
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-primary-foreground/70 hover:text-primary-foreground'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {(role === 'driver' || profile?.role === 'both') && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }}>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-create-trip'))}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-semibold hover:brightness-110 transition-all duration-150"
              >
                <Plus className="w-4 h-4" />
                Create Trip
              </button>
            </motion.div>
          )}

          {profile && (
            <button
              onClick={() => setShowProfile(true)}
              className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-sm font-bold hover:brightness-110 transition-all overflow-hidden"
              title="My Profile"
            >
              {profile.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
              ) : (
                (profile.preferred_name || profile.email).charAt(0).toUpperCase()
              )}
            </button>
          )}

          <button
            onClick={handleSignOut}
            className="p-2 rounded-full text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-all"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {profile && (
        <ProfileOverlay
          user={{
            id: profile.id,
            name: profile.email,
            preferredName: profile.preferred_name || undefined,
            email: profile.email,
            year: profile.year || '',
            major: profile.major || '',
            rating: 5.0,
            interests: profile.interests || [],
            clubs: profile.clubs || [],
            college: profile.college || '',
            musicTag: profile.music_tag || undefined,
            avatarUrl: profile.avatar_url || undefined,
          }}
          open={showProfile}
          onClose={() => setShowProfile(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;

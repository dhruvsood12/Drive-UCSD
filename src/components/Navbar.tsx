import { useAuth } from '@/contexts/AuthContext';
import { useDriverRequests } from '@/hooks/useRideRequests';
import ThemeToggle from './ThemeToggle';
import { Plus, LogOut, Shield, History, DollarSign, ChevronDown, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Tab = 'feed' | 'map' | 'requests' | 'earnings' | 'history' | 'safety';

const Navbar = () => {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [role, setRole] = useState<'rider' | 'driver'>(
    profile?.role === 'driver' ? 'driver' : 'rider'
  );
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();

  const { requests } = useDriverRequests();
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  (window as any).__driveState = { activeTab, setActiveTab, role, setRole };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const primaryTabs: { key: Tab; label: string }[] = [
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
    <nav className="sticky top-0 z-50 triton-gradient border-b border-primary/20">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shadow-sm">
            <span className="text-lg">🔱</span>
          </div>
          <span className="font-display text-lg font-extrabold text-primary-foreground tracking-tight">
            DRIVE UCSD
          </span>
        </div>

        {/* Primary tabs */}
        <div className="hidden sm:flex items-center bg-primary-foreground/10 rounded-full p-1">
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
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-xs font-bold flex items-center justify-center animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
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

        {/* Mobile tabs */}
        <div className="flex sm:hidden items-center gap-1">
          {primaryTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-primary-foreground text-primary'
                  : 'text-primary-foreground/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center bg-primary-foreground/10 rounded-full p-1">
            {(['rider', 'driver'] as const).map((r) => (
              <button
                key={r}
                onClick={() => { setRole(r); if (r === 'rider' && (activeTab === 'requests' || activeTab === 'earnings')) setActiveTab('feed'); }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 capitalize ${
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
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold hover:brightness-110 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Create Trip</span>
                <span className="sm:hidden">+</span>
              </button>
            </motion.div>
          )}

          <button
            onClick={() => navigate('/chats')}
            className="p-2 rounded-full text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-all"
            title="Chats"
          >
            <MessageCircle className="w-4 h-4" />
          </button>

          <ThemeToggle />

          {profile && (
            <button
              onClick={() => navigate('/profile/me')}
              className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-sm font-bold hover:brightness-110 transition-all overflow-hidden ring-2 ring-primary-foreground/20"
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

      
    </nav>
  );
};

export default Navbar;

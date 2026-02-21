import { useStore } from '@/store/useStore';
import { Car, Plus, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import ProfileOverlay from './ProfileOverlay';
import { useState } from 'react';

const Navbar = () => {
  const { role, setRole, activeTab, setActiveTab, currentUser } = useStore();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <nav className="sticky top-0 z-50 ucsd-gradient border-b border-primary/20 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
            <Car className="w-5 h-5 text-secondary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-primary-foreground tracking-tight">
            DRIVE UCSD
          </span>
        </div>

        {/* Tabs */}
        <div className="flex items-center bg-primary-foreground/10 rounded-full p-1">
          {(['feed', 'map'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 capitalize ${
                activeTab === tab
                  ? 'bg-primary-foreground text-primary'
                  : 'text-primary-foreground/70 hover:text-primary-foreground'
              }`}
            >
              {tab === 'feed' ? 'Feed' : 'Map'}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Role toggle */}
          <div className="flex items-center bg-primary-foreground/10 rounded-full p-1">
            {(['rider', 'driver'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
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

          {/* Create trip - driver only */}
          {role === 'driver' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }}>
              <CreateTripButton />
            </motion.div>
          )}

          {/* UCSD pill */}
          <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full bg-primary-foreground/10 text-primary-foreground/60 text-xs font-medium">
            UCSD email required (demo)
          </span>

          {/* Profile button */}
          {currentUser && (
            <button
              onClick={() => setShowProfile(true)}
              className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-sm font-bold hover:brightness-110 transition-all"
              title="My Profile"
            >
              {(currentUser.preferredName || currentUser.name).charAt(0)}
            </button>
          )}
        </div>
      </div>

      {/* Profile Overlay */}
      {currentUser && (
        <ProfileOverlay user={currentUser} open={showProfile} onClose={() => setShowProfile(false)} />
      )}
    </nav>
  );
};

const CreateTripButton = () => {
  const { setSelectedTripId } = useStore();
  return (
    <button
      onClick={() => {
        // We'll use a custom event to open the modal
        window.dispatchEvent(new CustomEvent('open-create-trip'));
      }}
      className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-semibold hover:brightness-110 transition-all duration-150 animate-pulse-gold"
    >
      <Plus className="w-4 h-4" />
      Create Trip
    </button>
  );
};

export default Navbar;

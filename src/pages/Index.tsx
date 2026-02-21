import Navbar from '@/components/Navbar';
import FeedPage from '@/components/FeedPage';
import RealMapPage from '@/components/RealMapPage';
import CreateTripModal from '@/components/CreateTripModal';
import { useState, useEffect } from 'react';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'map'>('feed');
  const [role, setRole] = useState<'rider' | 'driver'>('rider');

  // Sync with navbar state
  useEffect(() => {
    const interval = setInterval(() => {
      const state = (window as any).__driveState;
      if (state) {
        if (state.activeTab !== activeTab) setActiveTab(state.activeTab);
        if (state.role !== role) setRole(state.role);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [activeTab, role]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-4 py-6 max-w-6xl mx-auto">
        {activeTab === 'feed' ? <FeedPage /> : <RealMapPage />}
      </main>
      <CreateTripModal />
    </div>
  );
};

export default Index;

import Navbar from '@/components/Navbar';
import FeedPage from '@/components/FeedPage';
import RealMapPage from '@/components/RealMapPage';
import DriverRequestsPage from '@/components/DriverRequestsPage';
import EarningsPage from '@/components/EarningsPage';
import RideHistoryPage from '@/components/RideHistoryPage';
import SafetyPage from '@/components/SafetyPage';
import CreateTripModal from '@/components/CreateTripModal';
import WalletCard from '@/components/WalletCard';
import { useState, useEffect } from 'react';

type Tab = 'feed' | 'map' | 'requests' | 'earnings' | 'history' | 'safety' | 'wallet';

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [role, setRole] = useState<'rider' | 'driver'>('rider');

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
        {activeTab === 'feed' && <FeedPage />}
        {activeTab === 'map' && <RealMapPage />}
        {activeTab === 'requests' && <DriverRequestsPage />}
        {activeTab === 'earnings' && <EarningsPage />}
        {activeTab === 'history' && <RideHistoryPage />}
        {activeTab === 'safety' && <SafetyPage />}
        {activeTab === 'wallet' && <WalletCard />}
      </main>
      <CreateTripModal />
    </div>
  );
};

export default Index;

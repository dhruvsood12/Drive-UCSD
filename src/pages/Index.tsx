import Navbar from '@/components/Navbar';
import FeedPage from '@/components/FeedPage';
import MapPage from '@/components/MapPage';
import CreateTripModal from '@/components/CreateTripModal';
import { useStore } from '@/store/useStore';

const Index = () => {
  const { activeTab } = useStore();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-4 py-6 max-w-6xl mx-auto">
        {activeTab === 'feed' ? <FeedPage /> : <MapPage />}
      </main>
      <CreateTripModal />
    </div>
  );
};

export default Index;

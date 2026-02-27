import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DEMO_CHAT_THREADS, type DemoChatThread } from '@/demo/demoData';
import { ArrowLeft, Search, MessageCircle, MapPin, Clock, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatThread {
  tripId: string;
  destination: string;
  lastMessage: string;
  lastMessageAt: string;
  participants: string[];
  unread: number;
  isPast: boolean;
}

const ChatInbox = () => {
  const navigate = useNavigate();
  const { profile, isDemo } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'past'>('all');

  useEffect(() => {
    if (!profile) return;

    // Demo mode: use rich demo threads
    if (isDemo) {
      setLoading(false);
      return;
    }

    const fetchThreads = async () => {
      setLoading(true);
      const { data: participations } = await supabase
        .from('trip_participants')
        .select('trip_id')
        .eq('user_id', profile.id);

      const { data: driverTrips } = await supabase
        .from('trips')
        .select('id')
        .eq('driver_id', profile.id);

      const tripIds = new Set([
        ...(participations || []).map(p => p.trip_id),
        ...(driverTrips || []).map(t => t.id),
      ]);

      if (tripIds.size === 0) { setLoading(false); return; }

      const result: ChatThread[] = [];

      for (const tripId of tripIds) {
        const { data: trip } = await supabase.from('trips').select('to_location, departure_time').eq('id', tripId).single();
        if (!trip) continue;

        const { data: msgs } = await supabase.from('chat_messages').select('content, created_at')
          .eq('trip_id', tripId).order('created_at', { ascending: false }).limit(1);

        const { data: parts } = await supabase.from('trip_participants').select('user_id').eq('trip_id', tripId);

        const isPast = new Date(trip.departure_time) < new Date(Date.now() - 24 * 60 * 60 * 1000);

        result.push({
          tripId,
          destination: trip.to_location,
          lastMessage: msgs?.[0]?.content || 'No messages yet',
          lastMessageAt: msgs?.[0]?.created_at || trip.departure_time,
          participants: (parts || []).map(p => p.user_id),
          unread: 0,
          isPast,
        });
      }

      result.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
      setThreads(result);
      setLoading(false);
    };
    fetchThreads();
  }, [profile, isDemo]);

  // Merge demo threads for demo mode or empty state
  const displayThreads = isDemo || threads.length === 0 ? DEMO_CHAT_THREADS : threads;

  const filtered = displayThreads.filter(t => {
    if (filter === 'active' && t.isPast) return false;
    if (filter === 'past' && !t.isPast) return false;
    if (search && !('destination' in t ? t.destination : '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const formatTime = (date: string) => {
    const d = new Date(date);
    const diff = Date.now() - d.getTime();
    if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors btn-press">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="font-display text-sm font-bold text-foreground">Messages</span>
          <div className="w-9" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Search */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 flex items-center border border-border rounded-xl bg-card px-3">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search chats..."
              className="flex-1 h-10 px-2 bg-transparent text-sm text-foreground outline-none" />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-muted rounded-xl p-1 mb-4">
          {(['all', 'active', 'past'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all btn-press ${
                filter === f ? 'bg-card text-card-foreground shadow-sm' : 'text-muted-foreground'
              }`}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 skeleton rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="text-section-title mb-1">No chats yet</p>
            <p className="text-body">Join a trip to start chatting with your ride group</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((thread, i) => {
              const isDemoThread = 'driverName' in thread;
              const dThread = thread as DemoChatThread;
              return (
                <motion.button
                  key={isDemoThread ? dThread.tripId : (thread as ChatThread).tripId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => navigate(`/chats/${isDemoThread ? dThread.tripId : (thread as ChatThread).tripId}`)}
                  className="w-full card-interactive p-4 flex items-center gap-3 text-left"
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {isDemoThread && dThread.driverAvatar ? (
                      <img src={dThread.driverAvatar} className="w-12 h-12 rounded-full bg-muted" alt="" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    {isDemoThread && dThread.isActiveRide && (
                      <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-success flex items-center justify-center ring-2 ring-card">
                        <Radio className="w-2.5 h-2.5 text-success-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {isDemoThread ? dThread.driverName : ''}
                        </p>
                        {isDemoThread && dThread.isActiveRide && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success/15 text-success font-medium">Active</span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                        {formatTime(isDemoThread ? dThread.lastMessageAt : (thread as ChatThread).lastMessageAt)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-0.5">
                      → {isDemoThread ? dThread.destination : (thread as ChatThread).destination}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground/80 truncate">
                        {isDemoThread ? dThread.lastMessage : (thread as ChatThread).lastMessage}
                      </p>
                      {isDemoThread && dThread.unread > 0 && (
                        <span className="ml-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                          {dThread.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInbox;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Search, MessageCircle, MapPin, Clock } from 'lucide-react';
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
  const { profile } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'past'>('all');

  useEffect(() => {
    if (!profile) return;
    const fetchThreads = async () => {
      setLoading(true);
      // Get trips where user is participant or driver
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
  }, [profile]);

  const filtered = threads.filter(t => {
    if (filter === 'active' && t.isPast) return false;
    if (filter === 'past' && !t.isPast) return false;
    if (search && !t.destination.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="font-display text-sm font-bold text-foreground">Chats</span>
          <div className="w-9" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Search */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 flex items-center border border-border rounded-lg bg-card px-3">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search chats..."
              className="flex-1 h-9 px-2 bg-transparent text-sm text-foreground outline-none" />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1 mb-4">
          {(['all', 'active', 'past'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                filter === f ? 'bg-card text-card-foreground shadow-sm' : 'text-muted-foreground'
              }`}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 skeleton rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-lg font-display font-semibold text-muted-foreground">No chats yet</p>
            <p className="text-sm text-muted-foreground mt-1">Join a trip to start chatting with your ride group</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((thread, i) => (
              <motion.button
                key={thread.tripId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/chats/${thread.tripId}`)}
                className="w-full bg-card rounded-xl border border-border p-4 flex items-center gap-3 hover:shadow-md transition-all text-left"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-semibold text-foreground truncate">{thread.destination}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                      {new Date(thread.lastMessageAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{thread.lastMessage}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground">{thread.participants.length} participants</span>
                    {thread.isPast && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">Past</span>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInbox;

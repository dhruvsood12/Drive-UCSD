import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Send, MapPin, Music, Clock, Users, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { DEMO_CHAT_MESSAGES, DEMO_CHAT_THREADS } from '@/demo/demoData';
import { useDemoGuard } from '@/hooks/useDemoGuard';

interface ChatMessage {
  id: string;
  trip_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface Participant {
  id: string;
  preferred_name: string | null;
  avatar_url: string | null;
}

const ChatDetail = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { profile, isDemo } = useAuth();
  const { guardDemo } = useDemoGuard();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [trip, setTrip] = useState<{ to_location: string; departure_time: string } | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [senderNames, setSenderNames] = useState<Record<string, { name: string; avatar: string | null }>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  const isPast = trip ? new Date(trip.departure_time) < new Date(Date.now() - 24 * 60 * 60 * 1000) : false;

  // Demo mode: load demo chat messages
  const demoThread = chatId ? DEMO_CHAT_THREADS.find(t => t.tripId === chatId) : null;
  const demoMessages = chatId ? (DEMO_CHAT_MESSAGES[chatId] || []) : [];


  useEffect(() => {
    if (!chatId) return;

    const fetchAll = async () => {
      // Trip info
      const { data: tripData } = await supabase.from('trips').select('to_location, departure_time, driver_id').eq('id', chatId).single();
      if (tripData) setTrip(tripData);

      // Messages
      const { data: msgs } = await supabase.from('chat_messages').select('*').eq('trip_id', chatId).order('created_at', { ascending: true });
      setMessages((msgs || []) as ChatMessage[]);

      // Participants
      const { data: parts } = await supabase.from('trip_participants').select('user_id').eq('trip_id', chatId);
      const userIds = [...new Set([...(parts || []).map(p => p.user_id), tripData?.driver_id].filter(Boolean))];

      if (userIds.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('id, preferred_name, avatar_url').in('id', userIds);
        setParticipants((profiles || []) as Participant[]);
        const names: Record<string, { name: string; avatar: string | null }> = {};
        (profiles || []).forEach(p => { names[p.id] = { name: p.preferred_name || 'User', avatar: p.avatar_url }; });
        setSenderNames(names);
      }
    };
    fetchAll();

    // Realtime
    const channel = supabase
      .channel(`chat-${chatId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `trip_id=eq.${chatId}` }, (payload) => {
        setMessages(prev => [...prev, payload.new as ChatMessage]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !profile || sending || isPast) return;
    setSending(true);
    const { error } = await supabase.from('chat_messages').insert({
      trip_id: chatId, sender_id: profile.id, content: newMessage.trim(),
    } as any);
    if (error) toast.error('Failed to send');
    setNewMessage('');
    setSending(false);
  };

  // Group messages by date
  const grouped: { date: string; msgs: ChatMessage[] }[] = [];
  messages.forEach(msg => {
    const dateStr = new Date(msg.created_at).toLocaleDateString();
    const last = grouped[grouped.length - 1];
    if (last?.date === dateStr) last.msgs.push(msg);
    else grouped.push({ date: dateStr, msgs: [msg] });
  });

  const quickActions = [
    { icon: <MapPin className="w-3.5 h-3.5" />, label: 'Meetup spot', action: () => setNewMessage('Meeting at the Price Center loop 📍') },
    { icon: <Music className="w-3.5 h-3.5" />, label: 'Playlist', action: () => setNewMessage('Playlist for the ride 🎵') },
    { icon: <Clock className="w-3.5 h-3.5" />, label: 'ETA', action: () => setNewMessage(`ETA ~${Math.floor(Math.random() * 10) + 5} min 🕐`) },
  ];

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate('/chats')} className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">Trip to {trip?.to_location || '...'}</p>
            <p className="text-[10px] text-muted-foreground">
              {participants.length} participants · {isPast ? 'Past trip' : 'Active'}
            </p>
          </div>
          <button onClick={() => setShowParticipants(!showParticipants)} className="p-2 rounded-full hover:bg-muted transition-colors">
            <Users className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Participants drawer */}
        <AnimatePresence>
          {showParticipants && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-border">
              <div className="max-w-2xl mx-auto px-4 py-3 space-y-2">
                {participants.map(p => (
                  <button key={p.id} onClick={() => navigate(`/profile/${p.id}`)} className="flex items-center gap-2.5 w-full text-left hover:bg-muted rounded-lg p-1.5 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary overflow-hidden">
                      {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" alt="" /> : (p.preferred_name || '?').charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-foreground">{p.preferred_name || 'User'}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Trip summary for past chats */}
      {isPast && trip && (
        <div className="max-w-2xl mx-auto w-full px-4 py-3">
          <div className="bg-muted rounded-xl p-3 text-center">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Trip completed</p>
            <p className="text-sm font-medium text-foreground">{trip.to_location} · {new Date(trip.departure_time).toLocaleDateString()}</p>
            <p className="text-xs text-muted-foreground mt-1">This chat is read-only</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-2xl mx-auto w-full space-y-1">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No messages yet. Say hi! 👋</p>
          </div>
        )}
        {grouped.map(group => (
          <div key={group.date}>
            <div className="flex justify-center my-3">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">{group.date}</span>
            </div>
            {group.msgs.map(msg => {
              const isMine = msg.sender_id === profile?.id;
              const sender = senderNames[msg.sender_id];
              return (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex mb-1.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
                  {!isMine && (
                    <button onClick={() => navigate(`/profile/${msg.sender_id}`)} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-foreground overflow-hidden mr-1.5 mt-1 shrink-0">
                      {sender?.avatar ? <img src={sender.avatar} className="w-full h-full object-cover" alt="" /> : (sender?.name || '?').charAt(0)}
                    </button>
                  )}
                  <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${
                    isMine ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted text-foreground rounded-bl-sm'
                  }`}>
                    {!isMine && <p className="text-[10px] font-semibold mb-0.5 opacity-70">{sender?.name || 'User'}</p>}
                    <p>{msg.content}</p>
                    <p className={`text-[10px] mt-0.5 ${isMine ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick actions + Input */}
      {!isPast && (
        <>
          <div className="max-w-2xl mx-auto w-full flex gap-2 px-4 py-2 overflow-x-auto">
            {quickActions.map((qa, i) => (
              <button key={i} onClick={qa.action}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-muted text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors whitespace-nowrap shrink-0">
                {qa.icon} {qa.label}
              </button>
            ))}
          </div>
          <div className="max-w-2xl mx-auto w-full p-3 border-t border-border bg-card flex gap-2">
            <input value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..." maxLength={500}
              className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" />
            <button onClick={handleSend} disabled={!newMessage.trim() || sending}
              className="p-2.5 rounded-lg bg-primary text-primary-foreground hover:brightness-110 transition-all disabled:opacity-50">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatDetail;

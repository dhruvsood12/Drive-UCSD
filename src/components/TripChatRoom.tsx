import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect, useRef } from 'react';
import { Send, MapPin, Music, Clock, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id: string;
  trip_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface Props {
  tripId: string;
  tripDestination: string;
  onClose: () => void;
}

const TripChatRoom = ({ tripId, tripDestination, onClose }: Props) => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: true });
    setMessages((data || []) as ChatMessage[]);
  };

  useEffect(() => {
    fetchMessages();
    const channel = supabase
      .channel(`trip-chat-${tripId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `trip_id=eq.${tripId}` }, (payload) => {
        setMessages(prev => [...prev, payload.new as ChatMessage]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [tripId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !profile || sending) return;
    setSending(true);
    const { error } = await supabase.from('chat_messages').insert({
      trip_id: tripId,
      sender_id: profile.id,
      content: newMessage.trim(),
    } as any);
    if (error) {
      toast.error('Failed to send');
    }
    setNewMessage('');
    setSending(false);
  };

  // Group messages by date
  const groupedMessages: { date: string; msgs: ChatMessage[] }[] = [];
  messages.forEach(msg => {
    const dateStr = new Date(msg.created_at).toLocaleDateString();
    const last = groupedMessages[groupedMessages.length - 1];
    if (last?.date === dateStr) {
      last.msgs.push(msg);
    } else {
      groupedMessages.push({ date: dateStr, msgs: [msg] });
    }
  });

  const quickActions = [
    { icon: <MapPin className="w-3.5 h-3.5" />, label: 'Share meetup spot', action: () => setNewMessage('Meeting at the Price Center loop 📍') },
    { icon: <Music className="w-3.5 h-3.5" />, label: 'Share playlist', action: () => setNewMessage('Playlist for the ride 🎵 open.spotify.com/...') },
    { icon: <Clock className="w-3.5 h-3.5" />, label: 'Send ETA', action: () => setNewMessage(`ETA ~${Math.floor(Math.random() * 10) + 5} min 🕐`) },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div>
          <p className="text-sm font-semibold text-foreground">Trip to {tripDestination}</p>
          <p className="text-xs text-muted-foreground">Group chat · Auto-expires 24h after trip</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No messages yet. Say hi! 👋</p>
          </div>
        )}
        {groupedMessages.map(group => (
          <div key={group.date}>
            <div className="flex justify-center my-3">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">{group.date}</span>
            </div>
            {group.msgs.map(msg => {
              const isMine = msg.sender_id === profile?.id;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex mb-1.5 ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${
                    isMine
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted text-foreground rounded-bl-sm'
                  }`}>
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

      {/* Quick actions */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto">
        {quickActions.map((qa, i) => (
          <button
            key={i}
            onClick={qa.action}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-muted text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors whitespace-nowrap shrink-0"
          >
            {qa.icon} {qa.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border bg-card flex gap-2">
        <input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          maxLength={500}
        />
        <button
          onClick={handleSend}
          disabled={!newMessage.trim() || sending}
          className="p-2.5 rounded-lg bg-primary text-primary-foreground hover:brightness-110 transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TripChatRoom;

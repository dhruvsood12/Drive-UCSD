import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { X } from 'lucide-react';

const DEST_OPTIONS = ['Pacific Beach', 'Downtown', 'Grocery', 'Airport'];

const CreateTripModal = () => {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [destination, setDestination] = useState('Pacific Beach');
  const [departureTime, setDepartureTime] = useState('');
  const [seats, setSeats] = useState(3);
  const [rate, setRate] = useState(5);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('open-create-trip', handler);
    return () => window.removeEventListener('open-create-trip', handler);
  }, []);

  useEffect(() => {
    if (open) {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 30);
      const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setDepartureTime(local);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    const { error } = await supabase.from('trips').insert({
      driver_id: profile.id,
      to_location: destination,
      departure_time: new Date(departureTime).toISOString(),
      seats_available: seats,
      seats_total: seats,
      comp_rate: rate,
      notes,
    } as any);

    if (error) {
      toast.error('Failed to create trip');
      console.error(error);
    } else {
      toast.success('Trip posted! 🚗', { description: `Heading to ${destination}` });
      setOpen(false);
      setNotes('');
    }
    setSaving(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl border border-border"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl font-bold text-foreground">Create a Trip</h3>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Destination</label>
                <div className="flex flex-wrap gap-2">
                  {DEST_OPTIONS.map(d => (
                    <button key={d} type="button" onClick={() => setDestination(d)} className={`chip ${destination === d ? 'chip-active' : 'chip-inactive'}`}>{d}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Departure Time</label>
                <input type="datetime-local" value={departureTime} onChange={e => setDepartureTime(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Seats (1–6)</label>
                  <input type="number" min={1} max={6} value={seats} onChange={e => setSeats(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">$ Suggested</label>
                  <input type="number" min={0} value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Trunk space, music preferences, vibes..." rows={2} className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
              <button type="submit" disabled={saving} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50">
                {saving ? 'Posting...' : 'Post Trip 🚀'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateTripModal;

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

const REPORT_REASONS = [
  { value: 'harassment', label: '🚫 Harassment' },
  { value: 'unsafe_driving', label: '🚗 Unsafe Driving' },
  { value: 'no_show', label: '👻 No-Show' },
  { value: 'scam_spam', label: '💰 Scam / Spam' },
  { value: 'inappropriate_messages', label: '💬 Inappropriate Messages' },
  { value: 'discrimination', label: '⚖️ Discrimination' },
  { value: 'other', label: '📝 Other' },
];

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  reportedId: string;
  reportedName: string;
  tripId?: string;
}

const ReportModal = ({ open, onClose, reportedId, reportedName, tripId }: ReportModalProps) => {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !reason) return;
    if (reason === 'other' && !details.trim()) {
      toast.error('Please provide details for "Other" reports');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('reports').insert({
      reporter_id: user.id,
      reported_id: reportedId,
      reason,
      details: details.trim(),
      trip_id: tripId || null,
      status: 'pending',
    } as any);

    if (error) {
      toast.error('Failed to submit report');
    } else {
      toast.success('Report submitted. Our team will review it.');
      onClose();
      setReason('');
      setDetails('');
    }
    setSubmitting(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl border border-border"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <h3 className="font-display text-lg font-bold text-foreground">Report {reportedName}</h3>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">Select a reason for your report. All reports are reviewed by our safety team.</p>

            <div className="space-y-2 mb-4">
              {REPORT_REASONS.map(r => (
                <button
                  key={r.value}
                  onClick={() => setReason(r.value)}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                    reason === r.value
                      ? 'border-destructive bg-destructive/10 text-destructive'
                      : 'border-border text-foreground hover:bg-muted'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-1">
                Details {reason === 'other' ? '*' : '(optional)'}
              </label>
              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="Describe what happened..."
                rows={3}
                maxLength={500}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!reason || submitting}
                className="flex-1 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReportModal;

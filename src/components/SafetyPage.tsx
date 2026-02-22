import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Phone, AlertTriangle, Share2, Star, BadgeCheck, Flag } from 'lucide-react';
import { toast } from 'sonner';

const SafetyPage = () => {
  const { profile } = useAuth();
  const [emergencyContact, setEmergencyContact] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportedUser, setReportedUser] = useState('');

  const handleShareLiveLink = () => {
    const link = `${window.location.origin}/live-track/${profile?.id}`;
    navigator.clipboard.writeText(link).then(() => {
      toast.success('Live ride link copied!', { description: 'Share with a friend for safety.' });
    }).catch(() => {
      toast.info('Live tracking link ready', { description: link });
    });
  };

  const handleEmergencyCall = () => {
    toast.info('Emergency contacts feature', {
      description: 'In production, this would call campus police or 911.',
    });
  };

  const handleReport = async () => {
    if (!profile || !reportReason) {
      toast.error('Please select a reason');
      return;
    }
    const { error } = await supabase.from('reports').insert({
      reporter_id: profile.id,
      reported_id: reportedUser || profile.id,
      reason: reportReason,
      details: reportDetails,
    } as any);
    if (error) {
      toast.error('Failed to submit report');
    } else {
      toast.success('Report submitted', { description: 'Our team will review this.' });
      setShowReport(false);
      setReportReason('');
      setReportDetails('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="font-display text-xl font-bold text-foreground mb-1">Safety Center</h2>
      <p className="text-sm text-muted-foreground mb-6">Your safety is our top priority</p>

      {/* Verification status */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-5 mb-4"
      >
        <div className="flex items-center gap-3 mb-3">
          <BadgeCheck className="w-6 h-6 text-success" />
          <div>
            <p className="text-sm font-semibold text-foreground">UCSD Verified</p>
            <p className="text-xs text-muted-foreground">Your @ucsd.edu email has been verified</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-success/15 text-success font-medium flex items-center gap-1">
            <Shield className="w-3 h-3" /> Email Verified
          </span>
          {profile?.clubs && profile.clubs.length > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-info/15 text-info font-medium flex items-center gap-1">
              <BadgeCheck className="w-3 h-3" /> Club Member
            </span>
          )}
          <span className="text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary font-medium flex items-center gap-1">
            <Star className="w-3 h-3" /> Rated 4.8★
          </span>
        </div>
      </motion.div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          onClick={handleEmergencyCall}
          className="bg-destructive/10 rounded-xl border border-destructive/20 p-4 text-left hover:bg-destructive/15 transition-colors"
        >
          <Phone className="w-5 h-5 text-destructive mb-2" />
          <p className="text-sm font-semibold text-foreground">Emergency</p>
          <p className="text-xs text-muted-foreground">Call campus police</p>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={handleShareLiveLink}
          className="bg-info/10 rounded-xl border border-info/20 p-4 text-left hover:bg-info/15 transition-colors"
        >
          <Share2 className="w-5 h-5 text-info mb-2" />
          <p className="text-sm font-semibold text-foreground">Share Live Ride</p>
          <p className="text-xs text-muted-foreground">Copy tracking link</p>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          onClick={() => setShowReport(true)}
          className="bg-warning/10 rounded-xl border border-warning/20 p-4 text-left hover:bg-warning/15 transition-colors"
        >
          <Flag className="w-5 h-5 text-warning mb-2" />
          <p className="text-sm font-semibold text-foreground">Report User</p>
          <p className="text-xs text-muted-foreground">Flag inappropriate behavior</p>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border p-4"
        >
          <AlertTriangle className="w-5 h-5 text-muted-foreground mb-2" />
          <p className="text-sm font-semibold text-foreground">Safety Tips</p>
          <p className="text-xs text-muted-foreground">Always meet in public areas</p>
        </motion.div>
      </div>

      {/* Rating system info */}
      <div className="bg-card rounded-xl border border-border p-5 mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">⭐ Rating System</h3>
        <p className="text-sm text-muted-foreground mb-3">
          After each ride, both drivers and riders can rate each other on a 1-5 scale.
          Ratings below 3.0 trigger a review.
        </p>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Your Rating</p>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`w-4 h-4 ${s <= 4 ? 'text-warning fill-warning' : 'text-warning'}`} />
              ))}
              <span className="text-sm font-semibold text-foreground ml-1">4.8</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Ratings</p>
            <p className="text-lg font-display font-bold text-foreground">12</p>
          </div>
        </div>
      </div>

      {/* Report modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4" onClick={() => setShowReport(false)}>
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-xl border border-border" onClick={e => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold text-foreground mb-4">Report a User</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Reason</label>
                <select
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm"
                >
                  <option value="">Select reason</option>
                  <option value="unsafe_driving">Unsafe driving</option>
                  <option value="harassment">Harassment</option>
                  <option value="no_show">No show</option>
                  <option value="inappropriate">Inappropriate behavior</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Details</label>
                <textarea
                  value={reportDetails}
                  onChange={e => setReportDetails(e.target.value)}
                  placeholder="Describe what happened..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground resize-none"
                  maxLength={500}
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowReport(false)} className="flex-1 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">Cancel</button>
                <button onClick={handleReport} className="flex-1 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:brightness-110 transition-all">Submit Report</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafetyPage;

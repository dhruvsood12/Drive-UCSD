import { useState, useEffect } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Shield, Users, Car, Flag, MessageCircle, Search, Ban, CheckCircle, XCircle, ArrowLeft, Trash2 } from 'lucide-react';

type AdminTab = 'users' | 'trips' | 'reports' | 'messages';

interface AdminUser {
  id: string;
  email: string;
  preferred_name: string | null;
  role: string | null;
  suspended: boolean;
  created_at: string;
}

interface AdminReport {
  id: string;
  reporter_id: string;
  reported_id: string;
  reason: string;
  details: string;
  status: string;
  admin_notes: string;
  created_at: string;
  trip_id: string | null;
}

interface AdminTrip {
  id: string;
  driver_id: string;
  to_location: string;
  departure_time: string;
  seats_available: number;
  seats_total: number;
}

const AdminDashboard = () => {
  const { isAdmin, loading: adminLoading, promoteToAdmin } = useAdmin();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>('users');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [promoting, setPromoting] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    fetchData();
  }, [isAdmin, tab]);

  const fetchData = async () => {
    setLoadingData(true);
    if (tab === 'users') {
      const { data } = await supabase.from('profiles').select('id, email, preferred_name, role, suspended, created_at').order('created_at', { ascending: false }).limit(100);
      setUsers((data || []) as AdminUser[]);
    } else if (tab === 'reports') {
      const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(100);
      setReports((data || []) as AdminReport[]);
    } else if (tab === 'trips') {
      const { data } = await supabase.from('trips').select('id, driver_id, to_location, departure_time, seats_available, seats_total').order('departure_time', { ascending: false }).limit(100);
      setTrips((data || []) as AdminTrip[]);
    }
    setLoadingData(false);
  };

  const handleSuspendUser = async (userId: string, suspend: boolean) => {
    await supabase.from('profiles').update({ suspended: suspend, suspended_at: suspend ? new Date().toISOString() : null, suspended_by: suspend ? user?.id : null } as any).eq('id', userId);
    toast.success(suspend ? 'User suspended' : 'User unsuspended');
    fetchData();
  };

  const handleDeleteTrip = async (tripId: string) => {
    await supabase.from('trips').delete().eq('id', tripId);
    toast.success('Trip deleted');
    fetchData();
  };

  const handleResolveReport = async (reportId: string, status: string, notes: string) => {
    await supabase.from('reports').update({ status, admin_notes: notes, resolved_at: new Date().toISOString(), resolved_by: user?.id } as any).eq('id', reportId);
    toast.success(`Report ${status}`);
    fetchData();
  };

  const handlePromote = async () => {
    setPromoting(true);
    try {
      await promoteToAdmin();
      toast.success('Admin role activated!');
    } catch {
      toast.error('Failed to activate admin role. Check that your email matches ADMIN_EMAIL.');
    }
    setPromoting(false);
  };

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Show promote button if not admin yet
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-sm">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="font-display text-xl font-bold text-foreground mb-2">Admin Access</h1>
          <p className="text-sm text-muted-foreground mb-6">
            If your account email matches the configured admin email, you can activate admin access.
          </p>
          <button
            onClick={handlePromote}
            disabled={promoting}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50"
          >
            {promoting ? 'Activating...' : 'Activate Admin Access'}
          </button>
          <button
            onClick={() => navigate('/')}
            className="block mx-auto mt-4 text-sm text-muted-foreground hover:text-foreground"
          >
            Back to app
          </button>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u =>
    (u.preferred_name || u.email).toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 triton-gradient border-b border-primary/20">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-primary-foreground/10 transition-colors">
              <ArrowLeft className="w-5 h-5 text-primary-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-secondary" />
              <span className="font-display text-lg font-bold text-primary-foreground">Admin Dashboard</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { key: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
            { key: 'reports', label: 'Reports', icon: <Flag className="w-4 h-4" /> },
            { key: 'trips', label: 'Trips', icon: <Car className="w-4 h-4" /> },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as AdminTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                tab === t.key ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground hover:bg-muted'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        {tab === 'users' && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users by name or email..."
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}

        {loadingData ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Users Tab */}
            {tab === 'users' && (
              <div className="space-y-2">
                {filteredUsers.map(u => (
                  <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-card border border-border"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{u.preferred_name || 'Unnamed'}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Joined {new Date(u.created_at).toLocaleDateString()}
                        {u.suspended && <span className="ml-2 text-destructive font-semibold">⛔ SUSPENDED</span>}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSuspendUser(u.id, !u.suspended)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        u.suspended
                          ? 'bg-success/10 text-success hover:bg-success/20'
                          : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                      }`}
                    >
                      {u.suspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                  </motion.div>
                ))}
                {filteredUsers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No users found</p>
                )}
              </div>
            )}

            {/* Reports Tab */}
            {tab === 'reports' && (
              <div className="space-y-3">
                {reports.map(r => (
                  <ReportCard key={r.id} report={r} onResolve={handleResolveReport} />
                ))}
                {reports.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No reports</p>
                )}
              </div>
            )}

            {/* Trips Tab */}
            {tab === 'trips' && (
              <div className="space-y-2">
                {trips.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
                    <div>
                      <p className="text-sm font-medium text-foreground">{t.to_location}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(t.departure_time).toLocaleString()} • {t.seats_available}/{t.seats_total} seats
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteTrip(t.id)}
                      className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const ReportCard = ({ report, onResolve }: { report: AdminReport; onResolve: (id: string, status: string, notes: string) => void }) => {
  const [notes, setNotes] = useState(report.admin_notes || '');
  const [expanded, setExpanded] = useState(false);

  const statusColor = {
    pending: 'bg-warning/10 text-warning',
    reviewing: 'bg-info/10 text-info',
    resolved: 'bg-success/10 text-success',
    dismissed: 'bg-muted text-muted-foreground',
  }[report.status] || 'bg-muted text-muted-foreground';

  return (
    <div className="p-4 rounded-xl bg-card border border-border">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor}`}>{report.status}</span>
            <span className="text-xs text-muted-foreground">{new Date(report.created_at).toLocaleDateString()}</span>
          </div>
          <p className="text-sm font-medium text-foreground capitalize">{report.reason.replace('_', ' ')}</p>
          {report.details && <p className="text-xs text-muted-foreground mt-1">{report.details}</p>}
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-xs text-primary font-medium">
          {expanded ? 'Collapse' : 'Actions'}
        </button>
      </div>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-border space-y-3">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Admin notes..."
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex gap-2">
            <button
              onClick={() => onResolve(report.id, 'resolved', notes)}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-success/10 text-success text-xs font-semibold hover:bg-success/20"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Resolve
            </button>
            <button
              onClick={() => onResolve(report.id, 'dismissed', notes)}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-muted text-muted-foreground text-xs font-semibold hover:bg-muted/80"
            >
              <XCircle className="w-3.5 h-3.5" /> Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

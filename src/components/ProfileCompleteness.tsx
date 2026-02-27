import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Camera, Pencil, Heart, Mail, Car, Check } from 'lucide-react';

interface CheckItem {
  label: string;
  done: boolean;
  icon: React.ReactNode;
  action?: string;
}

const ProfileCompleteness = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  if (!profile) return null;

  const items: CheckItem[] = [
    { label: 'Add profile photo', done: !!profile.avatar_url, icon: <Camera className="w-4 h-4" />, action: '/profile/me' },
    { label: 'Set your name', done: !!profile.preferred_name, icon: <Pencil className="w-4 h-4" />, action: '/profile/me' },
    { label: 'Add interests', done: (profile.interests?.length || 0) > 0, icon: <Heart className="w-4 h-4" />, action: '/profile/me' },
    { label: 'Verify email', done: profile.email?.endsWith('@ucsd.edu') || false, icon: <Mail className="w-4 h-4" /> },
    { label: 'Complete 3 rides', done: false, icon: <Car className="w-4 h-4" /> },
  ];

  const filled = items.filter(i => i.done).length;
  if (filled >= items.length) return null;

  return (
    <div className="card-elevated p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-card-title">Get started</p>
        <span className="text-xs font-bold text-primary">{filled}/{items.length}</span>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => item.action && navigate(item.action)}
            disabled={item.done || !item.action}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
              item.done
                ? 'bg-success/10 text-success'
                : item.action
                  ? 'bg-muted hover:bg-primary/5 text-foreground cursor-pointer'
                  : 'bg-muted text-muted-foreground'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
              item.done ? 'bg-success text-success-foreground' : 'bg-muted-foreground/20'
            }`}>
              {item.done ? <Check className="w-3.5 h-3.5" /> : item.icon}
            </div>
            <span className={`text-sm font-medium ${item.done ? 'line-through opacity-60' : ''}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileCompleteness;

import { useAuth } from '@/contexts/AuthContext';

const ProfileCompleteness = () => {
  const { profile } = useAuth();
  if (!profile) return null;

  const fields = [
    !!profile.preferred_name,
    !!profile.college,
    !!profile.year,
    !!profile.major,
    !!profile.avatar_url,
    (profile.interests?.length || 0) > 0,
    (profile.clubs?.length || 0) > 0,
    !!profile.music_tag,
    !!profile.gender,
  ];
  const filled = fields.filter(Boolean).length;
  const pct = Math.round((filled / fields.length) * 100);

  if (pct >= 100) return null;

  return (
    <div className="bg-card rounded-xl border border-border p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-foreground">Profile completeness</p>
        <span className="text-xs font-bold text-primary">{pct}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1.5">Complete your profile to improve match quality</p>
    </div>
  );
};

export default ProfileCompleteness;

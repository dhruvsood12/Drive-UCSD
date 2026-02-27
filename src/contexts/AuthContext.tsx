import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  preferred_name: string | null;
  role: string | null;
  college: string | null;
  year: string | null;
  major: string | null;
  interests: string[];
  clubs: string[];
  age: number | null;
  gender: string | null;
  avatar_url: string | null;
  music_tag: string | null;
  onboarding_complete: boolean;
  created_at: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isDemo: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
}

const DEMO_PROFILE: Profile = {
  id: 'demo-user',
  email: 'demo@ucsd.edu',
  preferred_name: 'Demo Rider',
  role: 'rider',
  college: 'Sixth',
  year: '2nd',
  major: 'Computer Science',
  interests: ['surfing', 'coding', 'boba', 'hiking'],
  clubs: ['ACM', 'Surf Club'],
  age: 20,
  gender: null,
  avatar_url: null,
  music_tag: 'indie',
  onboarding_complete: true,
  created_at: new Date().toISOString(),
};

const DEMO_SESSION = { access_token: 'demo', refresh_token: 'demo' } as unknown as Session;
const DEMO_USER = { id: 'demo-user', email: 'demo@ucsd.edu' } as unknown as User;

function isDemoActive(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get('demo') === '1') return true;
  return localStorage.getItem('demo') === 'true';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data as unknown as Profile);
    return data as unknown as Profile | null;
  };

  const refreshProfile = async () => {
    if (isDemo) return;
    if (user) await fetchProfile(user.id);
  };

  const enterDemoMode = () => {
    localStorage.setItem('demo', 'true');
    setIsDemo(true);
    setSession(DEMO_SESSION);
    setUser(DEMO_USER);
    setProfile(DEMO_PROFILE);
    setLoading(false);
  };

  const exitDemoMode = () => {
    localStorage.removeItem('demo');
    setIsDemo(false);
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  useEffect(() => {
    // Check for demo mode on mount
    if (isDemoActive()) {
      enterDemoMode();
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => fetchProfile(session.user.id), 0);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    if (isDemo) {
      exitDemoMode();
      return;
    }
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, isDemo, signUp, signIn, signOut, refreshProfile, enterDemoMode, exitDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

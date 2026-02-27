import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { DEMO_USER_PROFILE } from '@/demo/demoData';

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

const DEMO_PROFILE: Profile = DEMO_USER_PROFILE as unknown as Profile;
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

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data as unknown as Profile);
    return data as unknown as Profile | null;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (isDemo) return;
    if (user) await fetchProfile(user.id);
  }, [isDemo, user, fetchProfile]);

  const enterDemoMode = useCallback(() => {
    localStorage.setItem('demo', 'true');
    setIsDemo(true);
    setSession(DEMO_SESSION);
    setUser(DEMO_USER);
    setProfile(DEMO_PROFILE);
    setLoading(false);
  }, []);

  const exitDemoMode = useCallback(() => {
    localStorage.removeItem('demo');
    setIsDemo(false);
    setSession(null);
    setUser(null);
    setProfile(null);
  }, []);

  useEffect(() => {
    // Check for demo mode on mount
    if (isDemoActive()) {
      enterDemoMode();
      return;
    }

    let mounted = true;

    // Set up auth listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;

      // If switching from demo to real auth, exit demo
      if (isDemo && newSession) {
        localStorage.removeItem('demo');
        setIsDemo(false);
      }

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        // Fetch profile before setting loading=false
        const prof = await fetchProfile(newSession.user.id);
        if (mounted) setLoading(false);
      } else {
        setProfile(null);
        if (mounted) setLoading(false);
      }
    });

    // Then get initial session
    supabase.auth.getSession().then(async ({ data: { session: initSession } }) => {
      if (!mounted) return;

      setSession(initSession);
      setUser(initSession?.user ?? null);

      if (initSession?.user) {
        await fetchProfile(initSession.user.id);
      }
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    // If in demo mode and user logs in for real, exit demo
    if (isDemo) exitDemoMode();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, [isDemo, exitDemoMode]);

  const signOut = useCallback(async () => {
    if (isDemo) {
      exitDemoMode();
      return;
    }
    await supabase.auth.signOut();
    setProfile(null);
  }, [isDemo, exitDemoMode]);

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

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
  const { session, profile, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (session && profile?.onboarding_complete) return <Navigate to="/" replace />;
  if (session && profile && !profile.onboarding_complete) return <Navigate to="/onboarding" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl triton-gradient flex items-center justify-center mb-3 shadow-lg">
            <span className="text-2xl">🔱</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Triton Rideshare</h1>
          <p className="text-sm text-muted-foreground mt-1">Campus rides, real connections</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-lg">
          <h2 className="font-display text-xl font-bold text-foreground mb-1">Welcome back</h2>
          <p className="text-sm text-muted-foreground mb-6">Sign in with your UCSD email</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@ucsd.edu"
                required
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Log In'}
            </button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-4">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:underline">Sign up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

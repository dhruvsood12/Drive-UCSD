import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/**
 * Hook that returns a guard function for demo mode.
 * Call `guardDemo()` before any destructive action.
 * Returns `true` if the action should be blocked (user is in demo mode).
 */
export function useDemoGuard() {
  const { isDemo } = useAuth();

  const guardDemo = (actionLabel?: string): boolean => {
    if (isDemo) {
      toast.info(actionLabel ? `${actionLabel} is disabled in demo mode.` : 'Disabled in demo mode.', {
        description: 'Sign up with your @ucsd.edu email to unlock all features.',
      });
      return true;
    }
    return false;
  };

  return { isDemo, guardDemo };
}

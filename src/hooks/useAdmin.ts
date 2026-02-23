import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const checkAdmin = async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      setIsAdmin(!!data);
      setLoading(false);
    };

    checkAdmin();
  }, [user?.id]);

  const promoteToAdmin = async () => {
    const { data, error } = await supabase.functions.invoke('promote-admin');
    if (error) throw error;
    if (data?.success) {
      setIsAdmin(true);
    }
    return data;
  };

  return { isAdmin, loading, promoteToAdmin };
};

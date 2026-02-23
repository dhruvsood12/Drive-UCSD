import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useWallet = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchBalance = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data) {
      setBalance(Number(data.balance));
    } else {
      // Create wallet if doesn't exist
      await supabase.from('wallets').insert({ user_id: user.id, balance: 100 } as any);
      setBalance(100);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBalance();
  }, [user?.id]);

  const processPayment = async (tripId: string, amount: number, payeeId: string) => {
    const { data, error } = await supabase.functions.invoke('process-payment', {
      body: { trip_id: tripId, amount, payee_id: payeeId },
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    await fetchBalance();
    return data;
  };

  return { balance, loading, processPayment, refreshBalance: fetchBalance };
};

import { useWallet } from '@/hooks/useWallet';
import { DollarSign, Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Payment {
  id: string;
  payer_id: string;
  payee_id: string;
  amount: number;
  status: string;
  description: string;
  created_at: string;
  trip_id: string | null;
}

const WalletCard = () => {
  const { balance, loading } = useWallet();
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchPayments = async () => {
      const { data } = await supabase
        .from('payments')
        .select('*')
        .or(`payer_id.eq.${user.id},payee_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(10);
      setPayments((data || []) as Payment[]);
    };
    fetchPayments();
  }, [user?.id]);

  if (loading) {
    return <div className="h-40 skeleton rounded-2xl" />;
  }

  return (
    <div className="space-y-4">
      {/* Balance card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="triton-gradient rounded-2xl p-6 text-primary-foreground"
      >
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="w-5 h-5" />
          <span className="text-sm font-medium opacity-80">Drive UCSD Wallet</span>
        </div>
        <p className="text-4xl font-display font-extrabold">${balance.toFixed(2)}</p>
        <p className="text-xs opacity-60 mt-1">Demo balance • New accounts start with $100</p>
      </motion.div>

      {/* Transaction history */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Transaction History</h3>
        {payments.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No transactions yet</p>
        ) : (
          <div className="space-y-2">
            {payments.map((p, i) => {
              const isOutgoing = p.payer_id === user?.id;
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isOutgoing ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
                    }`}>
                      {isOutgoing ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {isOutgoing ? 'Ride Payment' : 'Ride Earnings'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${isOutgoing ? 'text-destructive' : 'text-success'}`}>
                    {isOutgoing ? '-' : '+'}${Number(p.amount).toFixed(2)}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletCard;

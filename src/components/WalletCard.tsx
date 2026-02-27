import { useWallet } from '@/hooks/useWallet';
import { ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DEMO_TRANSACTIONS, type DemoTransaction } from '@/demo/demoData';

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
  const { user, isDemo } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (!user || isDemo) return;
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
  }, [user?.id, isDemo]);

  // Use demo transactions for demo mode or empty state
  const transactions: { id: string; isOutgoing: boolean; amount: number; description: string; date: string; otherParty?: string }[] = useMemo(() => {
    if (isDemo || payments.length === 0) {
      return DEMO_TRANSACTIONS;
    }
    return payments.map(p => ({
      id: p.id,
      isOutgoing: p.payer_id === user?.id,
      amount: Number(p.amount),
      description: p.description || (p.payer_id === user?.id ? 'Ride Payment' : 'Ride Earnings'),
      date: p.created_at,
    }));
  }, [payments, isDemo, user?.id]);

  const demoBalance = isDemo ? 87.50 : balance;
  const spentThisMonth = transactions.filter(t => t.isOutgoing).reduce((s, t) => s + t.amount, 0);
  const earnedThisMonth = transactions.filter(t => !t.isOutgoing).reduce((s, t) => s + t.amount, 0);
  const savedVsUber = Math.round(spentThisMonth * 2.8); // Uber would've cost ~2.8x more

  if (loading) {
    return <div className="space-y-3">
      <div className="h-40 skeleton rounded-2xl" />
      <div className="h-20 skeleton rounded-2xl" />
    </div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
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
        <p className="text-4xl font-display font-extrabold">${demoBalance.toFixed(2)}</p>
        <p className="text-xs opacity-60 mt-1">
          {isDemo ? 'Demo balance' : 'Available balance'} • New accounts start with $100
        </p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="card-elevated p-4 text-center">
          <TrendingDown className="w-4 h-4 text-destructive mx-auto mb-1" />
          <p className="text-lg font-display font-bold text-foreground">${spentThisMonth}</p>
          <p className="text-[10px] text-muted-foreground">Spent this month</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="card-elevated p-4 text-center">
          <TrendingUp className="w-4 h-4 text-success mx-auto mb-1" />
          <p className="text-lg font-display font-bold text-foreground">${earnedThisMonth}</p>
          <p className="text-[10px] text-muted-foreground">Earned this month</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="card-elevated p-4 text-center">
          <span className="text-lg">💰</span>
          <p className="text-lg font-display font-bold text-success">${savedVsUber}</p>
          <p className="text-[10px] text-muted-foreground">Saved vs Uber</p>
        </motion.div>
      </div>

      {/* Transaction history */}
      <div className="card-elevated p-5">
        <h3 className="text-card-title mb-4">Transaction History</h3>
        <div className="space-y-1">
          {transactions.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between py-3 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  t.isOutgoing ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
                }`}>
                  {t.isOutgoing ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{t.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.otherParty && `${t.otherParty} · `}{new Date(t.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className={`text-sm font-semibold ${t.isOutgoing ? 'text-destructive' : 'text-success'}`}>
                {t.isOutgoing ? '-' : '+'}${t.amount.toFixed(2)}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WalletCard;

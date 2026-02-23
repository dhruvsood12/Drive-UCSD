import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { X, CreditCard, Check, DollarSign } from 'lucide-react';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
  driverId: string;
  driverName: string;
  amount: number;
  destination: string;
  onSuccess?: () => void;
}

const PaymentModal = ({ open, onClose, tripId, driverId, driverName, amount, destination, onSuccess }: PaymentModalProps) => {
  const { balance, processPayment } = useWallet();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const serviceFee = Math.round(amount * 0.1 * 100) / 100;
  const total = amount + serviceFee;

  const handlePay = async () => {
    if (balance < total) {
      toast.error('Insufficient balance');
      return;
    }

    setProcessing(true);
    try {
      await processPayment(tripId, total, driverId);
      setSuccess(true);
      toast.success('Payment successful! 🎉');
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || 'Payment failed');
    }
    setProcessing(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-xl border border-border"
            onClick={e => e.stopPropagation()}
          >
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-success" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">Payment Complete!</h3>
                <p className="text-sm text-muted-foreground mt-2">Your ride to {destination} is confirmed</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <h3 className="font-display text-lg font-bold text-foreground">Pay for Ride</h3>
                  </div>
                  <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-muted/50 rounded-xl p-4 mb-4">
                  <p className="text-sm text-foreground font-medium">🚗 {destination}</p>
                  <p className="text-xs text-muted-foreground mt-1">Driver: {driverName}</p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Ride fare</span>
                    <span className="text-foreground font-medium">${amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service fee (10%)</span>
                    <span className="text-foreground font-medium">${serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between text-sm font-bold">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 mb-4">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Wallet balance: <strong className="text-foreground">${balance.toFixed(2)}</strong></span>
                </div>

                <button
                  onClick={handlePay}
                  disabled={processing || balance < total}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {processing ? 'Processing...' : balance < total ? 'Insufficient Balance' : `Pay $${total.toFixed(2)}`}
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;

import { Award } from 'lucide-react';

interface Props {
  rideCount: number;
  className?: string;
}

const getTier = (count: number) => {
  if (count >= 50) return { name: 'Gold', color: 'text-secondary', bg: 'bg-secondary/15' };
  if (count >= 20) return { name: 'Silver', color: 'text-muted-foreground', bg: 'bg-muted' };
  return { name: 'Bronze', color: 'text-warning', bg: 'bg-warning/15' };
};

const DriverTierBadge = ({ rideCount, className = '' }: Props) => {
  const tier = getTier(rideCount);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${tier.bg} ${tier.color} ${className}`}>
      <Award className="w-3 h-3" />
      {tier.name}
    </span>
  );
};

export default DriverTierBadge;

import { CompatibilityResult } from '@/types';
import { Sparkles } from 'lucide-react';

interface Props {
  result: CompatibilityResult;
}

const CompatibilityBreakdown = ({ result }: Props) => {
  if (result.reasons.length === 0) return null;

  return (
    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-secondary/10 border border-secondary/20">
      <div className="flex items-center gap-1.5 shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-secondary" />
        <span className="text-xs font-bold text-secondary">{result.score}%</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {result.reasons.map((r, i) => (
          <span key={i} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {r}
          </span>
        ))}
      </div>
    </div>
  );
};

export default CompatibilityBreakdown;

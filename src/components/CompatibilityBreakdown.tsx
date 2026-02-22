import { CompatibilityResult } from '@/lib/compatibility';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface Props {
  result: CompatibilityResult;
  showBreakdown?: boolean;
}

const CompatibilityBreakdown = ({ result, showBreakdown = false }: Props) => {
  const [expanded, setExpanded] = useState(false);

  if (result.reasons.length === 0 && result.score === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-secondary/10 border border-secondary/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-secondary" />
            <span className="text-xs font-bold text-secondary">{result.score}% match</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {result.reasons.slice(0, 3).map((r, i) => (
              <span key={i} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {r}
              </span>
            ))}
            {result.reasons.length > 3 && !expanded && (
              <span className="text-xs text-muted-foreground">+{result.reasons.length - 3} more</span>
            )}
          </div>
        </div>
        {(result.reasons.length > 3 || showBreakdown) && (
          <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
      {expanded && (
        <div className="space-y-2 pt-1">
          {result.reasons.length > 3 && (
            <div className="flex flex-wrap gap-1">
              {result.reasons.slice(3).map((r, i) => (
                <span key={i} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{r}</span>
              ))}
            </div>
          )}
          {showBreakdown && result.breakdown && (
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <BreakdownBar label="Interests" value={result.breakdown.sharedInterests} />
              <BreakdownBar label="College" value={result.breakdown.sameCollege} />
              <BreakdownBar label="Major" value={result.breakdown.sameMajor} />
              <BreakdownBar label="Clubs" value={result.breakdown.overlappingClubs} />
              <BreakdownBar label="Year" value={result.breakdown.yearProximity} />
              <BreakdownBar label="Personality" value={result.breakdown.personalitySimilarity} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const BreakdownBar = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="h-1 bg-muted rounded-full overflow-hidden">
      <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${value}%` }} />
    </div>
  </div>
);

export default CompatibilityBreakdown;

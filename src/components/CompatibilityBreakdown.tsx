import { Sparkles, ChevronDown, ChevronUp, Brain, Info } from 'lucide-react';
import { useState } from 'react';
import type { MLCompatibilityResult, FeatureContribution } from '@/ml';
import type { CompatibilityResult } from '@/lib/compatibility';

type ResultType = MLCompatibilityResult | CompatibilityResult;

interface Props {
  result: ResultType;
  showBreakdown?: boolean;
}

function isMLResult(r: ResultType): r is MLCompatibilityResult {
  return 'isML' in r && 'contributions' in r;
}

const CompatibilityBreakdown = ({ result, showBreakdown = false }: Props) => {
  const [expanded, setExpanded] = useState(false);

  if ('reasons' in result && result.reasons.length === 0 && result.score === 0) return null;

  const mlResult = isMLResult(result) ? result : null;
  const reasons = result.reasons || [];
  const breakdown = result.breakdown;

  return (
    <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-secondary/10 border border-secondary/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 shrink-0">
            {mlResult?.isML ? (
              <Brain className="w-3.5 h-3.5 text-secondary" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-secondary" />
            )}
            <span className="text-xs font-bold text-secondary">{result.score}% match</span>
            {mlResult?.isML && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-secondary/20 text-secondary font-semibold uppercase tracking-wider">
                ML
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {reasons.slice(0, 3).map((r, i) => (
              <span key={i} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {r}
              </span>
            ))}
            {reasons.length > 3 && !expanded && (
              <span className="text-xs text-muted-foreground">+{reasons.length - 3} more</span>
            )}
          </div>
        </div>
        {(reasons.length > 3 || showBreakdown || (mlResult?.contributions && mlResult.contributions.length > 0)) && (
          <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {expanded && (
        <div className="space-y-2 pt-1">
          {/* ML Tooltip */}
          {mlResult?.isML && (
            <div className="flex items-start gap-1.5 text-[10px] text-muted-foreground bg-muted/50 rounded-md p-2">
              <Info className="w-3 h-3 mt-0.5 shrink-0" />
              <span>Predicted probability of successful ride match based on historical data.</span>
            </div>
          )}

          {/* Extra reasons */}
          {reasons.length > 3 && (
            <div className="flex flex-wrap gap-1">
              {reasons.slice(3).map((r, i) => (
                <span key={i} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{r}</span>
              ))}
            </div>
          )}

          {/* ML Feature Contributions */}
          {mlResult?.isML && mlResult.contributions.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Why this score</p>
              {mlResult.contributions.slice(0, 5).filter(c => c.percentage > 0).map((c) => (
                <ContributionBar key={c.feature} contribution={c} />
              ))}
            </div>
          )}

          {/* Breakdown bars (always available) */}
          {(showBreakdown || !mlResult?.isML) && breakdown && (
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <BreakdownBar label="Interests" value={breakdown.sharedInterests} />
              <BreakdownBar label="College" value={breakdown.sameCollege} />
              <BreakdownBar label="Major" value={breakdown.sameMajor} />
              <BreakdownBar label="Clubs" value={breakdown.overlappingClubs} />
              <BreakdownBar label="Year" value={breakdown.yearProximity} />
              <BreakdownBar label="Personality" value={breakdown.personalitySimilarity} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ContributionBar = ({ contribution }: { contribution: FeatureContribution }) => {
  const isPositive = contribution.contribution > 0;
  return (
    <div>
      <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
        <span>{contribution.label}</span>
        <span className={isPositive ? 'text-success' : 'text-muted-foreground'}>
          {isPositive ? '+' : ''}{contribution.percentage}%
        </span>
      </div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isPositive ? 'bg-secondary' : 'bg-muted-foreground/30'}`}
          style={{ width: `${Math.min(contribution.percentage, 100)}%` }}
        />
      </div>
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

/**
 * React hook for ML Compatibility — loads weights once, provides sync inference.
 */

import { useState, useEffect } from 'react';
import { loadWeights, computeMLCompatibilitySync, dbProfileToFeatureProfile, MLCompatibilityResult, ModelWeights } from '@/ml';
import type { UserFeatureProfile } from '@/ml';

export function useMLWeights() {
  const [weights, setWeights] = useState<ModelWeights | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadWeights().then(w => {
      setWeights(w);
      setLoaded(true);
    });
  }, []);

  return { weights, loaded };
}

/**
 * Compute ML compatibility synchronously using pre-loaded weights.
 */
export function useMLCompatibility(
  currentProfile: any | null,
  otherProfile: any | null,
  weights: ModelWeights | null
): MLCompatibilityResult | null {
  if (!currentProfile || !otherProfile) return null;
  if (currentProfile.id === otherProfile.id) return null;

  const a = toFeatureProfile(currentProfile);
  const b = toFeatureProfile(otherProfile);

  return computeMLCompatibilitySync(a, b, weights);
}

function toFeatureProfile(p: any): UserFeatureProfile {
  // Handle both DB profile shape and already-converted shape
  if (p.personalityTalk !== undefined) {
    return p as UserFeatureProfile;
  }
  return dbProfileToFeatureProfile(p);
}

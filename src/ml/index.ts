/**
 * ML Compatibility Pipeline — Public API
 * 
 * Single entry point for the entire ML system.
 * Handles feature building, weight loading, inference, and fallback.
 */

export { buildFeatureVector, dbProfileToFeatureProfile, FEATURE_NAMES, FEATURE_LABELS } from './featureBuilder';
export type { UserFeatureProfile, FeatureVector } from './featureBuilder';
export { predict, ruleBasedFallback } from './compatibilityModel';
export type { MLCompatibilityResult, FeatureContribution, ModelWeights } from './compatibilityModel';
export { loadWeights, invalidateWeightCache } from './modelLoader';

import { buildFeatureVector, dbProfileToFeatureProfile, UserFeatureProfile } from './featureBuilder';
import { predict, ruleBasedFallback, MLCompatibilityResult } from './compatibilityModel';
import { loadWeights } from './modelLoader';
import { computeCompatibility, profileToCompatibility, CompatibilityProfile } from '@/lib/compatibility';

/**
 * Compute ML-powered compatibility between two users.
 * Falls back to rule-based model if no trained weights exist.
 */
export async function computeMLCompatibility(
  a: UserFeatureProfile,
  b: UserFeatureProfile,
  historical?: {
    pastSharedRides?: number;
    historicalRating?: number;
    sharedConnections?: number;
  }
): Promise<MLCompatibilityResult> {
  const features = buildFeatureVector(a, b, historical);
  const weights = await loadWeights();

  if (weights) {
    return predict(features, weights);
  }

  // Fallback to rule-based
  const compatA: CompatibilityProfile = {
    id: a.id, interests: a.interests, clubs: a.clubs,
    college: a.college, major: a.major, year: a.year,
    personalityTalk: a.personalityTalk, personalityMusic: a.personalityMusic,
    personalitySchedule: a.personalitySchedule, personalitySocial: a.personalitySocial,
    cleanCarPref: a.cleanCarPref,
  };
  const compatB: CompatibilityProfile = {
    id: b.id, interests: b.interests, clubs: b.clubs,
    college: b.college, major: b.major, year: b.year,
    personalityTalk: b.personalityTalk, personalityMusic: b.personalityMusic,
    personalitySchedule: b.personalitySchedule, personalitySocial: b.personalitySocial,
    cleanCarPref: b.cleanCarPref,
  };

  const ruleResult = computeCompatibility(compatA, compatB);
  return ruleBasedFallback(ruleResult);
}

/**
 * Synchronous compatibility (uses cached weights, returns null if cache miss).
 * Use this in render paths where async isn't ideal.
 */
export function computeMLCompatibilitySync(
  a: UserFeatureProfile,
  b: UserFeatureProfile,
  cachedWeightsRef: { bias: number; weights: Record<string, number> } | null,
  historical?: {
    pastSharedRides?: number;
    historicalRating?: number;
    sharedConnections?: number;
  }
): MLCompatibilityResult {
  const features = buildFeatureVector(a, b, historical);

  if (cachedWeightsRef) {
    return predict(features, cachedWeightsRef);
  }

  // Fallback
  const compatA: CompatibilityProfile = {
    id: a.id, interests: a.interests, clubs: a.clubs,
    college: a.college, major: a.major, year: a.year,
    personalityTalk: a.personalityTalk, personalityMusic: a.personalityMusic,
    personalitySchedule: a.personalitySchedule, personalitySocial: a.personalitySocial,
    cleanCarPref: a.cleanCarPref,
  };
  const compatB: CompatibilityProfile = {
    id: b.id, interests: b.interests, clubs: b.clubs,
    college: b.college, major: b.major, year: b.year,
    personalityTalk: b.personalityTalk, personalityMusic: b.personalityMusic,
    personalitySchedule: b.personalitySchedule, personalitySocial: b.personalitySocial,
    cleanCarPref: b.cleanCarPref,
  };

  const ruleResult = computeCompatibility(compatA, compatB);
  return ruleBasedFallback(ruleResult);
}

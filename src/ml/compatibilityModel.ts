/**
 * ML Compatibility Model — Logistic Regression Inference
 * 
 * Loads trained weights from DB, computes sigmoid(w · x + bias),
 * and returns an explainable compatibility result.
 * 
 * Falls back to rule-based scoring when no trained weights are available.
 */

import { FeatureVector, FEATURE_NAMES, FEATURE_LABELS } from './featureBuilder';
import { computeCompatibility as ruleBased, profileToCompatibility, CompatibilityResult } from '@/lib/compatibility';

export interface ModelWeights {
  bias: number;
  weights: Record<string, number>;
}

export interface MLCompatibilityResult {
  score: number; // 0-100
  probability: number; // 0-1 raw sigmoid output
  isML: boolean; // true if ML model was used
  reasons: string[];
  contributions: FeatureContribution[];
  breakdown: {
    sharedInterests: number;
    sameCollege: number;
    sameMajor: number;
    overlappingClubs: number;
    yearProximity: number;
    personalitySimilarity: number;
  };
}

export interface FeatureContribution {
  feature: string;
  label: string;
  value: number; // feature value
  weight: number; // learned weight
  contribution: number; // weight * value
  percentage: number; // normalized contribution %
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/**
 * Run logistic regression inference.
 */
export function predict(
  features: FeatureVector,
  weights: ModelWeights
): MLCompatibilityResult {
  // Compute z = bias + sum(w_i * x_i)
  let z = weights.bias;
  const contributions: FeatureContribution[] = [];

  for (const name of FEATURE_NAMES) {
    const w = weights.weights[name] ?? 0;
    const x = features[name] ?? 0;
    const contrib = w * x;
    z += contrib;

    contributions.push({
      feature: name,
      label: FEATURE_LABELS[name],
      value: x,
      weight: w,
      contribution: contrib,
      percentage: 0, // filled below
    });
  }

  const probability = sigmoid(z);
  const score = Math.round(probability * 100);

  // Normalize contributions to percentages
  const totalAbsContrib = contributions.reduce((s, c) => s + Math.abs(c.contribution), 0);
  if (totalAbsContrib > 0) {
    for (const c of contributions) {
      c.percentage = Math.round((Math.abs(c.contribution) / totalAbsContrib) * 100);
    }
  }

  // Sort by absolute contribution descending
  contributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  // Generate human-readable reasons from top contributors
  const reasons: string[] = [];
  for (const c of contributions.slice(0, 5)) {
    if (c.contribution > 0.05) {
      reasons.push(c.label);
    }
  }

  // Build breakdown for UI compatibility (maps to existing CompatibilityBreakdown component)
  const breakdown = {
    sharedInterests: Math.round(features.interest_jaccard * 100),
    sameCollege: features.same_college * 100,
    sameMajor: Math.round(Math.max(features.same_major, features.major_similarity) * 100),
    overlappingClubs: Math.round(features.shared_clubs_norm * 100),
    yearProximity: Math.round(features.year_proximity * 100),
    personalitySimilarity: Math.round(features.personality_similarity * 100),
  };

  return {
    score,
    probability,
    isML: true,
    reasons,
    contributions,
    breakdown,
  };
}

/**
 * Fallback: convert rule-based result to ML result shape.
 */
export function ruleBasedFallback(ruleResult: CompatibilityResult): MLCompatibilityResult {
  return {
    score: ruleResult.score,
    probability: ruleResult.score / 100,
    isML: false,
    reasons: ruleResult.reasons,
    contributions: [],
    breakdown: ruleResult.breakdown,
  };
}

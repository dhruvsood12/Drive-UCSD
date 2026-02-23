/**
 * Model Trainer — Logistic Regression Training Pipeline
 * 
 * Pulls historical ride data, generates labeled pairs, and trains
 * logistic regression via gradient descent.
 * 
 * Designed to run server-side (edge function) but structured here
 * for portability. The edge function wrapper calls trainModel().
 */

import { buildFeatureVector, UserFeatureProfile, FEATURE_NAMES, FeatureVector } from './featureBuilder';

export interface TrainingSample {
  features: FeatureVector;
  label: number; // 1 = successful ride, 0 = unsuccessful
}

/**
 * Train logistic regression using gradient descent.
 * Returns learned weights.
 */
export function trainLogisticRegression(
  samples: TrainingSample[],
  learningRate = 0.01,
  epochs = 100
): { bias: number; weights: Record<string, number> } {
  if (samples.length === 0) {
    throw new Error('No training samples provided');
  }

  // Initialize weights
  let bias = 0;
  const weights: Record<string, number> = {};
  for (const name of FEATURE_NAMES) {
    weights[name] = 0;
  }

  const sigmoid = (z: number) => 1 / (1 + Math.exp(-Math.min(Math.max(z, -500), 500)));
  const n = samples.length;

  for (let epoch = 0; epoch < epochs; epoch++) {
    let biasGrad = 0;
    const grads: Record<string, number> = {};
    for (const name of FEATURE_NAMES) grads[name] = 0;

    for (const sample of samples) {
      // Forward pass
      let z = bias;
      for (const name of FEATURE_NAMES) {
        z += weights[name] * (sample.features[name] ?? 0);
      }
      const pred = sigmoid(z);
      const error = pred - sample.label;

      // Accumulate gradients
      biasGrad += error;
      for (const name of FEATURE_NAMES) {
        grads[name] += error * (sample.features[name] ?? 0);
      }
    }

    // Update weights
    bias -= learningRate * (biasGrad / n);
    for (const name of FEATURE_NAMES) {
      weights[name] -= learningRate * (grads[name] / n);
    }
  }

  return { bias, weights };
}

/**
 * Label a ride pair as successful or not.
 * 
 * Successful if:
 * - Ride completed (request accepted)
 * - Average rating >= 4
 * - No reports filed between the pair
 */
export function labelRidePair(params: {
  requestAccepted: boolean;
  avgRating: number | null;
  reportsFiled: number;
  chatMessages: number;
  rideRepeated: boolean;
}): number {
  if (!params.requestAccepted) return 0;

  let score = 0;
  if (params.avgRating !== null && params.avgRating >= 4) score += 2;
  if (params.reportsFiled === 0) score += 1;
  if (params.chatMessages > 3) score += 1;
  if (params.rideRepeated) score += 2;

  return score >= 2 ? 1 : 0;
}

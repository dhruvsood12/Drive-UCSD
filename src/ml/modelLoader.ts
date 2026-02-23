/**
 * Model Loader — fetches trained weights from DB and caches them.
 * Cache TTL: 5 minutes for performance.
 */

import { supabase } from '@/integrations/supabase/client';
import { ModelWeights } from './compatibilityModel';

let cachedWeights: ModelWeights | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Load model weights from the model_weights table.
 * Returns null if no weights are found (triggers rule-based fallback).
 */
export async function loadWeights(): Promise<ModelWeights | null> {
  const now = Date.now();
  if (cachedWeights && (now - cacheTimestamp) < CACHE_TTL_MS) {
    return cachedWeights;
  }

  try {
    const { data, error } = await supabase
      .from('model_weights' as any)
      .select('feature_name, weight_value');

    if (error || !data || data.length === 0) {
      return null;
    }

    const rows = data as unknown as Array<{ feature_name: string; weight_value: number }>;
    let bias = 0;
    const weights: Record<string, number> = {};

    for (const row of rows) {
      if (row.feature_name === 'bias') {
        bias = row.weight_value;
      } else {
        weights[row.feature_name] = row.weight_value;
      }
    }

    cachedWeights = { bias, weights };
    cacheTimestamp = now;
    return cachedWeights;
  } catch {
    return null;
  }
}

/**
 * Invalidate the weight cache (call after retraining).
 */
export function invalidateWeightCache(): void {
  cachedWeights = null;
  cacheTimestamp = 0;
}

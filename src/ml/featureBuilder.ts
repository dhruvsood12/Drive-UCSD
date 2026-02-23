/**
 * ML Feature Builder
 * Converts a user pair into a numeric feature vector for logistic regression inference.
 * Designed to be model-agnostic — can feed into neural nets, GBTs, etc.
 */

export interface UserFeatureProfile {
  id: string;
  interests: string[];
  clubs: string[];
  college: string;
  major: string;
  year: string;
  personalityTalk?: string;
  personalityMusic?: string;
  personalitySchedule?: string;
  personalitySocial?: string;
  cleanCarPref?: string;
}

export interface FeatureVector {
  same_college: number;
  same_major: number;
  major_similarity: number;
  year_proximity: number;
  interest_jaccard: number;
  shared_clubs_norm: number;
  personality_similarity: number;
  past_shared_rides: number;
  historical_rating: number;
  shared_connections: number;
}

export const FEATURE_NAMES: (keyof FeatureVector)[] = [
  'same_college',
  'same_major',
  'major_similarity',
  'year_proximity',
  'interest_jaccard',
  'shared_clubs_norm',
  'personality_similarity',
  'past_shared_rides',
  'historical_rating',
  'shared_connections',
];

export const FEATURE_LABELS: Record<keyof FeatureVector, string> = {
  same_college: 'Same College',
  same_major: 'Same Major',
  major_similarity: 'Related Field',
  year_proximity: 'Year Proximity',
  interest_jaccard: 'Shared Interests',
  shared_clubs_norm: 'Shared Clubs',
  personality_similarity: 'Personality Fit',
  past_shared_rides: 'Past Rides Together',
  historical_rating: 'Rating History',
  shared_connections: 'Mutual Connections',
};

function yearToNum(y: string): number {
  if (y.startsWith('1')) return 1;
  if (y.startsWith('2')) return 2;
  if (y.startsWith('3')) return 3;
  if (y.startsWith('4')) return 4;
  if (y.startsWith('5') || y.toLowerCase() === 'grad') return 5;
  return 3;
}

function jaccardSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter(x => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

function personalityMatch(a: string | undefined, b: string | undefined): number {
  if (!a || !b) return 0.5; // neutral when unknown
  return a === b ? 1 : 0.2;
}

/**
 * Build the feature vector for a user pair.
 * Historical features default to 0 when no ride history is available.
 */
export function buildFeatureVector(
  a: UserFeatureProfile,
  b: UserFeatureProfile,
  historical?: {
    pastSharedRides?: number;
    historicalRating?: number;
    sharedConnections?: number;
  }
): FeatureVector {
  // Academic features
  const same_college = a.college && b.college && a.college === b.college ? 1 : 0;
  const same_major = a.major && b.major && a.major === b.major ? 1 : 0;

  let major_similarity = 0;
  if (a.major && b.major && !same_major) {
    const aDept = a.major.split(' ')[0].toLowerCase();
    const bDept = b.major.split(' ')[0].toLowerCase();
    if (aDept === bDept && aDept.length > 2) major_similarity = 0.5;
  }

  const yearDiff = Math.abs(yearToNum(a.year) - yearToNum(b.year));
  const year_proximity = Math.max(1 - yearDiff * 0.25, 0);

  // Social features
  const interest_jaccard = jaccardSimilarity(a.interests, b.interests);
  const sharedClubs = (a.clubs || []).filter(c => (b.clubs || []).includes(c));
  const shared_clubs_norm = Math.min(sharedClubs.length / 3, 1);

  // Personality features — cosine-like similarity across dimensions
  const dims = [
    personalityMatch(a.personalityTalk, b.personalityTalk),
    personalityMatch(a.personalityMusic, b.personalityMusic),
    personalityMatch(a.personalitySchedule, b.personalitySchedule),
    personalityMatch(a.personalitySocial, b.personalitySocial),
    personalityMatch(a.cleanCarPref, b.cleanCarPref),
  ];
  const personality_similarity = dims.reduce((s, v) => s + v, 0) / dims.length;

  // Historical features (default 0 for cold-start)
  const past_shared_rides = Math.min((historical?.pastSharedRides || 0) / 5, 1);
  const historical_rating = (historical?.historicalRating || 0) / 5; // normalize to 0-1
  const shared_connections = Math.min((historical?.sharedConnections || 0) / 10, 1);

  return {
    same_college,
    same_major,
    major_similarity,
    year_proximity,
    interest_jaccard,
    shared_clubs_norm,
    personality_similarity,
    past_shared_rides,
    historical_rating,
    shared_connections,
  };
}

/**
 * Convert a DB profile to a UserFeatureProfile for the ML pipeline.
 */
export function dbProfileToFeatureProfile(p: {
  id: string;
  interests?: string[] | null;
  clubs?: string[] | null;
  college?: string | null;
  major?: string | null;
  year?: string | null;
  personality_talk?: string | null;
  personality_music?: string | null;
  personality_schedule?: string | null;
  personality_social?: string | null;
  clean_car_pref?: string | null;
}): UserFeatureProfile {
  return {
    id: p.id,
    interests: p.interests || [],
    clubs: p.clubs || [],
    college: p.college || '',
    major: p.major || '',
    year: p.year || '',
    personalityTalk: p.personality_talk || undefined,
    personalityMusic: p.personality_music || undefined,
    personalitySchedule: p.personality_schedule || undefined,
    personalitySocial: p.personality_social || undefined,
    cleanCarPref: p.clean_car_pref || undefined,
  };
}

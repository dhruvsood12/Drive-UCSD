/**
 * Social Compatibility Engine v2
 * Weighted scoring system — ML-ready architecture
 * 
 * Weights can be replaced with learned parameters.
 * Structure supports cosine similarity embeddings and logistic regression.
 */

export interface CompatibilityProfile {
  id: string;
  interests: string[];
  clubs: string[];
  college: string;
  major: string;
  year: string;
  musicTag?: string;
  personalityTalk?: string;
  personalityMusic?: string;
  personalitySchedule?: string;
  personalitySocial?: string;
  cleanCarPref?: string;
}

export interface CompatibilityResult {
  score: number;
  reasons: string[];
  breakdown: {
    sharedInterests: number;
    sameCollege: number;
    sameMajor: number;
    overlappingClubs: number;
    yearProximity: number;
    personalitySimilarity: number;
  };
}

// Weights — tunable, can be replaced with learned params
const WEIGHTS = {
  sharedInterests: 0.30,
  sameCollege: 0.20,
  sameMajor: 0.15,
  overlappingClubs: 0.15,
  yearProximity: 0.10,
  personalitySimilarity: 0.10,
};

function yearToNum(y: string): number {
  if (y.startsWith('1')) return 1;
  if (y.startsWith('2')) return 2;
  if (y.startsWith('3')) return 3;
  if (y.startsWith('4')) return 4;
  if (y.startsWith('5') || y === 'Grad') return 5;
  return 3;
}

function personalityMatch(a: string | undefined, b: string | undefined): number {
  if (!a || !b) return 0.5;
  return a === b ? 1 : 0.3;
}

export function computeCompatibility(a: CompatibilityProfile, b: CompatibilityProfile): CompatibilityResult {
  const reasons: string[] = [];

  // Shared interests (0-1 normalized)
  const sharedInterests = a.interests.filter(i => b.interests.includes(i));
  const interestScore = a.interests.length > 0 || b.interests.length > 0
    ? sharedInterests.length / Math.max(Math.min(a.interests.length, b.interests.length), 1)
    : 0;
  const cappedInterest = Math.min(interestScore, 1);
  if (sharedInterests.length > 0) reasons.push(`${sharedInterests.length} shared interest${sharedInterests.length > 1 ? 's' : ''}`);

  // Same college (0 or 1)
  const collegeScore = a.college && b.college && a.college === b.college ? 1 : 0;
  if (collegeScore) reasons.push('Same college');

  // Same major (0, 0.5 for same dept, 1 for exact)
  let majorScore = 0;
  if (a.major && b.major) {
    if (a.major === b.major) {
      majorScore = 1;
      reasons.push('Same major');
    } else {
      const aDept = a.major.split(' ')[0].toLowerCase();
      const bDept = b.major.split(' ')[0].toLowerCase();
      if (aDept === bDept && aDept.length > 2) {
        majorScore = 0.5;
        reasons.push('Related major');
      }
    }
  }

  // Overlapping clubs
  const sharedClubs = (a.clubs || []).filter(c => (b.clubs || []).includes(c));
  const clubScore = sharedClubs.length > 0
    ? Math.min(sharedClubs.length / 3, 1)
    : 0;
  if (sharedClubs.length > 0) {
    if (sharedClubs.length <= 2) {
      sharedClubs.forEach(c => reasons.push(`Both in ${c}`));
    } else {
      reasons.push(`${sharedClubs.length} shared clubs`);
    }
  }

  // Year proximity (closer = higher)
  const yearDiff = Math.abs(yearToNum(a.year) - yearToNum(b.year));
  const yearScore = Math.max(1 - yearDiff * 0.25, 0);
  if (yearDiff === 0) reasons.push('Same year');
  else if (yearDiff === 1) reasons.push('Adjacent year');

  // Personality similarity (average of all personality dimensions)
  const personalityDims = [
    personalityMatch(a.personalityTalk, b.personalityTalk),
    personalityMatch(a.personalityMusic, b.personalityMusic),
    personalityMatch(a.personalitySchedule, b.personalitySchedule),
    personalityMatch(a.personalitySocial, b.personalitySocial),
    personalityMatch(a.cleanCarPref, b.cleanCarPref),
  ];
  const personalityScore = personalityDims.reduce((s, v) => s + v, 0) / personalityDims.length;

  // Personality reasons
  if (a.personalityTalk && b.personalityTalk && a.personalityTalk === b.personalityTalk) {
    const labels: Record<string, string> = { talkative: 'Both talkative', quiet: 'Both quiet', depends: 'Both go-with-flow' };
    reasons.push(labels[a.personalityTalk] || 'Same talk style');
  }
  if (a.personalitySchedule && b.personalitySchedule && a.personalitySchedule === b.personalitySchedule) {
    const labels: Record<string, string> = { early: 'Both early birds', night: 'Both night owls', flexible: 'Both flexible schedule' };
    reasons.push(labels[a.personalitySchedule] || 'Same schedule');
  }
  if (a.personalityMusic && b.personalityMusic && a.personalityMusic === b.personalityMusic) {
    reasons.push('Same music preference');
  }
  if (a.musicTag && b.musicTag && a.musicTag === b.musicTag) {
    reasons.push('Same music vibe');
  }

  // Weighted sum
  const raw =
    WEIGHTS.sharedInterests * cappedInterest +
    WEIGHTS.sameCollege * collegeScore +
    WEIGHTS.sameMajor * majorScore +
    WEIGHTS.overlappingClubs * clubScore +
    WEIGHTS.yearProximity * yearScore +
    WEIGHTS.personalitySimilarity * personalityScore;

  const score = Math.round(Math.min(raw * 100, 100));

  return {
    score,
    reasons: reasons.slice(0, 6),
    breakdown: {
      sharedInterests: Math.round(cappedInterest * 100),
      sameCollege: collegeScore * 100,
      sameMajor: majorScore * 100,
      overlappingClubs: Math.round(clubScore * 100),
      yearProximity: Math.round(yearScore * 100),
      personalitySimilarity: Math.round(personalityScore * 100),
    },
  };
}

/**
 * Convert a profile from the auth/DB layer to a CompatibilityProfile.
 * This adapter allows the engine to be independent of the data layer.
 */
export function profileToCompatibility(p: {
  id: string;
  interests?: string[];
  clubs?: string[];
  college?: string | null;
  major?: string | null;
  year?: string | null;
  music_tag?: string | null;
  personality_talk?: string | null;
  personality_music?: string | null;
  personality_schedule?: string | null;
  personality_social?: string | null;
  clean_car_pref?: string | null;
}): CompatibilityProfile {
  return {
    id: p.id,
    interests: p.interests || [],
    clubs: p.clubs || [],
    college: p.college || '',
    major: p.major || '',
    year: p.year || '',
    musicTag: p.music_tag || undefined,
    personalityTalk: p.personality_talk || undefined,
    personalityMusic: p.personality_music || undefined,
    personalitySchedule: p.personality_schedule || undefined,
    personalitySocial: p.personality_social || undefined,
    cleanCarPref: p.clean_car_pref || undefined,
  };
}

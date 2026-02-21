import { User, Trip } from '@/types';
import { useStore } from '@/store/useStore';
import { CompatibilityResult } from '@/types';

export function computeCompatibility(currentUser: User, driver: User): CompatibilityResult {
  const reasons: string[] = [];
  let score = 0;

  const sharedInterests = currentUser.interests.filter(i => driver.interests.includes(i));
  if (sharedInterests.length > 0) {
    score += sharedInterests.length * 10;
    reasons.push(`${sharedInterests.length} shared interest${sharedInterests.length > 1 ? 's' : ''}`);
  }

  const sharedClubs = (currentUser.clubs || []).filter(c => (driver.clubs || []).includes(c));
  if (sharedClubs.length > 0) {
    score += sharedClubs.length * 8;
    reasons.push(`${sharedClubs.length} shared club${sharedClubs.length > 1 ? 's' : ''}`);
  }

  if (currentUser.college === driver.college) {
    score += 15;
    reasons.push('Same college');
  }

  if (currentUser.major === driver.major) {
    score += 10;
    reasons.push('Same major');
  }

  if (currentUser.musicTag && driver.musicTag && currentUser.musicTag === driver.musicTag) {
    score += 10;
    reasons.push('Same music vibe');
  }

  if (currentUser.year === driver.year) {
    score += 5;
    reasons.push('Same year');
  }

  return { score: Math.min(Math.max(score, 0), 100), reasons };
}

export function formatDepartureTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 0) return 'Departed';
  if (diffMin < 1) return 'Leaving now';
  if (diffMin < 60) return `In ${diffMin} min`;
  const hours = Math.floor(diffMin / 60);
  const mins = diffMin % 60;
  if (hours < 6) return `In ${hours}h ${mins > 0 ? `${mins}m` : ''}`;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

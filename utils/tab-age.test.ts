import { describe, expect, it } from 'vitest';
import { formatTabAge } from './tab-age';

const NOW = Date.UTC(2026, 9, 6, 12, 0, 0);
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('formatTabAge', () => {
  it('says "just now" for under a minute', () => {
    expect(formatTabAge(NOW - 30_000, NOW)).toBe('just now');
  });

  it('uses minutes under an hour', () => {
    expect(formatTabAge(NOW - 5 * MINUTE, NOW)).toBe('5 minutes ago');
  });

  it('uses hours under a day', () => {
    expect(formatTabAge(NOW - 3 * HOUR, NOW)).toBe('3 hours ago');
  });

  it('uses days from a day up', () => {
    expect(formatTabAge(NOW - 3 * DAY, NOW)).toBe('3 days ago');
  });

  it('uses singular for exactly one unit', () => {
    expect(formatTabAge(NOW - DAY, NOW)).toBe('1 day ago');
  });

  it('switches to minutes at exactly one minute', () => {
    expect(formatTabAge(NOW - MINUTE, NOW)).toBe('1 minute ago');
  });

  it('switches to hours at exactly one hour', () => {
    expect(formatTabAge(NOW - HOUR, NOW)).toBe('1 hour ago');
  });

  it('treats a future timestamp as "just now"', () => {
    expect(formatTabAge(NOW + HOUR, NOW)).toBe('just now');
  });

  it('says "unknown" when lastAccessed is missing', () => {
    expect(formatTabAge(undefined, NOW)).toBe('unknown');
  });
});

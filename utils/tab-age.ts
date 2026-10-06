const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function formatAgo(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? '' : 's'} ago`;
}

export function formatTabAge(lastAccessed: number | undefined, now: number): string {
  if (lastAccessed === undefined) return 'unknown';
  const elapsed = Math.max(0, now - lastAccessed);
  if (elapsed < MINUTE) return 'just now';
  if (elapsed < HOUR) return formatAgo(Math.floor(elapsed / MINUTE), 'minute');
  if (elapsed < DAY) return formatAgo(Math.floor(elapsed / HOUR), 'hour');
  return formatAgo(Math.floor(elapsed / DAY), 'day');
}

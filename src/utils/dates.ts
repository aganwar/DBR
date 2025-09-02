// src/utils/dates.ts

/** Zero-pad to 2 digits */
const pad2 = (n: number) => (n < 10 ? `0${n}` : String(n));

/** Format a Date (local time) as YYYY-MM-DD */
export function formatYMD(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Alias some files used earlier */
export const fmtYMD = formatYMD;

/** Parse a YYYY-MM-DD string to a Date (local time). Returns null if invalid. */
export function parseYMD(s?: string | null): Date | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  // validate round-trip to avoid 2025-02-31 becoming Mar 3rd, etc.
  return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d ? dt : null;
}

/** Today at local midnight */
export function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Add n days (can be negative) */
export function addDays(d: Date, n: number): Date {
  const t = new Date(d);
  t.setDate(t.getDate() + n);
  return t;
}

/** Start of this week (Mon as first day) */
export function startOfThisWeek(): Date {
  const t = today();
  const dow = t.getDay(); // 0=Sun..6=Sat
  const delta = dow === 0 ? -6 : 1 - dow; // move back to Monday
  return addDays(t, delta);
}

/** End of this week (Sun as last day) */
export function endOfThisWeek(): Date {
  return addDays(startOfThisWeek(), 6);
}

/** Start of month for a given date */
export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/** End of month for a given date */
export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

/** Inclusive range of YYYY-MM-DD strings */
export function rangeYMD(from: Date, to: Date): string[] {
  const out: string[] = [];
  let cur = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  while (cur <= end) {
    out.push(formatYMD(cur));
    cur = addDays(cur, 1);
  }
  return out;
}

/** Convenience wrappers some files import */
export const toYMD = formatYMD;
export const fromYMD = parseYMD;

/** Clamp a date to [min, max] */
export function clampDate(d: Date, min: Date, max: Date): Date {
  if (d < min) return new Date(min);
  if (d > max) return new Date(max);
  return d;
}

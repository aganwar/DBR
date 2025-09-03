// src/utils/dates.ts

/** Zero-pad to 2 digits */
const pad2 = (n: number) => (n < 10 ? `0${n}` : String(n));

/** Format a Date (local time) as YYYY-MM-DD */
export function formatYMD(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Alias kept for any older imports */
export const ymd = formatYMD;

/** Today at local midnight */
export function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Add n days (can be negative) */
export function addDays(d: Date, n: number): Date {
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  t.setDate(t.getDate() + n);
  return t;
}

/** Start of this week (Mon as first day) */
export function startOfThisWeek(ref?: Date): Date {
  const t = ref ? new Date(ref) : today();
  const dow = t.getDay(); // 0=Sun..6=Sat
  const delta = dow === 0 ? -6 : 1 - dow; // move back to Monday
  return addDays(t, delta);
}

/** End of this week (Sun as last day) */
export function endOfThisWeek(ref?: Date): Date {
  return addDays(startOfThisWeek(ref), 6);
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

/* ------------------------------------------------------------------------- */
/*  Public ranges EXPECTED by CalendarGrid                                   */
/* ------------------------------------------------------------------------- */

/** Current week (Mon..Sun) relative to today (or a ref date) */
export function thisWeek(ref?: Date): { from: string; to: string } {
  const fromD = startOfThisWeek(ref);
  const toD = endOfThisWeek(ref);
  return { from: formatYMD(fromD), to: formatYMD(toD) };
}

/** Next 7 days including today: [today .. today+6] */
export function next7Days(ref?: Date): { from: string; to: string } {
  const base = ref ? new Date(ref) : today();
  return { from: formatYMD(base), to: formatYMD(addDays(base, 6)) };
}

/** Next calendar week (Mon..Sun) after the current one */
export function nextWeek(ref?: Date): { from: string; to: string } {
  const startNext = addDays(startOfThisWeek(ref), 7);
  const endNext = addDays(startNext, 6);
  return { from: formatYMD(startNext), to: formatYMD(endNext) };
}

/** Current calendar month */
export function thisMonth(ref?: Date): { from: string; to: string } {
  const base = ref ? new Date(ref) : today();
  return {
    from: formatYMD(startOfMonth(base)),
    to: formatYMD(endOfMonth(base)),
  };
}

/** Open range (no constraints) for the “All” button */
export function allRange(): { from?: string; to?: string } {
  return {};
}

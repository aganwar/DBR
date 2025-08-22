// src/dates.ts
import dayjs, { Dayjs } from "dayjs";

/**
 * Return ISO "YYYY-MM-DD"
 */
export function ymd(d: Dayjs | Date | string | number): string {
  return dayjs(d).format("YYYY-MM-DD");
}

/**
 * Start of week as Monday, end as Sunday for a given reference day.
 */
export function thisWeek(ref?: Dayjs | Date | string | number): { from: string; to: string } {
  const base = dayjs(ref ?? dayjs()).startOf("day");
  // dayjs startOf('week') is Sunday by default; shift to Monday
  const monday = base.startOf("week").add(1, "day");
  const sunday = monday.add(6, "day");
  return { from: ymd(monday), to: ymd(sunday) };
}

/**
 * Next 7 days including today: [today .. today+6]
 */
export function next7Days(ref?: Dayjs | Date | string | number): { from: string; to: string } {
  const base = dayjs(ref ?? dayjs()).startOf("day");
  return { from: ymd(base), to: ymd(base.add(6, "day")) };
}

/**
 * Current calendar month for a given reference day.
 */
export function thisMonth(ref?: Dayjs | Date | string | number): { from: string; to: string } {
  const base = dayjs(ref ?? dayjs()).startOf("day");
  return { from: ymd(base.startOf("month")), to: ymd(base.endOf("month")) };
}

/**
 * Open range (no constraints). Use when the UI selects "All".
 */
export function allRange(): { from?: string; to?: string } {
  return {};
}

/**
 * Small enum-like helper for UI mapping
 */
export type RangeKey = "thisweek" | "next7" | "thismonth" | "all";

/**
 * Get range by simple key. Useful for CalendarGrid range buttons.
 */
export function getRange(key: RangeKey, ref?: Dayjs | Date | string | number) {
  switch (key) {
    case "thisweek":  return thisWeek(ref);
    case "next7":     return next7Days(ref);
    case "thismonth": return thisMonth(ref);
    case "all":       return allRange();
  }
}

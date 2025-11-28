import { toZonedTime, fromZonedTime } from 'date-fns-tz';

const ISRAEL_TIMEZONE = 'Asia/Jerusalem';

/**
 * Convert a UTC date to Israel time
 */
export function toIsraelTime(date: Date): Date {
  return toZonedTime(date, ISRAEL_TIMEZONE);
}

/**
 * Convert Israel time to UTC
 * Use this when you have a date/time that represents Israel local time
 * and you need to store it as UTC
 */
export function fromIsraelTime(date: Date): Date {
  return fromZonedTime(date, ISRAEL_TIMEZONE);
}

/**
 * Create a UTC date from Israel date and time components
 * @param year - Year (e.g., 2024)
 * @param month - Month (1-12)
 * @param day - Day of month
 * @param hour - Hour in Israel time (0-23)
 * @param minute - Minute (0-59)
 */
export function createIsraelDate(
  year: number,
  month: number,
  day: number,
  hour: number = 9,
  minute: number = 0
): Date {
  // Create a date string in Israel time
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
  // Convert from Israel time to UTC
  return fromZonedTime(dateStr, ISRAEL_TIMEZONE);
}

/**
 * Set a specific Israel time on a given date
 * Useful for setting "9:00 AM Israel time" on any date
 */
export function setIsraelTime(date: Date, hour: number, minute: number = 0): Date {
  const israelDate = toZonedTime(date, ISRAEL_TIMEZONE);
  israelDate.setHours(hour, minute, 0, 0);
  return fromZonedTime(israelDate, ISRAEL_TIMEZONE);
}

/**
 * Format a date in Israel timezone
 */
export function formatIsraelDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
  return date.toLocaleString('he-IL', {
    timeZone: ISRAEL_TIMEZONE,
    ...options,
  });
}

/**
 * Check if a given UTC date is currently in Israel DST (summer time)
 */
export function isIsraelDST(date: Date): boolean {
  const jan = new Date(date.getFullYear(), 0, 1);
  const jul = new Date(date.getFullYear(), 6, 1);
  const janOffset = toZonedTime(jan, ISRAEL_TIMEZONE).getTimezoneOffset();
  const julOffset = toZonedTime(jul, ISRAEL_TIMEZONE).getTimezoneOffset();
  const dateOffset = toZonedTime(date, ISRAEL_TIMEZONE).getTimezoneOffset();

  // If current offset matches the smaller offset (more negative = more ahead of UTC), it's DST
  return dateOffset === Math.min(janOffset, julOffset);
}

export { ISRAEL_TIMEZONE };

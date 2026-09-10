/**
 * Pure JavaScript Date Utilities (Zero-dependency replacement for date-fns)
 */

export function startOfDay(date: Date | string): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function subMonths(date: Date, months: number): Date {
  return addMonths(date, -months);
}

export function getDay(date: Date): number {
  return date.getDay();
}

export function isSameDay(dateLeft: Date, dateRight: Date): boolean {
  const d1 = startOfDay(dateLeft);
  const d2 = startOfDay(dateRight);
  return d1.getTime() === d2.getTime();
}

export function isBefore(dateLeft: Date, dateRight: Date): boolean {
  return startOfDay(dateLeft).getTime() < startOfDay(dateRight).getTime();
}

export function eachDayOfInterval({ start, end }: { start: Date; end: Date }): Date[] {
  const days: Date[] = [];
  let current = startOfDay(start);
  const last = startOfDay(end);

  while (current.getTime() <= last.getTime()) {
    days.push(new Date(current));
    current = addDays(current, 1);
  }

  return days;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const DAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function format(date: Date, formatStr: string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();
  const dayOfWeek = d.getDay();
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;

  if (formatStr === 'yyyy-MM-dd') {
    const m = month + 1 < 10 ? '0' + (month + 1) : month + 1;
    const dayStr = day < 10 ? '0' + day : day;
    return `${year}-${m}-${dayStr}`;
  }

  if (formatStr === 'MMMM yyyy') {
    return `${MONTH_NAMES[month]} ${year}`;
  }

  if (formatStr === 'EEEE, MMMM d, yyyy') {
    return `${DAY_NAMES[dayOfWeek]}, ${MONTH_NAMES[month]} ${day}, ${year}`;
  }

  if (formatStr === 'EEEE, MMMM d') {
    return `${DAY_NAMES[dayOfWeek]}, ${MONTH_NAMES[month]} ${day}`;
  }

  if (formatStr === 'EEE, MMMM d, yyyy') {
    return `${DAY_NAMES_SHORT[dayOfWeek]}, ${MONTH_NAMES[month]} ${day}, ${year}`;
  }

  if (formatStr === 'MMM d, h:mm a') {
    return `${MONTH_NAMES_SHORT[month]} ${day}, ${hours12}:${minutesStr} ${ampm}`;
  }

  if (formatStr === 'd') {
    return String(day);
  }

  return d.toLocaleDateString();
}

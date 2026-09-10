import { getOrdersByDate } from './db';

export const MAX_ORDERS_PER_DAY = 15;

export function isCutoffPassed(dateStr: string): boolean {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return true;
  
  const [year, month, day] = dateStr.split('-').map(Number);
  const bakeDate = new Date(year, month - 1, day, 0, 0, 0, 0);
  
  const cutoff = new Date(bakeDate);
  cutoff.setDate(cutoff.getDate() - 1);
  cutoff.setHours(20, 0, 0, 0);
  
  const now = new Date();
  return now.getTime() > cutoff.getTime();
}

export function getOrderCount(dateStr: string): number {
  return getOrdersByDate(dateStr).length;
}

export function getRemainingCapacity(dateStr: string): number {
  const count = getOrderCount(dateStr);
  return Math.max(0, MAX_ORDERS_PER_DAY - count);
}

export function getCutoffLabel(dateStr: string): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [year, month, day] = dateStr.split('-').map(Number);
  const bake = new Date(year, month - 1, day);
  
  const cutoffDay = new Date(bake);
  cutoffDay.setDate(cutoffDay.getDate() - 1);
  
  return `Orders for ${days[bake.getDay()]} close ${days[cutoffDay.getDay()]} at 8 PM`;
}

// Helper to enforce 24‑hour advance booking rule
export function isWithin24Hours(dateStr: string): boolean {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [year, month, day] = dateStr.split('-').map(Number);
  const target = new Date(year, month - 1, day);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  // If diff is less than 24h (in ms), the date is too soon
  return diff < 24 * 60 * 60 * 1000;
}

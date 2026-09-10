export function isWithin24Hours(dateStr: string): boolean {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [year, month, day] = dateStr.split('-').map(Number);
  const target = new Date(year, month - 1, day);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return diff < 24 * 60 * 60 * 1000;
}

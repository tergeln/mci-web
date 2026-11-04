export const COURSE_PRICE = 49900;
export const COURSE_ACCESS_MONTHS = 3;

// Calendar months, clamped at month end (Jan 31 + 3 months = Apr 30).
export function accessExpiresAt(activatedAt) {
  const start = new Date(activatedAt);
  if (!Number.isFinite(start.getTime())) return null;
  const result = new Date(start);
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + COURSE_ACCESS_MONTHS);
  const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));
  return result.toISOString();
}
export function entitlementExpiry(item) {
  return item.expiresAt || accessExpiresAt(item.activatedAt || item.paidAt || item.startsAt);
}
export function isActiveCourse(item, now = Date.now()) {
  const expiry = Date.parse(entitlementExpiry(item));
  const start = item.activatedAt || item.paidAt || item.startsAt;
  const allowed = item.paymentStatus === 'paid';
  return item.status === 'active' && allowed && Number.isFinite(expiry) && expiry > now && (!start || Date.parse(start) <= now);
}

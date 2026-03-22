import verified from "/data/manselyeok/solar_terms_exact_verified.json" assert { type: "json" };
import pending from "/data/manselyeok/solar_terms_exact_pending.json" assert { type: "json" };

export const SOLAR_TERMS_EXACT_VERIFIED = verified;
export const SOLAR_TERMS_EXACT_PENDING = pending;

export function getVerifiedSolarTermRecord(year, termName) {
  return SOLAR_TERMS_EXACT_VERIFIED?.[year]?.[termName] || null;
}

export function getVerifiedSolarTermDate(year, termName) {
  const record = getVerifiedSolarTermRecord(year, termName);
  if (!record?.datetime || !record?.verified) return null;
  return new Date(record.datetime);
}

export function getPendingSolarTermRecord(year, termName) {
  return SOLAR_TERMS_EXACT_PENDING?.[year]?.[termName] || null;
}

export function hasVerifiedSolarTerm(year, termName) {
  return Boolean(getVerifiedSolarTermRecord(year, termName)?.verified);
}

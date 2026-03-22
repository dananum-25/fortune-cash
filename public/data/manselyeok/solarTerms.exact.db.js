// /js/solarTerms.exact.db.js
import solarTermsExact from "/data/manselyeok/solar_terms_exact.json" assert { type: "json" };

export const SOLAR_TERMS_EXACT = solarTermsExact;

export function getExactSolarTermRecord(year, termName) {
  return SOLAR_TERMS_EXACT?.[year]?.[termName] || null;
}

export function getExactSolarTermDate(year, termName) {
  const record = getExactSolarTermRecord(year, termName);
  if (!record?.datetime) return null;
  return new Date(record.datetime);
}

export function isExactSolarTermVerified(year, termName) {
  const record = getExactSolarTermRecord(year, termName);
  return Boolean(record?.verified);
}

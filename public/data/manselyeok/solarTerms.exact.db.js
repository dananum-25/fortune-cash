let verifiedCache = null;
let pendingCache = null;

async function loadJson(path) {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`${path} 로드 실패`);
  }
  return await res.json();
}

export async function loadVerifiedSolarTerms() {
  if (verifiedCache) return verifiedCache;
  verifiedCache = await loadJson("/data/manselyeok/solar_terms_exact_verified.json");
  return verifiedCache;
}

export async function loadPendingSolarTerms() {
  if (pendingCache) return pendingCache;
  pendingCache = await loadJson("/data/manselyeok/solar_terms_exact_pending.json");
  return pendingCache;
}

export async function getVerifiedSolarTermRecord(year, termName) {
  const data = await loadVerifiedSolarTerms();
  return data?.[year]?.[termName] || null;
}

export async function getVerifiedSolarTermDate(year, termName) {
  const record = await getVerifiedSolarTermRecord(year, termName);
  if (!record?.datetime || !record?.verified) return null;
  return new Date(record.datetime);
}

export async function getPendingSolarTermRecord(year, termName) {
  const data = await loadPendingSolarTerms();
  return data?.[year]?.[termName] || null;
}

export async function hasVerifiedSolarTerm(year, termName) {
  const record = await getVerifiedSolarTermRecord(year, termName);
  return Boolean(record?.verified);
}

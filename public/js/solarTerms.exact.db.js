let exactCache = null;
let verifiedCache = null;

async function loadJson(path) {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`${path} 로드 실패`);
  }
  return await res.json();
}

// 1순위: KASI API 실데이터
export async function loadExactSolarTerms() {
  if (exactCache) return exactCache;
  exactCache = await loadJson("/data/manselyeok/solar_terms_exact.json");
  return exactCache;
}

// 2순위: 예전 자동계산 확정본
export async function loadVerifiedSolarTerms() {
  if (verifiedCache) return verifiedCache;
  verifiedCache = await loadJson("/data/manselyeok/solar_terms_exact_verified.json");
  return verifiedCache;
}

export async function getExactSolarTermDate(year, termName) {
  const data = await loadExactSolarTerms();
  const datetime = data?.[year]?.[termName];

  if (!datetime) return null;
  return new Date(datetime);
}

export async function getVerifiedSolarTermDate(year, termName) {
  const data = await loadVerifiedSolarTerms();
  const record = data?.[year]?.[termName];

  if (!record?.datetime) return null;
  return new Date(record.datetime);
}

export async function getBestSolarTermDate(year, termName) {
  const exactDate = await getExactSolarTermDate(year, termName);
  if (exactDate) return exactDate;

  const verifiedDate = await getVerifiedSolarTermDate(year, termName);
  if (verifiedDate) return verifiedDate;

  return null;
}

export async function hasVerifiedSolarTerm(year, termName) {
  const exact = await loadExactSolarTerms();
  if (exact?.[year]?.[termName]) return true;

  const verified = await loadVerifiedSolarTerms();
  if (verified?.[year]?.[termName]) return true;

  return false;
}

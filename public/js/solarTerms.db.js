// /js/solarTerms.db.js
// 1940~2040 절기DB (형식 고정)
// 값은 "MM-DD" (필요하면 추후 "MM-DDTHH:mm"로 확장 가능)

export const TERM_ORDER_24 = [
  "소한","대한","입춘","우수","경칩","춘분","청명","곡우",
  "입하","소만","망종","하지","소서","대서","입추","처서",
  "백로","추분","한로","상강","입동","소설","대설","동지"
];

// 월지 경계에 쓰는 “절(節)” 12개만 따로
export const MONTH_BOUNDARY_TERMS_12 = [
  "대설", // 子월 시작 경계(연말)
  "소한", // 丑월
  "입춘", // 寅월
  "경칩", // 卯월
  "청명", // 辰월
  "입하", // 巳월
  "망종", // 午월
  "소서", // 未월
  "입추", // 申월
  "백로", // 酉월
  "한로", // 戌월
  "입동", // 亥월
];

// { [year]: { [termName]: "MM-DD" } }
export const SOLAR_TERMS = {
  // ✅ 샘플 (실제로는 1940~2040 채우면 됨)
  2026: {
    "소한":"01-05","대한":"01-20",
    "입춘":"02-04","우수":"02-19",
    "경칩":"03-06","춘분":"03-21",
    "청명":"04-05","곡우":"04-20",
    "입하":"05-05","소만":"05-21",
    "망종":"06-06","하지":"06-21",
    "소서":"07-07","대서":"07-23",
    "입추":"08-07","처서":"08-23",
    "백로":"09-07","추분":"09-23",
    "한로":"10-08","상강":"10-23",
    "입동":"11-07","소설":"11-22",
    "대설":"12-07","동지":"12-22",
  },
};

// ---- helpers ----
export function getTermMD(year, termName){
  return SOLAR_TERMS?.[year]?.[termName] || "";
}

// "MM-DD" 비교용 (문자열 비교 가능하게)
export function getMD(date){
  const mm = String(date.getMonth()+1).padStart(2,"0");
  const dd = String(date.getDate()).padStart(2,"0");
  return `${mm}-${dd}`;
}

// 개발용 검증 (콘솔에서 한번 호출)
export function validateSolarTerms(year){
  const t = SOLAR_TERMS[year];
  if(!t) return { ok:false, errors:[`No SOLAR_TERMS for ${year}`] };

  const errors = [];

  // 24개 모두 존재?
  for(const name of TERM_ORDER_24){
    if(!t[name]) errors.push(`Missing term: ${year} ${name}`);
  }

  // 형식 검증 + 오름차순 검증
  let prev = "";
  for(const name of TERM_ORDER_24){
    const md = t[name];
    if(md && !/^\d{2}-\d{2}$/.test(md)) errors.push(`Bad format: ${year} ${name}=${md}`);
    if(prev && md && md < prev) errors.push(`Not sorted: ${year} ${name}=${md} < prev=${prev}`);
    if(md) prev = md;
  }

  return { ok: errors.length===0, errors };
}

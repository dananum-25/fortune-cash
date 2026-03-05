// /js/saju.core.js  (ESM)

// ===============================
// SAJU CORE ENGINE (1940~2030)
// ===============================
import { SOLAR_TERMS } from "/js/solarTerms.db.js";

export const YEAR_MIN = 1940;
export const YEAR_MAX = 2030;

// /js/saju.core.js 상단
import { SOLAR_TERMS } from "/js/solarTerms.db.js";

export const heavenly = ["갑","을","병","정","무","기","경","신","임","계"];
export const earthly  = ["자","축","인","묘","진","사","오","미","신","유","술","해"];

// -------------------------------
// 1) Range check
// -------------------------------
export function assertYearRange(y){
  if(y < YEAR_MIN || y > YEAR_MAX){
    throw new Error(`지원 범위는 ${YEAR_MIN}~${YEAR_MAX}년입니다.`);
  }
}

// -------------------------------
// 2) Date helpers (UTC-safe)
// -------------------------------
export function normalizeBirthYMD(v){
  if(!v) return "";
  const s = String(v).trim();
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : "";
}

export function parseYmdLocal(ymd){
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(ymd || "").trim());
  if(!m) return null;
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  assertYearRange(y);
  return new Date(y, mo - 1, d); // local midnight
}

export function parseYMDLocalNoon(ymd){
  const d = parseYmdLocal(ymd);
  if(!d) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
}

// -------------------------------
// 3) Pillars
// -------------------------------
export function getYearPillar(year){
  assertYearRange(year);
  const baseYear = 1984; // 갑자년
  const idx = (year - baseYear) % 60;
  const n = (idx + 60) % 60;
  return heavenly[n % 10] + earthly[n % 12];
}

// 월지 (절기 DB 기반: 12절기 경계로 월지 산정)
export function getMonthBranch(date){
  const y = date.getFullYear();
  const terms = SOLAR_TERMS[y];
  if(!terms){
    // DB 없으면 기존 간이로 fallback (서비스 안죽게)
    return getMonthBranchSimple(date);
  }

  // 날짜를 YYYY-MM-DD 비교용 문자열로 만들기
  const mm = String(date.getMonth()+1).padStart(2,"0");
  const dd = String(date.getDate()).padStart(2,"0");
  const md = `${mm}-${dd}`;

  // 절기 기준 경계 (월지 매핑)
  // 자: 대설 ~ (다음) 소한
  // 축: 소한 ~ 입춘
  // 인: 입춘 ~ 경칩
  // 묘: 경칩 ~ 청명
  // 진: 청명 ~ 입하
  // 사: 입하 ~ 망종
  // 오: 망종 ~ 소서
  // 미: 소서 ~ 입추
  // 신: 입추 ~ 백로
  // 유: 백로 ~ 한로
  // 술: 한로 ~ 입동
  // 해: 입동 ~ 대설

  const t = (name)=> terms[name]; // "MM-DD"

  // 1) 소한 이전(1/1~1/4 같은) 처리: 전년도 대설~올해 소한 사이 = 자월
  // 전년도 대설이 DB에 있으면 그걸 쓰고, 없으면 안전 fallback
  const prev = SOLAR_TERMS[y-1];
  if(t("소한") && md < t("소한")){
    if(prev?.["대설"]) return "자";
    // 전년도 대설이 없어도 대체로 1월 초는 자월로 처리하는게 간이보다 안전
    return "자";
  }

  // 2) 올해 소한~입춘: 축월
  if(t("입춘") && md < t("입춘")) return "축";

  // 3) 입춘 이후는 아래 순서대로 경계 비교
  const borders = [
    { term:"경칩", branch:"인" },
    { term:"청명", branch:"묘" },
    { term:"입하", branch:"진" },
    { term:"망종", branch:"사" },
    { term:"소서", branch:"오" },
    { term:"입추", branch:"미" },
    { term:"백로", branch:"신" },
    { term:"한로", branch:"유" },
    { term:"입동", branch:"술" },
    { term:"대설", branch:"해" },
  ];

  for(const b of borders){
    const bd = t(b.term);
    if(bd && md < bd) return b.branch;
  }

  // 4) 대설 이후는 해월로 들어가고, 그 다음 소한 전까지 자월
  // 대설 이후는 일단 해월로 리턴 (연말 출생의 월지)
  if(t("대설") && md >= t("대설")) return "자";

  // 혹시 term 누락이면 fallback
  return getMonthBranchSimple(date);
}

// 기존 간이함수는 이름 바꿔서 남겨두기(안전)
function getMonthBranchSimple(date){
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if(month === 1) return "축";
  if(month === 2) return day < 4 ? "축" : "인";
  if(month === 3) return "묘";
  if(month === 4) return "진";
  if(month === 5) return "사";
  if(month === 6) return "오";
  if(month === 7) return "미";
  if(month === 8) return "신";
  if(month === 9) return "유";
  if(month === 10) return "술";
  if(month === 11) return "해";
  if(month === 12) return "자";
  return "축";
}

// 월주 (간이)
export function getMonthPillar(date){
  const monthBranch = getMonthBranch(date);

  const year = date.getFullYear();
  assertYearRange(year);

  const yearIndex = ((year - 1984) % 60 + 60) % 60;
  const yearStemIndex = yearIndex % 10;

  const branchIndex = earthly.indexOf(monthBranch);
  const monthStemIndex = (yearStemIndex * 2 + branchIndex) % 10;

  return heavenly[monthStemIndex] + monthBranch;
}

// -------------------------------
// 4) Day pillar (검증된 기준일)
// 기준: 1984-02-02 = 丙寅 (index 2)
// -------------------------------
const DAY_BASE_DATE = new Date(1984, 1, 2, 12, 0, 0);
const DAY_BASE_INDEX = 2;

export function getDayPillar(ymd){
  const d = parseYMDLocalNoon(ymd);
  if(!d) return "";
  const diffDays = Math.floor((d - DAY_BASE_DATE) / 86400000);
  const idx = ((DAY_BASE_INDEX + diffDays) % 60 + 60) % 60;
  return heavenly[idx % 10] + earthly[idx % 12];
}

// -------------------------------
// 5) Hour pillar
// -------------------------------
function getHourBranch(hour){
  return earthly[Math.floor(((hour + 1) % 24) / 2)];
}

export function getHourPillar(dayPillar, hour){
  const dayStem = dayPillar[0];
  const dayStemIndex = heavenly.indexOf(dayStem);

  const hourBranch = getHourBranch(hour);
  const hourBranchIndex = earthly.indexOf(hourBranch);

  const hourStemIndex = (dayStemIndex * 2 + hourBranchIndex) % 10;
  return heavenly[hourStemIndex] + hourBranch;
}

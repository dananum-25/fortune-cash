// /js/saju.core.js  (type="module")

// ===============================
// SAJU CORE ENGINE (1940~2040)
// - UTC 밀림 방지: 로컬 정오 기준
// - 기준일 1개 방식 일주 계산
// ===============================

export const YEAR_MIN = 1940;
export const YEAR_MAX = 2040;

export const heavenly = ["갑","을","병","정","무","기","경","신","임","계"];
export const earthly  = ["자","축","인","묘","진","사","오","미","신","유","술","해"];

// -------------------------------
// 1) 범위 체크
// -------------------------------
export function assertYearRange(y){
  if(y < YEAR_MIN || y > YEAR_MAX){
    throw new Error(`지원 범위는 ${YEAR_MIN}~${YEAR_MAX}년입니다.`);
  }
}

// -------------------------------
// 2) birth 값 정규화
// -------------------------------
export function normalizeBirthYMD(v){
  if(!v) return "";
  const s = String(v).trim();
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : "";
}

// -------------------------------
// 3) YYYY-MM-DD → 로컬 정오(Date)
// -------------------------------
export function parseYMDLocalNoon(ymd){
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(ymd||"").trim());
  if(!m) return null;

  const y = +m[1];
  const mo = +m[2];
  const d = +m[3];

  assertYearRange(y);
  return new Date(y, mo-1, d, 12, 0, 0); // ✅ 로컬 정오 고정
}

// (호환용) 기존 parseYmdLocal을 쓰는 코드가 있으면 이걸로 유지 가능
export function parseYmdLocal(ymd){
  // midnight 대신 noon으로 통일해도 됨
  return parseYMDLocalNoon(ymd);
}

// -------------------------------
// 4) 연주 / 월주 (간이)
// -------------------------------
export function getYearPillar(year){
  assertYearRange(year);
  const baseYear = 1984; // 갑자년
  const idx = (year - baseYear) % 60;
  const n = (idx + 60) % 60;
  return heavenly[n % 10] + earthly[n % 12];
}

export function getMonthBranch(date){
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if(month === 1) return "축";
  if(month === 2) return day < 4 ? "축" : "인"; // 입춘 간이
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
// 5) 일주 (기준일 1개 방식)
// 기준: 1984-02-02(로컬정오) = 丙寅  → index = 2
// -------------------------------
const DAY_BASE_DATE  = new Date(1984, 1, 2, 12, 0, 0);
const DAY_BASE_INDEX = 2;

export function getDayPillar(ymd){
  const d = parseYMDLocalNoon(ymd);
  if(!d) return "";

  const diffDays = Math.floor((d - DAY_BASE_DATE) / 86400000);
  const idx = ((DAY_BASE_INDEX + diffDays) % 60 + 60) % 60;

  return heavenly[idx % 10] + earthly[idx % 12];
}

// -------------------------------
// 6) 시주
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

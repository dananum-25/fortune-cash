// ===============================
// SAJU CORE ENGINE (1940~2040)
// ===============================

export const YEAR_MIN = 1940;
export const YEAR_MAX = 2040;

const heavenly = ["갑","을","병","정","무","기","경","신","임","계"];
const earthly  = ["자","축","인","묘","진","사","오","미","신","유","술","해"];

// -------------------------------
// 1. 범위 체크
// -------------------------------
export function assertYearRange(y){
  if(y < YEAR_MIN || y > YEAR_MAX){
    throw new Error(`지원 범위는 ${YEAR_MIN}~${YEAR_MAX}년입니다.`);
  }
}

// -------------------------------
// 2. YYYY-MM-DD → 로컬 정오
// -------------------------------
export function parseYMDLocalNoon(ymd){
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(ymd||""));
  if(!m) return null;

  const y = +m[1];
  const mo = +m[2];
  const d = +m[3];

  assertYearRange(y);

  return new Date(y, mo-1, d, 12, 0, 0);
}

// -------------------------------
// 3. 일주 계산 (기준일 1개 방식)
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
// 4. 시주
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

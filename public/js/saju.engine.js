// /js/saju.engine.js  (NEW ENGINE)

// ===============================
// SAJU ENGINE (NEW)
// 기존 saju.core.js와 완전히 분리
// ===============================

import { SOLAR_TERMS } from "/js/solarTerms.db.js";
import { SOLAR_TERMS_EXACT } from "/js/solarTerms.exact.db.js";

export const heavenly = ["갑","을","병","정","무","기","경","신","임","계"];
export const earthly  = ["자","축","인","묘","진","사","오","미","신","유","술","해"];

export const YEAR_MIN = 1940;
export const YEAR_MAX = 2030;

// -------------------------------
// 1) 범위 체크
// -------------------------------
function assertYearRange(year){
  if(year < YEAR_MIN || year > YEAR_MAX){
    throw new Error(`지원 범위 ${YEAR_MIN}~${YEAR_MAX}`);
  }
}

// -------------------------------
// 2) 날짜 파싱
// -------------------------------
export function parseBirthDate(ymd, hour=12, minute=0){

  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);

  if(!m) return null;

  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);

  assertYearRange(y);

  return new Date(y, mo-1, d, hour, minute, 0);
}

// -------------------------------
// 3) 60갑자 계산
// -------------------------------
function sexagenaryYear(year){

  const baseYear = 1984; // 갑자년

  const idx = ((year - baseYear) % 60 + 60) % 60;

  return heavenly[idx % 10] + earthly[idx % 12];
}

// -------------------------------
// 4) 입춘 기준 연주
// -------------------------------
function getIpchun(year){

  const terms = SOLAR_TERMS?.[year];

  if(!terms || !terms["입춘"]){
    return new Date(year,1,4,0,0,0);
  }

  const [mm,dd] = terms["입춘"].split("-").map(Number);

  return new Date(year, mm-1, dd, 0,0,0);
}

export function getYearPillar(date){

  const year = date.getFullYear();

  const ipchun = getIpchun(year);

  if(date < ipchun){
    return sexagenaryYear(year-1);
  }

  return sexagenaryYear(year);
}

// -------------------------------
// 5) 월지
// -------------------------------
function getMonthBranch(date){

  const y = date.getFullYear();

  const terms = SOLAR_TERMS?.[y];

  if(!terms) return "인";

  const mm = String(date.getMonth()+1).padStart(2,"0");
  const dd = String(date.getDate()).padStart(2,"0");

  const md = `${mm}-${dd}`;

  const t = (n)=>terms[n];

  if(md < t("입춘")) return "축";
  if(md < t("경칩")) return "인";
  if(md < t("청명")) return "묘";
  if(md < t("입하")) return "진";
  if(md < t("망종")) return "사";
  if(md < t("소서")) return "오";
  if(md < t("입추")) return "미";
  if(md < t("백로")) return "신";
  if(md < t("한로")) return "유";
  if(md < t("입동")) return "술";
  if(md < t("대설")) return "해";

  return "자";
}

// -------------------------------
// 6) 월주
// -------------------------------
export function getMonthPillar(date){

  const monthBranch = getMonthBranch(date);

  const yearPillar = getYearPillar(date);

  const yearStem = yearPillar[0];

  const map = {
    "갑":"병","기":"병",
    "을":"무","경":"무",
    "병":"경","신":"경",
    "정":"임","임":"임",
    "무":"갑","계":"갑"
  };

  const startStem = map[yearStem];

  const startIndex = heavenly.indexOf(startStem);

  const order = {
    "인":0,"묘":1,"진":2,"사":3,"오":4,"미":5,
    "신":6,"유":7,"술":8,"해":9,"자":10,"축":11
  };

  const stemIndex = (startIndex + order[monthBranch]) % 10;

  return heavenly[stemIndex] + monthBranch;
}

// -------------------------------
// 7) 일주
// -------------------------------
const BASE_DATE = new Date(1984,1,2,12,0,0);
const BASE_INDEX = 2;

export function getDayPillar(date){

  const diff = Math.floor((date - BASE_DATE) / 86400000);

  const idx = ((BASE_INDEX + diff) % 60 + 60) % 60;

  return heavenly[idx % 10] + earthly[idx % 12];
}

// -------------------------------
// 8) 시주
// -------------------------------
function hourBranch(hour){

  return earthly[Math.floor(((hour+1)%24)/2)];
}

export function getHourPillar(dayPillar, hour){

  const dayStem = dayPillar[0];

  const dayStemIndex = heavenly.indexOf(dayStem);

  const branch = hourBranch(hour);

  const branchIndex = earthly.indexOf(branch);

  const stemIndex = (dayStemIndex*2 + branchIndex) % 10;

  return heavenly[stemIndex] + branch;
}

// -------------------------------
// 9) 통합
// -------------------------------
export function calculateSaju(ymd, hour=12, minute=0){

  const birth = parseBirthDate(ymd, hour, minute);

  if(!birth) return null;

  const year = getYearPillar(birth);

  const month = getMonthPillar(birth);

  const day = getDayPillar(birth);

  const hourP = getHourPillar(day, hour);

  return {
    pillars:{
      year,
      month,
      day,
      hour:hourP
    }
  };
}

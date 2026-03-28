// /js/saju.engine.js  (NEW ENGINE)

// ===============================
// SAJU ENGINE (NEW)
// 기존 saju.core.js와 완전히 분리
// ===============================

import { SOLAR_TERMS } from "/js/solarTerms.db.js";
import { getBestSolarTermDate } from "/js/solarTerms.exact.db.js";
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
async function getIpchun(year){

  const exactDate = await getBestSolarTermDate(year, "입춘");
  if(exactDate){
    return exactDate;
  }

  const terms = SOLAR_TERMS?.[year];

  if(!terms || !terms["입춘"]){
    return new Date(year, 1, 4, 0, 0, 0);
  }

  const [mm, dd] = terms["입춘"].split("-").map(Number);

  return new Date(year, mm - 1, dd, 0, 0, 0);
}

export async function getYearPillar(date){

  const year = date.getFullYear();

  const ipchun = await getIpchun(year);

  if(date < ipchun){
    return sexagenaryYear(year-1);
  }

  return sexagenaryYear(year);
}

// -------------------------------
// 5) 월지
// -------------------------------

async function getTermDateTime(year, termName){

  const exactDate = await getBestSolarTermDate(year, termName);
  if(exactDate){
    return exactDate;
  }

  const simple = SOLAR_TERMS?.[year]?.[termName];
  if(simple){
    const [mm, dd] = simple.split("-").map(Number);
    return new Date(year, mm - 1, dd, 0, 0, 0);
  }

  return null;
}

async function getMonthBranch(date){
  const y = date.getFullYear();

  const boundaries = [
    { name: "입춘", branch: "인", date: await getTermDateTime(y, "입춘") },
    { name: "경칩", branch: "묘", date: await getTermDateTime(y, "경칩") },
    { name: "청명", branch: "진", date: await getTermDateTime(y, "청명") },
    { name: "입하", branch: "사", date: await getTermDateTime(y, "입하") },
    { name: "망종", branch: "오", date: await getTermDateTime(y, "망종") },
    { name: "소서", branch: "미", date: await getTermDateTime(y, "소서") },
    { name: "입추", branch: "신", date: await getTermDateTime(y, "입추") },
    { name: "백로", branch: "유", date: await getTermDateTime(y, "백로") },
    { name: "한로", branch: "술", date: await getTermDateTime(y, "한로") },
    { name: "입동", branch: "해", date: await getTermDateTime(y, "입동") },
    { name: "대설", branch: "자", date: await getTermDateTime(y, "대설") }
  ];

  const sohanThisYear = await getTermDateTime(y, "소한");
  const ipchunThisYear = await getTermDateTime(y, "입춘");
  const sohanNextYear = await getTermDateTime(y + 1, "소한");

  // 1) 올해 입춘 전
  //    -> 올해 소한 이후면 축월
  //    -> 올해 소한 전이면 전년도 자월/축월 경계이므로 전년도 기준으로 다시 판단
  if (ipchunThisYear && date < ipchunThisYear) {
    if (sohanThisYear && date >= sohanThisYear) {
      return "축";
    }

    const prevDaeseol = await getTermDateTime(y - 1, "대설");
    const prevSohan = await getTermDateTime(y, "소한");

    if (prevDaeseol && prevSohan && date >= prevDaeseol && date < prevSohan) {
      return "자";
    }

    return "축";
  }

  // 2) 입춘 이후~대설 이전
  for (let i = boundaries.length - 1; i >= 0; i--) {
    const item = boundaries[i];
    if (item.date && date >= item.date) {
      return item.branch;
    }
  }

  // 3) 대설 이후~다음해 소한 전 = 자월
  const daeseolThisYear = await getTermDateTime(y, "대설");
  if (daeseolThisYear && sohanNextYear && date >= daeseolThisYear && date < sohanNextYear) {
    return "자";
  }

  // 4) 다음해 소한 이후면 실제로는 이 해 범위를 넘어가므로 축으로 방어
  if (sohanNextYear && date >= sohanNextYear) {
    return "축";
  }

  // 최종 방어
  return "축";
}

// -------------------------------
// 6) 월주
// -------------------------------
export async function getMonthPillar(date){

  const monthBranch = await getMonthBranch(date);

  const yearPillar = await getYearPillar(date);

  const map = {
    "갑":"병","기":"병",
    "을":"무","경":"무",
    "병":"경","신":"경",
    "정":"임","임":"임",
    "무":"갑","계":"갑"
  };

  const yearStem = yearPillar[0];
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
export async function calculateSaju(ymd, hour=12, minute=0){

  const birth = parseBirthDate(ymd, hour, minute);

  if(!birth) return null;

  const year = await getYearPillar(birth);

  const month = await getMonthPillar(birth);

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

function adjustDateForJasi(date){

  const d = new Date(date);

  const hour = d.getHours();

  // 자시 (23:00 이후는 다음날로 계산)
  if(hour >= 23){
    d.setDate(d.getDate() + 1);
  }

  return d;
}

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

  const sohan = await getTermDateTime(y, "소한");
  const ipchun = await getTermDateTime(y, "입춘");
  const gyeongchip = await getTermDateTime(y, "경칩");
  const cheongmyeong = await getTermDateTime(y, "청명");
  const ibha = await getTermDateTime(y, "입하");
  const mangjong = await getTermDateTime(y, "망종");
  const soseo = await getTermDateTime(y, "소서");
  const ipchu = await getTermDateTime(y, "입추");
  const baengno = await getTermDateTime(y, "백로");
  const hanro = await getTermDateTime(y, "한로");
  const ibdong = await getTermDateTime(y, "입동");
  const daeseol = await getTermDateTime(y, "대설");

  if (sohan && date < sohan) return "자";
  if (ipchun && date < ipchun) return "축";
  if (gyeongchip && date < gyeongchip) return "인";
  if (cheongmyeong && date < cheongmyeong) return "묘";
  if (ibha && date < ibha) return "진";
  if (mangjong && date < mangjong) return "사";
  if (soseo && date < soseo) return "오";
  if (ipchu && date < ipchu) return "미";
  if (baengno && date < baengno) return "신";
  if (hanro && date < hanro) return "유";
  if (ibdong && date < ibdong) return "술";
  if (daeseol && date < daeseol) return "해";

  return "자";
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

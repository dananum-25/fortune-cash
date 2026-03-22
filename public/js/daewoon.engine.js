// /js/daewoon.engine.js  (NEW)
// ===============================
// DAEWOON ENGINE
// 순행/역행 + 대운 시작나이(근사) + 대운 리스트
// ===============================

import { heavenly, earthly } from "/js/saju.engine.js";
import { SOLAR_TERMS } from "/js/solarTerms.db.js";
import { getExactSolarTermDate } from "/js/solarTerms.exact.db.js";
// -------------------------------
// 1) 음양 판별
// -------------------------------
function isYangStem(stem){
  return ["갑","병","무","경","임"].includes(stem);
}

// -------------------------------
// 2) 순행 / 역행
// 규칙:
// 남성 + 양년간 = 순행
// 남성 + 음년간 = 역행
// 여성 + 양년간 = 역행
// 여성 + 음년간 = 순행
// -------------------------------
export function getDaewoonDirection(gender, yearStem){
  const yang = isYangStem(yearStem);

  if(gender === "남성"){
    return yang ? "순행" : "역행";
  }

  if(gender === "여성"){
    return yang ? "역행" : "순행";
  }

  return "";
}

// -------------------------------
// 3) 절기 날짜 얻기
// 현재는 MM-DD만 있으므로 "근사치" 계산
// 나중에 절입 시각 DB로 바꾸면 정밀 계산 가능
// -------------------------------
function getTermDateApprox(year, termName){
  const exactDate = getExactSolarTermDate(year, termName);
  if (exactDate) return exactDate;

  const terms = SOLAR_TERMS?.[year];
  const md = terms?.[termName];
  if (!md) return null;

  const [mm, dd] = md.split("-").map(Number);
  return new Date(year, mm - 1, dd, 0, 0, 0);
}

const orderedTerms = [
  "소한","대한","입춘","우수","경칩","춘분","청명","곡우",
  "입하","소만","망종","하지","소서","대서","입추","처서",
  "백로","추분","한로","상강","입동","소설","대설","동지"
];

// -------------------------------
// 4) 출생 직후/직전 절기 찾기(근사)
// -------------------------------
function findNearestTermApprox(birthDate, direction){
  const year = birthDate.getFullYear();

  const pool = [];

  for(const y of [year - 1, year, year + 1]){
    const terms = SOLAR_TERMS?.[y];
    if(!terms) continue;

    for(const name of orderedTerms){
      const d = getTermDateApprox(y, name);
      if(d){
        pool.push({ name, date: d });
      }
    }
  }

  pool.sort((a, b) => a.date - b.date);

  if(direction === "순행"){
    return pool.find(t => t.date >= birthDate) || null;
  }

  if(direction === "역행"){
    for(let i = pool.length - 1; i >= 0; i--){
      if(pool[i].date <= birthDate) return pool[i];
    }
  }

  return null;
}

// -------------------------------
// 5) 대운 시작나이(근사)
// 전통식: 출생시각~절입시 차이를 일수로 환산
// 현재는 시각 DB가 없으므로 "일 단위 근사"
// 관용적으로 3일 = 1년 기준 사용
// -------------------------------
export function getDaewoonStartAgeApprox(birthDate, direction){
  const nearestTerm = findNearestTermApprox(birthDate, direction);
  if(!nearestTerm){
    return {
      startAge: 1,
      nearestTerm: null,
      diffDays: null,
      precision: "fallback"
    };
  }

  const ms = Math.abs(nearestTerm.date - birthDate);
  const diffDays = ms / 86400000;

  // 3일 = 1년 근사
  let startAge = Math.round(diffDays / 3);

  // 너무 0으로 떨어지는 경우 최소 1세 처리
  if(startAge < 1) startAge = 1;

  return {
    startAge,
    nearestTerm,
    diffDays,
    precision: "approx_by_date_only"
  };
}

// -------------------------------
// 6) 60갑자 인덱스
// -------------------------------
function ganjiToIndex(pillar){
  const stem = pillar?.[0];
  const branch = pillar?.[1];

  const stemIndex = heavenly.indexOf(stem);
  const branchIndex = earthly.indexOf(branch);

  for(let i = 0; i < 60; i++){
    if((i % 10) === stemIndex && (i % 12) === branchIndex){
      return i;
    }
  }

  return -1;
}

function indexToGanji(index){
  const n = ((index % 60) + 60) % 60;
  return heavenly[n % 10] + earthly[n % 12];
}

// -------------------------------
// 7) 월주 기준 대운 진행
// 순행이면 +1, 역행이면 -1 에서 시작
// -------------------------------
export function buildDaewoonList(monthPillar, startAge, direction, count = 8){
  const monthIndex = ganjiToIndex(monthPillar);
  if(monthIndex < 0) return [];

  const step = direction === "순행" ? 1 : -1;

  const result = [];

  for(let i = 0; i < count; i++){
    const ganji = indexToGanji(monthIndex + step * (i + 1));
    const fromAge = startAge + i * 10;
    const toAge = fromAge + 9;

    result.push({
      order: i + 1,
      ganji,
      fromAge,
      toAge
    });
  }

  return result;
}

// -------------------------------
// 8) 통합 함수
// birthDate: Date
// yearPillar, monthPillar: "갑자" 형태
// gender: "남성" | "여성"
// -------------------------------
export function calculateDaewoon({ birthDate, yearPillar, monthPillar, gender }){
  const yearStem = yearPillar?.[0];
  const direction = getDaewoonDirection(gender, yearStem);

  const startInfo = getDaewoonStartAgeApprox(birthDate, direction);

  const list = buildDaewoonList(
    monthPillar,
    startInfo.startAge,
    direction,
    8
  );

  return {
    gender,
    direction,
    startAge: startInfo.startAge,
    nearestTerm: startInfo.nearestTerm,
    diffDays: startInfo.diffDays,
    precision: startInfo.precision,
    list
  };
}

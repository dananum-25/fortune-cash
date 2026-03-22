// /js/sewoon.engine.js  (NEW)
// ===============================
// SEWOON ENGINE
// 세운(연운) 계산
// ===============================

const heavenly = ["갑","을","병","정","무","기","경","신","임","계"];
const earthly  = ["자","축","인","묘","진","사","오","미","신","유","술","해"];

function assertYearRange(year){
  if(year < 1900 || year > 2100){
    throw new Error("세운 계산 지원 범위는 1900~2100년입니다.");
  }
}

function getSexagenaryByYear(year){
  assertYearRange(year);

  const baseYear = 1984; // 갑자년
  const idx = ((year - baseYear) % 60 + 60) % 60;

  return heavenly[idx % 10] + earthly[idx % 12];
}

export function getSeWoon(targetYear){
  const ganji = getSexagenaryByYear(targetYear);

  return {
    year: targetYear,
    ganji,
    stem: ganji[0],
    branch: ganji[1]
  };
}

export function buildSeWoonRange(startYear, endYear){
  const result = [];

  for(let y = startYear; y <= endYear; y++){
    result.push(getSeWoon(y));
  }

  return result;
}

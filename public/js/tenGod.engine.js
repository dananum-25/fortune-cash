// /js/tenGod.engine.js  (NEW)
// ===============================
// TEN GOD ENGINE
// 일간 기준 십성 계산
// ===============================

export const heavenly = ["갑","을","병","정","무","기","경","신","임","계"];

const stemElementMap = {
  "갑":"목","을":"목",
  "병":"화","정":"화",
  "무":"토","기":"토",
  "경":"금","신":"금",
  "임":"수","계":"수"
};

const stemYinYangMap = {
  "갑":"양","을":"음",
  "병":"양","정":"음",
  "무":"양","기":"음",
  "경":"양","신":"음",
  "임":"양","계":"음"
};

const generates = {
  "목":"화",
  "화":"토",
  "토":"금",
  "금":"수",
  "수":"목"
};

const controls = {
  "목":"토",
  "화":"금",
  "토":"수",
  "금":"목",
  "수":"화"
};

function sameElement(a, b){
  return stemElementMap[a] === stemElementMap[b];
}

function sameYinYang(a, b){
  return stemYinYangMap[a] === stemYinYangMap[b];
}

function elementOf(stem){
  return stemElementMap[stem];
}

function yinYangOf(stem){
  return stemYinYangMap[stem];
}

// -------------------------------
// 핵심: 일간 기준 특정 천간의 십성
// -------------------------------
export function getTenGod(dayMaster, targetStem){
  if(!dayMaster || !targetStem) return "";

  const dmEl = elementOf(dayMaster);
  const tgEl = elementOf(targetStem);
  const sameYY = sameYinYang(dayMaster, targetStem);

  // 비견 / 겁재
  if(dmEl === tgEl){
    return sameYY ? "비견" : "겁재";
  }

  // 식신 / 상관 : 내가 생하는 오행
  if(generates[dmEl] === tgEl){
    return sameYY ? "식신" : "상관";
  }

  // 편재 / 정재 : 내가 극하는 오행
  if(controls[dmEl] === tgEl){
    return sameYY ? "편재" : "정재";
  }

  // 편관 / 정관 : 나를 극하는 오행
  if(controls[tgEl] === dmEl){
    return sameYY ? "편관" : "정관";
  }

  // 편인 / 정인 : 나를 생하는 오행
  if(generates[tgEl] === dmEl){
    return sameYY ? "편인" : "정인";
  }

  return "";
}

// -------------------------------
// 사주 4기둥 천간 기준 십성
// year/month/day/hour pillar 문자열(예: "갑자")
// -------------------------------
export function getPillarTenGods(dayPillar, pillars){
  const dayMaster = dayPillar?.[0];
  if(!dayMaster || !pillars) return null;

  return {
    yearStemTenGod: pillars.year ? getTenGod(dayMaster, pillars.year[0]) : "",
    monthStemTenGod: pillars.month ? getTenGod(dayMaster, pillars.month[0]) : "",
    dayStemTenGod: "일원",
    hourStemTenGod: pillars.hour ? getTenGod(dayMaster, pillars.hour[0]) : ""
  };
}

// -------------------------------
// 천간 리스트 전체 십성표
// -------------------------------
export function getTenGodTable(dayMaster){
  return heavenly.map(stem => ({
    stem,
    element: elementOf(stem),
    yinYang: yinYangOf(stem),
    tenGod: getTenGod(dayMaster, stem)
  }));
}

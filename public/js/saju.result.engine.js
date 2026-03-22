// /js/saju.result.engine.js  (NEW)
// ===============================
// SAJU RESULT ENGINE
// 사주 4주 + 십성 + 오행 + 대운 통합
// ===============================

import { calculateSaju } from "/js/saju.engine.js";
import { getPillarTenGods } from "/js/tenGod.engine.js";
import { calculateDaewoon } from "/js/daewoon.engine.js";

// -------------------------------
// 기본 맵
// -------------------------------
const stemElementMap = {
  "갑":"목","을":"목",
  "병":"화","정":"화",
  "무":"토","기":"토",
  "경":"금","신":"금",
  "임":"수","계":"수"
};

const branchElementMap = {
  "자":"수",
  "축":"토",
  "인":"목",
  "묘":"목",
  "진":"토",
  "사":"화",
  "오":"화",
  "미":"토",
  "신":"금",
  "유":"금",
  "술":"토",
  "해":"수"
};

const stemYinYangMap = {
  "갑":"양","을":"음",
  "병":"양","정":"음",
  "무":"양","기":"음",
  "경":"양","신":"음",
  "임":"양","계":"음"
};

// -------------------------------
// 오행 카운트
// 현재는 천간 4 + 지지 4 단순 카운트
// 지장간 확장은 다음 단계
// -------------------------------
export function countFiveElements(pillars){
  const result = {
    목: 0,
    화: 0,
    토: 0,
    금: 0,
    수: 0
  };

  if(!pillars) return result;

  const keys = ["year", "month", "day", "hour"];

  for(const key of keys){
    const pillar = pillars[key];
    if(!pillar || pillar.length < 2) continue;

    const stem = pillar[0];
    const branch = pillar[1];

    const stemEl = stemElementMap[stem];
    const branchEl = branchElementMap[branch];

    if(stemEl) result[stemEl] += 1;
    if(branchEl) result[branchEl] += 1;
  }

  return result;
}

// -------------------------------
// 일간 정보
// -------------------------------
export function getDayMasterInfo(dayPillar){
  if(!dayPillar) return null;

  const stem = dayPillar[0];

  return {
    stem,
    element: stemElementMap[stem] || "",
    yinYang: stemYinYangMap[stem] || ""
  };
}

// -------------------------------
// 월령(월지 기준)
// -------------------------------
export function getMonthBranchInfo(monthPillar){
  if(!monthPillar) return null;

  const branch = monthPillar[1];

  return {
    branch,
    element: branchElementMap[branch] || ""
  };
}

// -------------------------------
// 보기 좋은 오행 요약
// -------------------------------
export function summarizeFiveElements(counts){
  const entries = Object.entries(counts || {});
  if(entries.length === 0) return null;

  let maxKey = "";
  let maxValue = -1;
  let minKey = "";
  let minValue = 999;

  for(const [key, value] of entries){
    if(value > maxValue){
      maxValue = value;
      maxKey = key;
    }
    if(value < minValue){
      minValue = value;
      minKey = key;
    }
  }

  return {
    counts,
    strongest: {
      element: maxKey,
      count: maxValue
    },
    weakest: {
      element: minKey,
      count: minValue
    }
  };
}

// -------------------------------
// 원국 구조 요약
// -------------------------------
export function buildStructureSummary({ pillars, tenGods, fiveElements, dayMasterInfo, monthBranchInfo }){
  return {
    pillars,
    dayMaster: dayMasterInfo,
    monthBranch: monthBranchInfo,
    tenGods,
    fiveElements: summarizeFiveElements(fiveElements)
  };
}

// -------------------------------
// 통합 결과 엔진
// gender: "남성" | "여성"
// -------------------------------
export function calculateSajuResult({
  ymd,
  hour = 12,
  minute = 0,
  gender = ""
}){
  const saju = calculateSaju(ymd, hour, minute);

  if(!saju) return null;

  const birthDate = new Date(
    Number(ymd.slice(0, 4)),
    Number(ymd.slice(5, 7)) - 1,
    Number(ymd.slice(8, 10)),
    hour,
    minute,
    0
  );

  const tenGods = getPillarTenGods(
    saju.pillars.day,
    saju.pillars
  );

  const fiveElements = countFiveElements(saju.pillars);

  const dayMasterInfo = getDayMasterInfo(saju.pillars.day);
  const monthBranchInfo = getMonthBranchInfo(saju.pillars.month);

  const daewoon = gender
    ? calculateDaewoon({
        birthDate,
        yearPillar: saju.pillars.year,
        monthPillar: saju.pillars.month,
        gender
      })
    : null;

  return {
    input: {
      ymd,
      hour,
      minute,
      gender
    },
    pillars: saju.pillars,
    dayMaster: dayMasterInfo,
    monthBranch: monthBranchInfo,
    tenGods,
    fiveElements,
    structure: buildStructureSummary({
      pillars: saju.pillars,
      tenGods,
      fiveElements,
      dayMasterInfo,
      monthBranchInfo
    }),
    daewoon,
    meta: {
      engineVersion: "1.0.0",
      note: [
        "연주는 입춘 기준",
        "월주는 절기 날짜 기준",
        "십성은 천간 기준",
        "대운 시작나이는 현재 근사치"
      ]
    }
  };
}

// /js/saju.result.v2.engine.js
// ===============================
// SAJU RESULT ENGINE V2
// 명리 구조 통합 결과
// ===============================

import { calculateSaju } from "/js/saju.engine.js";
import { getPillarTenGods } from "/js/tenGod.engine.js";
import { calculateDaewoon } from "/js/daewoon.engine.js";

import {
  getAllJijangan,
  getAllJijanganTenGods,
  summarizeJijangan
} from "/js/jijangan.engine.js";

import {
  detectHabChung,
  summarizeHabChung
} from "/js/habchung.engine.js";

import {
  calculateDayMasterStrength,
  summarizeStrength
} from "/js/strength.engine.js";

import {
  getExtraSinsal
} from "/js/sinsal.extra.engine.js";

import {
  get12SinsalForPillars,
  summarize12Sinsal
} from "/js/sinsal12.engine.js";

// -------------------------------
// 오행 맵
// -------------------------------
const stemElementMap = {
  "갑":"목","을":"목",
  "병":"화","정":"화",
  "무":"토","기":"토",
  "경":"금","신":"금",
  "임":"수","계":"수"
};

const branchElementMap = {
  "자":"수","축":"토","인":"목","묘":"목",
  "진":"토","사":"화","오":"화","미":"토",
  "신":"금","유":"금","술":"토","해":"수"
};

// -------------------------------
// 오행 카운트
// -------------------------------
function countFiveElements(pillars){

  const result = {
    목:0, 화:0, 토:0, 금:0, 수:0
  };

  const targets = [
    pillars?.year,
    pillars?.month,
    pillars?.day,
    pillars?.hour
  ];

  for(const pillar of targets){

    if(!pillar) continue;

    const stem = pillar[0];
    const branch = pillar[1];

    const stemEl = stemElementMap[stem];
    const branchEl = branchElementMap[branch];

    if(stemEl) result[stemEl]++;
    if(branchEl) result[branchEl]++;
  }

  return result;
}

// -------------------------------
// 일간 정보
// -------------------------------
function getDayMaster(dayPillar){

  if(!dayPillar) return null;

  const stem = dayPillar[0];

  return {
    stem,
    element: stemElementMap[stem]
  };
}

// -------------------------------
// 월지 정보
// -------------------------------
function getMonthBranch(monthPillar){

  if(!monthPillar) return null;

  const branch = monthPillar[1];

  return {
    branch,
    element: branchElementMap[branch]
  };
}

// -------------------------------
// 통합 계산
// -------------------------------
export function calculateSajuResultV2({

  ymd,
  hour = 12,
  minute = 0,
  gender = ""

}){

  const saju = calculateSaju(ymd, hour, minute);

  if(!saju) return null;

  const pillars = saju.pillars;

  // ----------------
  // 기본 정보
  // ----------------

  const dayMaster = getDayMaster(pillars.day);
  const monthBranch = getMonthBranch(pillars.month);

  // ----------------
  // 십성
  // ----------------

  const tenGods = getPillarTenGods(
    pillars.day,
    pillars
  );

  // ----------------
  // 오행
  // ----------------

  const fiveElements = countFiveElements(pillars);

  // ----------------
  // 지장간
  // ----------------

  const jijangan = getAllJijangan(pillars);
  const jijanganTenGods = getAllJijanganTenGods(
    pillars.day,
    pillars
  );
  const jijanganSummary = summarizeJijangan(
    pillars.day,
    pillars
  );

  // ----------------
  // 합충형파해
  // ----------------

  const habchung = detectHabChung(pillars);
  const habchungSummary = summarizeHabChung(pillars);

  // ----------------
  // 신강/신약
  // ----------------

  const strength = calculateDayMasterStrength(pillars);
  const strengthSummary = summarizeStrength(strength);

  const sinsal12 = get12SinsalForPillars(pillars);
  const sinsal12Summary = summarize12Sinsal(pillars);
  
  // ----------------
  // 대운
  // ----------------

  let daewoon = null;

  if(gender){

    const birthDate = new Date(
      Number(ymd.slice(0,4)),
      Number(ymd.slice(5,7))-1,
      Number(ymd.slice(8,10)),
      hour,
      minute,
      0
    );

    daewoon = calculateDaewoon({
      birthDate,
      yearPillar: pillars.year,
      monthPillar: pillars.month,
      gender
    });
  }

  // ----------------
  // 최종 반환
  // ----------------

  return {

    const extraSinsal = getExtraSinsal(pillars);
  
    input:{
      ymd,
      hour,
      minute,
      gender
    },

    pillars,

    dayMaster,

    extraSinsal,
    
    monthBranch,

    tenGods,

    fiveElements,

    jijangan:{
      raw: jijangan,
      tenGods: jijanganTenGods,
      summary: jijanganSummary
    },

    habchung:{
      raw: habchung,
      summary: habchungSummary
    },

    strength:{
      raw: strength,
      summary: strengthSummary
    },

    sinsal12: {
      raw: sinsal12,
      summary: sinsal12Summary
    },
    
    daewoon,

    meta:{
      engineVersion:"2.0",
      note:[
        "연주: 입춘 기준",
        "월주: 절기 기준",
        "지장간 포함",
        "합충형파해 포함",
        "신강/신약 기초판단 포함"
      ]
    }

  };
}

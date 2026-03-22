// /js/strength.engine.js  (NEW)
// ===============================
// STRENGTH ENGINE
// 신강 / 신약 기초판단
// ===============================

import { getAllJijangan } from "/js/jijangan.engine.js";

// -------------------------------
// 1) 기본 맵
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

// -------------------------------
// 2) 월령 보정
// 월지 기준으로 어떤 오행이 계절상 유리한지
// -------------------------------
const monthSeasonSupport = {
  "인": "목",
  "묘": "목",
  "진": "토",
  "사": "화",
  "오": "화",
  "미": "토",
  "신": "금",
  "유": "금",
  "술": "토",
  "해": "수",
  "자": "수",
  "축": "토"
};

// -------------------------------
// 3) 보조 함수
// -------------------------------
function getStem(pillar){
  if(!pillar || pillar.length < 2) return "";
  return pillar[0];
}

function getBranch(pillar){
  if(!pillar || pillar.length < 2) return "";
  return pillar[1];
}

function sameElement(a, b){
  return a === b;
}

function isResourceFor(dayElement, targetElement){
  return generates[targetElement] === dayElement;
}

function isOutputFrom(dayElement, targetElement){
  return generates[dayElement] === targetElement;
}

function isWealthFor(dayElement, targetElement){
  return controls[dayElement] === targetElement;
}

function isOfficerFor(dayElement, targetElement){
  return controls[targetElement] === dayElement;
}

// -------------------------------
// 4) 오행 득점 계산
// - 일간 동일 오행
// - 인성(나를 생함)
// - 식상/재성/관성 구분
// -------------------------------
function scoreElementAgainstDayMaster(dayElement, targetElement, weight = 1){
  if(sameElement(dayElement, targetElement)){
    return { support: 1 * weight, drain: 0 };
  }

  if(isResourceFor(dayElement, targetElement)){
    return { support: 1 * weight, drain: 0 };
  }

  if(isOutputFrom(dayElement, targetElement)){
    return { support: 0, drain: 1 * weight };
  }

  if(isWealthFor(dayElement, targetElement)){
    return { support: 0, drain: 1 * weight };
  }

  if(isOfficerFor(dayElement, targetElement)){
    return { support: 0, drain: 1 * weight };
  }

  return { support: 0, drain: 0 };
}

// -------------------------------
// 5) 월령 점수
// -------------------------------
function scoreMonthSupport(dayElement, monthBranch){
  const seasonElement = monthSeasonSupport[monthBranch];
  if(!seasonElement){
    return { support: 0, drain: 0, seasonElement: "" };
  }

  if(dayElement === seasonElement){
    return { support: 2, drain: 0, seasonElement };
  }

  if(isResourceFor(dayElement, seasonElement)){
    return { support: 1.5, drain: 0, seasonElement };
  }

  if(isOutputFrom(dayElement, seasonElement) || isWealthFor(dayElement, seasonElement) || isOfficerFor(dayElement, seasonElement)){
    return { support: 0, drain: 1.5, seasonElement };
  }

  return { support: 0, drain: 0, seasonElement };
}

// -------------------------------
// 6) 천간/지지 표면 점수
// -------------------------------
function scoreVisiblePillars(dayElement, pillars){
  const detail = [];
  let support = 0;
  let drain = 0;

  const targets = [
    { area: "yearStem", element: stemElementMap[getStem(pillars?.year)] },
    { area: "monthStem", element: stemElementMap[getStem(pillars?.month)] },
    { area: "hourStem", element: stemElementMap[getStem(pillars?.hour)] },
    { area: "yearBranch", element: branchElementMap[getBranch(pillars?.year)] },
    { area: "monthBranch", element: branchElementMap[getBranch(pillars?.month)] },
    { area: "dayBranch", element: branchElementMap[getBranch(pillars?.day)] },
    { area: "hourBranch", element: branchElementMap[getBranch(pillars?.hour)] }
  ];

  for(const item of targets){
    if(!item.element) continue;
    const score = scoreElementAgainstDayMaster(dayElement, item.element, 1);
    support += score.support;
    drain += score.drain;
    detail.push({
      area: item.area,
      element: item.element,
      support: score.support,
      drain: score.drain
    });
  }

  return { support, drain, detail };
}

// -------------------------------
// 7) 지장간 점수
// weight를 약하게 반영
// -------------------------------
function scoreJijangan(dayElement, pillars){
  const jijangan = getAllJijangan(pillars);
  const detail = [];
  let support = 0;
  let drain = 0;

  if(!jijangan){
    return { support, drain, detail };
  }

  for(const [area, items] of Object.entries(jijangan)){
    for(const item of items){
      const el = stemElementMap[item.stem];
      if(!el) continue;

      const normalizedWeight = (item.weight || 0) / 100;
      const score = scoreElementAgainstDayMaster(dayElement, el, normalizedWeight * 0.8);

      support += score.support;
      drain += score.drain;

      detail.push({
        area,
        stem: item.stem,
        element: el,
        weight: item.weight,
        support: score.support,
        drain: score.drain
      });
    }
  }

  return { support, drain, detail };
}

// -------------------------------
// 8) 총판정
// -------------------------------
export function calculateDayMasterStrength(pillars){
  if(!pillars?.day || !pillars?.month){
    return null;
  }

  const dayStem = getStem(pillars.day);
  const dayElement = stemElementMap[dayStem];
  const monthBranch = getBranch(pillars.month);

  if(!dayElement || !monthBranch){
    return null;
  }

  const monthScore = scoreMonthSupport(dayElement, monthBranch);
  const visibleScore = scoreVisiblePillars(dayElement, pillars);
  const hiddenScore = scoreJijangan(dayElement, pillars);

  const support =
    monthScore.support +
    visibleScore.support +
    hiddenScore.support;

  const drain =
    monthScore.drain +
    visibleScore.drain +
    hiddenScore.drain;

  const net = support - drain;

  let level = "";
  let simpleLabel = "";

  if(net >= 2.5){
    level = "strong";
    simpleLabel = "신강";
  } else if(net <= -2.5){
    level = "weak";
    simpleLabel = "신약";
  } else {
    level = "balanced";
    simpleLabel = "중화에 가까움";
  }

  return {
    dayMaster: {
      stem: dayStem,
      element: dayElement
    },
    monthBranch: monthBranch,
    seasonElement: monthScore.seasonElement,
    score: {
      support: Number(support.toFixed(2)),
      drain: Number(drain.toFixed(2)),
      net: Number(net.toFixed(2))
    },
    judgment: {
      level,
      label: simpleLabel
    },
    detail: {
      monthScore,
      visibleScore,
      hiddenScore
    }
  };
}

// -------------------------------
// 9) 보기 쉬운 요약 문장
// -------------------------------
export function summarizeStrength(strengthResult){
  if(!strengthResult){
    return {
      title: "강약 정보 없음",
      summary: "신강/신약 판단에 필요한 정보가 부족합니다."
    };
  }

  const label = strengthResult.judgment.label;
  const dayElement = strengthResult.dayMaster.element;
  const seasonElement = strengthResult.seasonElement;

  if(label === "신강"){
    return {
      title: "일간의 힘이 비교적 강한 편",
      summary: `${dayElement} 일간이 계절(${seasonElement})과 구조의 도움을 받아 비교적 힘이 실리는 편으로 봅니다.`
    };
  }

  if(label === "신약"){
    return {
      title: "일간의 힘이 비교적 약한 편",
      summary: `${dayElement} 일간이 계절(${seasonElement})과 구조상 소모를 더 크게 받는 편으로 봅니다.`
    };
  }

  return {
    title: "일간의 힘이 한쪽으로 크게 치우치지 않은 편",
    summary: `${dayElement} 일간이 계절(${seasonElement})과 구조상 중화에 가까운 상태로 보입니다.`
  };
}

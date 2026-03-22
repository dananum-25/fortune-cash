// /js/gunghap.engine.js  (NEW)
// ===============================
// GUNGHAP ENGINE
// 두 사람 사주 기반 궁합 기초 엔진
// ===============================

import { calculateSajuResultV2 } from "/js/saju.result.v2.engine.js";

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

const BRANCH_HAP = {
  "자-축":"육합",
  "인-해":"육합",
  "묘-술":"육합",
  "진-유":"육합",
  "사-신":"육합",
  "오-미":"육합"
};

const BRANCH_CHUNG = {
  "자-오":"충",
  "축-미":"충",
  "인-신":"충",
  "묘-유":"충",
  "진-술":"충",
  "사-해":"충"
};

function pairKey(a, b){
  return [a, b].sort().join("-");
}

function getElementRelation(a, b){
  if(!a || !b) return { type:"unknown", score:0, label:"판단 불가" };

  if(a === b){
    return { type:"same", score:2, label:"동일 오행" };
  }

  if(generates[a] === b){
    return { type:"generate_out", score:3, label:`${a}생${b}` };
  }

  if(generates[b] === a){
    return { type:"generate_in", score:3, label:`${b}생${a}` };
  }

  if(controls[a] === b){
    return { type:"control_out", score:-2, label:`${a}극${b}` };
  }

  if(controls[b] === a){
    return { type:"control_in", score:-2, label:`${b}극${a}` };
  }

  return { type:"neutral", score:0, label:"중립" };
}

function getBranchRelation(a, b){
  const key = pairKey(a, b);

  if(BRANCH_HAP[key]){
    return { type:"hap", score:3, label:BRANCH_HAP[key] };
  }

  if(BRANCH_CHUNG[key]){
    return { type:"chung", score:-3, label:BRANCH_CHUNG[key] };
  }

  if(a === b){
    return { type:"same", score:1, label:"동일 지지" };
  }

  return { type:"neutral", score:0, label:"중립" };
}

function summarizeScore(score){
  if(score >= 7){
    return {
      level: "high",
      label: "궁합 흐름이 좋은 편",
      summary: "서로 보완되거나 자연스럽게 맞물리는 요소가 비교적 많습니다."
    };
  }

  if(score >= 2){
    return {
      level: "mid",
      label: "무난한 궁합",
      summary: "강한 장점과 주의점이 함께 있어 조율 방식이 중요합니다."
    };
  }

  return {
    level: "low",
    label: "조율이 많이 필요한 궁합",
    summary: "반응 방식이나 관계 리듬 차이가 커서 이해와 조정이 중요합니다."
  };
}

function buildAdvice(dayStemRel, dayBranchRel, fiveElementRel){
  const list = [];

  if(dayStemRel.type === "generate_in" || dayStemRel.type === "generate_out"){
    list.push("기본 기질에서는 서로 돕거나 북돋우는 흐름이 있을 수 있습니다.");
  }

  if(dayStemRel.type === "control_in" || dayStemRel.type === "control_out"){
    list.push("기질 차이가 강하게 드러날 수 있어, 누가 주도권을 쥐는지 민감해질 수 있습니다.");
  }

  if(dayBranchRel.type === "hap"){
    list.push("생활 리듬이나 정서 연결에서 맞물리는 지점이 있을 수 있습니다.");
  }

  if(dayBranchRel.type === "chung"){
    list.push("가까워질수록 생활 방식과 반응 속도의 차이가 크게 느껴질 수 있습니다.");
  }

  if(fiveElementRel.type === "neutral" || fiveElementRel.type === "same"){
    list.push("잘 맞고 안 맞고를 단정하기보다, 역할 분담과 소통 방식이 더 중요할 수 있습니다.");
  }

  return list;
}

export function calculateGunghap(personA, personB){
  const a = calculateSajuResultV2(personA);
  const b = calculateSajuResultV2(personB);

  if(!a || !b) return null;

  const aDayStem = a?.dayMaster?.stem || "";
  const bDayStem = b?.dayMaster?.stem || "";

  const aDayElement = a?.dayMaster?.element || "";
  const bDayElement = b?.dayMaster?.element || "";

  const aDayBranch = a?.pillars?.day?.[1] || "";
  const bDayBranch = b?.pillars?.day?.[1] || "";

  const dayStemRelation = getElementRelation(aDayElement, bDayElement);
  const dayBranchRelation = getBranchRelation(aDayBranch, bDayBranch);

  const strongestA = a?.strength?.raw?.dayMaster?.element || aDayElement;
  const strongestB = b?.strength?.raw?.dayMaster?.element || bDayElement;
  const fiveElementRelation = getElementRelation(strongestA, strongestB);

  const totalScore =
    dayStemRelation.score +
    dayBranchRelation.score +
    fiveElementRelation.score;

  const scoreSummary = summarizeScore(totalScore);

  return {
    personA: a,
    personB: b,
    relation: {
      dayStemRelation,
      dayBranchRelation,
      fiveElementRelation,
      totalScore,
      scoreSummary
    },
    advice: buildAdvice(dayStemRelation, dayBranchRelation, fiveElementRelation)
  };
}

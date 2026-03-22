// /js/gunghap.v2.engine.js  (NEW)
// ===============================
// GUNGHAP ENGINE V2
// 일간/일지 + 합충형파해 + 지장간 + 신살 보조
// ===============================

import { calculateSajuResultV2 } from "/js/saju.result.v2.engine.js";
import { detectHabChung } from "/js/habchung.engine.js";
import { getAllJijanganTenGods } from "/js/jijangan.engine.js";
import { get12SinsalForPillars } from "/js/sinsal12.engine.js";
import { getExtraSinsal } from "/js/sinsal.extra.engine.js";

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

function findCrossHabChung(aPillars, bPillars){
  const aBranches = [
    aPillars?.year?.[1], aPillars?.month?.[1], aPillars?.day?.[1], aPillars?.hour?.[1]
  ].filter(Boolean);

  const bBranches = [
    bPillars?.year?.[1], bPillars?.month?.[1], bPillars?.day?.[1], bPillars?.hour?.[1]
  ].filter(Boolean);

  const relations = [];

  for(const a of aBranches){
    for(const b of bBranches){
      const rel = getBranchRelation(a, b);
      if(rel.type !== "neutral"){
        relations.push({
          a,
          b,
          label: rel.label,
          score: rel.score
        });
      }
    }
  }

  return relations;
}

function countSharedSinsal(a, b){
  const a12 = get12SinsalForPillars(a?.pillars);
  const b12 = get12SinsalForPillars(b?.pillars);

  const aExtra = getExtraSinsal(a?.pillars) || [];
  const bExtra = getExtraSinsal(b?.pillars) || [];

  const sharedExtra = aExtra.filter(v => bExtra.includes(v));

  return {
    a12,
    b12,
    aExtra,
    bExtra,
    sharedExtra
  };
}

function countJijanganSupport(a, b){
  const aHidden = getAllJijanganTenGods(a?.pillars?.day, a?.pillars);
  const bHidden = getAllJijanganTenGods(b?.pillars?.day, b?.pillars);

  const aMain = aHidden?.month?.[0]?.tenGod || "";
  const bMain = bHidden?.month?.[0]?.tenGod || "";

  let score = 0;
  const notes = [];

  if(aMain && bMain){
    if(aMain === bMain){
      score += 1;
      notes.push("월지 지장간 핵심 십성이 유사함");
    } else {
      notes.push("월지 지장간 핵심 십성이 다름");
    }
  }

  return {
    score,
    notes,
    aMain,
    bMain
  };
}

function summarizeScore(score){
  if(score >= 9){
    return {
      level: "high",
      label: "궁합 흐름이 좋은 편",
      summary: "기질, 생활 리듬, 상호 보완 면에서 맞물리는 요소가 비교적 많습니다."
    };
  }

  if(score >= 3){
    return {
      level: "mid",
      label: "조율하면 좋은 궁합",
      summary: "잘 맞는 요소와 부딪히는 요소가 함께 있어 소통 방식이 중요합니다."
    };
  }

  return {
    level: "low",
    label: "조율이 많이 필요한 궁합",
    summary: "기질 차이와 생활 리듬 차이가 커서 이해와 조정이 중요합니다."
  };
}

function buildAdvice({ dayStemRelation, dayBranchRelation, crossRelations, sinsalInfo, jijanganInfo }){
  const list = [];

  if(dayStemRelation.type === "generate_in" || dayStemRelation.type === "generate_out"){
    list.push("기본 기질에서는 서로 돕거나 북돋우는 흐름이 있을 수 있습니다.");
  }

  if(dayStemRelation.type === "control_in" || dayStemRelation.type === "control_out"){
    list.push("기질 차이가 강하게 드러날 수 있어, 누가 주도권을 쥐는지 민감해질 수 있습니다.");
  }

  if(dayBranchRelation.type === "hap"){
    list.push("일상 리듬과 정서 연결에서 자연스럽게 맞물리는 지점이 있을 수 있습니다.");
  }

  if(dayBranchRelation.type === "chung"){
    list.push("가까워질수록 생활 방식과 반응 속도의 차이가 크게 느껴질 수 있습니다.");
  }

  if(crossRelations.length >= 2){
    list.push("두 사람 원국 사이에 여러 지지 관계가 보여, 단순 호불호보다 관계 운영 방식이 더 중요할 수 있습니다.");
  }

  if((sinsalInfo?.sharedExtra || []).includes("도화")){
    list.push("서로를 끌어당기는 매력 포인트가 강하게 작동할 수 있습니다.");
  }

  if((sinsalInfo?.sharedExtra || []).includes("화개")){
    list.push("관계 안에서도 각자의 혼자만의 시간과 깊이를 존중하는 것이 중요할 수 있습니다.");
  }

  if(jijanganInfo?.score > 0){
    list.push("겉으로는 달라도 안쪽 작동 방식에는 비슷한 결이 있을 수 있습니다.");
  }

  list.push("궁합은 좋고 나쁨의 판정보다, 어떤 방식으로 맞추면 좋은지를 보는 것이 더 중요합니다.");

  return list;
}

export function calculateGunghapV2(personA, personB){
  const a = calculateSajuResultV2(personA);
  const b = calculateSajuResultV2(personB);

  if(!a || !b) return null;

  const aDayElement = a?.dayMaster?.element || "";
  const bDayElement = b?.dayMaster?.element || "";

  const aDayBranch = a?.pillars?.day?.[1] || "";
  const bDayBranch = b?.pillars?.day?.[1] || "";

  const dayStemRelation = getElementRelation(aDayElement, bDayElement);
  const dayBranchRelation = getBranchRelation(aDayBranch, bDayBranch);

  const crossRelations = findCrossHabChung(a.pillars, b.pillars);
  const sinsalInfo = countSharedSinsal(a, b);
  const jijanganInfo = countJijanganSupport(a, b);

  const totalScore =
    dayStemRelation.score +
    dayBranchRelation.score +
    crossRelations.reduce((acc, cur) => acc + cur.score, 0) +
    (sinsalInfo.sharedExtra.length > 0 ? 1 : 0) +
    jijanganInfo.score;

  const scoreSummary = summarizeScore(totalScore);

  return {
    personA: a,
    personB: b,
    relation: {
      dayStemRelation,
      dayBranchRelation,
      crossRelations,
      sinsalInfo,
      jijanganInfo,
      totalScore,
      scoreSummary
    },
    advice: buildAdvice({
      dayStemRelation,
      dayBranchRelation,
      crossRelations,
      sinsalInfo,
      jijanganInfo
    })
  };
}

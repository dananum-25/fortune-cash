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
    aPillars?.year?.[1], aPill

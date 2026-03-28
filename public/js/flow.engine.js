// /js/flow.engine.js  (NEW)
// ===============================
// FLOW ENGINE
// 원국 + 대운 + 세운 흐름 해석
// ===============================

import { getSeWoon } from "/js/sewoon.engine.js";

const stemElementMap = {
  "갑":"목","을":"목",
  "병":"화","정":"화",
  "무":"토","기":"토",
  "경":"금","신":"금",
  "임":"수","계":"수"
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

function loadRelationType(dayMasterStem, targetStem){
  const dm = stemElementMap[dayMasterStem];
  const tg = stemElementMap[targetStem];

  if(!dm || !tg) return "";

  if(dm === tg) return "same_as_daymaster";
  if(generates[tg] === dm) return "resource";
  if(generates[dm] === tg) return "output";
  if(controls[dm] === tg) return "wealth";
  if(controls[tg] === dm) return "officer";

  return "";
}

async function loadFlowDB(){
  const res = await fetch("/data/myeongri/flow_interpretation.json");
  if(!res.ok){
    throw new Error("flow_interpretation.json 로드 실패");
  }
  return await res.json();
}

function findCurrentDaewoon(daewoon, currentAge){
  if(!daewoon?.list || !Array.isArray(daewoon.list)) return null;

  return daewoon.list.find(item =>
    currentAge >= item.fromAge &&
    currentAge <= item.toAge
  ) || null;
}

export async function calculateFlowInterpretation({
  birthYear,
  currentYear,
  dayMasterStem,
  daewoon
}){
  const db = await loadFlowDB();

  const safeBirthYear = Number(birthYear);
  const safeCurrentYear = Number(currentYear);
  const safeDayMasterStem = String(dayMasterStem || "").trim();

  if (!safeBirthYear || !safeCurrentYear || !safeDayMasterStem) {
    return {
      currentAge: null,
      sewoon: null,
      currentDaewoon: null,
      sewoonType: "",
      daewoonType: "",
      sewoonMessage: null,
      daewoonMessage: null
    };
  }

  const sewoon = getSeWoon(safeCurrentYear);
  const currentAge = safeCurrentYear - safeBirthYear + 1;

  const currentDaewoon = findCurrentDaewoon(daewoon, currentAge);

  const sewoonType = sewoon?.stem
    ? loadRelationType(safeDayMasterStem, sewoon.stem)
    : "";

  const daewoonType = currentDaewoon?.ganji?.[0]
    ? loadRelationType(safeDayMasterStem, currentDaewoon.ganji[0])
    : "";

  const sewoonMsg = db?.[sewoonType] || null;
  const daewoonMsg = db?.[daewoonType] || null;

  return {
    currentAge,
    sewoon,
    currentDaewoon,
    sewoonType,
    daewoonType,
    sewoonMessage: sewoonMsg,
    daewoonMessage: daewoonMsg
  };
}

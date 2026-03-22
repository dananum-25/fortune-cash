// /js/career.flow.engine.js  (NEW)
// ===============================
// CAREER FLOW ENGINE
// 직업 적성 + 현재 대운/세운 흐름 연결
// ===============================

import { calculateFlowInterpretation } from "/js/flow.engine.js";

async function loadJson(path){
  const res = await fetch(path);
  if(!res.ok){
    throw new Error(`직업 흐름 DB 로드 실패: ${path}`);
  }
  return await res.json();
}

export async function loadCareerFlowDB(){
  return await loadJson("/data/myeongri/career_flow_messages.json");
}

function pickFlowMessage(db, type){
  if(!type) return null;
  return db?.[type] || null;
}

export async function calculateCareerFlow({
  birthYear,
  currentYear,
  dayMasterStem,
  daewoon
}){
  const db = await loadCareerFlowDB();

  const flow = await calculateFlowInterpretation({
    birthYear,
    currentYear,
    dayMasterStem,
    daewoon
  });

  const sewoonMessage = pickFlowMessage(db, flow?.sewoonType);
  const daewoonMessage = pickFlowMessage(db, flow?.daewoonType);

  return {
    raw: flow,
    sewoonMessage,
    daewoonMessage
  };
}

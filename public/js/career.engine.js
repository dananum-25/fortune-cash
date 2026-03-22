// /js/career.engine.js  (NEW)
// ===============================
// CAREER ENGINE
// 십성 + 신강/신약 + 오행 기반 직업 적성 엔진
// ===============================

import { calculateSajuResultV2 } from "/js/saju.result.v2.engine.js";
import { calculateCareerFlow } from "/js/career.flow.engine.js";
const DB_PATH = "/data/myeongri/career_messages.json";

async function loadJson(path){
  const res = await fetch(path);
  if(!res.ok){
    throw new Error(`직업 DB 로드 실패: ${path}`);
  }
  return await res.json();
}

export async function loadCareerDB(){
  return await loadJson(DB_PATH);
}

function pickMainTenGod(result){
  return (
    result?.tenGods?.monthStemTenGod ||
    result?.tenGods?.yearStemTenGod ||
    result?.tenGods?.hourStemTenGod ||
    ""
  );
}

function pickFiveElementHint(result){
  const fe = result?.fiveElements || {};
  let topKey = "";
  let topValue = -1;

  for(const [key, value] of Object.entries(fe)){
    if(value > topValue){
      topValue = value;
      topKey = key;
    }
  }

  return topKey;
}

function normalizeCareerType(rawType){
  if(rawType === "독립형") return "기획형";
  return rawType || "분석형";
}

export async function calculateCareerResult(input){
  const result = calculateSajuResultV2(input);
  if(!result) return null;

  const db = await loadCareerDB();

  const mainTenGod = pickMainTenGod(result);
  const rawType = db?.keywords?.[mainTenGod] || "분석형";
  const careerType = normalizeCareerType(rawType);

  const typeMessage = db?.types?.[careerType] || null;
  const strengthLabel = result?.strength?.raw?.judgment?.label || "";
  const strengthMessage = db?.strength_map?.[strengthLabel] || null;
  const fiveElementHint = pickFiveElementHint(result);

  const extraHints = [];

  if(fiveElementHint === "목"){
    extraHints.push("성장과 확장이 중요한 역할에서 동기부여가 살아날 수 있습니다.");
  }
  if(fiveElementHint === "화"){
    extraHints.push("표현과 전달, 대외 활동이 있는 환경에서 에너지가 살아날 수 있습니다.");
  }
  if(fiveElementHint === "토"){
    extraHints.push("안정성과 운영, 유지가 필요한 역할에서 강점이 드러날 수 있습니다.");
  }
  if(fiveElementHint === "금"){
    extraHints.push("정리, 기준, 분석, 결론을 내리는 역할에 적성이 있을 수 있습니다.");
  }
  if(fiveElementHint === "수"){
    extraHints.push("사고력, 정보, 기획, 연구 흐름에서 강점이 드러날 수 있습니다.");
  }

  export async function calculateCareerResult(input){
  const result = calculateSajuResultV2(input);
  if(!result) return null;

  const db = await loadCareerDB();

  const mainTenGod = pickMainTenGod(result);
  const rawType = db?.keywords?.[mainTenGod] || "분석형";
  const careerType = normalizeCareerType(rawType);

  const typeMessage = db?.types?.[careerType] || null;
  const strengthLabel = result?.strength?.raw?.judgment?.label || "";
  const strengthMessage = db?.strength_map?.[strengthLabel] || null;
  const fiveElementHint = pickFiveElementHint(result);

  const extraHints = [];

  if(fiveElementHint === "목"){
    extraHints.push("성장과 확장이 중요한 역할에서 동기부여가 살아날 수 있습니다.");
  }
  if(fiveElementHint === "화"){
    extraHints.push("표현과 전달, 대외 활동이 있는 환경에서 에너지가 살아날 수 있습니다.");
  }
  if(fiveElementHint === "토"){
    extraHints.push("안정성과 운영, 유지가 필요한 역할에서 강점이 드러날 수 있습니다.");
  }
  if(fiveElementHint === "금"){
    extraHints.push("정리, 기준, 분석, 결론을 내리는 역할에 적성이 있을 수 있습니다.");
  }
  if(fiveElementHint === "수"){
    extraHints.push("사고력, 정보, 기획, 연구 흐름에서 강점이 드러날 수 있습니다.");
  }

  const birthYear = Number(input.ymd.slice(0, 4));
  const currentYear = new Date().getFullYear();

  const flow = await calculateCareerFlow({
    birthYear,
    currentYear,
    dayMasterStem: result?.dayMaster?.stem,
    daewoon: result?.daewoon
  });

  return {
    input,
    saju: result,
    career: {
      mainTenGod,
      careerType,
      fiveElementHint,
      typeMessage,
      strengthLabel,
      strengthMessage,
      extraHints
    },
    flow
  };
  }

// /js/career.engine.js
// Career aptitude engine based on the existing saju result and career-flow engines.

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
  const fiveElements = result?.fiveElements || {};
  let topKey = "";
  let topValue = -1;

  for(const [key, value] of Object.entries(fiveElements)){
    if(Number(value) > topValue){
      topValue = Number(value);
      topKey = key;
    }
  }

  return topKey;
}

function normalizeCareerType(rawType){
  return rawType || "분석형";
}

function buildElementHints(fiveElementHint){
  const hints = {
    목: "성장과 확장, 기획이나 교육처럼 가능성을 키우는 일에서 에너지가 살아날 수 있습니다.",
    화: "표현과 전달, 홍보나 콘텐츠처럼 사람 앞에 드러나는 일에서 강점이 보일 수 있습니다.",
    토: "안정성과 운영, 관리나 조율처럼 중심을 잡는 역할에 어울릴 수 있습니다.",
    금: "정리, 기준, 분석처럼 명확한 판단이 필요한 일에서 장점이 드러날 수 있습니다.",
    수: "정보, 탐색, 연구처럼 깊이 파고드는 일에서 몰입도가 높을 수 있습니다."
  };

  return hints[fiveElementHint] ? [hints[fiveElementHint]] : [];
}

export async function calculateCareerResult(input){
  const result = await calculateSajuResultV2(input);
  if(!result) return null;

  const db = await loadCareerDB();

  const mainTenGod = pickMainTenGod(result);
  const rawType = db?.keywords?.[mainTenGod] || "분석형";
  const careerType = normalizeCareerType(rawType);

  const typeMessage = db?.types?.[careerType] || null;
  const strengthLabel = result?.strength?.raw?.judgment?.label || "";
  const strengthMessage = db?.strength_map?.[strengthLabel] || null;
  const fiveElementHint = pickFiveElementHint(result);
  const extraHints = buildElementHints(fiveElementHint);

  const birthYear = Number(String(input?.ymd || "").slice(0, 4));
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

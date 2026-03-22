// /js/gunghap.db.engine.js  (NEW)
// ===============================
// GUNGHAP DB ENGINE
// 궁합 결과 + 해석 DB 매칭
// ===============================

const DB_PATH = "/data/myeongri/gunghap_detail_messages.json";

async function loadJson(path){
  const res = await fetch(path);
  if(!res.ok){
    throw new Error(`궁합 DB 로드 실패: ${path}`);
  }
  return await res.json();
}

export async function loadGunghapDB(){
  return await loadJson(DB_PATH);
}

export function buildGunghapDbInterpretation(db, result){
  if(!db || !result) return null;

  const scoreLevel = result?.relation?.scoreSummary?.level || "";
  const scoreMsg = db?.score?.[scoreLevel] || null;

  const dayBranchLabel = result?.relation?.dayBranchRelation?.label || "";
  const dayBranchMsg = db?.dayBranch?.[dayBranchLabel] || null;

  const sharedExtra = Array.isArray(result?.relation?.sinsalInfo?.sharedExtra)
    ? result.relation.sinsalInfo.sharedExtra
    : [];

  const specialMsgs = [];
  ["도화", "화개", "역마"].forEach((key) => {
    if (sharedExtra.includes(key) && db?.special?.[key]) {
      specialMsgs.push(db.special[key]);
    }
  });

  const jijanganSame =
    result?.relation?.jijanganInfo?.aMain &&
    result?.relation?.jijanganInfo?.bMain &&
    result.relation.jijanganInfo.aMain === result.relation.jijanganInfo.bMain;

  const jijanganMsg = jijanganSame
    ? db?.jijangan?.same || null
    : db?.jijangan?.different || null;

  return {
    score: scoreMsg,
    dayBranch: dayBranchMsg,
    special: specialMsgs,
    jijangan: jijanganMsg
  };
}

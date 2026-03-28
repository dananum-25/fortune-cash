// /js/myeongri.db.engine.js  (NEW)
// ===============================
// MYEONGRI DB ENGINE
// JSON DB 로드 + 결과 매칭
// ===============================

const DB_BASE = "/data/myeongri";

async function loadJson(path){
  const res = await fetch(path);
  if(!res.ok){
    throw new Error(`DB 로드 실패: ${path}`);
  }
  return await res.json();
}

export async function loadMyeongriDB(){
  const [daymaster, tenGod, strength, habchung, sinsal12, counseling] = await Promise.all([
  loadJson(`${DB_BASE}/daymaster.json`),
  loadJson(`${DB_BASE}/tenGod.json`),
  loadJson(`${DB_BASE}/strength.json`),
  loadJson(`${DB_BASE}/habchung.json`),
  loadJson(`${DB_BASE}/sinsal12.json`),
  loadJson(`${DB_BASE}/counseling.json`)
]);

  return {
  daymaster,
  tenGod,
  strength,
  habchung,
  sinsal12,
  counseling
};
}

export function matchDaymasterMessage(db, dayMasterStem){
  return db?.daymaster?.[dayMasterStem] || null;
}

export function matchTenGodMessage(db, tenGodName){
  return db?.tenGod?.[tenGodName] || null;
}

export function matchStrengthMessage(db, strengthLabel){
  return db?.strength?.[strengthLabel] || null;
}

export function matchSinsalMessage(db, sinsalName){
  return db?.sinsal12?.[sinsalName] || null;
}

export function matchHabChungMessage(db, typeName){
  return db?.habchung?.[typeName] || null;
}

 export function buildDbInterpretation(db, resultV2){
  if(!db || !resultV2) return null;

  const dayMasterStem = resultV2?.dayMaster?.stem || "";
  const dayMasterMsg = matchDaymasterMessage(db, dayMasterStem);

  const mainTenGod =
    resultV2?.tenGods?.monthStemTenGod ||
    resultV2?.tenGods?.yearStemTenGod ||
    resultV2?.tenGods?.hourStemTenGod ||
    "";

  const tenGodMsg = matchTenGodMessage(db, mainTenGod);

  const strengthLabel = resultV2?.strength?.raw?.judgment?.label || "";
  const strengthMsg = matchStrengthMessage(db, strengthLabel);

  const habchungNames = Array.isArray(resultV2?.habchung?.summary)
    ? resultV2.habchung.summary
    : [];

  const habchungMsgs = [];
  if(habchungNames.length){
    if(habchungNames.some(v => String(v).includes("합"))){
      const m = matchHabChungMessage(db, "천간합") || matchHabChungMessage(db, "삼합");
      if(m) habchungMsgs.push(m);
    }
    if(habchungNames.some(v => String(v).includes("충"))){
      const m = matchHabChungMessage(db, "지지충");
      if(m) habchungMsgs.push(m);
    }
    if(habchungNames.some(v => String(v).includes("형"))){
      const m = matchHabChungMessage(db, "지지형");
      if(m) habchungMsgs.push(m);
    }
    if(habchungNames.some(v => String(v).includes("파"))){
      const m = matchHabChungMessage(db, "지지파");
      if(m) habchungMsgs.push(m);
    }
    if(habchungNames.some(v => String(v).includes("해"))){
      const m = matchHabChungMessage(db, "지지해");
      if(m) habchungMsgs.push(m);
    }
  }

  const sinsalMsgs = [];
  const usedSinsalKeys = new Set();
  const sinsalSummary = Array.isArray(resultV2?.sinsal12?.summary)
    ? resultV2.sinsal12.summary
    : [];

  for (const item of sinsalSummary) {
    const text = String(item || "").trim();
    if (!text) continue;

    const matchedKey = Object.keys(db?.sinsal12 || {}).find((key) => text.includes(key));
    if (!matchedKey || usedSinsalKeys.has(matchedKey)) continue;

    const msg = matchSinsalMessage(db, matchedKey);
    if (msg) {
      sinsalMsgs.push(msg);
      usedSinsalKeys.add(matchedKey);
    }
  }

  return {
    principles: db?.counseling?.principles || [],
    bridges: db?.counseling?.bridges || {},
    dayMaster: dayMasterMsg,
    tenGod: tenGodMsg,
    strength: strengthMsg,
    habchung: habchungMsgs,
    sinsal12: sinsalMsgs
  };
}



// /js/saju.compat.engine.js  (NEW)
// ===============================
// SAJU COMPAT ENGINE
// 새 엔진 결과를 기존 페이지 형식으로 변환
// ===============================

import { calculateSajuInterpretation } from "/js/saju.interpretation.engine.js";

// -------------------------------
// 1) 안전 유틸
// -------------------------------
function safe(value, fallback = ""){
  return value ?? fallback;
}

function splitPillar(pillar){
  if(!pillar || pillar.length < 2){
    return { stem: "", branch: "" };
  }
  return {
    stem: pillar[0],
    branch: pillar[1]
  };
}

function makeEightChars(pillars){
  const y = splitPillar(pillars?.year);
  const m = splitPillar(pillars?.month);
  const d = splitPillar(pillars?.day);
  const h = splitPillar(pillars?.hour);

  return {
    yearStem: y.stem,
    yearBranch: y.branch,
    monthStem: m.stem,
    monthBranch: m.branch,
    dayStem: d.stem,
    dayBranch: d.branch,
    hourStem: h.stem,
    hourBranch: h.branch
  };
}

// -------------------------------
// 2) 기존 화면 친화형 요약
// -------------------------------
function buildLegacySummary(result){
  const interp = result?.interpretation;

  return {
    title: safe(interp?.overview?.title, "사주 해석 결과"),
    summary: Array.isArray(interp?.overview?.summary)
      ? interp.overview.summary.join(" ")
      : "",
    strengths: Array.isArray(interp?.strengths)
      ? interp.strengths
      : [],
    cautions: Array.isArray(interp?.cautions)
      ? interp.cautions
      : [],
    advice: Array.isArray(interp?.advice)
      ? interp.advice
      : []
  };
}

// -------------------------------
// 3) 기존 화면 친화형 대운 포맷
// -------------------------------
function buildLegacyDaewoon(result){
  const d = result?.daewoon;

  if(!d){
    return {
      direction: "",
      startAge: null,
      list: []
    };
  }

  return {
    direction: safe(d.direction),
    startAge: d.startAge ?? null,
    precision: safe(d.precision),
    nearestTermName: safe(d.nearestTerm?.name),
    nearestTermDate: d.nearestTerm?.date
      ? new Date(d.nearestTerm.date).toISOString()
      : "",
    list: Array.isArray(d.list)
      ? d.list.map(item => ({
          ganji: safe(item.ganji),
          fromAge: item.fromAge ?? null,
          toAge: item.toAge ?? null,
          label: `${safe(item.ganji)} (${item.fromAge}~${item.toAge})`
        }))
      : []
  };
}

// -------------------------------
// 4) 기존 화면 친화형 오행 포맷
// -------------------------------
function buildLegacyElements(result){
  const counts = result?.fiveElements || {};

  return {
    wood: counts["목"] ?? 0,
    fire: counts["화"] ?? 0,
    earth: counts["토"] ?? 0,
    metal: counts["금"] ?? 0,
    water: counts["수"] ?? 0,
    strongest: safe(result?.structure?.fiveElements?.strongest?.element),
    weakest: safe(result?.structure?.fiveElements?.weakest?.element)
  };
}

// -------------------------------
// 5) 기존 화면 친화형 십성 포맷
// -------------------------------
function buildLegacyTenGods(result){
  const tg = result?.tenGods || {};

  return {
    year: safe(tg.yearStemTenGod),
    month: safe(tg.monthStemTenGod),
    day: safe(tg.dayStemTenGod),
    hour: safe(tg.hourStemTenGod)
  };
}

// -------------------------------
// 6) 기존 템플릿에서 바로 쓰기 쉬운 최종 변환
// -------------------------------
export function calculateSajuLegacyCompat({
  ymd,
  hour = 12,
  minute = 0,
  gender = ""
}){
  const result = calculateSajuInterpretation({
    ymd,
    hour,
    minute,
    gender
  });

  if(!result) return null;

  const eightChars = makeEightChars(result.pillars);
  const summary = buildLegacySummary(result);
  const daewoon = buildLegacyDaewoon(result);
  const elements = buildLegacyElements(result);
  const tenGods = buildLegacyTenGods(result);

  return {
    // ---------------------------
    // 입력
    // ---------------------------
    input: {
      ymd: safe(result?.input?.ymd),
      hour: result?.input?.hour ?? 12,
      minute: result?.input?.minute ?? 0,
      gender: safe(result?.input?.gender)
    },

    // ---------------------------
    // 기존 페이지용 핵심 필드
    // ---------------------------
    saju: {
      year: safe(result?.pillars?.year),
      month: safe(result?.pillars?.month),
      day: safe(result?.pillars?.day),
      hour: safe(result?.pillars?.hour)
    },

    eightChars,

    dayMaster: {
      stem: safe(result?.dayMaster?.stem),
      element: safe(result?.dayMaster?.element),
      yinYang: safe(result?.dayMaster?.yinYang)
    },

    monthBranch: {
      branch: safe(result?.monthBranch?.branch),
      element: safe(result?.monthBranch?.element)
    },

    tenGods,
    fiveElements: elements,
    daewoon,

    // ---------------------------
    // 기존 화면에서 바로 뿌리기 쉬운 해석
    // ---------------------------
    text: {
      title: summary.title,
      summary: summary.summary,
      strengths: summary.strengths,
      cautions: summary.cautions,
      advice: summary.advice
    },

    // ---------------------------
    // 디버깅/고도화용 원본
    // ---------------------------
    raw: result
  };
}

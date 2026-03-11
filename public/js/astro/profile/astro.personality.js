// /js/astro/profile/astro.personality.js

import {
  ELEMENT_BY_SIGN,
  MODALITY_BY_SIGN,
  SIGN_NAMES_KO
} from "/js/astro/core/astro.constants.js";

function countElements(signs = []){
  const counts = {
    fire: 0,
    earth: 0,
    air: 0,
    water: 0
  };

  signs.forEach(sign => {
    const el = ELEMENT_BY_SIGN[sign];
    if(el && counts[el] !== undefined){
      counts[el] += 1;
    }
  });

  return counts;
}

function countModalities(signs = []){
  const counts = {
    cardinal: 0,
    fixed: 0,
    mutable: 0
  };

  signs.forEach(sign => {
    const mo = MODALITY_BY_SIGN[sign];
    if(mo && counts[mo] !== undefined){
      counts[mo] += 1;
    }
  });

  return counts;
}

function getTopKey(obj = {}){
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || "";
}

function getPlanetSign(chart, key){
  return chart?.planets?.[key]?.sign || "";
}

function getElementTone(element){
  const map = {
    fire: "행동과 추진력이 강한 편",
    earth: "현실감과 안정성이 강한 편",
    air: "생각과 소통의 흐름이 강한 편",
    water: "감정과 직관의 흐름이 강한 편"
  };
  return map[element] || "";
}

function getModalityTone(modality){
  const map = {
    cardinal: "시작하고 방향을 잡는 힘이 강함",
    fixed: "유지하고 버티는 힘이 강함",
    mutable: "조율하고 변화에 적응하는 힘이 강함"
  };
  return map[modality] || "";
}

export function buildPersonalityProfile(chart){
  if(!chart){
    return null;
  }

  const signs = [
    chart?.sun?.sign,
    chart?.moon?.sign,
    chart?.asc?.sign,
    getPlanetSign(chart, "mercury"),
    getPlanetSign(chart, "venus"),
    getPlanetSign(chart, "mars"),
    getPlanetSign(chart, "jupiter"),
    getPlanetSign(chart, "saturn")
  ].filter(Boolean);

  const elementCounts = countElements(signs);
  const modalityCounts = countModalities(signs);

  const dominantElement = getTopKey(elementCounts);
  const dominantModality = getTopKey(modalityCounts);

  const sunSign = chart?.sun?.sign || "";
  const moonSign = chart?.moon?.sign || "";
  const ascSign = chart?.asc?.sign || "";

  return {
    identity: {
      sunSign,
      moonSign,
      ascSign,
      sunNameKo: SIGN_NAMES_KO[sunSign] || "",
      moonNameKo: SIGN_NAMES_KO[moonSign] || "",
      ascNameKo: SIGN_NAMES_KO[ascSign] || ""
    },
    balance: {
      elementCounts,
      modalityCounts,
      dominantElement,
      dominantModality
    },
    tone: {
      element: getElementTone(dominantElement),
      modality: getModalityTone(dominantModality)
    },
    tags: [
      dominantElement,
      dominantModality,
      sunSign,
      moonSign,
      ascSign
    ].filter(Boolean)
  };
}

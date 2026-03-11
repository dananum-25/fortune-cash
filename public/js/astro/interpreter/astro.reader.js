// /js/astro/interpreter/astro.reader.js

import { SIGN_NAMES_KO } from "/js/astro/core/astro.constants.js";

function getBand(score){
  const n = Number(score || 0);

  if(n >= 80){
    return {
      key: "high",
      label: "강함",
      tone: "흐름이 비교적 강하게 열리는 편입니다."
    };
  }

  if(n >= 65){
    return {
      key: "good",
      label: "좋음",
      tone: "무난하게 좋은 흐름이 이어질 가능성이 있습니다."
    };
  }

  if(n >= 50){
    return {
      key: "mid",
      label: "보통",
      tone: "기본 흐름은 유지되지만 관리가 중요합니다."
    };
  }

  return {
    key: "low",
    label: "주의",
    tone: "무리한 확장보다 조정과 점검이 더 중요할 수 있습니다."
  };
}

function getElementKo(element){
  const map = {
    fire: "화",
    earth: "토",
    air: "풍",
    water: "수"
  };
  return map[element] || "";
}

function getModalityKo(modality){
  const map = {
    cardinal: "주도형",
    fixed: "고정형",
    mutable: "변화형"
  };
  return map[modality] || "";
}

function getElementComment(element){
  const map = {
    fire: "행동력과 추진력이 강하게 작동하는 편입니다.",
    earth: "현실 감각과 안정 지향성이 강한 편입니다.",
    air: "사고력과 소통 능력이 강하게 드러나는 편입니다.",
    water: "감정과 직관의 민감도가 높은 편입니다."
  };
  return map[element] || "기본 성향이 비교적 고르게 섞여 있습니다.";
}

function getModalityComment(modality){
  const map = {
    cardinal: "시작하고 방향을 잡는 힘이 강한 편입니다.",
    fixed: "한번 잡은 흐름을 유지하는 힘이 강한 편입니다.",
    mutable: "상황에 맞게 조율하고 적응하는 힘이 강한 편입니다."
  };
  return map[modality] || "상황에 따라 유연하게 반응하는 편입니다.";
}

function scoreComment(type, score){
  const band = getBand(score);

  if(type === "overall"){
    if(band.key === "high") return "전체 흐름은 비교적 또렷하게 열리는 구간입니다.";
    if(band.key === "good") return "전체적으로 무난하게 좋은 흐름을 기대할 수 있습니다.";
    if(band.key === "mid") return "크게 나쁘지 않지만 선택과 집중이 중요합니다.";
    return "전체 흐름은 방어적으로 운영하는 편이 더 유리할 수 있습니다.";
  }

  if(type === "career"){
    if(band.key === "high") return "일과 결과물, 책임 영역에서 성과가 드러나기 쉬운 편입니다.";
    if(band.key === "good") return "커리어는 안정적으로 전진할 가능성이 있습니다.";
    if(band.key === "mid") return "커리어는 무난하지만 정리와 마무리가 중요합니다.";
    return "일에서는 속도보다 구조 점검과 우선순위 조정이 먼저입니다.";
  }

  if(type === "wealth"){
    if(band.key === "high") return "재정 흐름은 비교적 강한 편이며 기회 포착력이 올라갈 수 있습니다.";
    if(band.key === "good") return "돈의 흐름은 무난한 편이며 관리와 유지가 잘 맞습니다.";
    if(band.key === "mid") return "재정은 큰 확장보다 균형 관리가 더 중요합니다.";
    return "지출 통제와 조건 확인을 먼저 챙기는 편이 좋습니다.";
  }

  if(type === "love"){
    if(band.key === "high") return "관계와 애정의 흐름이 부드럽게 이어질 가능성이 있습니다.";
    if(band.key === "good") return "관계는 비교적 안정적인 흐름을 기대할 수 있습니다.";
    if(band.key === "mid") return "관계는 무난하지만 표현 방식이 결과를 좌우할 수 있습니다.";
    return "감정기복과 오해를 줄이는 방향이 더 중요할 수 있습니다.";
  }

  if(type === "health"){
    if(band.key === "high") return "컨디션 유지력과 회복 흐름이 비교적 좋은 편입니다.";
    if(band.key === "good") return "건강 흐름은 무난하며 생활 리듬이 잘 맞으면 더 안정됩니다.";
    if(band.key === "mid") return "건강은 기본 관리만 해도 흐름이 크게 흔들리지 않습니다.";
    return "피로 누적과 생활 리듬 붕괴를 먼저 조심하는 편이 좋습니다.";
  }

  return band.tone;
}

export function buildIdentityReader(personality){
  const sunName = personality?.identity?.sunNameKo || "";
  const moonName = personality?.identity?.moonNameKo || "";
  const ascName = personality?.identity?.ascNameKo || "";
  const dominantElement = personality?.balance?.dominantElement || "";
  const dominantModality = personality?.balance?.dominantModality || "";

  return {
    title: `${sunName || "기본"} · ${moonName || "기본"} · ${ascName || "기본"} 조합`,
    text: [
      sunName ? `기본 자아는 ${sunName} 성향이 중심입니다.` : "",
      moonName ? `감정 반응은 ${moonName} 흐름이 섞여 있을 가능성이 있습니다.` : "",
      ascName ? `겉으로 보이는 인상과 시작 방식은 ${ascName} 색이 묻어날 수 있습니다.` : "",
      dominantElement ? `${getElementKo(dominantElement)} 원소 우세: ${getElementComment(dominantElement)}` : "",
      dominantModality ? `${getModalityKo(dominantModality)} 중심: ${getModalityComment(dominantModality)}` : ""
    ].filter(Boolean).join(" ")
  };
}

export function buildScoreReaders(scores){
  return {
    overall: {
      score: scores?.overall || 60,
      ...getBand(scores?.overall || 60),
      text: scoreComment("overall", scores?.overall || 60)
    },
    career: {
      score: scores?.career || 60,
      ...getBand(scores?.career || 60),
      text: scoreComment("career", scores?.career || 60)
    },
    wealth: {
      score: scores?.wealth || 60,
      ...getBand(scores?.wealth || 60),
      text: scoreComment("wealth", scores?.wealth || 60)
    },
    love: {
      score: scores?.love || 60,
      ...getBand(scores?.love || 60),
      text: scoreComment("love", scores?.love || 60)
    },
    health: {
      score: scores?.health || 60,
      ...getBand(scores?.health || 60),
      text: scoreComment("health", scores?.health || 60)
    }
  };
}

export function buildPlanetHighlights(natal){
  const planets = natal?.planets || {};
  const lines = [];

  if(planets.sun){
    lines.push(`태양은 ${SIGN_NAMES_KO[planets.sun.sign] || planets.sun.sign} 흐름에 있어 기본 자아와 방향성을 보여줍니다.`);
  }

  if(planets.moon){
    lines.push(`달은 ${SIGN_NAMES_KO[planets.moon.sign] || planets.moon.sign} 쪽에 있어 감정 반응과 안정 방식을 비춥니다.`);
  }

  if(planets.venus){
    lines.push(`금성은 관계와 호감 표현 방식에 영향을 주며, 현재는 ${SIGN_NAMES_KO[planets.venus.sign] || planets.venus.sign} 성향이 강조됩니다.`);
  }

  if(planets.mars){
    lines.push(`화성은 행동력과 추진 방식을 보여주며, ${SIGN_NAMES_KO[planets.mars.sign] || planets.mars.sign} 방식으로 힘이 실릴 수 있습니다.`);
  }

  return lines;
}

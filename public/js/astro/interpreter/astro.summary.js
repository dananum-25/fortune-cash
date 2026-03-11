// /js/astro/interpreter/astro.summary.js

import {
  buildIdentityReader,
  buildScoreReaders,
  buildPlanetHighlights
} from "/js/astro/interpreter/astro.reader.js";

export function buildAstroSummary({ natal, personality, scores, natalAspects } = {}){
  const identity = buildIdentityReader(personality);
  const scoreReaders = buildScoreReaders(scores);
  const planetLines = buildPlanetHighlights(natal);

  const headline = (() => {
    const arr = [
      { key: "career", value: scores?.career || 60, label: "일과 결과물" },
      { key: "wealth", value: scores?.wealth || 60, label: "재정과 자원" },
      { key: "love", value: scores?.love || 60, label: "관계와 감정" },
      { key: "health", value: scores?.health || 60, label: "컨디션과 리듬" }
    ].sort((a, b) => b.value - a.value);

    const top = arr[0];
    const low = arr[arr.length - 1];

    return `${top.label} 쪽 흐름이 상대적으로 강하고, ${low.label} 쪽은 조금 더 관리가 중요할 수 있습니다.`;
  })();

  const aspectText = (() => {
    if(!Array.isArray(natalAspects) || natalAspects.length === 0){
      return "현재 기본 차트 구조에서는 뚜렷한 각도 편중이 강하지 않은 편입니다.";
    }

    const strong = natalAspects.slice(0, 3).map(a => `${a.a}-${a.b} ${a.type}`).join(", ");
    return `출생 차트의 주요 각도 흐름: ${strong}.`;
  })();

  return {
    headline,
    identityTitle: identity.title,
    identityText: identity.text,
    overall: scoreReaders.overall.text,
    career: scoreReaders.career.text,
    wealth: scoreReaders.wealth.text,
    love: scoreReaders.love.text,
    health: scoreReaders.health.text,
    aspectText,
    planetLines,
    scoreReaders
  };
}

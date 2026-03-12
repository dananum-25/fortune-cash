// /js/astro/interpreter/astro.today.js

function getBand(score){
  const n = Number(score || 0);
  if(n >= 80) return "high";
  if(n >= 65) return "good";
  if(n >= 50) return "mid";
  return "low";
}

function findTransitAspect(transitAspects = [], transit, target, type = ""){
  return transitAspects.find(item => {
    if(item.transit !== transit) return false;
    if(item.target !== target) return false;
    if(type && item.type !== type) return false;
    return true;
  }) || null;
}

function clampScore(v){
  let n = Number(v || 0);
  if(n > 95) n = 95;
  if(n < 30) n = 30;
  return Math.round(n);
}

export function buildTodayScores({ scores, transitAspects } = {}){
  const result = {
    overall: Number(scores?.overall || 60),
    career: Number(scores?.career || 60),
    wealth: Number(scores?.wealth || 60),
    love: Number(scores?.love || 60),
    health: Number(scores?.health || 60)
  };

  if(findTransitAspect(transitAspects, "jupiter", "sun", "trine") || findTransitAspect(transitAspects, "jupiter", "sun", "sextile")){
    result.overall += 8;
    result.career += 6;
    result.wealth += 4;
  }

  if(findTransitAspect(transitAspects, "saturn", "moon", "square") || findTransitAspect(transitAspects, "saturn", "moon", "opposition")){
    result.overall -= 5;
    result.love -= 4;
    result.health -= 5;
  }

  if(findTransitAspect(transitAspects, "venus", "venus", "trine") || findTransitAspect(transitAspects, "venus", "moon", "sextile")){
    result.love += 6;
    result.overall += 3;
  }

  if(findTransitAspect(transitAspects, "mars", "mars", "square") || findTransitAspect(transitAspects, "mars", "sun", "square")){
    result.health -= 4;
    result.love -= 2;
    result.career += 1;
  }

  if(findTransitAspect(transitAspects, "jupiter", "jupiter", "conjunction") || findTransitAspect(transitAspects, "jupiter", "sun", "conjunction")){
    result.overall += 5;
    result.wealth += 4;
    result.career += 3;
  }

  Object.keys(result).forEach(key => {
    result[key] = clampScore(result[key]);
  });

  return result;
}

function makeLine(type, score){
  const band = getBand(score);

  if(type === "overall"){
    if(band === "high") return "오늘은 전체 흐름이 비교적 강하게 열리는 편입니다.";
    if(band === "good") return "오늘은 전반적으로 무난하게 좋은 흐름을 기대할 수 있습니다.";
    if(band === "mid") return "오늘은 기본 흐름은 유지되지만 선택과 집중이 중요합니다.";
    return "오늘은 무리하게 밀어붙이기보다 조정과 점검이 더 중요할 수 있습니다.";
  }

  if(type === "career"){
    if(band === "high") return "오늘은 일과 결과물, 실행력에서 힘을 받기 쉬운 흐름입니다.";
    if(band === "good") return "오늘은 직업과 실무 흐름이 비교적 안정적인 편입니다.";
    if(band === "mid") return "오늘은 일에서 속도보다 정리와 마무리가 더 중요합니다.";
    return "오늘은 직업과 실무에서 무리한 확장보다 우선순위 조정이 필요할 수 있습니다.";
  }

  if(type === "wealth"){
    if(band === "high") return "오늘은 재정 감각과 기회 포착이 비교적 잘 맞는 편입니다.";
    if(band === "good") return "오늘은 돈의 흐름이 무난하며 관리 중심 접근이 좋습니다.";
    if(band === "mid") return "오늘은 수익보다 지출 균형을 먼저 보는 편이 좋습니다.";
    return "오늘은 재정과 소비에서 보수적으로 접근하는 편이 더 유리합니다.";
  }

  if(type === "love"){
    if(band === "high") return "오늘은 관계와 감정 표현이 비교적 부드럽게 흐를 수 있습니다.";
    if(band === "good") return "오늘은 관계가 무난한 편이라 대화의 흐름을 잘 살리면 좋습니다.";
    if(band === "mid") return "오늘은 관계에서 오해를 줄이는 표현 방식이 중요합니다.";
    return "오늘은 감정기복과 서운함을 바로 결론내리지 않는 편이 좋습니다.";
  }

  if(type === "health"){
    if(band === "high") return "오늘은 컨디션 유지와 회복력이 비교적 좋은 흐름입니다.";
    if(band === "good") return "오늘은 생활 리듬만 무너지지 않으면 무난한 흐름입니다.";
    if(band === "mid") return "오늘은 피로 관리와 수면 리듬을 먼저 챙기는 편이 좋습니다.";
    return "오늘은 무리한 일정과 과로를 줄이는 것이 우선입니다.";
  }

  return "";
}

export function buildTodaySummary({ scores, transitAspects, targetDate } = {}){
  const todayScores = buildTodayScores({ scores, transitAspects });

  const highlights = [];

  if(findTransitAspect(transitAspects, "jupiter", "sun", "trine") || findTransitAspect(transitAspects, "jupiter", "sun", "sextile")){
    highlights.push("오늘은 확장과 자신감의 흐름이 비교적 잘 들어오는 편입니다.");
  }

  if(findTransitAspect(transitAspects, "saturn", "moon", "square") || findTransitAspect(transitAspects, "saturn", "moon", "opposition")){
    highlights.push("감정이 무거워질 수 있어 마음과 휴식 관리가 중요합니다.");
  }

  if(findTransitAspect(transitAspects, "venus", "moon", "sextile") || findTransitAspect(transitAspects, "venus", "venus", "trine")){
    highlights.push("관계와 호감 표현은 부드럽게 풀릴 가능성이 있습니다.");
  }

  if(findTransitAspect(transitAspects, "mars", "sun", "square") || findTransitAspect(transitAspects, "mars", "mars", "square")){
    highlights.push("과속과 예민함이 생기기 쉬워 속도 조절이 중요합니다.");
  }

  if(!highlights.length){
    highlights.push("오늘은 전체적으로 큰 흔들림보다 기본 흐름을 유지하는 편에 가깝습니다.");
  }

  return {
    targetDate,
    scores: todayScores,
    headline: highlights[0],
    highlights,
    overall: makeLine("overall", todayScores.overall),
    career: makeLine("career", todayScores.career),
    wealth: makeLine("wealth", todayScores.wealth),
    love: makeLine("love", todayScores.love),
    health: makeLine("health", todayScores.health)
  };
}

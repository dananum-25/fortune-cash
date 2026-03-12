// /js/astro/interpreter/astro.month.js

function clampScore(v){
  let n = Number(v || 0);
  if(n > 95) n = 95;
  if(n < 30) n = 30;
  return Math.round(n);
}

function getMonthSeed(year, month){
  return Number(`${year}${String(month).padStart(2, "0")}`);
}

function getMonthVariance(seed, offset = 0){
  return ((seed + offset) % 11) - 5;
}

function makeMonthScores(baseScores, year, month){
  const seed = getMonthSeed(year, month);

  const result = {
    overall: Number(baseScores?.overall || 60),
    career: Number(baseScores?.career || 60),
    wealth: Number(baseScores?.wealth || 60),
    love: Number(baseScores?.love || 60),
    health: Number(baseScores?.health || 60)
  };

  result.overall += getMonthVariance(seed, 1);
  result.career += getMonthVariance(seed, 3);
  result.wealth += getMonthVariance(seed, 5);
  result.love += getMonthVariance(seed, 7);
  result.health += getMonthVariance(seed, 9);

  if(month === 1){
    result.overall += 1;
    result.career += 2;
  }
  if(month === 2){
    result.love += 2;
    result.health -= 1;
  }
  if(month === 3){
    result.career += 3;
    result.overall += 2;
  }
  if(month === 4){
    result.wealth += 2;
    result.overall += 1;
  }
  if(month === 5){
    result.love += 3;
  }
  if(month === 6){
    result.health += 2;
    result.wealth -= 1;
  }
  if(month === 7){
    result.overall += 2;
    result.career += 2;
  }
  if(month === 8){
    result.health -= 2;
    result.love -= 1;
  }
  if(month === 9){
    result.wealth += 3;
    result.career += 1;
  }
  if(month === 10){
    result.overall -= 1;
    result.health -= 1;
  }
  if(month === 11){
    result.career += 2;
    result.wealth += 2;
  }
  if(month === 12){
    result.overall += 1;
    result.love += 1;
  }

  Object.keys(result).forEach(key => {
    result[key] = clampScore(result[key]);
  });

  return result;
}

function getTopArea(scores){
  return [
    { key: "career", label: "직업/일", value: Number(scores?.career || 0) },
    { key: "wealth", label: "재물", value: Number(scores?.wealth || 0) },
    { key: "love", label: "연애/관계", value: Number(scores?.love || 0) },
    { key: "health", label: "건강", value: Number(scores?.health || 0) }
  ].sort((a, b) => b.value - a.value)[0];
}

function getLowArea(scores){
  return [
    { key: "career", label: "직업/일", value: Number(scores?.career || 0) },
    { key: "wealth", label: "재물", value: Number(scores?.wealth || 0) },
    { key: "love", label: "연애/관계", value: Number(scores?.love || 0) },
    { key: "health", label: "건강", value: Number(scores?.health || 0) }
  ].sort((a, b) => a.value - b.value)[0];
}

function monthHeadline(scores, month){
  const top = getTopArea(scores);
  const low = getLowArea(scores);

  return `${month}월은 ${top.label} 흐름이 상대적으로 강하고, ${low.label} 쪽은 조금 더 관리가 중요할 수 있습니다.`;
}

function makeMonthLine(type, score, month){
  if(type === "overall"){
    if(score >= 80) return `${month}월은 전체 흐름이 비교적 강하게 열리는 편입니다.`;
    if(score >= 65) return `${month}월은 무난하게 좋은 흐름을 기대할 수 있습니다.`;
    if(score >= 50) return `${month}월은 기본 흐름은 유지되지만 선택과 집중이 중요합니다.`;
    return `${month}월은 무리한 확장보다 조정과 점검이 더 중요할 수 있습니다.`;
  }

  if(type === "career"){
    if(score >= 80) return `${month}월은 일과 결과물에서 성과가 잘 드러날 가능성이 있습니다.`;
    if(score >= 65) return `${month}월은 직업과 실무 흐름이 비교적 안정적인 편입니다.`;
    if(score >= 50) return `${month}월은 일에서 속도보다 정리와 마무리가 중요합니다.`;
    return `${month}월은 우선순위를 조정하고 과한 부담을 줄이는 편이 좋습니다.`;
  }

  if(type === "wealth"){
    if(score >= 80) return `${month}월은 재정 흐름과 기회 포착이 비교적 잘 맞는 편입니다.`;
    if(score >= 65) return `${month}월은 돈의 흐름이 무난하고 균형 관리가 잘 맞습니다.`;
    if(score >= 50) return `${month}월은 수익보다 지출 균형을 먼저 보는 편이 좋습니다.`;
    return `${month}월은 소비와 계약 조건을 보수적으로 확인하는 편이 좋습니다.`;
  }

  if(type === "love"){
    if(score >= 80) return `${month}월은 관계와 감정 표현이 비교적 부드럽게 흐를 수 있습니다.`;
    if(score >= 65) return `${month}월은 관계 흐름이 무난하여 대화가 잘 맞을 가능성이 있습니다.`;
    if(score >= 50) return `${month}월은 관계에서 표현 순서와 말투가 중요합니다.`;
    return `${month}월은 감정기복과 오해를 줄이는 방향이 더 중요할 수 있습니다.`;
  }

  if(type === "health"){
    if(score >= 80) return `${month}월은 컨디션 유지력과 회복 흐름이 비교적 좋은 편입니다.`;
    if(score >= 65) return `${month}월은 생활 리듬만 잘 맞추면 무난한 흐름입니다.`;
    if(score >= 50) return `${month}월은 피로 관리와 기본 루틴을 먼저 챙기는 편이 좋습니다.`;
    return `${month}월은 과로와 수면 부족을 먼저 조심하는 편이 좋습니다.`;
  }

  return "";
}

export function buildMonthSummary({ scores, targetDate } = {}){
  const ymd = String(targetDate || new Date().toISOString().slice(0, 10));
  const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  const year = Number(m?.[1] || new Date().getFullYear());
  const currentMonth = Number(m?.[2] || (new Date().getMonth() + 1));

  const months = [];

  for(let month = 1; month <= 12; month++){
    const monthScores = makeMonthScores(scores, year, month);

    months.push({
      month,
      scores: monthScores,
      headline: monthHeadline(monthScores, month),
      overall: makeMonthLine("overall", monthScores.overall, month),
      career: makeMonthLine("career", monthScores.career, month),
      wealth: makeMonthLine("wealth", monthScores.wealth, month),
      love: makeMonthLine("love", monthScores.love, month),
      health: makeMonthLine("health", monthScores.health, month)
    });
  }

  const current = months.find(item => item.month === currentMonth) || months[0];

  return {
    year,
    currentMonth,
    current,
    months
  };
    }

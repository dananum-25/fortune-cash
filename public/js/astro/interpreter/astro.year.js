// /js/astro/interpreter/astro.year.js

function avg(arr){
  if(!Array.isArray(arr) || !arr.length) return 0;
  return Math.round(arr.reduce((a, b) => a + Number(b || 0), 0) / arr.length);
}

function getStrongestArea(scores){
  return [
    { key: "career", label: "직업/일", value: Number(scores?.career || 0) },
    { key: "wealth", label: "재물", value: Number(scores?.wealth || 0) },
    { key: "love", label: "연애/관계", value: Number(scores?.love || 0) },
    { key: "health", label: "건강", value: Number(scores?.health || 0) }
  ].sort((a, b) => b.value - a.value)[0];
}

function getWeakestArea(scores){
  return [
    { key: "career", label: "직업/일", value: Number(scores?.career || 0) },
    { key: "wealth", label: "재물", value: Number(scores?.wealth || 0) },
    { key: "love", label: "연애/관계", value: Number(scores?.love || 0) },
    { key: "health", label: "건강", value: Number(scores?.health || 0) }
  ].sort((a, b) => a.value - b.value)[0];
}

function buildYearHeadline(avgScore, strongest, weakest){
  if(avgScore >= 80){
    return `전체적으로 흐름이 강한 편이며 특히 ${strongest.label}에서 성과 체감이 크게 올 수 있습니다. 다만 ${weakest.label} 쪽 균형은 함께 챙기는 것이 좋습니다.`;
  }

  if(avgScore >= 65){
    return `전체적으로 무난하게 좋은 흐름이며 ${strongest.label}이 상대적으로 힘을 받는 편입니다. ${weakest.label}은 방치보다 관리 중심 접근이 더 잘 맞습니다.`;
  }

  if(avgScore >= 50){
    return `전체 흐름은 보통 수준이며 ${strongest.label}은 활용 가치가 있지만 ${weakest.label}은 조정과 점검이 중요할 수 있습니다.`;
  }

  return `전체적으로 확장보다 안정과 점검이 중요한 흐름이며 ${weakest.label} 관리가 핵심 포인트가 될 수 있습니다.`;
}

function buildYearStrategy(avgScore, strongest, weakest){
  if(avgScore >= 80){
    return `강한 흐름이 들어오는 시기에는 ${strongest.label} 쪽 실행량을 늘리고, ${weakest.label}은 과속만 피하는 방향으로 운영하면 좋습니다.`;
  }

  if(avgScore >= 65){
    return `${strongest.label}은 기회를 잡되, ${weakest.label}에서는 손실을 줄이는 구조를 먼저 세우는 편이 좋습니다.`;
  }

  if(avgScore >= 50){
    return `${strongest.label}에 집중하되, ${weakest.label}은 규칙과 루틴으로 흔들림을 줄이는 전략이 더 잘 맞습니다.`;
  }

  return `${weakest.label} 회복과 정비를 우선하고, 중요한 결정은 천천히 확정하는 편이 좋습니다.`;
}

function buildChecklist(strongest, weakest){
  const list = [];

  list.push(`가장 강한 영역인 ${strongest.label}은 실행량보다 방향 점검을 먼저 하기`);
  list.push(`가장 약한 영역인 ${weakest.label}은 방치하지 말고 기준을 미리 정해두기`);
  list.push(`큰 결정은 감정보다 기록과 현실 조건을 함께 확인하기`);
  list.push(`몸과 마음이 동시에 지치지 않게 생활 리듬을 일정하게 유지하기`);
  list.push(`성과가 보이는 영역은 바로 루틴화해서 반복 가능 구조로 만들기`);

  return list;
}

export function buildYearSummary({ scores, month } = {}){
  const monthRows = Array.isArray(month?.months) ? month.months : [];

  const overallAvg = avg(monthRows.map(v => v?.scores?.overall || 0)) || Number(scores?.overall || 60);
  const careerAvg = avg(monthRows.map(v => v?.scores?.career || 0)) || Number(scores?.career || 60);
  const wealthAvg = avg(monthRows.map(v => v?.scores?.wealth || 0)) || Number(scores?.wealth || 60);
  const loveAvg = avg(monthRows.map(v => v?.scores?.love || 0)) || Number(scores?.love || 60);
  const healthAvg = avg(monthRows.map(v => v?.scores?.health || 0)) || Number(scores?.health || 60);

  const yearScores = {
    overall: overallAvg,
    career: careerAvg,
    wealth: wealthAvg,
    love: loveAvg,
    health: healthAvg
  };

  const strongest = getStrongestArea(yearScores);
  const weakest = getWeakestArea(yearScores);

  return {
    year: Number(month?.year || new Date().getFullYear()),
    scores: yearScores,
    strongest,
    weakest,
    headline: buildYearHeadline(overallAvg, strongest, weakest),
    strategy: buildYearStrategy(overallAvg, strongest, weakest),
    checklist: buildChecklist(strongest, weakest)
  };
}

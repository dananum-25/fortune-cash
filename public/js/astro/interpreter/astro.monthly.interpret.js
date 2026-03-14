function getPlanetLabel(key){
  const map = {
    sun: "태양",
    moon: "달",
    mercury: "수성",
    venus: "금성",
    mars: "화성",
    jupiter: "목성",
    saturn: "토성",
    uranus: "천왕성",
    neptune: "해왕성",
    pluto: "명왕성"
  };

  return map[key] || key;
}

function pickMonthlyTheme(planets){
  if(!planets) return "전반 흐름 점검";

  const sun = planets.sun?.signName || "";
  const moon = planets.moon?.signName || "";
  const mercury = planets.mercury?.signName || "";
  const venus = planets.venus?.signName || "";
  const mars = planets.mars?.signName || "";

  const lines = [];

  if(sun){
    lines.push(`이번 달 태양은 ${sun} 흐름을 강조합니다.`);
  }

  if(moon){
    lines.push(`달의 흐름은 ${moon} 쪽 감정 반응을 키우기 쉽습니다.`);
  }

  if(mercury){
    lines.push(`수성은 ${mercury}에 있어 소통과 일정 조율 방식에 영향을 줍니다.`);
  }

  if(venus){
    lines.push(`금성은 ${venus}에 있어 관계와 소비 감각에 영향을 줍니다.`);
  }

  if(mars){
    lines.push(`화성은 ${mars}에 있어 행동 속도와 추진력의 방향을 보여줍니다.`);
  }

  return lines.join(" ");
}

function buildAspectSummary(aspects){
  if(!Array.isArray(aspects) || aspects.length === 0){
    return "이번 달은 특정 각도가 강하게 두드러지기보다 전체 흐름을 균형 있게 보는 편이 좋습니다.";
  }

  const top = aspects.slice(0, 2);

  return top.map(item => {
    return `${getPlanetLabel(item.aKey)}과 ${getPlanetLabel(item.bKey)}이 ${item.aspectLabel}(${item.angle}°) 각을 이루며 ${item.meaning} 흐름을 만듭니다.`;
  }).join(" ");
}

function monthLabel(month){
  return `${month}월`;
}

export function buildMonthlyAstroSummary({ year, monthlyData }){
  if(!Array.isArray(monthlyData) || monthlyData.length === 0){
    return [];
  }

  return monthlyData.map(item => {
    return {
      month: item.month,
      label: monthLabel(item.month),
      title: `${year}년 ${monthLabel(item.month)} 흐름`,
      summary: `${pickMonthlyTheme(item.planets)} ${buildAspectSummary(item.aspects)}`
    };
  });
}

function safe(v){
  return v ?? "";
}

function getPlanetHouse(placements, key){
  const p = placements?.[key];
  return p ? p.house : null;
}

function careerInterpret(planets, houses){
  const sunHouse = getPlanetHouse(houses,"sun");
  const saturnHouse = getPlanetHouse(houses,"saturn");
  const marsHouse = getPlanetHouse(houses,"mars");

  let text = [];

  if(sunHouse === 10){
    text.push("사회적 역할과 커리어 방향성이 비교적 분명하게 드러나는 흐름입니다.");
  }

  if(marsHouse === 10){
    text.push("일과 관련된 추진력이 강하게 작동할 수 있습니다.");
  }

  if(saturnHouse === 10){
    text.push("책임과 구조가 강조되는 시기로 장기적인 커리어 안정에 집중하기 좋은 흐름입니다.");
  }

  if(text.length === 0){
    text.push("현재 커리어 흐름은 비교적 중립적인 상태이며 계획과 준비 단계로 활용하기 좋습니다.");
  }

  return text.join(" ");
}

function loveInterpret(planets, houses){
  const venusHouse = getPlanetHouse(houses,"venus");
  const moonHouse = getPlanetHouse(houses,"moon");

  let text = [];

  if(venusHouse === 7){
    text.push("관계와 파트너십에서 호감이나 협력 흐름이 비교적 자연스럽게 이어질 수 있습니다.");
  }

  if(moonHouse === 7){
    text.push("감정적인 교류가 중요한 시기로 대화와 공감이 관계 분위기를 크게 좌우할 수 있습니다.");
  }

  if(text.length === 0){
    text.push("관계 영역에서는 큰 변화보다는 기존 관계의 균형을 유지하는 흐름으로 볼 수 있습니다.");
  }

  return text.join(" ");
}

function moneyInterpret(planets, houses){
  const jupiterHouse = getPlanetHouse(houses,"jupiter");
  const venusHouse = getPlanetHouse(houses,"venus");

  let text = [];

  if(jupiterHouse === 2){
    text.push("재정과 자원 확장 기회를 탐색하기 좋은 흐름입니다.");
  }

  if(venusHouse === 2){
    text.push("지출과 소비 패턴이 관계나 취향과 연결될 가능성이 있습니다.");
  }

  if(text.length === 0){
    text.push("재정 흐름은 안정적인 관리와 장기적인 계획 중심으로 보는 것이 좋습니다.");
  }

  return text.join(" ");
}

function healthInterpret(planets, houses){
  const marsHouse = getPlanetHouse(houses,"mars");
  const saturnHouse = getPlanetHouse(houses,"saturn");

  let text = [];

  if(marsHouse === 6){
    text.push("활동량이 증가하거나 생활 리듬을 바꾸려는 에너지가 나타날 수 있습니다.");
  }

  if(saturnHouse === 6){
    text.push("건강과 생활 루틴을 점검하고 정리하기 좋은 시기입니다.");
  }

  if(text.length === 0){
    text.push("건강 흐름은 큰 변동보다는 꾸준한 관리가 중요한 상태입니다.");
  }

  return text.join(" ");
}

export function buildLifeAreaInterpretation(planets, houses){

  return {
    career: careerInterpret(planets,houses),
    love: loveInterpret(planets,houses),
    money: moneyInterpret(planets,houses),
    health: healthInterpret(planets,houses)
  };
}

function normalizeAngleDiff(a, b){
  let diff = Math.abs(Number(a || 0) - Number(b || 0)) % 360;
  if(diff > 180) diff = 360 - diff;
  return diff;
}

function isWithinOrb(diff, target, orb){
  return Math.abs(diff - target) <= orb;
}

function getAspectType(diff){
  const orb = 5;

  if(isWithinOrb(diff, 0, orb)){
    return { key: "conjunction", label: "합", angle: 0, orb: Math.abs(diff - 0) };
  }

  if(isWithinOrb(diff, 60, orb)){
    return { key: "sextile", label: "육합", angle: 60, orb: Math.abs(diff - 60) };
  }

  if(isWithinOrb(diff, 90, orb)){
    return { key: "square", label: "사각", angle: 90, orb: Math.abs(diff - 90) };
  }

  if(isWithinOrb(diff, 120, orb)){
    return { key: "trine", label: "삼합", angle: 120, orb: Math.abs(diff - 120) };
  }

  if(isWithinOrb(diff, 180, orb)){
    return { key: "opposition", label: "충", angle: 180, orb: Math.abs(diff - 180) };
  }

  return null;
}

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

function getNatalPlanetMeaning(key){
  const map = {
    sun: "기본 성향과 중심 정체성",
    moon: "감정 반응과 심리적 안정감",
    mercury: "생각, 말, 판단 방식",
    venus: "관계, 호감, 취향과 애정 방식",
    mars: "행동력, 추진력, 예민함",
    jupiter: "성장, 확장, 기회 포착",
    saturn: "책임감, 구조, 부담과 성실함",
    uranus: "변화 욕구와 독립성",
    neptune: "직감, 이상, 감수성",
    pluto: "집중력, 압축, 깊은 변화"
  };

  return map[key] || "";
}

function getTransitPlanetMeaning(key){
  const map = {
    sun: "현재 전체 분위기와 중심 주제",
    moon: "오늘의 체감 감정과 컨디션",
    mercury: "대화, 전달, 일정 조율",
    venus: "관계, 호감, 소비 흐름",
    mars: "행동, 속도, 충동성",
    jupiter: "확장, 기회, 낙관",
    saturn: "점검, 책임, 제약",
    uranus: "예상 밖 변화",
    neptune: "감성, 흐림, 직감",
    pluto: "강한 몰입과 변화 압력"
  };

  return map[key] || "";
}

export function buildTransitToNatalAspects(natalPlanets, transitPlanets){
  if(!natalPlanets || !transitPlanets) return [];

  const natalKeys = Object.keys(natalPlanets);
  const transitKeys = Object.keys(transitPlanets);
  const result = [];

  natalKeys.forEach(natalKey => {
    transitKeys.forEach(transitKey => {
      const natal = natalPlanets[natalKey];
      const transit = transitPlanets[transitKey];

      if(!natal || !transit) return;

      const diff = normalizeAngleDiff(natal.longitude, transit.longitude);
      const aspect = getAspectType(diff);

      if(!aspect) return;

      result.push({
        natalKey,
        transitKey,
        natalLabel: getPlanetLabel(natalKey),
        transitLabel: getPlanetLabel(transitKey),
        natalMeaning: getNatalPlanetMeaning(natalKey),
        transitMeaning: getTransitPlanetMeaning(transitKey),
        aspectKey: aspect.key,
        aspectLabel: aspect.label,
        angle: aspect.angle,
        diff: Number(diff.toFixed(2)),
        orb: Number(aspect.orb.toFixed(2))
      });
    });
  });

  return result.sort((a, b) => a.orb - b.orb).slice(0, 8);
}

export function buildTransitNarratives(aspects){
  if(!Array.isArray(aspects) || aspects.length === 0) return [];

  return aspects.map(item => {
    let flow = "";

    if(item.aspectKey === "conjunction"){
      flow = "영향이 직접적으로 강하게 겹쳐 현재 체감이 매우 뚜렷해질 수 있습니다.";
    }else if(item.aspectKey === "sextile"){
      flow = "상대적으로 부드럽고 활용하기 쉬운 흐름으로 작동할 가능성이 큽니다.";
    }else if(item.aspectKey === "square"){
      flow = "긴장과 마찰이 생기기 쉬워 조정과 점검이 필요한 흐름입니다.";
    }else if(item.aspectKey === "trine"){
      flow = "자연스럽게 이어져 비교적 편안하게 힘을 쓸 수 있는 흐름입니다.";
    }else if(item.aspectKey === "opposition"){
      flow = "양쪽 방향이 맞서기 쉬워 균형과 선택이 중요해집니다.";
    }

    return `${item.transitLabel}이 내 ${item.natalLabel}과 ${item.aspectLabel}(${item.angle}°) 각을 이루고 있습니다. ${item.transitLabel}은 ${item.transitMeaning}, 내 ${item.natalLabel}은 ${item.natalMeaning}을 뜻하므로, 현재는 ${flow}`;
  });
}

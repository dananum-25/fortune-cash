function normalizeAngleDiff(a, b){
  let diff = Math.abs(Number(a || 0) - Number(b || 0)) % 360;
  if(diff > 180) diff = 360 - diff;
  return diff;
}

function isWithinOrb(diff, target, orb){
  return Math.abs(diff - target) <= orb;
}

function getAspectType(diff){
  const orb = 6;

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

function getAspectMeaning(aspectKey){
  const map = {
    conjunction: "두 흐름이 강하게 겹치며 영향이 직접적으로 커지는 구조",
    sextile: "부드럽게 협력하며 활용하기 좋은 구조",
    square: "긴장과 마찰이 생기기 쉬워 조정이 필요한 구조",
    trine: "흐름이 자연스럽게 이어져 비교적 편하게 작동하는 구조",
    opposition: "양쪽 방향이 맞서며 균형이나 선택이 중요해지는 구조"
  };

  return map[aspectKey] || "";
}

function getPlanetRole(key){
  const map = {
    sun: "전체 방향성과 중심 주제",
    moon: "감정 반응과 컨디션",
    mercury: "대화, 전달, 사고 방식",
    venus: "관계, 호감, 소비 감각",
    mars: "행동력, 추진력, 예민함",
    jupiter: "확장, 기회, 낙관성",
    saturn: "책임, 제약, 구조화",
    uranus: "변화, 돌발성, 혁신",
    neptune: "직감, 이상, 흐림",
    pluto: "집중, 압축, 깊은 변화"
  };

  return map[key] || "";
}

export function buildPlanetAspects(planets){
  if(!planets) return [];

  const keys = Object.keys(planets);
  const aspects = [];

  for(let i = 0; i < keys.length; i++){
    for(let j = i + 1; j < keys.length; j++){
      const aKey = keys[i];
      const bKey = keys[j];

      const a = planets[aKey];
      const b = planets[bKey];

      if(!a || !b) continue;

      const diff = normalizeAngleDiff(a.longitude, b.longitude);
      const aspect = getAspectType(diff);

      if(!aspect) continue;

      aspects.push({
        aKey,
        bKey,
        aLabel: getPlanetLabel(aKey),
        bLabel: getPlanetLabel(bKey),
        aRole: getPlanetRole(aKey),
        bRole: getPlanetRole(bKey),
        aspectKey: aspect.key,
        aspectLabel: aspect.label,
        angle: aspect.angle,
        diff: Number(diff.toFixed(2)),
        orb: Number(aspect.orb.toFixed(2)),
        meaning: getAspectMeaning(aspect.key)
      });
    }
  }

  return aspects.sort((x, y) => x.orb - y.orb);
}

export function buildAspectNarratives(aspects){
  if(!Array.isArray(aspects) || aspects.length === 0){
    return [];
  }

  return aspects.slice(0, 5).map(item => {
    return `${item.aLabel}과 ${item.bLabel}이 ${item.aspectLabel}(${item.angle}°) 각을 이루고 있습니다. ${item.aLabel}은 ${item.aRole}, ${item.bLabel}은 ${item.bRole}을 뜻하므로, 현재는 ${item.meaning}로 해석할 수 있습니다.`;
  });
}

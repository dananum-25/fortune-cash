import { buildAstronomySnapshot } from "/js/astro/adapters/astronomy-engine.adapter.js";

function getPlanetLabel(key){
  const map = {
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

function normalizeDiff(nextLongitude, currentLongitude){
  let diff = Number(nextLongitude || 0) - Number(currentLongitude || 0);

  if(diff > 180) diff -= 360;
  if(diff < -180) diff += 360;

  return diff;
}

export function buildRetrogradeStatus(date){
  if(!(date instanceof Date) || Number.isNaN(date.getTime())){
    console.warn("[astro-retrograde] invalid date", date);
    return null;
  }

  const tomorrow = new Date(date.getTime() + 24 * 60 * 60 * 1000);

  const todaySnapshot = buildAstronomySnapshot(date);
  const tomorrowSnapshot = buildAstronomySnapshot(tomorrow);

  if(!todaySnapshot?.planets || !tomorrowSnapshot?.planets){
    console.warn("[astro-retrograde] snapshot build failed");
    return null;
  }

  const keys = [
    "mercury",
    "venus",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
    "pluto"
  ];

  const result = {};

  keys.forEach(key => {
    const todayPlanet = todaySnapshot.planets[key];
    const tomorrowPlanet = tomorrowSnapshot.planets[key];

    if(!todayPlanet || !tomorrowPlanet){
      return;
    }

    const delta = normalizeDiff(
      tomorrowPlanet.longitude,
      todayPlanet.longitude
    );

    result[key] = {
      label: getPlanetLabel(key),
      motion: delta < 0 ? "retrograde" : "direct",
      delta: Number(delta.toFixed(6))
    };
  });

  return result;
}

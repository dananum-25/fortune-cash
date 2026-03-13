function normalizeDegree(deg){
  let v = Number(deg || 0) % 360;
  if(v < 0) v += 360;
  return v;
}

function degreeToSign(longitude){
  const signs = [
    "양자리","황소자리","쌍둥이자리","게자리",
    "사자자리","처녀자리","천칭자리","전갈자리",
    "사수자리","염소자리","물병자리","물고기자리"
  ];

  const normalized = normalizeDegree(longitude);
  const signIndex = Math.floor(normalized / 30);
  const degree = normalized % 30;

  return {
    longitude: Number(normalized.toFixed(6)),
    degree: Number(degree.toFixed(2)),
    signIndex,
    signName: signs[signIndex]
  };
}

export function buildEqualHouseCusps(ascendantLongitude){
  const asc = normalizeDegree(ascendantLongitude);
  const houses = [];

  for(let i = 0; i < 12; i++){
    const cuspLongitude = normalizeDegree(asc + (i * 30));
    const zodiac = degreeToSign(cuspLongitude);

    houses.push({
      house: i + 1,
      cuspLongitude: zodiac.longitude,
      cuspDegree: zodiac.degree,
      cuspSignIndex: zodiac.signIndex,
      cuspSignName: zodiac.signName
    });
  }

  return houses;
}

function isLongitudeInHouse(targetLongitude, startLongitude, endLongitude){
  const target = normalizeDegree(targetLongitude);
  const start = normalizeDegree(startLongitude);
  const end = normalizeDegree(endLongitude);

  if(start < end){
    return target >= start && target < end;
  }

  return target >= start || target < end;
}

export function findPlanetHouse(planetLongitude, houses){
  if(!Array.isArray(houses) || houses.length !== 12){
    return null;
  }

  for(let i = 0; i < 12; i++){
    const current = houses[i];
    const next = houses[(i + 1) % 12];

    if(
      isLongitudeInHouse(
        planetLongitude,
        current.cuspLongitude,
        next.cuspLongitude
      )
    ){
      return current.house;
    }
  }

  return null;
}

export function buildPlanetHousePlacements(planets, houses){
  if(!planets || !houses) return {};

  const placements = {};

  Object.keys(planets).forEach(key => {
    const item = planets[key];
    placements[key] = {
      ...item,
      house: findPlanetHouse(item.longitude, houses)
    };
  });

  return placements;
}

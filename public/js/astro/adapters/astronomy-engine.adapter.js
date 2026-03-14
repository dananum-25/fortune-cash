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

function buildSafeBirthDate(birthDate, birthTime){
  const safeDate = String(birthDate || "1940-01-01");
  const safeTime = String(birthTime || "11:00");

  const dateParts = safeDate.split("-");
  const timeParts = safeTime.split(":");

  const year = Number(dateParts[0]);
  const monthIndex = Number(dateParts[1]) - 1;
  const day = Number(dateParts[2]);

  const hour = Number(timeParts[0]);
  const minute = Number(timeParts[1]);

  const date = new Date(Date.UTC(year, monthIndex, day, hour - 9, minute, 0));

  if(!(date instanceof Date) || Number.isNaN(date.getTime())){
    console.warn("[astronomy-engine] invalid birth date", { birthDate, birthTime });
    return new Date(Date.UTC(1940, 0, 1, 2, 0, 0));
  }

  return date;
}

export function buildAstronomySnapshotFromBirth({ birthDate, birthTime }){
  const date = buildSafeBirthDate(birthDate, birthTime);
  return buildAstronomySnapshot(date);
}

function vectorToEclipticLongitude(vec){
  const rot = Astronomy.Rotation_EQJ_ECL();
  const eclVec = Astronomy.RotateVector(rot, vec);
  const sphere = Astronomy.SphereFromVector(eclVec);
  return normalizeDegree(sphere.lon);
}

export function buildAstronomySnapshot(date){
  if(typeof Astronomy === "undefined"){
    console.warn("[astronomy-engine] library not loaded");
    return null;
  }

  if(!(date instanceof Date) || Number.isNaN(date.getTime())){
    console.warn("[astronomy-engine] invalid date input", date);
    return null;
  }

  const time = new Astronomy.AstroTime(date);

  function planet(body){
    const vec = Astronomy.GeoVector(body, time, false);
    const longitude = vectorToEclipticLongitude(vec);
    return degreeToSign(longitude);
  }

  const planets = {
    sun: planet(Astronomy.Body.Sun),
    moon: planet(Astronomy.Body.Moon),
    mercury: planet(Astronomy.Body.Mercury),
    venus: planet(Astronomy.Body.Venus),
    mars: planet(Astronomy.Body.Mars),
    jupiter: planet(Astronomy.Body.Jupiter),
    saturn: planet(Astronomy.Body.Saturn),
    uranus: planet(Astronomy.Body.Uranus),
    neptune: planet(Astronomy.Body.Neptune),
    pluto: planet(Astronomy.Body.Pluto)
  };

  return {
    date,
    planets
  };
}

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

function parseBirthToDate(birthDate, birthTime){
  const safeDate = String(birthDate || "1940-01-01");
  const safeTime = String(birthTime || "11:00");
  const iso = `${safeDate}T${safeTime}:00+09:00`;
  return new Date(iso);
}

export function buildAscendantSnapshot({ birthDate, birthTime, geo }){
  if(typeof Astronomy === "undefined"){
    console.warn("[astronomy-ascendant] library not loaded");
    return null;
  }

  if(!geo || typeof geo.lat !== "number" || typeof geo.lon !== "number"){
    console.warn("[astronomy-ascendant] invalid geo");
    return null;
  }

  const date = parseBirthToDate(birthDate, birthTime);
  const time = new Astronomy.AstroTime(date);
  const observer = new Astronomy.Observer(geo.lat, geo.lon, geo.elevation || 0);

  const horizon = Astronomy.Horizon(time, observer, 90, 0, "normal");

  if(!horizon || typeof horizon.ra !== "number"){
    console.warn("[astronomy-ascendant] horizon calc failed");
    return null;
  }

  const rotation = Astronomy.Rotation_EQJ_ECL();
  const vecEq = Astronomy.VectorFromSphere({ lat: 0, lon: horizon.ra, dist: 1 });
  const vecEcl = Astronomy.RotateVector(rotation, vecEq);
  const sphere = Astronomy.SphereFromVector(vecEcl);

  const ascLongitude = normalizeDegree(sphere.lon);
  const zodiac = degreeToSign(ascLongitude);

  return {
    birthDate,
    birthTime,
    latitude: geo.lat,
    longitudeGeo: geo.lon,
    ascendantLongitude: zodiac.longitude,
    ascendantDegree: zodiac.degree,
    ascendantSignIndex: zodiac.signIndex,
    ascendantSignName: zodiac.signName
  };
}

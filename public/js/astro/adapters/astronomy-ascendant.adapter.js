const DEFAULT_ASC_LAT = 37.57295;
const DEFAULT_ASC_LON = 126.97936;
const DEFAULT_ASC_ELEVATION = 0;

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
    return new Date(Date.UTC(1940, 0, 1, 2, 0, 0));
  }

  return date;
}

function toNumber(v){
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function resolveGeo(geo){
  const lat =
    toNumber(geo?.lat) ??
    toNumber(geo?.latitude) ??
    DEFAULT_ASC_LAT;

  const lon =
    toNumber(geo?.lon) ??
    toNumber(geo?.lng) ??
    toNumber(geo?.longitude) ??
    DEFAULT_ASC_LON;

  const elevation =
    toNumber(geo?.elevation) ??
    toNumber(geo?.altitude) ??
    DEFAULT_ASC_ELEVATION;

  return { lat, lon, elevation };
}

export function buildAscendantSnapshot({ birthDate, birthTime, geo }){
  if(typeof Astronomy === "undefined"){
    console.warn("[astronomy-ascendant] library not loaded");
    return null;
  }

  const safeDate = buildSafeBirthDate(birthDate, birthTime);
  const resolvedGeo = resolveGeo(geo);

  if(
    !Number.isFinite(resolvedGeo.lat) ||
    !Number.isFinite(resolvedGeo.lon)
  ){
    console.warn("[astronomy-ascendant] invalid geo", geo);
    return null;
  }

  const observer = new Astronomy.Observer(
    resolvedGeo.lat,
    resolvedGeo.lon,
    resolvedGeo.elevation
  );

  const horizon = Astronomy.Horizon(safeDate, observer, 90, 0);

  if(!horizon || typeof horizon.ra !== "number"){
    console.warn("[astronomy-ascendant] horizon calc failed");
    return null;
  }

  const rotation = Astronomy.Rotation_EQJ_ECL();
  const vecEq = Astronomy.VectorFromSphere({
    lat: 0,
    lon: horizon.ra,
    dist: 1
  });
  const vecEcl = Astronomy.RotateVector(rotation, vecEq);
  const sphere = Astronomy.SphereFromVector(vecEcl);

  const ascLongitude = normalizeDegree(sphere.lon);
  const zodiac = degreeToSign(ascLongitude);

  return {
    birthDate,
    birthTime,
    latitude: resolvedGeo.lat,
    longitudeGeo: resolvedGeo.lon,
    ascendantLongitude: zodiac.longitude,
    ascendantDegree: zodiac.degree,
    ascendantSignIndex: zodiac.signIndex,
    ascendantSignName: zodiac.signName
  };
}

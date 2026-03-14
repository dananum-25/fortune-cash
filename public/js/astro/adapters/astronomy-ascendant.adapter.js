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

function parseBirthToDate(birthDate, birthTime){

  const safeDate = birthDate || "1940-01-01";
  const safeTime = birthTime || "11:00";

  const parts = safeDate.split("-");
  const timeParts = safeTime.split(":");

  const y = Number(parts[0]);
  const m = Number(parts[1]) - 1;
  const d = Number(parts[2]);

  const hh = Number(timeParts[0]);
  const mm = Number(timeParts[1]);

  const date = new Date(Date.UTC(y, m, d, hh - 9, mm, 0));

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

  const resolvedGeo = resolveGeo(geo);

  if(
    !Number.isFinite(resolvedGeo.lat) ||
    !Number.isFinite(resolvedGeo.lon)
  ){
    console.warn("[astronomy-ascendant] invalid geo", geo);
    return null;
  }

  const date = parseBirthToDate(birthDate, birthTime);
  const time = new Astronomy.AstroTime(date);
  const observer = new Astronomy.Observer(
    resolvedGeo.lat,
    resolvedGeo.lon,
    resolvedGeo.elevation
  );

  const horizon = Astronomy.Horizon(time, observer, 90, 0);

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
    latitude: resolvedGeo.lat,
    longitudeGeo: resolvedGeo.lon,
    ascendantLongitude: zodiac.longitude,
    ascendantDegree: zodiac.degree,
    ascendantSignIndex: zodiac.signIndex,
    ascendantSignName: zodiac.signName
  };
}

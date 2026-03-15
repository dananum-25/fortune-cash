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

function toRadians(deg){
  return deg * Math.PI / 180;
}

function toDegrees(rad){
  return rad * 180 / Math.PI;
}

function julianDay(date){
  return (date.getTime() / 86400000) + 2440587.5;
}

function meanObliquityDeg(T){
  return 23.439291 - (0.0130042 * T);
}

function localSiderealTimeDeg(jd, longitude){
  const T = (jd - 2451545.0) / 36525.0;

  let gmst =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000.0;

  gmst = normalizeDegree(gmst);

  return normalizeDegree(gmst + longitude);
}

function calculateAscendantLongitude(date, latitude, longitude){
  const jd = julianDay(date);
  const T = (jd - 2451545.0) / 36525.0;

  const eps = toRadians(meanObliquityDeg(T));
  const theta = toRadians(localSiderealTimeDeg(jd, longitude));

  const safeLat = Math.max(-89.9999, Math.min(89.9999, latitude));
  const phi = toRadians(safeLat);

  const numerator = -Math.cos(theta);
  const denominator =
    (Math.sin(theta) * Math.cos(eps)) +
    (Math.tan(phi) * Math.sin(eps));

  const lambda = Math.atan2(numerator, denominator);

  return normalizeDegree(toDegrees(lambda));
}

export function buildAscendantSnapshot({ birthDate, birthTime, geo }){
  const safeDate = buildSafeBirthDate(birthDate, birthTime);
  const resolvedGeo = resolveGeo(geo);

  if(
    !Number.isFinite(resolvedGeo.lat) ||
    !Number.isFinite(resolvedGeo.lon)
  ){
    console.warn("[astronomy-ascendant] invalid geo", geo);
    return null;
  }

  const ascLongitude = calculateAscendantLongitude(
    safeDate,
    resolvedGeo.lat,
    resolvedGeo.lon
  );

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

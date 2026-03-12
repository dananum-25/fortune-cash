// /js/astro/core/astro.geocode.js

const KOREA_LOCATION_DB = [
  {
    key: "seoul",
    names: ["서울", "서울시", "서울특별시", "seoul"],
    label: "서울특별시",
    lat: 37.5665,
    lng: 126.9780,
    timezone: "Asia/Seoul"
  },
  {
    key: "busan",
    names: ["부산", "부산시", "부산광역시", "busan"],
    label: "부산광역시",
    lat: 35.1796,
    lng: 129.0756,
    timezone: "Asia/Seoul"
  },
  {
    key: "daegu",
    names: ["대구", "대구시", "대구광역시", "daegu"],
    label: "대구광역시",
    lat: 35.8714,
    lng: 128.6014,
    timezone: "Asia/Seoul"
  },
  {
    key: "incheon",
    names: ["인천", "인천시", "인천광역시", "incheon"],
    label: "인천광역시",
    lat: 37.4563,
    lng: 126.7052,
    timezone: "Asia/Seoul"
  },
  {
    key: "gwangju",
    names: ["광주", "광주시", "광주광역시", "gwangju"],
    label: "광주광역시",
    lat: 35.1595,
    lng: 126.8526,
    timezone: "Asia/Seoul"
  },
  {
    key: "daejeon",
    names: ["대전", "대전시", "대전광역시", "daejeon"],
    label: "대전광역시",
    lat: 36.3504,
    lng: 127.3845,
    timezone: "Asia/Seoul"
  },
  {
    key: "ulsan",
    names: ["울산", "울산시", "울산광역시", "ulsan"],
    label: "울산광역시",
    lat: 35.5384,
    lng: 129.3114,
    timezone: "Asia/Seoul"
  },
  {
    key: "sejong",
    names: ["세종", "세종시", "세종특별자치시", "sejong"],
    label: "세종특별자치시",
    lat: 36.4800,
    lng: 127.2890,
    timezone: "Asia/Seoul"
  },
  {
    key: "gyeonggi",
    names: ["경기", "경기도", "gyeonggi"],
    label: "경기도",
    lat: 37.4138,
    lng: 127.5183,
    timezone: "Asia/Seoul"
  },
  {
    key: "gangwon",
    names: ["강원", "강원도", "강원특별자치도", "gangwon"],
    label: "강원특별자치도",
    lat: 37.8228,
    lng: 128.1555,
    timezone: "Asia/Seoul"
  },
  {
    key: "chungbuk",
    names: ["충북", "충청북도", "chungbuk"],
    label: "충청북도",
    lat: 36.6357,
    lng: 127.4917,
    timezone: "Asia/Seoul"
  },
  {
    key: "chungnam",
    names: ["충남", "충청남도", "chungnam"],
    label: "충청남도",
    lat: 36.5184,
    lng: 126.8000,
    timezone: "Asia/Seoul"
  },
  {
    key: "jeonbuk",
    names: ["전북", "전라북도", "전북특별자치도", "jeonbuk"],
    label: "전북특별자치도",
    lat: 35.7175,
    lng: 127.1530,
    timezone: "Asia/Seoul"
  },
  {
    key: "jeonnam",
    names: ["전남", "전라남도", "jeonnam"],
    label: "전라남도",
    lat: 34.8679,
    lng: 126.9910,
    timezone: "Asia/Seoul"
  },
  {
    key: "gyeongbuk",
    names: ["경북", "경상북도", "gyeongbuk"],
    label: "경상북도",
    lat: 36.4919,
    lng: 128.8889,
    timezone: "Asia/Seoul"
  },
  {
    key: "gyeongnam",
    names: ["경남", "경상남도", "gyeongnam"],
    label: "경상남도",
    lat: 35.4606,
    lng: 128.2132,
    timezone: "Asia/Seoul"
  },
  {
    key: "jeju",
    names: ["제주", "제주시", "제주도", "제주특별자치도", "jeju"],
    label: "제주특별자치도",
    lat: 33.4996,
    lng: 126.5312,
    timezone: "Asia/Seoul"
  }
];

const DEFAULT_GEOCODE_RESULT = {
  key: "seoul",
  label: "서울특별시",
  lat: 37.5665,
  lng: 126.9780,
  timezone: "Asia/Seoul",
  matched: false,
  source: "default"
};

function normalizePlaceText(v){
  return String(v || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

function scoreMatch(input, candidateNames){
  const normalizedInput = normalizePlaceText(input);
  if(!normalizedInput) return 0;

  let score = 0;

  for(const name of candidateNames){
    const n = normalizePlaceText(name);

    if(normalizedInput === n){
      score = Math.max(score, 100);
      continue;
    }

    if(normalizedInput.includes(n)){
      score = Math.max(score, 70 + n.length);
      continue;
    }

    if(n.includes(normalizedInput)){
      score = Math.max(score, 40 + normalizedInput.length);
    }
  }

  return score;
}

export function geocodeKoreanBirthplace(placeText){
  const raw = String(placeText || "").trim();

  if(!raw){
    return {
      ...DEFAULT_GEOCODE_RESULT,
      matched: false,
      source: "empty_input"
    };
  }

  let best = null;
  let bestScore = 0;

  for(const item of KOREA_LOCATION_DB){
    const s = scoreMatch(raw, item.names || []);
    if(s > bestScore){
      bestScore = s;
      best = item;
    }
  }

  if(best && bestScore > 0){
    return {
      key: best.key,
      label: best.label,
      lat: best.lat,
      lng: best.lng,
      timezone: best.timezone,
      matched: true,
      source: "korea_location_db",
      input: raw
    };
  }

  return {
    ...DEFAULT_GEOCODE_RESULT,
    matched: false,
    source: "default_fallback",
    input: raw
  };
}

export function getKoreanLocationOptions(){
  return KOREA_LOCATION_DB.map(item => ({
    key: item.key,
    label: item.label,
    lat: item.lat,
    lng: item.lng,
    timezone: item.timezone
  }));
}

export function enrichBirthplaceInput(placeText){
  const result = geocodeKoreanBirthplace(placeText);

  return {
    birthPlaceText: result.input || placeText || result.label,
    lat: result.lat,
    lng: result.lng,
    timezone: result.timezone,
    geoLabel: result.label,
    geoMatched: result.matched,
    geoSource: result.source
  };
}

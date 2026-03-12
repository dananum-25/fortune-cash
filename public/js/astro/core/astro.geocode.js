const KOREA_LOCATION_DB = [
  {
    key: "seoul",
    names: ["서울", "서울시", "서울특별시", "종로", "종로구", "중구", "강남", "강남구", "송파", "송파구", "마포", "마포구", "노원", "노원구", "seoul"],
    label: "서울특별시",
    lat: 37.5665,
    lng: 126.9780,
    timezone: "Asia/Seoul"
  },
  {
    key: "busan",
    names: ["부산", "부산시", "부산광역시", "해운대", "해운대구", "부산진구", "사하구", "동래구", "busan"],
    label: "부산광역시",
    lat: 35.1796,
    lng: 129.0756,
    timezone: "Asia/Seoul"
  },
  {
    key: "daegu",
    names: ["대구", "대구시", "대구광역시", "중구대구", "수성구", "달서구", "북구대구", "daegu"],
    label: "대구광역시",
    lat: 35.8714,
    lng: 128.6014,
    timezone: "Asia/Seoul"
  },
  {
    key: "incheon",
    names: ["인천", "인천시", "인천광역시", "부평", "부평구", "연수구", "남동구", "미추홀구", "incheon"],
    label: "인천광역시",
    lat: 37.4563,
    lng: 126.7052,
    timezone: "Asia/Seoul"
  },
  {
    key: "gwangju",
    names: ["광주", "광주시", "광주광역시", "북구광주", "서구광주", "광산구", "gwangju"],
    label: "광주광역시",
    lat: 35.1595,
    lng: 126.8526,
    timezone: "Asia/Seoul"
  },
  {
    key: "daejeon",
    names: ["대전", "대전시", "대전광역시", "유성구", "서구대전", "중구대전", "daejeon"],
    label: "대전광역시",
    lat: 36.3504,
    lng: 127.3845,
    timezone: "Asia/Seoul"
  },
  {
    key: "ulsan",
    names: ["울산", "울산시", "울산광역시", "남구울산", "중구울산", "동구울산", "ulsan"],
    label: "울산광역시",
    lat: 35.5384,
    lng: 129.3114,
    timezone: "Asia/Seoul"
  },
  {
    key: "sejong",
    names: ["세종", "세종시", "세종특별자치시", "조치원", "sejong"],
    label: "세종특별자치시",
    lat: 36.4800,
    lng: 127.2890,
    timezone: "Asia/Seoul"
  },
  {
    key: "suwon",
    names: ["수원", "수원시", "장안구", "권선구", "팔달구", "영통구", "suwon"],
    label: "경기도 수원시",
    lat: 37.2636,
    lng: 127.0286,
    timezone: "Asia/Seoul"
  },
  {
    key: "seongnam",
    names: ["성남", "성남시", "분당", "분당구", "판교", "수정구", "중원구", "seongnam"],
    label: "경기도 성남시",
    lat: 37.4200,
    lng: 127.1265,
    timezone: "Asia/Seoul"
  },
  {
    key: "goyang",
    names: ["고양", "고양시", "일산", "일산동구", "일산서구", "덕양구", "goyang"],
    label: "경기도 고양시",
    lat: 37.6584,
    lng: 126.8320,
    timezone: "Asia/Seoul"
  },
  {
    key: "yongin",
    names: ["용인", "용인시", "기흥", "기흥구", "수지", "수지구", "처인구", "yongin"],
    label: "경기도 용인시",
    lat: 37.2411,
    lng: 127.1776,
    timezone: "Asia/Seoul"
  },
  {
    key: "anyang",
    names: ["안양", "안양시", "동안구", "만안구", "anyang"],
    label: "경기도 안양시",
    lat: 37.3943,
    lng: 126.9568,
    timezone: "Asia/Seoul"
  },
  {
    key: "bucheon",
    names: ["부천", "부천시", "원미", "오정", "소사", "bucheon"],
    label: "경기도 부천시",
    lat: 37.5034,
    lng: 126.7660,
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
    key: "gangneung",
    names: ["강릉", "강릉시", "gangneung"],
    label: "강원특별자치도 강릉시",
    lat: 37.7519,
    lng: 128.8761,
    timezone: "Asia/Seoul"
  },
  {
    key: "wonju",
    names: ["원주", "원주시", "wonju"],
    label: "강원특별자치도 원주시",
    lat: 37.3422,
    lng: 127.9202,
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
    key: "cheongju",
    names: ["청주", "청주시", "상당구", "흥덕구", "서원구", "청원구", "cheongju"],
    label: "충청북도 청주시",
    lat: 36.6424,
    lng: 127.4890,
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
    key: "cheonan",
    names: ["천안", "천안시", "동남구", "서북구", "cheonan"],
    label: "충청남도 천안시",
    lat: 36.8151,
    lng: 127.1139,
    timezone: "Asia/Seoul"
  },
  {
    key: "asan",
    names: ["아산", "아산시", "asan"],
    label: "충청남도 아산시",
    lat: 36.7898,
    lng: 127.0018,
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
    key: "jeonju",
    names: ["전주", "전주시", "완산구", "덕진구", "jeonju"],
    label: "전북특별자치도 전주시",
    lat: 35.8242,
    lng: 127.1480,
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
    key: "mokpo",
    names: ["목포", "목포시", "mokpo"],
    label: "전라남도 목포시",
    lat: 34.8118,
    lng: 126.3922,
    timezone: "Asia/Seoul"
  },
  {
    key: "yeosu",
    names: ["여수", "여수시", "yeosu"],
    label: "전라남도 여수시",
    lat: 34.7604,
    lng: 127.6622,
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
    key: "pohang",
    names: ["포항", "포항시", "남구포항", "북구포항", "pohang"],
    label: "경상북도 포항시",
    lat: 36.0190,
    lng: 129.3435,
    timezone: "Asia/Seoul"
  },
  {
    key: "gumi",
    names: ["구미", "구미시", "gumi"],
    label: "경상북도 구미시",
    lat: 36.1195,
    lng: 128.3446,
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
    key: "changwon",
    names: ["창원", "창원시", "마산", "진해", "의창구", "성산구", "changwon"],
    label: "경상남도 창원시",
    lat: 35.2281,
    lng: 128.6811,
    timezone: "Asia/Seoul"
  },
  {
    key: "jinju",
    names: ["진주", "진주시", "jinju"],
    label: "경상남도 진주시",
    lat: 35.1800,
    lng: 128.1076,
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
    key: "jeju_city",
    names: ["제주시", "제주 시내", "jejusi"],
    label: "제주특별자치도 제주시",
    lat: 33.4996,
    lng: 126.5312,
    timezone: "Asia/Seoul"
  },
  {
    key: "seogwipo",
    names: ["서귀포", "서귀포시", "seogwipo"],
    label: "제주특별자치도 서귀포시",
    lat: 33.2541,
    lng: 126.5601,
    timezone: "Asia/Seoul"
  },
  {
    key: "jeju",
    names: ["제주", "제주도", "제주특별자치도", "jeju"],
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
    .replace(/\s+/g, "")
    .replace(/특별시/g, "")
    .replace(/광역시/g, "")
    .replace(/특별자치시/g, "")
    .replace(/특별자치도/g, "")
    .replace(/자치시/g, "")
    .replace(/자치도/g, "")
    .replace(/도/g, "")
    .replace(/시/g, "")
    .replace(/군/g, "")
    .replace(/구/g, "");
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

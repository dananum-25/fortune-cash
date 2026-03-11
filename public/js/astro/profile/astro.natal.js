// /js/astro/profile/astro.natal.js

import {
  ASTRO_DEFAULT_BIRTH,
  ASTRO_DEFAULT_TIME,
  ASTRO_DEFAULT_TIMEZONE
} from "/js/astro/core/astro.constants.js";

import {
  parseBirthParts,
  toSeedFromBirth
} from "/js/astro/core/astro.utils.js";

import {
  getSunSignProfile
} from "/js/astro/core/astro.zodiac.js";

// 12궁 순서
const SIGNS = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces"
];

// 간이용: sign index
function getSignIndex(sign){
  const idx = SIGNS.indexOf(sign);
  return idx >= 0 ? idx : 0;
}

// 간이용: index -> sign
function getSignByIndex(idx){
  const n = ((idx % 12) + 12) % 12;
  return SIGNS[n];
}

// 간이 달자리 계산 (임시 골격용)
// 추후 실제 천문 계산으로 교체 가능
function getApproxMoonSign(parts){
  const base = (parts.year + parts.month * 3 + parts.day + parts.hour) % 12;
  return getSignByIndex(base);
}

// 간이 상승궁 계산 (임시 골격용)
// 추후 위도/경도 + 실제 시간 계산으로 교체 가능
function getApproxAscSign(parts){
  const base = (parts.month + parts.day + Math.floor(parts.hour / 2)) % 12;
  return getSignByIndex(base);
}

// 간이 MC 계산
function getApproxMcSign(ascSign){
  return getSignByIndex(getSignIndex(ascSign) + 9);
}

// 간이 하우스 분할
function buildApproxHouses(ascSign){
  const ascIndex = getSignIndex(ascSign);

  return Array.from({ length: 12 }, (_, i) => {
    return {
      house: i + 1,
      sign: getSignByIndex(ascIndex + i)
    };
  });
}

// 간이 행성 배치
function buildApproxPlanets(parts, sunSign, moonSign, ascSign){
  const seed = toSeedFromBirth(parts.ymd, parts.hm);

  const sunIndex = getSignIndex(sunSign);
  const moonIndex = getSignIndex(moonSign);
  const ascIndex = getSignIndex(ascSign);

  return {
    sun: {
      sign: sunSign,
      degree: ((parts.day * 1.2) % 30),
      house: ((sunIndex - ascIndex + 12) % 12) + 1
    },
    moon: {
      sign: moonSign,
      degree: ((parts.hour * 2.3 + parts.day) % 30),
      house: ((moonIndex - ascIndex + 12) % 12) + 1
    },
    mercury: {
      sign: getSignByIndex(sunIndex + ((seed % 3) - 1)),
      degree: ((seed % 290) / 10),
      house: ((getSignIndex(getSignByIndex(sunIndex + ((seed % 3) - 1))) - ascIndex + 12) % 12) + 1
    },
    venus: {
      sign: getSignByIndex(sunIndex + ((seed % 5) - 2)),
      degree: ((seed % 260) / 10),
      house: ((getSignIndex(getSignByIndex(sunIndex + ((seed % 5) - 2))) - ascIndex + 12) % 12) + 1
    },
    mars: {
      sign: getSignByIndex(sunIndex + ((seed % 7) - 3)),
      degree: ((seed % 240) / 10),
      house: ((getSignIndex(getSignByIndex(sunIndex + ((seed % 7) - 3))) - ascIndex + 12) % 12) + 1
    },
    jupiter: {
      sign: getSignByIndex((parts.year + 8) % 12),
      degree: ((parts.year + parts.month) % 30),
      house: ((getSignIndex(getSignByIndex((parts.year + 8) % 12)) - ascIndex + 12) % 12) + 1
    },
    saturn: {
      sign: getSignByIndex((parts.year + 4) % 12),
      degree: ((parts.year + parts.day) % 30),
      house: ((getSignIndex(getSignByIndex((parts.year + 4) % 12)) - ascIndex + 12) % 12) + 1
    },
    uranus: {
      sign: getSignByIndex(Math.floor(parts.year / 7) % 12),
      degree: ((parts.year + 11) % 30),
      house: ((getSignIndex(getSignByIndex(Math.floor(parts.year / 7) % 12)) - ascIndex + 12) % 12) + 1
    },
    neptune: {
      sign: getSignByIndex(Math.floor(parts.year / 14) % 12),
      degree: ((parts.year + 17) % 30),
      house: ((getSignIndex(getSignByIndex(Math.floor(parts.year / 14) % 12)) - ascIndex + 12) % 12) + 1
    },
    pluto: {
      sign: getSignByIndex(Math.floor(parts.year / 12) % 12),
      degree: ((parts.year + 23) % 30),
      house: ((getSignIndex(getSignByIndex(Math.floor(parts.year / 12) % 12)) - ascIndex + 12) % 12) + 1
    }
  };
}

export function buildNatalChart(input = {}){
  const birthDate = input.birthDate || ASTRO_DEFAULT_BIRTH;
  const birthTime = input.birthTime || ASTRO_DEFAULT_TIME;
  const timezone = input.timezone || ASTRO_DEFAULT_TIMEZONE;
  const lat = Number(input.lat || 37.5665);
  const lng = Number(input.lng || 126.9780);
  const birthPlaceText = input.birthPlaceText || "Seoul";

  const parts = parseBirthParts(birthDate, birthTime);
  if(!parts){
    return null;
  }

  const sun = getSunSignProfile(parts.month, parts.day);
  const moonSign = getApproxMoonSign(parts);
  const ascSign = getApproxAscSign(parts);
  const mcSign = getApproxMcSign(ascSign);
  const houses = buildApproxHouses(ascSign);
  const planets = buildApproxPlanets(parts, sun.sign, moonSign, ascSign);

  return {
    birth: {
      ymd: parts.ymd,
      hm: parts.hm,
      year: parts.year,
      month: parts.month,
      day: parts.day,
      hour: parts.hour,
      minute: parts.minute,
      timezone,
      birthPlaceText,
      lat,
      lng
    },
    sun: {
      sign: sun.sign,
      nameKo: sun.nameKo,
      element: sun.element,
      modality: sun.modality
    },
    moon: {
      sign: moonSign
    },
    asc: {
      sign: ascSign
    },
    mc: {
      sign: mcSign
    },
    houses,
    planets
  };
}

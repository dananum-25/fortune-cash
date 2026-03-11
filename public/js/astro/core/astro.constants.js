// /js/astro/core/astro.constants.js

export const ASTRO_DEFAULT_BIRTH = "1940-01-01";
export const ASTRO_DEFAULT_TIME = "12:00";
export const ASTRO_DEFAULT_TIMEZONE = "Asia/Seoul";

export const PLANET_KEYS = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto"
];

export const SIGN_KEYS = [
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

export const SIGN_NAMES_KO = {
  aries: "양자리",
  taurus: "황소자리",
  gemini: "쌍둥이자리",
  cancer: "게자리",
  leo: "사자자리",
  virgo: "처녀자리",
  libra: "천칭자리",
  scorpio: "전갈자리",
  sagittarius: "사수자리",
  capricorn: "염소자리",
  aquarius: "물병자리",
  pisces: "물고기자리"
};

export const ELEMENT_BY_SIGN = {
  aries: "fire",
  taurus: "earth",
  gemini: "air",
  cancer: "water",
  leo: "fire",
  virgo: "earth",
  libra: "air",
  scorpio: "water",
  sagittarius: "fire",
  capricorn: "earth",
  aquarius: "air",
  pisces: "water"
};

export const MODALITY_BY_SIGN = {
  aries: "cardinal",
  taurus: "fixed",
  gemini: "mutable",
  cancer: "cardinal",
  leo: "fixed",
  virgo: "mutable",
  libra: "cardinal",
  scorpio: "fixed",
  sagittarius: "mutable",
  capricorn: "cardinal",
  aquarius: "fixed",
  pisces: "mutable"
};

export const ASPECTS = [
  { key: "conjunction", angle: 0, orb: 8 },
  { key: "sextile", angle: 60, orb: 4 },
  { key: "square", angle: 90, orb: 6 },
  { key: "trine", angle: 120, orb: 6 },
  { key: "opposition", angle: 180, orb: 8 }
];

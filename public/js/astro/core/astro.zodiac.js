// /js/astro/core/astro.zodiac.js

import {
  SIGN_NAMES_KO,
  ELEMENT_BY_SIGN,
  MODALITY_BY_SIGN
} from "/js/astro/core/astro.constants.js";

export function getSunSign(month, day){
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return "gemini";
  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return "cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 22)) return "scorpio";
  if ((month === 11 && day >= 23) || (month === 12 && day <= 24)) return "sagittarius";
  if ((month === 12 && day >= 25) || (month === 1 && day <= 19)) return "capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "aquarius";
  return "pisces";
}

export function getSignNameKo(signKey){
  return SIGN_NAMES_KO[signKey] || "별자리";
}

export function getSignElement(signKey){
  return ELEMENT_BY_SIGN[signKey] || "";
}

export function getSignModality(signKey){
  return MODALITY_BY_SIGN[signKey] || "";
}

export function getSunSignProfile(month, day){
  const sign = getSunSign(month, day);
  return {
    sign,
    nameKo: getSignNameKo(sign),
    element: getSignElement(sign),
    modality: getSignModality(sign)
  };
}

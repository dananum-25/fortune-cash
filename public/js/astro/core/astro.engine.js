// /js/astro/engine/astro.engine.js

import { ASTRO_DEFAULT_BIRTH, ASTRO_DEFAULT_TIME } from "/js/astro/core/astro.constants.js";
import { parseBirthParts } from "/js/astro/core/astro.utils.js";
import { getSunSignProfile } from "/js/astro/core/astro.zodiac.js";

export function buildAstroBaseProfile(input = {}){
  const birthDate = input.birthDate || ASTRO_DEFAULT_BIRTH;
  const birthTime = input.birthTime || ASTRO_DEFAULT_TIME;

  const parts = parseBirthParts(birthDate, birthTime);
  if(!parts){
    return null;
  }

  const sun = getSunSignProfile(parts.month, parts.day);

  return {
    birth: {
      ymd: parts.ymd,
      hm: parts.hm,
      year: parts.year,
      month: parts.month,
      day: parts.day,
      hour: parts.hour,
      minute: parts.minute
    },
    sun
  };
}

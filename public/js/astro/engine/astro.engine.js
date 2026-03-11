// /js/astro/engine/astro.engine.js

import {
  ASTRO_DEFAULT_BIRTH,
  ASTRO_DEFAULT_TIME,
  ASTRO_DEFAULT_TIMEZONE
} from "/js/astro/core/astro.constants.js";

import {
  buildNatalChart
} from "/js/astro/profile/astro.natal.js";

import {
  buildPersonalityProfile
} from "/js/astro/profile/astro.personality.js";

import {
  calculateNatalAspects
} from "/js/astro/core/astro.aspects.js";

import {
  buildAstroScores
} from "/js/astro/interpreter/astro.score.js";

export function buildAstroBaseProfile(input = {}){
  const birthDate = input.birthDate || ASTRO_DEFAULT_BIRTH;
  const birthTime = input.birthTime || ASTRO_DEFAULT_TIME;
  const timezone = input.timezone || ASTRO_DEFAULT_TIMEZONE;
  const birthPlaceText = input.birthPlaceText || "Seoul";
  const lat = Number(input.lat || 37.5665);
  const lng = Number(input.lng || 126.9780);

  const natal = buildNatalChart({
    birthDate,
    birthTime,
    timezone,
    birthPlaceText,
    lat,
    lng
  });

  if(!natal){
    return null;
  }

  const personality = buildPersonalityProfile(natal);
  const natalAspects = calculateNatalAspects(natal?.planets || {});
  const scores = buildAstroScores({
    natal,
    personality,
    natalAspects
  });

  return {
    birth: natal.birth,
    natal,
    personality,
    natalAspects,
    scores
  };
}

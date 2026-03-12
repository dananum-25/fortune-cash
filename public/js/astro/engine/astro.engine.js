// /js/astro/engine/astro.engine.js

import {
  ASTRO_DEFAULT_BIRTH,
  ASTRO_DEFAULT_TIME,
  ASTRO_DEFAULT_TIMEZONE
} from "/js/astro/core/astro.constants.js";

import {
  enrichBirthplaceInput
} from "/js/astro/core/astro.geocode.js";

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
  buildTransitChart,
  calculateTransitToNatalAspects
} from "/js/astro/core/astro.transit.js";

import {
  buildAstroScores
} from "/js/astro/interpreter/astro.score.js";

import {
  buildAstroSummary
} from "/js/astro/interpreter/astro.summary.js";

import {
  buildTodaySummary
} from "/js/astro/interpreter/astro.today.js";

import {
  buildMonthSummary
} from "/js/astro/interpreter/astro.month.js";

import {
  buildYearSummary
} from "/js/astro/interpreter/astro.year.js";

export function buildAstroBaseProfile(input = {}){
  const birthDate = input.birthDate || ASTRO_DEFAULT_BIRTH;
  const birthTime = input.birthTime || ASTRO_DEFAULT_TIME;
  const targetDate = input.targetDate || new Date().toISOString().slice(0, 10);

  const geo = enrichBirthplaceInput(
    input.birthPlaceText || input.birthPlace || ""
  );

  const timezone = input.timezone || geo.timezone || ASTRO_DEFAULT_TIMEZONE;
  const birthPlaceText = geo.birthPlaceText || input.birthPlaceText || "Seoul";
  const lat = Number(input.lat ?? geo.lat ?? 37.5665);
  const lng = Number(input.lng ?? geo.lng ?? 126.9780);

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

  const summary = buildAstroSummary({
    natal,
    personality,
    scores,
    natalAspects
  });

  const transit = buildTransitChart({
    targetDate,
    timezone
  });

  const transitAspects = calculateTransitToNatalAspects(
    transit?.planets || {},
    natal?.planets || {}
  );

  const today = buildTodaySummary({
    scores,
    transitAspects,
    targetDate
  });

  const month = buildMonthSummary({
    scores,
    targetDate
  });

  const year = buildYearSummary({
    scores,
    month
  });

  return {
    birth: natal.birth,
    geo,
    natal,
    personality,
    natalAspects,
    scores,
    summary,
    transit,
    transitAspects,
    today,
    month,
    year
  };
}

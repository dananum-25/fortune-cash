// /js/astro/core/astro.transit.js

import { PLANET_KEYS } from "/js/astro/core/astro.constants.js";
import { calculateNatalAspects } from "/js/astro/core/astro.aspects.js";

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

function getSignByIndex(idx){
  const n = ((idx % 12) + 12) % 12;
  return SIGNS[n];
}

function getSignIndex(sign){
  const idx = SIGNS.indexOf(sign);
  return idx >= 0 ? idx : 0;
}

function normalizeYmd(v){
  const s = String(v || "").trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : "";
}

function parseTargetDate(targetDate){
  const ymd = normalizeYmd(targetDate) || normalizeYmd(new Date().toISOString().slice(0, 10));
  const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  return {
    ymd,
    year: Number(m?.[1] || 2000),
    month: Number(m?.[2] || 1),
    day: Number(m?.[3] || 1)
  };
}

// 간이 오늘 행성 배치
function buildTransitPlanets(parts){
  const seed = (parts.year * 10000) + (parts.month * 100) + parts.day;

  const sunIndex = Math.floor((((parts.month - 1) * 30) + parts.day - 1) / 30) % 12;

  return {
    sun: {
      sign: getSignByIndex(sunIndex),
      degree: (((parts.day - 1) % 30) + 0.5)
    },
    moon: {
      sign: getSignByIndex((seed + parts.day) % 12),
      degree: ((seed % 290) / 10)
    },
    mercury: {
      sign: getSignByIndex((sunIndex + ((seed % 3) - 1))),
      degree: ((seed % 260) / 10)
    },
    venus: {
      sign: getSignByIndex((sunIndex + ((seed % 5) - 2))),
      degree: ((seed % 240) / 10)
    },
    mars: {
      sign: getSignByIndex((sunIndex + ((seed % 7) - 3))),
      degree: ((seed % 220) / 10)
    },
    jupiter: {
      sign: getSignByIndex(Math.floor(parts.year / 1.2) % 12),
      degree: ((parts.year + parts.month + parts.day) % 30)
    },
    saturn: {
      sign: getSignByIndex(Math.floor(parts.year / 2.5) % 12),
      degree: ((parts.year + parts.month) % 30)
    },
    uranus: {
      sign: getSignByIndex(Math.floor(parts.year / 7) % 12),
      degree: ((parts.year + 11) % 30)
    },
    neptune: {
      sign: getSignByIndex(Math.floor(parts.year / 14) % 12),
      degree: ((parts.year + 17) % 30)
    },
    pluto: {
      sign: getSignByIndex(Math.floor(parts.year / 12) % 12),
      degree: ((parts.year + 23) % 30)
    }
  };
}

export function buildTransitChart(input = {}){
  const parts = parseTargetDate(input.targetDate);

  return {
    targetDate: parts.ymd,
    planets: buildTransitPlanets(parts)
  };
}

export function calculateTransitToNatalAspects(transitPlanets = {}, natalPlanets = {}){
  const combined = {};

  PLANET_KEYS.forEach(key => {
    if(transitPlanets[key]){
      combined[`t_${key}`] = transitPlanets[key];
    }
    if(natalPlanets[key]){
      combined[`n_${key}`] = natalPlanets[key];
    }
  });

  const all = calculateNatalAspects(combined);

  return all.filter(item => {
    const aTransit = String(item.a).startsWith("t_");
    const bTransit = String(item.b).startsWith("t_");
    const aNatal = String(item.a).startsWith("n_");
    const bNatal = String(item.b).startsWith("n_");

    return (aTransit && bNatal) || (bTransit && aNatal);
  }).map(item => ({
    transit: String(item.a).startsWith("t_") ? item.a.replace("t_", "") : item.b.replace("t_", ""),
    target: String(item.a).startsWith("n_") ? item.a.replace("n_", "") : item.b.replace("n_", ""),
    type: item.type,
    angle: item.angle,
    orb: item.orb,
    diff: item.diff
  }));
}

export function getTransitSignComment(sign){
  const idx = getSignIndex(sign);
  return {
    sign,
    signIndex: idx
  };
}

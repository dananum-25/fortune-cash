// /js/astro/core/astro.aspects.js

import { ASPECTS, PLANET_KEYS } from "/js/astro/core/astro.constants.js";

function normalizeDegree(deg){
  let n = Number(deg);
  if(Number.isNaN(n)) return 0;
  while(n < 0) n += 360;
  while(n >= 360) n -= 360;
  return n;
}

function getPlanetAbsoluteDegree(planet){
  if(!planet) return 0;

  const signOrder = {
    aries: 0,
    taurus: 30,
    gemini: 60,
    cancer: 90,
    leo: 120,
    virgo: 150,
    libra: 180,
    scorpio: 210,
    sagittarius: 240,
    capricorn: 270,
    aquarius: 300,
    pisces: 330
  };

  const signBase = signOrder[planet.sign] ?? 0;
  const degree = Number(planet.degree || 0);

  return normalizeDegree(signBase + degree);
}

function getAngleDiff(a, b){
  const diff = Math.abs(normalizeDegree(a) - normalizeDegree(b));
  return diff > 180 ? 360 - diff : diff;
}

function detectAspect(angleDiff){
  for(const aspect of ASPECTS){
    const orb = Number(aspect.orb || 0);
    const angle = Number(aspect.angle || 0);

    if(Math.abs(angleDiff - angle) <= orb){
      return {
        key: aspect.key,
        targetAngle: angle,
        orb: Math.abs(angleDiff - angle)
      };
    }
  }
  return null;
}

export function calculateNatalAspects(planets = {}){
  const results = [];
  const keys = PLANET_KEYS.filter(k => planets[k]);

  for(let i = 0; i < keys.length; i++){
    for(let j = i + 1; j < keys.length; j++){
      const aKey = keys[i];
      const bKey = keys[j];

      const aDeg = getPlanetAbsoluteDegree(planets[aKey]);
      const bDeg = getPlanetAbsoluteDegree(planets[bKey]);

      const diff = getAngleDiff(aDeg, bDeg);
      const hit = detectAspect(diff);

      if(hit){
        results.push({
          a: aKey,
          b: bKey,
          type: hit.key,
          angle: hit.targetAngle,
          orb: Number(hit.orb.toFixed(2)),
          diff: Number(diff.toFixed(2))
        });
      }
    }
  }

  return results;
}

export function findAspect(aspects = [], a, b, type = ""){
  return aspects.find(item => {
    const samePair =
      (item.a === a && item.b === b) ||
      (item.a === b && item.b === a);

    if(!samePair) return false;
    if(!type) return true;

    return item.type === type;
  }) || null;
}

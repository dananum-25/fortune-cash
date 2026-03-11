// /js/astro/interpreter/astro.score.js

import { findAspect } from "/js/astro/core/astro.aspects.js";

function clampScore(v){
  let n = Number(v || 0);
  if(n > 95) n = 95;
  if(n < 30) n = 30;
  return Math.round(n);
}

function getDominantElement(profile){
  return profile?.balance?.dominantElement || "";
}

function getDominantModality(profile){
  return profile?.balance?.dominantModality || "";
}

export function buildAstroScores({ natal, personality, natalAspects } = {}){
  let scores = {
    overall: 60,
    career: 60,
    wealth: 60,
    love: 60,
    health: 60
  };

  if(!natal || !personality){
    return scores;
  }

  const sunSign = natal?.sun?.sign || "";
  const moonSign = natal?.moon?.sign || "";
  const ascSign = natal?.asc?.sign || "";
  const dominantElement = getDominantElement(personality);
  const dominantModality = getDominantModality(personality);

  // 1) 태양 기본 성향
  if(["capricorn", "virgo", "taurus"].includes(sunSign)){
    scores.career += 6;
    scores.wealth += 4;
  }

  if(["aries", "leo", "sagittarius"].includes(sunSign)){
    scores.overall += 5;
    scores.career += 4;
    scores.health -= 2;
  }

  if(["cancer", "scorpio", "pisces"].includes(sunSign)){
    scores.love += 5;
    scores.health += 2;
  }

  if(["gemini", "libra", "aquarius"].includes(sunSign)){
    scores.love += 4;
    scores.overall += 3;
  }

  // 2) 달 성향
  if(["aries", "leo", "sagittarius"].includes(moonSign)){
    scores.health -= 2;
    scores.love -= 1;
    scores.overall += 2;
  }

  if(["cancer", "pisces", "scorpio"].includes(moonSign)){
    scores.love += 4;
    scores.health += 3;
  }

  if(["taurus", "virgo", "capricorn"].includes(moonSign)){
    scores.wealth += 3;
    scores.career += 2;
  }

  // 3) 상승궁 보정
  if(["capricorn", "taurus"].includes(ascSign)){
    scores.career += 3;
    scores.wealth += 2;
  }

  if(["libra", "pisces"].includes(ascSign)){
    scores.love += 3;
  }

  if(["aries", "scorpio"].includes(ascSign)){
    scores.overall += 2;
    scores.health -= 1;
  }

  // 4) 원소 우세
  if(dominantElement === "earth"){
    scores.career += 5;
    scores.wealth += 5;
  }else if(dominantElement === "fire"){
    scores.overall += 5;
    scores.career += 3;
    scores.health -= 2;
  }else if(dominantElement === "air"){
    scores.love += 4;
    scores.overall += 4;
  }else if(dominantElement === "water"){
    scores.love += 5;
    scores.health += 3;
  }

  // 5) 양식 우세
  if(dominantModality === "cardinal"){
    scores.overall += 4;
    scores.career += 3;
  }else if(dominantModality === "fixed"){
    scores.wealth += 3;
    scores.health += 2;
  }else if(dominantModality === "mutable"){
    scores.love += 2;
    scores.overall += 2;
  }

  // 6) 하우스 기반 간이 보정
  const planets = natal?.planets || {};

  if(planets.venus?.house === 7 || planets.venus?.house === 5){
    scores.love += 6;
  }

  if(planets.jupiter?.house === 2 || planets.jupiter?.house === 8){
    scores.wealth += 6;
  }

  if(planets.sun?.house === 10 || planets.saturn?.house === 10){
    scores.career += 7;
  }

  if(planets.mars?.house === 6){
    scores.health -= 3;
    scores.career += 2;
  }

  if(planets.moon?.house === 12){
    scores.health -= 2;
    scores.love -= 1;
  }

  // 7) 기본 각도 보정
  if(Array.isArray(natalAspects) && natalAspects.length){
    if(findAspect(natalAspects, "sun", "saturn", "square")){
      scores.career += 3;
      scores.health -= 3;
      scores.overall -= 2;
    }

    if(findAspect(natalAspects, "moon", "venus", "trine") || findAspect(natalAspects, "moon", "venus", "sextile")){
      scores.love += 6;
      scores.health += 2;
    }

    if(findAspect(natalAspects, "mars", "jupiter", "trine") || findAspect(natalAspects, "mars", "jupiter", "conjunction")){
      scores.career += 5;
      scores.overall += 4;
    }

    if(findAspect(natalAspects, "venus", "saturn", "square")){
      scores.love -= 5;
    }

    if(findAspect(natalAspects, "sun", "jupiter", "trine") || findAspect(natalAspects, "sun", "jupiter", "sextile")){
      scores.overall += 5;
      scores.wealth += 3;
      scores.career += 3;
    }
  }

  Object.keys(scores).forEach(key => {
    scores[key] = clampScore(scores[key]);
  });

  return scores;
}

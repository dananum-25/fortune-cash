// /js/astro/astro.storage.js

const DEFAULT_BIRTH_YMD = "1940-01-01";
const DEFAULT_BIRTH_TIME = "12:00";
const DEFAULT_BIRTH_PLACE = "서울";

export function getStoredBirthDate(){
  return localStorage.getItem("birth")
    || localStorage.getItem("guest_birth")
    || DEFAULT_BIRTH_YMD;
}

export function getStoredBirthTime(){
  return localStorage.getItem("birthTime")
    || localStorage.getItem("guest_birthTime")
    || DEFAULT_BIRTH_TIME;
}

export function getStoredBirthPlace(){
  return localStorage.getItem("birthPlaceText")
    || localStorage.getItem("guest_birthPlaceText")
    || DEFAULT_BIRTH_PLACE;
}

export function saveAstroInput({ birthDate, birthTime, birthPlaceText } = {}){
  const phone = localStorage.getItem("phone");

  if(phone){
    if(birthDate) localStorage.setItem("birth", birthDate);
    if(birthTime) localStorage.setItem("birthTime", birthTime);
    if(birthPlaceText) localStorage.setItem("birthPlaceText", birthPlaceText);
    return;
  }

  if(birthDate) localStorage.setItem("guest_birth", birthDate);
  if(birthTime) localStorage.setItem("guest_birthTime", birthTime);
  if(birthPlaceText) localStorage.setItem("guest_birthPlaceText", birthPlaceText);
}

export function getAstroInput(){
  return {
    birthDate: getStoredBirthDate(),
    birthTime: getStoredBirthTime(),
    birthPlaceText: getStoredBirthPlace()
  };
}

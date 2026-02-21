// public/js/config.js

// ✅ 전역 설정 객체
window.APP_CONFIG = window.APP_CONFIG || {};
window.APP_CONFIG.API_URL =
  window.APP_CONFIG.API_URL ||
  "https://script.google.com/macros/s/AKfycbxV49VtrO-fV68nmPLsZFYZnDp6F8OwDFGaOe3Kj_Syi6LW7znJ5dHlHx5ZgK3uNlClZw/exec";

// ✅ 어디서든 안전하게 쓰는 공통 함수
window.getApiUrl = window.getApiUrl || function(){
  const url = window.APP_CONFIG?.API_URL || "";
  if(!url){
    console.warn("[config.js] API_URL is empty");
  }
  return url;
};

// (선택) 디버그용 로그 — 배포 후엔 주석 처리해도 됨
console.log("[config.js] loaded ✅", window.getApiUrl());

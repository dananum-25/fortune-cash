// public/js/config.js
window.APP_CONFIG = window.APP_CONFIG || {};
window.APP_CONFIG.API_URL =
  "https://script.google.com/macros/s/AKfycbxV49VtrO-fV68nmPLsZFYZnDp6F8OwDFGaOe3Kj_Syi6LW7znJ5dHlHx5ZgK3uNlClZw/exec";

// ✅ 어디서든 안전하게 쓰는 공통 함수
window.getApiUrl = window.getApiUrl || function(){
  return window.APP_CONFIG?.API_URL || "";
};

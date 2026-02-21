/* =========================================
 AUTH (auth.js)
 - entry modal
 - login/register + birth + zodiac + gapja
 - show "processing..." and read server response
 - points key unify: "point"
========================================= */

// ✅ config.js에서 설정을 가져오기만 함 (여기서 정의하지 않음)
window.getApiUrl = window.getApiUrl || function () {
  return window.APP_CONFIG?.API_URL || "";
};

console.log("[auth.js] loaded ✅", window.getApiUrl());

function normalizePhone(phone){
  return String(phone || "").replace(/[^0-9]/g, "");
}

function toKoreanYMD(v){
  if(!v) return "";
  const s = String(v).trim();

  // 이미 YYYY-MM-DD면 그대로
  if(/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // ISO가 섞여있으면 날짜 부분만 우선 잘라서 처리
  // 예: 1982-01-07T15:00:00.000Z -> 1982-01-07 (이게 “기준 날짜”)
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if(m && m[1]) return m[1];

  // 그래도 안 되면 Date로 파싱하되, UTC 기준으로 YYYY-MM-DD 뽑기
  const d = new Date(s);
  if(Number.isNaN(d.getTime())) return "";

  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth()+1).padStart(2,"0");
  const dd = String(d.getUTCDate()).padStart(2,"0");
  return `${yyyy}-${mm}-${dd}`;
}

// ✅ 공통: API URL 비어있을 때 안전장치
function getApiUrlOrWarn(){
  const url = window.getApiUrl?.() || "";
  if(!url){
    console.warn("[auth.js] API_URL is empty. Check <script src='/js/config.js'> is loaded BEFORE auth.js");
  }
  return url;
}

/* ---------- ENTRY MODAL ---------- */
function showEntryModal(){
  const modal = document.getElementById("entryModal");
  if(!modal) return;

  modal.classList.remove("hidden");

  const guestBtn = document.getElementById("startGuest");
  const apptechBtn = document.getElementById("startApptech");

  if(guestBtn){
    guestBtn.onclick = ()=>{
      localStorage.setItem("guestMode","true");
      modal.classList.add("hidden");
      refreshTopBar();
      refreshPointCard();
    };
  }

  if(apptechBtn){
    apptechBtn.onclick = ()=>{
      modal.classList.add("hidden");
      openLoginModal();
    };
  }
}

function authGuard(){
  const phone = localStorage.getItem("phone");
  const guest = localStorage.getItem("guestMode");
  if(!phone && !guest){
    showEntryModal();
  }
}

/* ---------- LOGIN MODAL ---------- */
function openLoginModal(){
  document.getElementById("loginModal")?.classList.remove("hidden");
}
function closeLoginModal(){
  document.getElementById("loginModal")?.classList.add("hidden");
}
window.openLoginModal = openLoginModal;

/* ---------- SERVER SYNC ---------- */
async function syncUserFromServer(){
  const phone = localStorage.getItem("phone");
  if(!phone) return;

  try{
const API_URL = getApiUrlOrWarn();
if(!API_URL) return;

const r = await fetch(API_URL,{
  method:"POST",
  headers:{ "Content-Type":"text/plain;charset=utf-8" },
  body: JSON.stringify({ action:"getUser", phone })
});

    const txt = await r.text();
    const res = JSON.parse(txt);

    if(res.status === "ok"){
      localStorage.setItem("point", String(res.points || 0));
      localStorage.setItem("name", String(res.name || ""));

      const birthYMD = toKoreanYMD(res.birth);   // ✅ 핵심
      if(birthYMD) localStorage.setItem("birth", birthYMD);

      if(res.zodiac) localStorage.setItem("zodiac", String(res.zodiac));
      if(res.gapja) localStorage.setItem("gapja", String(res.gapja));
    }
  }catch(e){
    console.log("[sync] skipped", e);
  }
}

/* ---------- TOPBAR ---------- */
function refreshTopBar(){
  const phone = localStorage.getItem("phone");
  const name = localStorage.getItem("name") || "회원";

  const info = document.getElementById("userInfo");
  const loginBtn = document.getElementById("loginBtn");
  if(!info || !loginBtn) return;

  if(phone){
    info.textContent = `👤 ${name}님`;
    loginBtn.textContent = "로그아웃";
    loginBtn.onclick = ()=>{
      localStorage.removeItem("phone");
      localStorage.removeItem("name");
      localStorage.removeItem("birth");
      localStorage.removeItem("zodiac");
      localStorage.removeItem("gapja");
      localStorage.removeItem("guestMode");
      // point도 같이 지우는게 안전
      localStorage.removeItem("point");
      location.reload();
    };
  }else{
    info.textContent = "로그인 필요";
    loginBtn.textContent = "로그인";
    loginBtn.onclick = openLoginModal;
  }
}

/* ---------- POINT CARD ---------- */
function refreshPointCard(){
  const card = document.getElementById("pointCard");
  if(!card) return;

  const phone = localStorage.getItem("phone");

  if(phone){
    card.classList.add("card-active");
    card.classList.remove("card-disabled");
    card.onclick = ()=>location.href="/point.html";
  }else{
    card.classList.add("card-disabled");
    card.classList.remove("card-active");
    card.onclick = ()=>{
      alert("로그인 후 이용 가능합니다.");
      openLoginModal();
    };
  }
}

/* ---------- LOGIN/REGISTER ---------- */
async function handleSubmitLogin(){
  const nameEl = document.getElementById("loginName");
  const phoneEl = document.getElementById("loginPhone");
  const birthEl = document.getElementById("loginBirth");
  const submitBtn = document.getElementById("loginSubmit");

  const name = (nameEl?.value || "").trim();
  const phone = normalizePhone((phoneEl?.value || "").trim());
  const birth = (birthEl?.value || "").trim();

  if(!name || !phone){
    alert("이름과 전화번호를 입력해주세요.");
    return;
  }
  if(phone.length !== 11 || !phone.startsWith("010")){
    alert("전화번호는 010xxxxxxxx 형식의 11자리 숫자로 입력해주세요.");
    return;
  }
  if(!birth){
    alert("생년월일을 입력해주세요.");
    return;
  }

  // ✅ 입춘DB 로드(있으면 사용)
  try{
    if(window.BirthUtil?.loadIpchunDB){
      await window.BirthUtil.loadIpchunDB();
    }
  }catch(e){}

  const zodiac = window.BirthUtil?.calcZodiacByIpchun
    ? window.BirthUtil.calcZodiacByIpchun(birth)
    : "";

  const gapja = window.BirthUtil?.calcGapjaByIpchun
    ? window.BirthUtil.calcGapjaByIpchun(birth)
    : "";

  // ✅ reCAPTCHA 로드 여부 확인
  if(typeof grecaptcha === "undefined"){
    alert("reCAPTCHA가 아직 로드되지 않았어요. 잠시 후 다시 시도해주세요.");
    return;
  }

  // ✅ 토큰 먼저 확보
  const token = grecaptcha.getResponse();
  if(!token){
    alert("reCAPTCHA 확인을 먼저 해주세요.");
    return;
  }

  const API_URL = getApiUrlOrWarn();
  if(!API_URL){
    alert("API_URL이 비어있어요. config.js 로드 순서를 확인해주세요.");
    return;
  }

  const prevText = submitBtn ? submitBtn.textContent : "";
  if(submitBtn){
    submitBtn.disabled = true;
    submitBtn.textContent = "처리 중…";
  }

  let serverRes = null;
  let rawTxt = "";

  try{
    const r = await fetch(API_URL,{
      method:"POST",
      headers:{ "Content-Type":"text/plain;charset=utf-8" },
      body: JSON.stringify({
        action:"register",
        phone,
        name,
        birth,
        zodiac,
        gapja,
        token
      })
    });

    rawTxt = await r.text();

    try{
      serverRes = JSON.parse(rawTxt);
    }catch(parseErr){
      alert("서버 응답이 JSON이 아니에요.\n\nRAW:\n" + rawTxt);
      return;
    }

  }catch(e){
    alert("네트워크/서버 호출 실패\n" + String(e));
    return;

  }finally{
    if(submitBtn){
      submitBtn.disabled = false;
      submitBtn.textContent = prevText || "시작하기";
    }
    try{ grecaptcha.reset(); }catch(e){}
  }

  const st = serverRes?.status;

  if(!st){
    alert("서버 응답에 status가 없어요.\n\nOBJ:\n" + JSON.stringify(serverRes) + "\n\nRAW:\n" + rawTxt);
    return;
  }

  if(st === "captcha_fail"){
    const codes = serverRes?.captcha?.["error-codes"] || serverRes?.errors || [];
    alert("captcha_fail\n" + JSON.stringify(codes) + "\n\n" + JSON.stringify(serverRes));
    return;
  }

  if(st === "invalid"){
    alert("서버에서 invalid 응답.\n\n" + JSON.stringify(serverRes));
    return;
  }

if(st === "exists" || st === "ok"){
  localStorage.setItem("name", name);
  localStorage.setItem("phone", phone);
  localStorage.setItem("birth", toKoreanYMD(birth)); // ✅ 저장도 YMD로 고정

  // ✅ 과거 points 키 제거 (혼선 방지)
  localStorage.removeItem("points");
    if(zodiac) localStorage.setItem("zodiac", zodiac);
    if(gapja) localStorage.setItem("gapja", gapja);
    localStorage.removeItem("guestMode");

    closeLoginModal();
    document.getElementById("entryModal")?.classList.add("hidden");

    refreshTopBar();
    refreshPointCard();

    alert(st === "exists" ? "이미 가입된 번호라 로그인 처리했어요 ✅" : "회원가입 완료 ✅");

    await syncUserFromServer();
    return;
  }

  alert("서버 응답이 예상과 달라 저장이 확인되지 않았어요.\n(status: " + st + ")\n\n" + JSON.stringify(serverRes));
}

/* ---------- INIT ---------- */
window.addEventListener("DOMContentLoaded", async ()=>{
  try{
    if(window.BirthUtil?.loadIpchunDB){
      window.BirthUtil.loadIpchunDB();
    }
  }catch(e){}

  authGuard();

  document.getElementById("loginSubmit")?.addEventListener("click", handleSubmitLogin);
  document.getElementById("loginClose")?.addEventListener("click", closeLoginModal);
  document.getElementById("loginBtn")?.addEventListener("click", openLoginModal);

  await syncUserFromServer();
  refreshTopBar();
  refreshPointCard();
});

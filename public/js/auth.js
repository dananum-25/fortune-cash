/* =========================================
   AUTH (auth.js)
   - entry modal
   - login/register + birth + zodiac + gapja
   - show "processing..." and read server response
   - points key unify: "point"
========================================= */

window.API_URL = window.API_URL || "https://script.google.com/macros/s/AKfycbxOPPekB2KONL7o6zAPoZtg7aBPr9E70pzRAw7s-wYU6ScU6pBD41uLMMBez-wRW-y_6Q/exec";

console.log("[auth.js] loaded ✅");

function normalizePhone(phone){
  return String(phone || "").replace(/[^0-9]/g, "");
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
    const r = await fetch(window.API_URL,{
      method:"POST",
      headers:{ "Content-Type":"text/plain;charset=utf-8" },
      body: JSON.stringify({ action:"getUser", phone })
    });

    const txt = await r.text();
    const res = JSON.parse(txt);

    if(res.status === "ok"){
      localStorage.setItem("point", String(res.points || 0)); // ✅ point로 통일
      localStorage.setItem("name", String(res.name || ""));
      if(res.birth) localStorage.setItem("birth", String(res.birth));
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

  // ✅ 토큰은 처리중 표시 전에 먼저 확인 (버튼 멈춤 방지)
  const token = grecaptcha.getResponse();
  if(!token){
    alert("reCAPTCHA 확인을 먼저 해주세요.");
    return;
  }

  // ✅ UX: 처리중 표시
  const prevText = submitBtn ? submitBtn.textContent : "";
  if(submitBtn){
    submitBtn.disabled = true;
    submitBtn.textContent = "처리 중…";
  }

  let serverRes = null;

  try{
    alert("회원가입 처리 중...");

    const r = await fetch(window.API_URL,{
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

    const txt = await r.text();
    serverRes = JSON.parse(txt);

  }catch(e){
    console.log("[register] network error:", e);
  }finally{
    // ✅ 버튼 복구는 무조건 실행
    if(submitBtn){
      submitBtn.disabled = false;
      submitBtn.textContent = prevText || "시작하기";
    }
    // ✅ 토큰은 1회성이라 요청 후 리셋 권장
    try{ grecaptcha.reset(); }catch(e){}
  }

function verifyRecaptcha(token){
  if(!token) return { ok:false, data:{ "error-codes":["missing-input-response"] } };

  try{
    const res = UrlFetchApp.fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method:"post",
        payload:{
          secret: SECRET_KEY,
          response: token
        },
        muteHttpExceptions: true
      }
    );

    const data = JSON.parse(res.getContentText());
    return { ok: data.success === true, data };

  }catch(e){
    return { ok:false, data:{ "error-codes":["verify-exception", String(e)] } };
  }
}

  // ✅ 서버 응답에 따른 안내
  if(serverRes?.status === "captcha_fail"){
    alert("서버 보안 검증 실패(captcha). 서버(Apps Script)에서 secret으로 siteverify 검증이 통과해야 합니다.");
    return;
  }
  if(serverRes?.status === "invalid"){
    alert("서버에서 invalid 응답. action/파라미터 이름을 확인해주세요.");
    return;
  }
  if(serverRes?.status === "device_required"){
    alert("서버가 deviceId를 요구하고 있어요. 현재는 deviceId 제외 버전으로 바꿔야 합니다.");
    return;
  }

  // ✅ exists(이미 가입)도 “로그인 성공” 처리
  if(serverRes?.status === "exists" || serverRes?.status === "ok"){
    localStorage.setItem("name", name);
    localStorage.setItem("phone", phone);
    localStorage.setItem("birth", birth);
    if(zodiac) localStorage.setItem("zodiac", zodiac);
    if(gapja) localStorage.setItem("gapja", gapja);
    localStorage.removeItem("guestMode");

    closeLoginModal();
    document.getElementById("entryModal")?.classList.add("hidden");

    refreshTopBar();
    refreshPointCard();

    if(serverRes.status === "exists"){
      alert("이미 가입된 번호라 로그인 처리했어요 ✅");
    }else{
      alert("회원가입 완료 ✅");
    }

    await syncUserFromServer();
    return;
  }

  alert("서버 응답이 예상과 달라 저장이 확인되지 않았어요. (status: " + String(serverRes?.status || "unknown") + ")");
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

auth.js

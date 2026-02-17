/* =========================================
   AUTH (auth.js)
========================================= */

window.API_URL = window.API_URL || "https://script.google.com/macros/s/AKfycbx6NjF9IVzW0eA0fE_q54B8wRQMPq8BivT3snTuNfDTTc-ggaYqoRw7AMqrqOeT5Kz_9A/exec";

console.log("[auth.js] loaded ✅");
window.__AUTH_LOADED__ = true;

function normalizePhone(phone){
  return String(phone || "").replace(/[^0-9]/g, "");
}

/* ---------- ENTRY MODAL ---------- */
function ensureEntryModal(){
  let modal = document.getElementById("entryModal");
  if(modal) return modal;

  modal = document.createElement("div");
  modal.id = "entryModal";
  modal.className = "modal";

  modal.innerHTML = `
    <div style="
      background:#1a1a1a;
      padding:20px;
      border-radius:16px;
      width:90%;
      max-width:320px;
      text-align:center;
    ">
      <h3>이용 방법 선택</h3>
      <p style="opacity:.7;font-size:14px;">
        앱테크 참여 또는 비회원 이용이 가능합니다
      </p>

      <button id="startApptech" style="
        width:100%;
        padding:14px;
        margin-top:12px;
        border-radius:12px;
        border:none;
        background:#ffd56b;
        font-weight:bold;
      ">앱테크 시작하기</button>

      <button id="startGuest" style="
        width:100%;
        padding:14px;
        margin-top:10px;
        border-radius:12px;
        border:none;
        background:#2a2a2a;
        color:white;
      ">그냥 운세 보기</button>
    </div>
  `;

  document.body.appendChild(modal);
  return modal;
}

function showEntryModal(){
  const modal = ensureEntryModal();
  modal.classList.remove("hidden");

  const startGuestBtn = document.getElementById("startGuest");
  const startApptechBtn = document.getElementById("startApptech");

  if(startGuestBtn){
    startGuestBtn.onclick = ()=>{
      localStorage.setItem("guestMode", "true");
      document.getElementById("entryModal")?.remove();
      // 게스트는 그냥 계속 이용
      refreshTopBar();
      refreshPointCard();
    };
  }

  if(startApptechBtn){
    startApptechBtn.onclick = ()=>{
      localStorage.removeItem("guestMode");
      document.getElementById("entryModal")?.remove();
      openLoginModal();
    };
  }
}

function authGuard(){
  const phone = localStorage.getItem("phone");
  const guest = localStorage.getItem("guestMode");

  // ✅ “최초 모달”을 보고 싶다면:
  // - 로그인/게스트가 없을 때만 보여줌
  if(!phone && !guest){
    showEntryModal();
  }
}

/* ---------- LOGIN MODAL CONTROL ---------- */
function openLoginModal(){
  const modal = document.getElementById("loginModal");
  if(modal) modal.classList.remove("hidden");
}
function closeLoginModal(){
  const modal = document.getElementById("loginModal");
  if(modal) modal.classList.add("hidden");
}
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;

/* ---------- SERVER SYNC ---------- */
async function syncUserFromServer(){
  const phone = localStorage.getItem("phone");
  if(!phone) return;

  try{
    const r = await fetch(window.API_URL,{
      method:"POST",
      headers: { "Content-Type":"text/plain;charset=utf-8" },
      body: JSON.stringify({ action:"getUser", phone })
    });

    const txt = await r.text();
    const res = JSON.parse(txt);

    if(res.status === "ok"){
      localStorage.setItem("points", String(res.points || 0));
      localStorage.setItem("name", String(res.name || ""));
    }
  }catch(e){
    console.error("[syncUserFromServer] failed:", e);
  }
}

/* ---------- TOPBAR UI ---------- */
function refreshTopBar(){
  const phone = localStorage.getItem("phone");
  const name  = localStorage.getItem("name");
  const points = Number(localStorage.getItem("points") || "0");

  const info = document.getElementById("userInfo");
  const loginBtn = document.getElementById("loginBtn");

  if(!info || !loginBtn) return;

  if(phone){
    if(phone){
    info.textContent = `${name}님`;
    loginBtn.textContent = "로그아웃";
    loginBtn.onclick = ()=>{
      localStorage.removeItem("phone");
      localStorage.removeItem("name");
      localStorage.removeItem("points");
      localStorage.removeItem("guestMode");
      location.reload();
    };
  }else{
    info.textContent = "로그인 필요";
    loginBtn.textContent = "로그인";
    loginBtn.onclick = openLoginModal;
  }
}

/* ---------- POINT CARD UI ---------- */
function refreshPointCard(){
  const card = document.getElementById("pointCard");
  if(!card) return;

  const phone = localStorage.getItem("phone");

  if(phone){
    card.classList.remove("card-disabled");
    card.classList.add("card-active");
    card.onclick = ()=>{ location.href="/point.html"; };
  }else{
    card.classList.add("card-disabled");
    card.classList.remove("card-active");
    card.onclick = ()=>{
      alert("로그인 후 이용 가능합니다.");
      openLoginModal();
    };
  }
}

/* ---------- LOGIN FLOW ---------- */
async function handleSubmitLogin(){
  const nameEl = document.getElementById("loginName");
  const phoneEl = document.getElementById("loginPhone");

  const name = (nameEl?.value || "").trim();
  const phone = normalizePhone((phoneEl?.value || "").trim());

  if(!name || !phone){
    alert("이름과 전화번호를 입력해주세요.");
    return;
  }
  if(phone.length !== 11 || !phone.startsWith("010")){
    alert("전화번호는 010xxxxxxxx 형식의 11자리 숫자로 입력해주세요.");
    return;
  }

  // ✅ 로컬 상태 먼저 확정(= 로그인 유지의 핵심)
  localStorage.setItem("name", name);
  localStorage.setItem("phone", phone);
  localStorage.removeItem("guestMode");

  // 서버 register (실패해도 로그인 유지)
  try{
    await fetch(window.API_URL,{
      method:"POST",
      headers: { "Content-Type":"text/plain;charset=utf-8" },
      body: JSON.stringify({ action:"register", phone, name })
    });
  }catch(e){
    console.error("[register] failed:", e);
  }

  closeLoginModal();
document.getElementById("entryModal")?.remove();

refreshTopBar();
refreshPointCard();

alert("로그인 되셨습니다.");

/* 서버 동기화는 백그라운드 */
syncUserFromServer();

/* ---------- BIND EVENTS ---------- */
window.addEventListener("DOMContentLoaded", async ()=>{
  // 1) 모달/가드
  authGuard();

  // 2) 상단 로그인 버튼
  const loginBtn = document.getElementById("loginBtn");
  if(loginBtn) loginBtn.onclick = openLoginModal;

  // 3) 로그인 모달 버튼
  const submitBtn = document.getElementById("loginSubmit");
  const closeBtn  = document.getElementById("loginClose");

  if(submitBtn) submitBtn.onclick = handleSubmitLogin;
  if(closeBtn)  closeBtn.onclick  = closeLoginModal;

  // 4) 기존 로그인 사용자면 서버 동기화 후 UI 반영
  await syncUserFromServer();
  refreshTopBar();
  refreshPointCard();
});

/* =========================================
   AUTH (auth.js)
========================================= */

window.API_URL = window.API_URL || "https://script.google.com/macros/s/AKfycbxOPPekB2KONL7o6zAPoZtg7aBPr9E70pzRAw7s-wYU6ScU6pBD41uLMMBez-wRW-y_6Q/exec";

console.log("[auth.js] loaded ✅");

function normalizePhone(phone){
  return String(phone || "").replace(/[^0-9]/g, "");
}
window.lunarMap = {};
function calcZodiac(birth){
  if(!birth) return "";

  const animals = [
    "쥐","소","호랑이","토끼",
    "용","뱀","말","양",
    "원숭이","닭","개","돼지"
  ];

  const [y,m,d] = birth.split("-").map(Number);
  let zodiacYear = y;

  const lunar = window.lunarMap?.[y];

  if(lunar){
    const [ly,lm,ld] = lunar.split("-").map(Number);
    if(m < lm || (m === lm && d < ld)){
      zodiacYear = y - 1;
    }
  }

  return animals[(zodiacYear - 2020 + 120) % 12];
}

/* ---------- ENTRY MODAL ---------- */
function showEntryModal(){
  const modal = document.getElementById("entryModal");
  if(!modal) return;

  modal.classList.remove("hidden");

  document.getElementById("startGuest").onclick = ()=>{
    localStorage.setItem("guestMode","true");
    modal.classList.add("hidden");
    refreshTopBar();
    refreshPointCard();
  };

  document.getElementById("startApptech").onclick = ()=>{
    modal.classList.add("hidden");
    openLoginModal();
  };
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
      localStorage.setItem("points", String(res.points || 0));
      localStorage.setItem("name", String(res.name || ""));
    }
  }catch(e){
    console.log("sync skipped");
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
      localStorage.clear();
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
    card.classList.remove("card-disabled");
    card.classList.add("card-active");
    card.onclick = ()=>location.href="/point.html";
  }else{
    card.onclick = ()=>{
      alert("로그인 후 이용 가능합니다.");
      openLoginModal();
    };
  }
}

/* ---------- LOGIN ---------- */
async function handleSubmitLogin(){
  const name = document.getElementById("loginName").value.trim();
  const phone = normalizePhone(document.getElementById("loginPhone").value.trim());
  const birth = document.getElementById("loginBirth").value;

  if(!name || !phone){
    alert("이름과 전화번호를 입력해주세요.");
    return;
  }

  const zodiac = calcZodiac(birth);

  await fetch(API_URL,{
    method:"POST",
    headers:{ "Content-Type":"text/plain;charset=utf-8" },
    body: JSON.stringify({
      action:"register",
      phone,
      name,
      birth,
      zodiac
    })
  });

  localStorage.setItem("name", name);
  localStorage.setItem("phone", phone);
  localStorage.setItem("birth", birth);
  localStorage.setItem("zodiac", zodiac);
  localStorage.removeItem("guestMode");

  closeLoginModal();
  document.getElementById("entryModal")?.classList.add("hidden");

  refreshTopBar();
  refreshPointCard();

  alert("로그인 되셨습니다.");

  syncUserFromServer();
}

  localStorage.setItem("name", name);
  localStorage.setItem("phone", phone);
  localStorage.removeItem("guestMode");

  closeLoginModal();
  document.getElementById("entryModal")?.classList.add("hidden");

  refreshTopBar();
  refreshPointCard();

  alert("로그인 되셨습니다.");

  syncUserFromServer();
}

/* ---------- INIT ---------- */
window.addEventListener("DOMContentLoaded", async ()=>{
  authGuard();

  document.getElementById("loginSubmit")?.addEventListener("click", handleSubmitLogin);
  document.getElementById("loginClose")?.addEventListener("click", closeLoginModal);
  document.getElementById("loginBtn")?.addEventListener("click", openLoginModal);
async function loadLunar(){
  try{
    const r = await fetch("/data/lunar_new_year_1920_2026.json");
    window.lunarMap = await r.json();
  }catch(e){
    console.log("lunar load skipped");
  }
}
  await syncUserFromServer();
  refreshTopBar();
  refreshPointCard();
});

/* =========================================
   AUTH (auth.js)
   - entry modal
   - login/register + birth + zodiac + gapja
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
      localStorage.setItem("points", String(res.points || 0));
      localStorage.setItem("name", String(res.name || ""));
      if(res.birth) localStorage.setItem("birth", String(res.birth));
      if(res.zodiac) localStorage.setItem("zodiac", String(res.zodiac));
      if(res.gapja) localStorage.setItem("gapja", String(res.gapja));
    }
  }catch(e){
    console.log("[sync] skipped");
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
    // ✅ 허브에서는 전화번호 숨기고 이름만
    info.textContent = `👤 ${name}님`;
    loginBtn.textContent = "로그아웃";
    loginBtn.onclick = ()=>{
      // 로그인만 정리 (point 등 공용값까지 싹 지우고 싶으면 clear()로 바꿔도 됨)
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

  // ✅ 지금은 point.html에서만 포인트 보여주기로 했으니
  // 허브에서는 로그인 여부만으로 접근만 제어
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
  const birthEl = document.getElementById("loginBirth"); // ✅ 너가 모달에 추가할 input

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

  // ✅ 입춘DB 로드(없어도 fallback)
  if(window.BirthUtil?.loadIpchunDB){
    await window.BirthUtil.loadIpchunDB();
  }

  const zodiac = window.BirthUtil?.calcZodiacByIpchun
    ? window.BirthUtil.calcZodiacByIpchun(birth)
    : "";

  const gapja = window.BirthUtil?.calcGapjaByIpchun
    ? window.BirthUtil.calcGapjaByIpchun(birth)
    : "";

  // ✅ 로컬 먼저 확정 (로그인 유지 최우선)
  localStorage.setItem("name", name);
  localStorage.setItem("phone", phone);
  localStorage.setItem("birth", birth);
  if(zodiac) localStorage.setItem("zodiac", zodiac);
  if(gapja) localStorage.setItem("gapja", gapja);
  localStorage.removeItem("guestMode");

  // ✅ 서버 저장 (느려도 UX 멈추지 않게)
  try{
    await fetch(window.API_URL,{
      method:"POST",
      headers:{ "Content-Type":"text/plain;charset=utf-8" },
      body: JSON.stringify({
        action:"register",
        phone,
        name,
        birth,
        zodiac,
        gapja,
        apptech: true  // 앱테크 모드 로그인으로 들어온 케이스
      })
    });
  }catch(e){
    console.log("[register] failed (but keep login):", e);
  }

  closeLoginModal();
  document.getElementById("entryModal")?.classList.add("hidden");

  refreshTopBar();
  refreshPointCard();

  alert(`로그인 되셨습니다.\n띠: ${zodiac}\n년주: ${gapja}`);

  // 서버값이 있으면 보정
  syncUserFromServer();
}

/* ---------- INIT ---------- */
window.addEventListener("DOMContentLoaded", async ()=>{
  // ✅ 입춘DB를 미리 로드 (계산 즉시 가능)
  if(window.BirthUtil?.loadIpchunDB){
    window.BirthUtil.loadIpchunDB();
  }

  authGuard();

  document.getElementById("loginSubmit")?.addEventListener("click", handleSubmitLogin);
  document.getElementById("loginClose")?.addEventListener("click", closeLoginModal);
  document.getElementById("loginBtn")?.addEventListener("click", openLoginModal);

  await syncUserFromServer();
  refreshTopBar();
  refreshPointCard();
});

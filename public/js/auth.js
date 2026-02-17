const API_URL =
"https://script.google.com/macros/s/AKfycbx6NjF9IVzW0eA0fE_q54B8wRQMPq8BivT3snTuNfDTTc-ggaYqoRw7AMqrqOeT5Kz_9A/exec";

console.log("[auth.js] loaded ✅");
window.__AUTH_LOADED__ = true;
/* =========================================
   AUTH GUARD + LOGIN (auth.js)
========================================= */

/* ---------- utils ---------- */
function getUserKey(phone){
  return "user_" + phone;
}

function normalizePhone(phone){
  return String(phone || "").replace(/[^0-9]/g, "");
}

function generateInviteCode(){
  // 6자리 대문자, 중복방지
  let code = "";
  for(let i=0;i<50;i++){
    code = Math.random().toString(36).substring(2,8).toUpperCase();
    if(!localStorage.getItem("invite_" + code)) break;
  }
  return code;
}

function addPoint(amount){
  const cur = Number(localStorage.getItem("points") || "0");
  const next = cur + Number(amount || 0);
  localStorage.setItem("points", String(next));
  return next;
}

/* ---------- entry modal ---------- */
function createEntryModal(){
  if(document.getElementById("entryModal")) return;

  const modal = document.createElement("div");
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

      <button id="guestBtn" style="
        width:100%;
        padding:14px;
        margin-top:12px;
        border-radius:12px;
        border:none;
        background:#2a2a2a;
        color:white;
      ">
        그냥 운세 보기
      </button>

      <button id="apptechBtn" style="
        width:100%;
        padding:14px;
        margin-top:10px;
        border-radius:12px;
        border:none;
        background:#ffd56b;
        font-weight:bold;
      ">
        앱테크 시작하기
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  const guestBtn = document.getElementById("guestBtn");
  const apptechBtn = document.getElementById("apptechBtn");

  if(guestBtn) guestBtn.onclick = startGuest;
  if(apptechBtn) apptechBtn.onclick = ()=>{
    // 엔트리 모달은 남겨도 되는데, UX상 닫고 로그인으로
    document.getElementById("entryModal")?.remove();
    openLoginModal();
  };
}

function startGuest(){
  localStorage.setItem("guestMode","true");
  document.getElementById("entryModal")?.remove();
}

function authGuard(){
  const phone = localStorage.getItem("phone");
  const guest = localStorage.getItem("guestMode");

  // ✅ 캐시 지워도 무조건 처음엔 모달 나오게 하고 싶다 했으니
  // 조건 없이 항상 보여주되, 이미 로그인/게스트면 자동으로 닫음(0.1초)
  createEntryModal();

  if(phone || guest){
    // 이미 상태 있으면 모달 닫기
    setTimeout(()=>document.getElementById("entryModal")?.remove(), 50);
  }
}

/* ---------- login modal ---------- */
function openLoginModal(){
  const modal = document.getElementById("loginModal");
  if(modal) modal.classList.remove("hidden");
}

function closeLoginModal(){
  const modal = document.getElementById("loginModal");
  if(modal) modal.classList.add("hidden");
}

/* ---------- login flow ---------- */
async function handleSubmitLogin(){
  const nameEl = document.getElementById("loginName");
  const phoneEl = document.getElementById("loginPhone");

  const name = (nameEl?.value || "").trim();
  const phoneRaw = (phoneEl?.value || "").trim();
  const phone = normalizePhone(phoneRaw);

  if(!name || !phone){
    alert("이름과 전화번호를 입력해주세요.");
    return;
  }

  if(phone.length !== 11 || !phone.startsWith("010")){
    alert("전화번호는 010xxxxxxxx 형식의 11자리 숫자로 입력해주세요.");
    return;
  }

  const userKey = getUserKey(phone);
  const existingUserStr = localStorage.getItem(userKey);

  // 신규 가입
  if(!existingUserStr){
    const inviteCode = generateInviteCode();

    const userData = {
      name,
      phone,
      inviteCode,
      points: 0,
      createdAt: Date.now()
    };

    // 저장 (유저)
    localStorage.setItem(userKey, JSON.stringify(userData));
    // 초대코드 역인덱스(중복방지/조회용)
// 🔥 서버 등록 추가 (네트워크 실패해도 UI가 멈추지 않게)
try{
  const r = await fetch(API_URL,{
    method:"POST",
    headers: { "Content-Type":"text/plain;charset=utf-8" },
    body:JSON.stringify({
      action:"register",
      phone,
      name,
      inviteBy: localStorage.getItem("inviteCode") || ""
    })
  });

  // 응답을 읽어서 Apps Script 에러도 잡기
  const txt = await r.text();
  console.log("[register] response:", txt);
}catch(e){
  console.error("[register] failed:", e);
}
    localStorage.setItem("invite_" + inviteCode, phone);

    // 현재 로그인 상태 저장
    localStorage.setItem("name", name);
    localStorage.setItem("phone", phone);
    localStorage.setItem("points", "0");
    localStorage.removeItem("guestMode");

    alert(
`가입이 완료되셨습니다.

친구초대 코드: ${inviteCode}

친구초대 시 양쪽 100점 지급`
    );
  }
  // 기존 사용자 로그인
  else{
    const userData = JSON.parse(existingUserStr);

    localStorage.setItem("name", userData.name);
    localStorage.setItem("phone", userData.phone);
    localStorage.setItem("points", String(userData.points || 0));
    localStorage.removeItem("guestMode");

    alert("로그인 되셨습니다.");
  }

  await syncUserFromServer();
closeLoginModal();
location.reload();
}

/* ---------- bind events ---------- */
window.addEventListener("DOMContentLoaded", ()=>{
  // 1) 진입 가드
  authGuard();

  // 2) 우측 상단 로그인 버튼도 연결
  

  // 3) 모달 버튼 연결
  const submitBtn = document.getElementById("loginSubmit");
  const closeBtn = document.getElementById("loginClose");

  if(submitBtn) submitBtn.onclick = handleSubmitLogin;
  if(closeBtn) closeBtn.onclick = closeLoginModal;
});
async function syncUserFromServer(){
  const phone = localStorage.getItem("phone");
  if(!phone) return;

  const res = await fetch(API_URL,{
    method:"POST",
    body:JSON.stringify({
      action:"getUser",
      phone
    })
  }).then(r=>r.json());

  if(res.status === "ok"){
    localStorage.setItem("points", res.points || 0);
    localStorage.setItem("name", res.name || "");
  }
}

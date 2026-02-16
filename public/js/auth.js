/* =========================================
   AUTH GUARD
========================================= */

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

  document.getElementById("guestBtn").onclick = startGuest;
  document.getElementById("apptechBtn").onclick = openLoginModal;
}

function startGuest(){
  localStorage.setItem("guestMode","true");
  document.getElementById("entryModal")?.remove();
}

function openLoginModal(){
  const modal = document.getElementById("loginModal");
  if(modal) modal.classList.remove("hidden");
}

function closeLoginModal(){
  const modal = document.getElementById("loginModal");
  if(modal) modal.classList.add("hidden");
}

function authGuard(){
  const phone = localStorage.getItem("phone");
  const guest = localStorage.getItem("guestMode");

  if(!phone && !guest){
    createEntryModal();
  }
}

/* =========================================
   INIT
========================================= */

window.addEventListener("DOMContentLoaded", ()=>{

  authGuard();

  const submitBtn = document.getElementById("loginSubmit");
  const closeBtn = document.getElementById("loginClose");

  if(submitBtn){
submitBtn.onclick = ()=>{
  const name = document.getElementById("loginName").value.trim();
  const phone = document.getElementById("loginPhone").value.trim();

  if(!name || !phone){
    alert("이름과 전화번호를 입력해주세요.");
    return;
  }

  const userKey = "user_" + phone;
  const existingUser = localStorage.getItem(userKey);

  /* =====================
     신규 가입
  ===================== */
  if(!existingUser){

    const inviteCode = generateInviteCode();

    const userData = {
      name,
      phone,
      inviteCode,
      points: 0
    };

    localStorage.setItem(userKey, JSON.stringify(userData));
    localStorage.setItem("name", name);
    localStorage.setItem("phone", phone);
    localStorage.setItem("points", 0);

    alert(
`가입이 완료되셨습니다.

친구초대 코드: ${inviteCode}

친구초대 시 양쪽 100점 지급`
    );

  } 
  /* =====================
     기존 사용자 로그인
  ===================== */
  else{

    const userData = JSON.parse(existingUser);

    localStorage.setItem("name", userData.name);
    localStorage.setItem("phone", userData.phone);
    localStorage.setItem("points", userData.points || 0);

    alert("로그인 되셨습니다.");
  }

  localStorage.removeItem("guestMode");

  closeLoginModal();
  location.reload();
};
     
function addPoint(amount){
  let p = Number(localStorage.getItem("points") || "0");
  p += amount;
  localStorage.setItem("points", p);
}

function generateInviteCode(){
  return Math.random().toString(36).substring(2,8).toUpperCase();
}

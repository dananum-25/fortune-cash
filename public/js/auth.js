/* =========================================
   AUTH GUARD (공통 로그인/게스트 접근 제어)
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

      <button onclick="startGuest()" style="
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

      <button onclick="openLoginModal()" style="
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
}

function startGuest(){
  localStorage.setItem("guestMode","true");
  document.getElementById("entryModal")?.remove();
}

/* 🔥 이건 반드시 전역에 있어야 함 */
function openLoginModal(){
  const modal = document.getElementById("loginModal");
  if(modal) modal.style.display="flex";
}

function authGuard(){
  const phone = localStorage.getItem("phone");
  const guest = localStorage.getItem("guestMode");

  if(!phone && !guest){
    createEntryModal();
  }
}

window.addEventListener("DOMContentLoaded", authGuard);

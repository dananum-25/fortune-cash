/* =========================================
 AUTH (auth.js) - B (음력+윤달 지원)
 - entry modal
 - login/register + birth + zodiac + gapja
 - points key unify: "point"
 - 서버에는 birth를 "양력(solarBirth)"로 저장해 downstream 전체 통일
========================================= */

console.log("[auth.js] loaded ✅", window.getApiUrl?.() || "(no getApiUrl)");

function normalizePhone(phone){
  return String(phone || "").replace(/[^0-9]/g, "");
}

// ✅ YYYY-MM-DD 문자열 유지(UTC 파싱 금지)

function toKoreanYMD(v){
  if(!v) return "";
  const s = String(v).trim();

  // YYYY-MM-DD
  let m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if(m) return m[1];

  // YYYY/MM/DD → YYYY-MM-DD로 변환
  m = s.match(/^(\d{4})\/(\d{2})\/(\d{2})/);
  if(m) return `${m[1]}-${m[2]}-${m[3]}`;

  return "";
}

function getApiUrlOrWarn(){
  const url = window.getApiUrl?.() || "";
  if(!url){
    console.warn("[auth.js] API_URL is empty. Check config.js is loaded BEFORE auth.js");
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

  const API_URL = getApiUrlOrWarn();
  if(!API_URL) return;

  try{
    const r = await fetch(API_URL,{
      method:"POST",
      headers:{ "Content-Type":"text/plain;charset=utf-8" },
      body: JSON.stringify({ action:"getUser", phone })
    });

    const txt = await r.text();
    let res = null;

    try{ res = JSON.parse(txt); }
    catch(e){
      console.warn("[sync] response not JSON:", txt);
      return;
    }

    if(res.status === "ok"){
      localStorage.setItem("point", String(res.points || 0));
      localStorage.setItem("name", String(res.name || ""));

      // 서버에는 solarBirth가 저장될 예정이라 여기서도 그대로 저장
      let birthYMD = "";

if(typeof res.birth === "string"){
  const m = res.birth.match(/^(\d{4}-\d{2}-\d{2})/);
  if(m) birthYMD = m[1];
}

if(birthYMD){
  localStorage.setItem("birth", birthYMD);
}
      if(birthYMD) localStorage.setItem("birth", birthYMD);

      // 서버는 birthType=solar로 통일할 것 (아래 register 참고)
      if(typeof res.birthType === "string" && res.birthType){
        localStorage.setItem("birthType", res.birthType);
      }

      if(res.zodiac) localStorage.setItem("zodiac", String(res.zodiac));
      if(res.gapja) localStorage.setItem("gapja", String(res.gapja));

      localStorage.removeItem("points");
    }else{
      console.warn("[sync] not ok:", res);
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
      localStorage.removeItem("birthType");
      localStorage.removeItem("zodiac");
      localStorage.removeItem("gapja");
      localStorage.removeItem("guestMode");
      localStorage.removeItem("point");
      localStorage.removeItem("points");

      // B 확장 저장값
      localStorage.removeItem("birth_input");
      localStorage.removeItem("birth_input_type");
      localStorage.removeItem("birth_input_isLeap");

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
  const birthTypeEl = document.getElementById("birthType");
  const isLeapEl = document.getElementById("isLeapMonth");
  const submitBtn = document.getElementById("loginSubmit");

  const name = (nameEl?.value || "").trim();
  const phone = normalizePhone((phoneEl?.value || "").trim());

  // ✅ 달력 입력값은 그대로 문자열 유지 (절대 Date로 변환하지 않음)
const rawBirth = (birthEl?.value || "").trim();

// YYYY-MM-DD 형태만 허용
if(!/^\d{4}-\d{2}-\d{2}$/.test(rawBirth)){
  alert("생년월일 형식이 올바르지 않습니다.");
  return;
}

const birthInput = rawBirth;  // 절대 new Date() 거치지 않음
  const birthTypeInput = (birthTypeEl?.value || "solar").trim(); // solar | lunar
  const isLeap = !!(isLeapEl && isLeapEl.checked);

  if(!name || !phone){
    alert("이름과 전화번호를 입력해주세요.");
    return;
  }
  if(phone.length !== 11 || !phone.startsWith("010")){
    alert("전화번호는 010xxxxxxxx 형식의 11자리 숫자로 입력해주세요.");
    return;
  }
  if(!birthInput){
    alert("생년월일을 입력해주세요.");
    return;
  }

  // 입춘DB 로드(띠/갑자)
  try{ await window.BirthUtil?.loadIpchunDB?.(); }catch(e){}

  // ✅ 계산/저장/서버전송 기준은 무조건 solarBirth
  let solarBirth = birthInput;

  if(birthTypeInput === "lunar"){
    if(typeof window.BirthUtil?.lunarToSolar !== "function"){
      alert("음력 변환 DB가 준비되지 않았습니다. /data/lunar_map.json 및 birth.js를 확인해주세요.");
      return;
    }

    try{
      // ✅ 윤달 포함
      solarBirth = await window.BirthUtil.lunarToSolar(birthInput, isLeap);
    }catch(e){
      alert("음력→양력 변환 실패: " + String(e));
      return;
    }

    if(!solarBirth || !/^\d{4}-\d{2}-\d{2}$/.test(solarBirth)){
      alert(
        "음력→양력 변환 결과를 찾지 못했습니다.\n" +
        `입력: ${birthInput} (윤달=${isLeap ? "예" : "아니오"})\n\n` +
        "DB에 해당 연도가 아직 없거나(예: 1940~), 윤달 체크가 틀릴 수 있어요."
      );
      return;
    }
  }

  // ✅ 띠/갑자 계산은 solarBirth로
  const zodiac = window.BirthUtil?.calcZodiacByIpchun ? window.BirthUtil.calcZodiacByIpchun(solarBirth) : "";
  const gapja  = window.BirthUtil?.calcGapjaByIpchun  ? window.BirthUtil.calcGapjaByIpchun(solarBirth)  : "";

  // reCAPTCHA
  if(typeof grecaptcha === "undefined"){
    alert("reCAPTCHA가 아직 로드되지 않았어요. 잠시 후 다시 시도해주세요.");
    return;
  }
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
    // ✅ 앱스크립트 건드리기 싫다고 했으니:
    // 서버 저장값도 solar로 통일해야(다른 페이지/동기화에서 꼬임 방지)
    const r = await fetch(API_URL,{
      method:"POST",
      headers:{ "Content-Type":"text/plain;charset=utf-8" },
      body: JSON.stringify({
        action:"register",
        phone,
        name,
        birth: solarBirth,   // ✅ 서버에는 "양력" 저장
        birthType: "solar",  // ✅ 서버도 solar로 통일
        zodiac,
        gapja,
        token
      })
    });

    rawTxt = await r.text();
    try{ serverRes = JSON.parse(rawTxt); }
    catch(e){
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
    alert("서버 응답에 status가 없어요.\n\n" + JSON.stringify(serverRes) + "\n\nRAW:\n" + rawTxt);
    return;
  }

  if(st === "captcha_fail"){
    const codes = serverRes?.captcha?.["error-codes"] || serverRes?.errors || [];
    alert("captcha_fail\n" + JSON.stringify(codes));
    return;
  }
  if(st === "invalid"){
    alert("서버에서 invalid 응답.\n\n" + JSON.stringify(serverRes));
    return;
  }

  if(st === "exists" || st === "ok"){
    // ✅ 로컬 저장도 solar 기준으로 통일 (사주/다른 페이지에서 UTC/음력 문제 예방)
    localStorage.setItem("name", name);
    localStorage.setItem("phone", phone);
    localStorage.setItem("birth", solarBirth);
localStorage.setItem("birthType", "solar");

localStorage.setItem("birth_input", birthInput);
localStorage.setItem("birth_input_type", birthTypeInput);
localStorage.setItem("birth_input_isLeap", isLeap ? "1" : "0");

// ✅ 안전장치: "양력 입력"인데 저장된 birth가 다르면 입력값으로 복구
if(birthTypeInput === "solar"){
  const saved = localStorage.getItem("birth");
  if(saved && saved !== birthInput){
    console.warn("[fixBirthShift] corrected birth:", saved, "->", birthInput);
    localStorage.setItem("birth", birthInput);
  }
}

    if(zodiac) localStorage.setItem("zodiac", zodiac);
    if(gapja)  localStorage.setItem("gapja", gapja);
    localStorage.removeItem("guestMode");
    localStorage.removeItem("points");

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
  authGuard();

  document.getElementById("loginSubmit")?.addEventListener("click", handleSubmitLogin);
  document.getElementById("loginClose")?.addEventListener("click", closeLoginModal);

  await syncUserFromServer();
  refreshTopBar();
  refreshPointCard();
});

// /public/js/cookie.js
console.log("[cookie.js] loaded ✅");

let cookieDB = null;

// ---- 유틸: YYYYMMDD 스탬프
function todayStamp(){
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${y}${m}${dd}`;
}

// ---- 유틸: seed (같은 날+같은 사람 = 같은 결과)
function ymdToSeed(ymd){
  const m = String(ymd || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!m) return 12345;
  return Number(m[1])*10000 + Number(m[2])*100 + Number(m[3]);
}

// ---- 고정 랜덤 pick
function seededPick(arr, seed, offset){
  if(!arr?.length) return "";
  const idx = Math.abs((seed + (offset||0)) % arr.length);
  return arr[idx];
}

// ---- 하루 1회만 컨텐츠 보상(+1)
async function rewardOncePerDay(key){
  const stamp = todayStamp();
  const k = `${key}_${stamp}`;
  if(localStorage.getItem(k) === "1") return;
  localStorage.setItem(k, "1");

  if(localStorage.getItem("phone")){
    await window.rewardContent?.(key);
  }
}

// ---- DB 로드 (없어도 동작)
async function loadCookieDB(){
  try{
    // 예: /data/cookie_ko.json 이런 식으로 만들면 좋음
    // 없으면 기본 문구로 fallback
    const db = await window.DB?.loadJSON?.("/data/cookie_ko.json").catch(()=>null);
    cookieDB = db;
  }catch(e){
    cookieDB = null;
  }
}

// ---- 운세 한 줄 생성
function makeFortuneLine(){
function makeFortuneLine(){
  const birth = localStorage.getItem("birth") || "";
  const phone = localStorage.getItem("phone") || "";
  const today = todayStamp(); // YYYYMMDD

  // 사람 고정 seed
  let personSeed = 0;

  if(phone){
    // 로그인 유저는 전화번호 기준
    personSeed = Number(phone.slice(-4)); // 뒤 4자리
  }else if(birth){
    // 비로그인은 생년월일 기준
    const m = birth.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if(m){
      personSeed = Number(m[1]) + Number(m[2]) + Number(m[3]);
    }
  }else{
    // 완전 비로그인
    personSeed = 777;
  }

  const seed = personSeed + Number(today);

  const pools = cookieDB?.pools;

  const fallback = [
    "오늘은 작은 친절이 큰 기회를 부릅니다.",
    "결정이 흔들릴 땐 가장 단순한 선택이 답입니다.",
    "조급함만 내려놓으면 일이 풀립니다.",
    "미루던 일 하나만 끝내도 운이 열립니다.",
    "오늘의 키워드: 정리, 정돈, 정리정돈."
  ];

  const arr = pools?.lines || fallback;

  const idx = Math.abs(seed % arr.length);
  return arr[idx];
}

// ---- UI 렌더
function renderBasicInfo(){
  const name = localStorage.getItem("name") || "회원";
  const birth = localStorage.getItem("birth");

  const box = document.getElementById("basicInfo");
  if(!box) return;

  if(birth){
    box.innerHTML = `<p><b>${name}</b></p><p>생년월일: ${birth}</p><p class="small">※ 오늘은 꼬리표를 당겨 운세를 꺼내보세요.</p>`;
  }else{
    box.innerHTML = `<p><b>${name}</b></p><p class="small">로그인하면 생년월일 기반으로 조금 더 “고정된” 결과가 나와요.</p>`;
  }
}

// ---- 쿠키 열기(한 번만)
function revealCookie(){
  const wrap = document.getElementById("cookieWrap");
  const shell = document.getElementById("cookieShell");
  const paper = document.getElementById("fortunePaper");
  const msgEl = document.getElementById("fortuneMsg");
  const stringEl = document.getElementById("string");
  const hint = document.getElementById("hintText");

  if(!wrap || !shell || !paper || !msgEl) return;

  // 이미 열렸으면 그냥 리턴
  if(wrap.dataset.opened === "1") return;
  wrap.dataset.opened = "1";

  // 메시지 세팅
  const line = makeFortuneLine();
  msgEl.textContent = line;

  // 끈 끊김
  stringEl?.classList.add("break");

  // 쿠키 열기
  shell.classList.add("cookie-open");

  // 종이 등장
  paper.classList.add("show");

  // 텍스트 등장
  setTimeout(()=> msgEl.classList.add("show"), 50);

  if(hint) hint.textContent = "✅ 열렸어요! (다시 뽑기는 아래 버튼)";

  // 포인트: 하루 1회 +1
  rewardOncePerDay("cookie");
}

// ---- 다시 뽑기(리셋)
function resetCookie(){
  const wrap = document.getElementById("cookieWrap");
  const shell = document.getElementById("cookieShell");
  const paper = document.getElementById("fortunePaper");
  const msgEl = document.getElementById("fortuneMsg");
  const stringEl = document.getElementById("string");
  const hint = document.getElementById("hintText");

  if(wrap) wrap.dataset.opened = "0";
  shell?.classList.remove("cookie-open");
  paper?.classList.remove("show");
  msgEl?.classList.remove("show");
  if(msgEl) msgEl.textContent = "";
  stringEl?.classList.remove("break");
  if(hint) hint.textContent = "👇 아래 꼬리표를 잡아당겨 보세요";
}

// ---- 드래그(당기기) 처리
function setupPullInteraction(){
  const tag = document.getElementById("pullTag");
  const stringEl = document.getElementById("string");
  const shell = document.getElementById("cookieShell");

  if(!tag || !stringEl || !shell) return;

  let isDown = false;
  let startY = 0;
  let pull = 0; // 0~100 정도

  const THRESHOLD = 55; // 이 이상 당기면 reveal
  const MAX_PULL = 80;

  function onDown(clientY){
    // 이미 열렸으면 드래그 금지
    const wrap = document.getElementById("cookieWrap");
    if(wrap?.dataset.opened === "1") return;

    isDown = true;
    startY = clientY;
    pull = 0;
    tag.style.transform = "translateY(0px)";
    stringEl.style.height = "60px";
    stringEl.classList.add("stretch");
  }

  function onMove(clientY){
    if(!isDown) return;
    pull = Math.max(0, Math.min(MAX_PULL, clientY - startY));

    // 태그 내려감
    tag.style.transform = `translateY(${pull}px)`;

    // 끈 길어짐(시각효과)
    stringEl.style.height = `${60 + pull}px`;

    // 쿠키 살짝 흔들(너무 과하지 않게)
    if(pull > 10){
      shell.classList.remove("cookie-shake");
      // reflow
      void shell.offsetWidth;
      shell.classList.add("cookie-shake");
    }

    // 임계치 도달하면 즉시 오픈
    if(pull >= THRESHOLD){
      isDown = false;
      stringEl.classList.remove("stretch");
      tag.style.transform = `translateY(${THRESHOLD}px)`;
      revealCookie();
    }
  }

  function onUp(){
    if(!isDown) return;
    isDown = false;
    stringEl.classList.remove("stretch");

    // 임계치 못 넘기면 원상복구(탄성 느낌)
    tag.style.transition = "transform .25s ease";
    stringEl.style.transition = "height .25s ease";
    tag.style.transform = "translateY(0px)";
    stringEl.style.height = "60px";

    setTimeout(()=>{
      tag.style.transition = "";
      stringEl.style.transition = "";
    }, 260);
  }

  // mouse
  tag.addEventListener("mousedown", (e)=> onDown(e.clientY));
  window.addEventListener("mousemove", (e)=> onMove(e.clientY));
  window.addEventListener("mouseup", onUp);

  // touch
  tag.addEventListener("touchstart", (e)=>{
    const t = e.touches?.[0];
    if(!t) return;
    onDown(t.clientY);
  }, {passive:true});

  window.addEventListener("touchmove", (e)=>{
    const t = e.touches?.[0];
    if(!t) return;
    onMove(t.clientY);
  }, {passive:true});

  window.addEventListener("touchend", onUp, {passive:true});
}

document.addEventListener("DOMContentLoaded", async ()=>{
  // 기본 정보 표시
  renderBasicInfo();

  // 공유 버튼 연결
  document.getElementById("btnShare")?.addEventListener("click", ()=>{
    // common.js가 있으면 그걸 쓰고, 없으면 기본 공유
    if(window.Common?.shareAndReward){
      window.Common.shareAndReward();
      return;
    }
    if(navigator.share){
      navigator.share({
        title: "포춘쿠키",
        text: "오늘의 한 줄 운세, 포춘쿠키에서 확인해보세요!",
        url: location.href
      }).catch(()=>{});
    }else{
      alert("공유 기능이 지원되지 않는 환경입니다.");
    }
  });

  // 다시 뽑기
  document.getElementById("btnAgain")?.addEventListener("click", ()=>{
    resetCookie();
  });

  // DB 로드
  await loadCookieDB();

  // 당기기 인터랙션
  setupPullInteraction();
  function makeDailyCookie(cookieDB){
  const stamp = Number(todayStamp());
  const seed = userSeed() + stamp;

  const category = weightedPick(cookieDB?.weights, seed);
  const pool = cookieDB?.pools?.[category] || cookieDB?.pools?.overall || [];

  const text = seededPick(pool, seed, 13) || "오늘은 천천히 가도 괜찮습니다.";
  return { category, text };
  }
});

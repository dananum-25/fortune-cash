// /public/js/cookie.js
console.log("[cookie.js] loaded ✅");

let cookieDB = null;

// ---- 유틸: YYYYMMDD
function todayStamp(){
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const da = String(d.getDate()).padStart(2,"0");
  return `${y}${m}${da}`;
}

// ---- 유저 seed (phone 우선, 없으면 birth)
function userSeed(){
  const phone = localStorage.getItem("phone") || "";
  const birth = localStorage.getItem("birth") || "";

  if(phone){
    const tail = phone.slice(-6);
    return Number(tail) || 777777;
  }

  const m = String(birth).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(m){
    return (Number(m[1])*10000) + (Number(m[2])*100) + Number(m[3]);
  }
  return 777777;
}

// ---- weighted pick (카테고리 선택)
function weightedPick(weights, seed){
  const entries = Object.entries(weights || {});
  let sum = 0;
  entries.forEach(([k,v]) => sum += Number(v||0));
  if(sum <= 0) return "overall";

  const r = Math.abs(seed) % sum;
  let acc = 0;
  for(const [k,v] of entries){
    acc += Number(v||0);
    if(r < acc) return k;
  }
  return entries[0]?.[0] || "overall";
}

// ---- seededPick (배열에서 고정 선택)
function seededPick(arr, seed, offset){
  if(!arr || !arr.length) return "";
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
    // /public/data/cookie_ko.json
    const db = await window.DB?.loadJSON?.("/data/cookie_ko.json").catch(()=>null);
    cookieDB = db;
  }catch(e){
    cookieDB = null;
  }
}

// ---- 하루 1개 고정 저장 키
function getDailyKey(){
  return `cookie_daily_${todayStamp()}`;
}

// ---- 오늘의 쿠키 생성 (희귀 5% 포함 + 하루 고정)
function makeDailyCookie(){
  const stamp = Number(todayStamp());
  const seed = userSeed() + stamp;

  const pools = cookieDB?.pools || {};

  // ✅ 5% 희귀 트리거 (seed 기반이라 하루/유저 고정)
  const isRare = (Math.abs(seed) % 100) < 5;

  if(isRare && pools?.rare?.length){
    const arr = pools.rare;
    const idx = Math.abs((seed + 13) % arr.length);
    return { category: "rare", text: arr[idx], rare: true };
  }

  // 일반 카테고리
  const weights = cookieDB?.weights || { overall: 100 };
  const category = weightedPick(weights, seed);

  const pool = pools?.[category] || pools?.overall || [];

  const fallback = [
    "오늘은 작은 친절이 큰 기회를 부릅니다.",
    "결정이 흔들릴 땐 가장 단순한 선택이 답입니다.",
    "조급함만 내려놓으면 일이 풀립니다.",
    "미루던 일 하나만 끝내도 운이 열립니다.",
    "오늘의 키워드: 정리, 정돈, 정리정돈."
  ];

  const arr = (pool && pool.length) ? pool : fallback;
  const text = seededPick(arr, seed, 17) || fallback[0];

  return { category, text, rare: false };
}

// ---- UI 기본 정보
function renderBasicInfo(){
  const name = localStorage.getItem("name") || "회원";
  const birth = localStorage.getItem("birth");
  const phone = localStorage.getItem("phone") || "";

  const box = document.getElementById("basicInfo");
  const loginHint = document.getElementById("loginHint");
  if(!box) return;

  if(phone){
    box.innerHTML =
      `<p><b>${name}</b>님</p><p class="small">로그인 상태: ✅</p>` +
      (birth ? `<p class="small">생년월일: ${birth}</p>` : "");
    if(loginHint) loginHint.style.display = "none";
  }else{
    box.innerHTML =
      `<p><b>${name}</b></p>` +
      (birth ? `<p class="small">생년월일: ${birth}</p>` : `<p class="small">비로그인도 이용 가능</p>`);
    if(loginHint) loginHint.style.display = "block";
  }
}

// ---- 쿠키 열기 UI (공통)
function openCookieUI({ category, text, rare }){
  const wrap = document.getElementById("cookieWrap");
  const shell = document.getElementById("cookieShell");
  const paper = document.getElementById("fortunePaper");
  const msgEl = document.getElementById("fortuneMsg");
  const titleEl = document.getElementById("fortuneTitle");
  const stringEl = document.getElementById("string");
  const hint = document.getElementById("hintText");
  const tag = document.getElementById("pullTag");

  if(!wrap || !shell || !paper || !msgEl) return;

  // 이전 희귀 효과 제거
  wrap.classList.remove("rare-glow");

  const labelMap = {
    overall: "전체운",
    wealth: "재물운",
    love: "연애운",
    career: "직장/사업운",
    health: "건강운",
    rare: "희귀운"
  };

  wrap.dataset.opened = "1";

  if(titleEl){
    titleEl.textContent = `🥠 오늘의 포춘쿠키 · ${labelMap[category] || "전체운"}`;
  }

  // 희귀 UI
  if(rare){
    wrap.classList.add("rare-glow");
    if(titleEl){
      titleEl.innerHTML =
        `<span class="rare-badge">RARE</span> 🥠 오늘의 포춘쿠키`;
    }
  }

  msgEl.textContent = text || "";

  stringEl?.classList.add("break");
  shell.classList.add("cookie-open");
  paper.classList.add("show");

  setTimeout(()=> msgEl.classList.add("show"), 50);

  if(hint) hint.textContent = "✅ 오늘의 쿠키가 열렸어요!";

  if(tag){
    tag.disabled = true;
    tag.textContent = "DONE";
    tag.style.opacity = "0.85";
    tag.style.cursor = "default";
  }
}

// ---- 쿠키 흔들기(다시뽑기 눌렀을 때 안내용)
function shakeCookie(){
  const shell = document.getElementById("cookieShell");
  if(!shell) return;
  shell.classList.remove("cookie-shake");
  void shell.offsetWidth;
  shell.classList.add("cookie-shake");
}

// ---- 다시뽑기 (B안: 오늘은 막고 안내만)
function tryAgain(){
  const againHint = document.getElementById("againHint");
  if(againHint) againHint.style.display = "block";
  shakeCookie();
}

// ---- 드래그(당기기) 처리 (임계치 넘으면 오픈)
function setupPullInteraction(){
  const tag = document.getElementById("pullTag");
  const stringEl = document.getElementById("string");
  const shell = document.getElementById("cookieShell");
  const wrap = document.getElementById("cookieWrap");

  if(!tag || !stringEl || !shell || !wrap) return;

  let isDown = false;
  let startY = 0;
  let pull = 0;

  const THRESHOLD = 55;
  const MAX_PULL = 80;

  function onDown(clientY){
    // 이미 오늘 뽑았으면 당기기 금지
    if(localStorage.getItem(getDailyKey())) return;
    if(wrap.dataset.opened === "1") return;

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

    tag.style.transform = `translateY(${pull}px)`;
    stringEl.style.height = `${60 + pull}px`;

    if(pull > 10){
      shell.classList.remove("cookie-shake");
      void shell.offsetWidth;
      shell.classList.add("cookie-shake");
    }

    if(pull >= THRESHOLD){
      isDown = false;
      stringEl.classList.remove("stretch");
      tag.style.transform = `translateY(${THRESHOLD}px)`;
      revealCookieOnce();
    }
  }

  function onUp(){
    if(!isDown) return;
    isDown = false;
    stringEl.classList.remove("stretch");

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

// ---- 실제 오픈(오늘 1회 고정 저장)
async function revealCookieOnce(){
  const dailyKey = getDailyKey();

  // 이미 오늘 뽑았으면 저장된 값으로만 열기
  const saved = localStorage.getItem(dailyKey);
  if(saved){
    try{
      const obj = JSON.parse(saved);
      openCookieUI(obj);
      return;
    }catch(e){}
  }

  // 오늘의 쿠키 만들고 저장
  const obj = makeDailyCookie();
  localStorage.setItem(dailyKey, JSON.stringify(obj));

  openCookieUI(obj);

  // 포인트: 하루 1회 +1
  await rewardOncePerDay("cookie");
}

document.addEventListener("DOMContentLoaded", async ()=>{
  renderBasicInfo();

  // DB 로드
  await loadCookieDB();

  // 혹시 오늘 이미 뽑았으면 자동 복원(페이지 재방문)
  const dailyKey = getDailyKey();
  const saved = localStorage.getItem(dailyKey);
  if(saved){
    try{
      const obj = JSON.parse(saved);
      openCookieUI(obj);
      const hint = document.getElementById("hintText");
      if(hint) hint.textContent = "오늘은 이미 뽑았어요 🙂";
    }catch(e){}
  }

  // 공유 버튼
  document.getElementById("btnShare")?.addEventListener("click", async ()=>{
    if(window.Common?.shareAndReward){
      window.Common.shareAndReward();
      return;
    }

    try{
      if(navigator.share){
        await navigator.share({
          title: "포춘쿠키",
          text: "오늘의 한 줄 운세, 포춘쿠키에서 확인해보세요! 🥠",
          url: location.href
        });
        await rewardOncePerDay("share_cookie");
        alert("공유 완료! ✅");
      }else{
        await navigator.clipboard.writeText(location.href);
        await rewardOncePerDay("share_cookie");
        alert("링크를 복사했어요 ✅");
      }
    }catch(e){
      console.log("[share] canceled or failed", e);
    }
  });

  // 다시 뽑기(B안): 오늘은 안내만
  document.getElementById("btnAgain")?.addEventListener("click", ()=>{
    tryAgain();
  });

  // 당기기 인터랙션
  setupPullInteraction();

  // 클릭으로도 오픈 가능하게(원하면) - 태그 클릭 시
  document.getElementById("pullTag")?.addEventListener("click", ()=>{
    revealCookieOnce();
  });
  // ---- 운세 한 줄 생성 (희귀 5% 포함)

});

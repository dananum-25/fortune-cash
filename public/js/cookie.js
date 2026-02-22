console.log("[cookie.js] loaded ✅");

function escapeHtml(s){
  return String(s ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

function ymdToSeed(ymd){
  const m = String(ymd || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!m) return 12345;
  return Number(m[1])*10000 + Number(m[2])*100 + Number(m[3]);
}

function getTodayStamp(){
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth()+1).padStart(2,"0");
  const d = String(t.getDate()).padStart(2,"0");
  return `${y}${m}${d}`; // YYYYMMDD
}

function seededPick(arr, seed){
  if(!Array.isArray(arr) || arr.length === 0) return "";
  const idx = Math.abs(seed % arr.length);
  return arr[idx];
}

async function rewardOncePerDay(key){
  const stamp = getTodayStamp();
  const k = `${key}_${stamp}`;
  if(localStorage.getItem(k) === "1") return;
  localStorage.setItem(k, "1");
  if(localStorage.getItem("phone")){
    await window.rewardContent?.(key); // +1 하루 1회
  }
}

async function loadJSON(path){
  try{
    if(window.DB?.loadJSON) return await window.DB.loadJSON(path);
    return await fetch(path).then(r=>r.json());
  }catch(e){
    console.warn("[cookie.js] load failed:", e);
    return null;
  }
}

/* ====== 정책: 로그인=하루1개 고정 / 게스트=매번 랜덤 ====== */
function getCookieMessage(arr){
  const phone = localStorage.getItem("phone");
  const birth = localStorage.getItem("birth"); // YYYY-MM-DD (auth.js가 정규화)
  const stamp = getTodayStamp();

  // 로그인 유저: (birth + stamp)로 오늘의 1개 고정
  if(phone && birth){
    const base = ymdToSeed(birth);
    const seed = base + Number(stamp);
    return {
      msg: seededPick(arr, seed) || "오늘은 작은 선택이 큰 흐름을 만듭니다.",
      fixedToday: true
    };
  }

  // 게스트: 매번 랜덤
  const seed = Math.floor(Math.random() * 999999);
  return {
    msg: seededPick(arr, seed) || "오늘은 작은 선택이 큰 흐름을 만듭니다.",
    fixedToday: false
  };
}

/* ====== UI: 태그 당기기 ====== */
function setupPullUI({ onReveal, fixedToday }){
  const tag = document.getElementById("pullTag");
  const string = document.getElementById("string");
  const paper = document.getElementById("fortunePaper");
  const msgEl = document.getElementById("fortuneMsg");
  const shell = document.getElementById("cookieShell");
  const hint = document.getElementById("hintText");

  let pulling = false;
  let startY = 0;
  let current = 0;
  let revealed = false;

  const MAX_PULL = 120;       // 당길 수 있는 최대 px
  const REVEAL_AT = 85;       // 이 이상 당기면 공개

  function setPull(v){
    current = Math.max(0, Math.min(MAX_PULL, v));
    tag.style.transform = `translateY(${current}px)`;
    string.style.height = `${60 + current}px`;
    string.classList.add("stretch");
  }

  function resetPull(){
    tag.style.transition = "transform .25s ease";
    string.style.transition = "height .25s ease";
    tag.style.transform = `translateY(0px)`;
    string.style.height = `60px`;

    setTimeout(()=>{
      tag.style.transition = "";
      string.style.transition = "";
      string.classList.remove("stretch");
    }, 260);

    current = 0;
  }

  function reveal(){
    if(revealed) return;
    revealed = true;

    // 쿠키 흔들
    shell.classList.remove("cookie-shake");
    void shell.offsetWidth; // reflow
    shell.classList.add("cookie-shake");

    paper.classList.add("show");
    hint && (hint.textContent = fixedToday ? "✅ 오늘의 쿠키를 열었어요 (로그인: 하루 1개)" : "✅ 새 쿠키가 나왔어요!");

    onReveal?.({ paper, msgEl });
  }

  function onDown(e){
    if(revealed && fixedToday){
      // 로그인 유저: 이미 열었으면 더 당겨도 변화 없음
      return;
    }
    pulling = true;
    startY = (e.touches ? e.touches[0].clientY : e.clientY);
    e.preventDefault?.();
  }

  function onMove(e){
    if(!pulling) return;
    const y = (e.touches ? e.touches[0].clientY : e.clientY);
    const dy = y - startY;
    setPull(dy);

    if(current >= REVEAL_AT){
      reveal();
    }
  }

  function onUp(){
    if(!pulling) return;
    pulling = false;
    if(!revealed) resetPull();
    else resetPull();
  }

  // Pointer Events 우선, 없으면 touch/mouse
  tag.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);

  // 모바일 호환(일부 브라우저)
  tag.addEventListener("touchstart", onDown, { passive:false });
  window.addEventListener("touchmove", onMove, { passive:false });
  window.addEventListener("touchend", onUp);

  tag.addEventListener("mousedown", onDown);
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
}

document.addEventListener("DOMContentLoaded", async ()=>{
  const name = localStorage.getItem("name") || "회원";
  const birth = localStorage.getItem("birth");
  const phone = localStorage.getItem("phone");

  const db = await loadJSON("/data/cookie_ko.json");
  const arr = db?.pools?.cookie || [];

  // 기본 정보 표시
  const infoEl = document.getElementById("basicInfo");
  if(infoEl){
    infoEl.innerHTML =
      `<p><b>${escapeHtml(name)}</b>님</p>` +
      (phone && birth
        ? `<p class="small">로그인 상태: 오늘은 쿠키 1개가 고정됩니다.</p>`
        : `<p class="small">게스트 모드: 당길 때마다 다른 쿠키가 나올 수 있어요.</p>`);
  }

  let current = getCookieMessage(arr);

  // 메시지는 “당겼을 때” 보여주기 위해 미리 저장만
  const msg = current.msg;

  setupPullUI({
    fixedToday: current.fixedToday,
    onReveal: ({ msgEl })=>{
      msgEl.innerHTML = escapeHtml(msg);

      // 컨텐츠 이용 보상(+1) 하루 1회
      rewardOncePerDay("cookie");
    }
  });

  // 버튼들
  document.getElementById("btnAgain")?.addEventListener("click", ()=>{
    const fixed = !!(localStorage.getItem("phone") && localStorage.getItem("birth"));
    if(fixed){
      alert("로그인 상태에서는 하루에 1개만 열 수 있어요 🙂");
      return;
    }
    location.reload();
  });

  document.getElementById("btnShare")?.addEventListener("click", async ()=>{
    // 아직 안 열었으면 먼저 열라고 유도
    const paperShown = document.getElementById("fortunePaper")?.classList.contains("show");
    if(!paperShown){
      alert("먼저 꼬리표를 잡아당겨 쿠키를 열어주세요 🙂");
      return;
    }

    const text = "🥠 포춘쿠키: " + msg + "\n" + location.href;

    try{
      if(navigator.share){
        await navigator.share({ text });
      }else{
        await navigator.clipboard.writeText(text);
        alert("복사 완료! 친구에게 붙여넣기 해주세요 ✅");
      }
    }catch(e){
      // 취소해도 OK
    }

    // 공유 보상도 하루 1회로(원하면 cookie_share로 분리 가능)
    await rewardOncePerDay("cookie");
  });
});

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

function seededPick(arr, seed, offset){
  if(!Array.isArray(arr) || arr.length === 0) return "";
  const idx = Math.abs((seed + (offset||0)) % arr.length);
  return arr[idx];
}

async function rewardOncePerDay(key){
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth()+1).padStart(2,"0");
  const d = String(today.getDate()).padStart(2,"0");
  const stamp = `${y}${m}${d}`;

  const k = `${key}_${stamp}`;
  if(localStorage.getItem(k) === "1") return;
  localStorage.setItem(k, "1");

  if(localStorage.getItem("phone")){
    await window.rewardContent?.(key); // +1 (서버쪽은 addPoint 고정)
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

document.addEventListener("DOMContentLoaded", async ()=>{
  const name = localStorage.getItem("name") || "회원";
  const birth = localStorage.getItem("birth"); // 로그인 안 해도 사용 가능하게(게스트)
  const seed = birth ? ymdToSeed(birth) : Math.floor(Math.random()*99999);

  const db = await loadJSON("/data/cookie_ko.json");
  const arr = db?.pools?.cookie || [];

  const msg = seededPick(arr, seed, 7) || "오늘은 작은 선택이 큰 흐름을 만듭니다.";

  const infoEl = document.getElementById("basicInfo");
  const boxEl = document.getElementById("cookieBox");

  if(infoEl){
    infoEl.innerHTML = `<p><b>${escapeHtml(name)}</b>님</p>` + (birth ? `<p class="small">생년월일 기반으로 같은 쿠키가 나올 수 있어요.</p>` : `<p class="small">게스트 모드: 매번 다른 쿠키가 나올 수 있어요.</p>`);
  }

  if(boxEl){
    boxEl.innerHTML = `
      <div class="cookie">
        <div class="cookie-top">🥠 오늘의 포춘쿠키</div>
        <div class="cookie-msg">${escapeHtml(msg)}</div>
      </div>
    `;
  }

  // 버튼
  document.getElementById("btnAgain")?.addEventListener("click", ()=>{
    // 게스트면 즉시 새 랜덤, 로그인이면 같은 seed라 "오늘은 1개" 컨셉 추천
    location.reload();
  });

  document.getElementById("btnShare")?.addEventListener("click", async ()=>{
    const text = "🥠 포춘쿠키: " + msg + "\n" + location.href;

    try{
      if(navigator.share){
        await navigator.share({ text });
      }else{
        await navigator.clipboard.writeText(text);
        alert("복사 완료! 친구에게 붙여넣기 해주세요 ✅");
      }
    }catch(e){
      // 취소해도 조용히
    }

    // 공유 보상은 '하루 1회'로만 (원하면 key를 cookie_share로 분리 가능)
    await rewardOncePerDay("cookie");
  });

  // 컨텐츠 이용 보상(+1) 하루 1회
  await rewardOncePerDay("cookie");
});

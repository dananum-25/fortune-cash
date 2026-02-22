console.log("[tojung.js] loaded ✅");

function ymdToSeed(ymd){
  const m = String(ymd || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!m) return 12345;
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  return (y * 10000) + (mo * 100) + d;
}

// 같은 생년월일이면 같은 결과(고정 랜덤)
function seededPick(arr, seed, offset){
  if(!Array.isArray(arr) || arr.length === 0) return "";
  const idx = Math.abs((seed + (offset || 0)) % arr.length);
  return arr[idx];
}

function safeNum(v, fallback=0){
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function pickBand(scoreGuide, score){
  const bands = scoreGuide?.bands || [];
  const sorted = [...bands].sort((a,b)=>(b.min||0)-(a.min||0));
  return sorted.find(b => score >= (b.min || 0)) || sorted[sorted.length - 1] || null;
}

function categoryLabel(key){
  if(key === "wealth") return "💰 재물운";
  if(key === "love") return "💖 연애운";
  if(key === "career") return "🏢 직장/사업운";
  if(key === "health") return "💪 건강운";
  return key;
}

// 점수 기반 자동 해석 HTML 생성
function buildAutoInterpretation(db, seed){
  const scores = db?.scores || {};
  const cats = scores?.categories || {};
  const guide = db?.scoreGuide || {};

  const total = safeNum(scores.total, 0);
  const bandTotal = pickBand(guide, total);

  const oneLine = scores.oneLine || seededPick(db?.summary, seed, 1) || "";
  const keywords = Array.isArray(scores.keywords) ? scores.keywords : [];

  // 상단(총평)
  let html = `
    <div class="card">
      <h2>📌 2026 토정비결 리포트</h2>
      <p><b>총점:</b> ${total}점 ${bandTotal?.title ? `· <b>${bandTotal.title}</b>` : ""}</p>
      ${bandTotal?.text ? `<p>${bandTotal.text}</p>` : ""}
      ${oneLine ? `<div class="hr"></div><p><b>한 줄 총평</b><br>${oneLine}</p>` : ""}
      ${keywords.length ? `<p class="small">키워드: ${keywords.map(k=>`#${k}`).join(" ")}</p>` : ""}
    </div>
  `;

  // 카테고리별 자동 해석
  ["wealth","love","career","health"].forEach((key, i)=>{
    const s = safeNum(cats[key], 0);
    const band = pickBand(guide, s);
    const tips = guide?.categoryTips?.[key] || [];

    // 각 카테고리 긴 해석은 DB의 배열에서 seed로 1개 고정 선택
    const longArr = db?.[key] || [];
    const longPick = seededPick(longArr, seed, 10 + i);

    html += `
      <div class="card">
        <h2>${categoryLabel(key)}</h2>
        <p><b>${s}점</b> ${band?.title ? `· <b>${band.title}</b>` : ""}</p>
        ${band?.text ? `<p>${band.text}</p>` : ""}
        ${longPick ? `<div class="hr"></div><p>${longPick}</p>` : ""}
        ${(tips && tips.length) ? `
          <div class="hr"></div>
          <p><b>실전 팁</b><br>
            ${tips[0] ? `• ${tips[0]}<br>` : ""}
            ${tips[1] ? `• ${tips[1]}` : ""}
          </p>
        ` : ""}
      </div>
    `;
  });

  // 체크리스트(상단 일부만 보여주고 더보기 느낌)
  const checklist = Array.isArray(db?.checklist) ? db.checklist : [];
  if(checklist.length){
    const pick1 = seededPick(checklist, seed, 101);
    const pick2 = seededPick(checklist, seed, 102);
    const pick3 = seededPick(checklist, seed, 103);

    html += `
      <div class="card">
        <h2>✅ 올해 체크리스트</h2>
        <p>• ${pick1}</p>
        <p>• ${pick2}</p>
        <p>• ${pick3}</p>
        <p class="small">※ 전체 체크리스트는 DB에 저장되어 있어요.</p>
      </div>
    `;
  }

  // 월별(현재 달 3개 문장 고정)
  const months = db?.months || {};
  const now = new Date();
  const mm = String(now.getMonth()+1); // "1"~"12"
  const monthArr = months?.[mm];

  if(Array.isArray(monthArr) && monthArr.length){
    html += `
      <div class="card">
        <h2>🗓 ${mm}월 포인트</h2>
        <p>• ${monthArr[0] || ""}</p>
        <p>• ${monthArr[1] || ""}</p>
        <p>• ${monthArr[2] || ""}</p>
      </div>
    `;
  }

  return html;
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
    await window.rewardContent?.(key);
  }
}

document.addEventListener("DOMContentLoaded", async ()=>{
  const birth = localStorage.getItem("birth");
  const name = localStorage.getItem("name") || "회원";

  if(!birth){
    document.getElementById("loginCheck").innerHTML =
      "<h2>⚠ 로그인 필요</h2><p>토정비결은 로그인 후 생년월일이 저장되어야 볼 수 있어요.</p><p class='small'>메인에서 로그인 후 다시 들어와주세요.</p>";
    return;
  }

  document.getElementById("loginCheck").innerHTML =
    "<h2>✅ 준비 완료</h2><p>2026년 토정비결을 불러올게요.</p>";

  // DB 로드
  const db = await (window.DB?.loadJSON?.("/data/tojung_2026.json").catch(()=>null));
  if(!db){
    document.getElementById("loginCheck").innerHTML =
      "<h2>⚠ 데이터 로드 실패</h2><p>tojung_2026.json을 불러오지 못했어요. /data 경로를 확인해주세요.</p>";
    return;
  }

  const seed = ymdToSeed(birth);

  // 기본 정보
  const basicInfo = document.getElementById("basicInfo");
  if(basicInfo){
    basicInfo.innerHTML =
      `<p><b>${name}</b></p><p>생년월일: ${birth}</p><p class="small">※ 같은 생년월일은 같은 해석 흐름이 나옵니다.</p>`;
  }

  // ✅ 기존 summaryBox/detailBox/result 구조를 그대로 쓰되,
  //    내용은 “점수 기반 자동 해석”으로 넣어줌
  const summaryBox = document.getElementById("summaryBox");
  if(summaryBox){
    summaryBox.innerHTML = `<span class="badge">자동 해석</span><p>점수 기반 리포트를 생성했습니다.</p>`;
  }

  const detailBox = document.getElementById("detailBox");
  if(detailBox){
    detailBox.innerHTML = buildAutoInterpretation(db, seed);
  }

  document.getElementById("result").style.display = "block";

  // 컨텐츠 이용 보상(+1) 하루 1번
  await rewardOncePerDay("tojung");
});

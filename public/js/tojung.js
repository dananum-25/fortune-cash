console.log("[tojung.js] loaded ✅");

// -----------------------------
// utils
// -----------------------------
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
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  return (y * 10000) + (mo * 100) + d;
}

// 같은 사람은 같은 결과
function seededPick(arr, seed, offset){
  if(!Array.isArray(arr) || arr.length === 0) return "";
  const idx = Math.abs((seed + (offset||0)) % arr.length);
  return arr[idx];
}

// 하루 1번만 +1 (중복방지)
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

// score band 찾기
function findBand(scoreGuide, score){
  const bands = scoreGuide?.bands;
  if(!Array.isArray(bands) || bands.length === 0){
    return { title:"보통", text:"기본기 관리가 핵심입니다." };
  }
  // min 내림차순이 아닐 수도 있으니 정렬해서 안전하게
  const sorted = [...bands].sort((a,b)=>(b.min??0)-(a.min??0));
  const hit = sorted.find(b => Number(score) >= Number(b.min ?? 0)) || sorted[sorted.length-1];
  return {
    title: hit?.title || "보통",
    text: hit?.text || ""
  };
}

function barColorClass(score){
  if(score >= 85) return "bar-high";
  if(score >= 70) return "bar-good";
  if(score >= 55) return "bar-mid";
  return "bar-low";
}

function renderBars(categories){
  const rows = [
    {k:"wealth", label:"💰 재물운"},
    {k:"love", label:"💖 연애운"},
    {k:"career", label:"🏢 직장/사업운"},
    {k:"health", label:"💪 건강운"},
  ];

  const html = rows.map(r=>{
    const v = Number(categories?.[r.k] ?? 0);
    return `
      <div style="margin:12px 0;">
        <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:6px;">
          <span>${r.label}</span>
          <span><b>${escapeHtml(v)}점</b></span>
        </div>
        <div style="height:12px;background:#222;border-radius:10px;overflow:hidden;">
          <div class="${barColorClass(v)}" style="height:100%;width:${Math.max(0,Math.min(100,v))}%;border-radius:10px;"></div>
        </div>
      </div>
    `;
  }).join("");

  return `
    <div style="margin-top:10px;">
      ${html}
    </div>
  `;
}

function getThisMonth(){
  return new Date().getMonth() + 1; // 1~12
}

function renderList(title, arr, seed, baseOffset, limit){
  const list = Array.isArray(arr) ? arr : [];
  const n = Math.min(limit || 5, list.length);
  if(n <= 0) return "";

  // seed 기반으로 “고정된 랜덤 선택”
  const picked = [];
  for(let i=0;i<n;i++){
    const t = seededPick(list, seed, (baseOffset||0) + i*7);
    if(t && !picked.includes(t)) picked.push(t);
  }

  const li = picked.map(t=>`<li>${escapeHtml(t)}</li>`).join("");
  return `
    <h3 style="margin:16px 0 8px;">${escapeHtml(title)}</h3>
    <ul style="line-height:1.8;margin:0 0 8px 18px;padding:0;">${li}</ul>
  `;
}

function renderKeywords(keywords){
  const arr = Array.isArray(keywords) ? keywords : [];
  if(arr.length === 0) return "";
  const badges = arr.slice(0,8).map(k=>`<span class="badge">${escapeHtml(k)}</span>`).join("");
  return `<div style="margin-top:6px;">${badges}</div>`;
}

function renderLucky(lucky, seed){
  const pick = (arr, off)=>{
    const v = seededPick(Array.isArray(arr)?arr:[], seed, off);
    return v ? escapeHtml(v) : "-";
  };

  return `
    <h3 style="margin:16px 0 8px;">🍀 올해의 럭키 힌트</h3>
    <p>색상: <b>${pick(lucky?.color, 11)}</b></p>
    <p>숫자: <b>${pick(lucky?.number, 22)}</b></p>
    <p>방향: <b>${pick(lucky?.direction, 33)}</b></p>
    <p>음식: <b>${pick(lucky?.food, 44)}</b></p>
    <p>아이템: <b>${pick(lucky?.item, 55)}</b></p>
  `;
}

function renderThisMonthFortune(monthsObj, seed){
  const m = String(getThisMonth());
  const arr = monthsObj?.[m];
  if(!Array.isArray(arr) || arr.length === 0) return "";
  const a = seededPick(arr, seed, 101);
  const b = seededPick(arr, seed, 102);
  const c = seededPick(arr, seed, 103);

  return `
    <h3 style="margin:16px 0 8px;">📅 이번 달(${m}월) 흐름</h3>
    <p>• ${escapeHtml(a)}</p>
    <p>• ${escapeHtml(b)}</p>
    <p>• ${escapeHtml(c)}</p>
  `;
}

// -----------------------------
// main
// -----------------------------
document.addEventListener("DOMContentLoaded", async ()=>{
  const birth = localStorage.getItem("birth");
  const name  = localStorage.getItem("name") || "회원";

  // 로그인 필요(생년월일 기반)
  if(!birth){
    const el = document.getElementById("loginCheck");
    if(el){
      el.innerHTML =
        "<h2>⚠ 로그인 필요</h2><p>토정비결은 로그인 후 생년월일이 저장되어야 볼 수 있어요.</p><p class='small'>메인에서 로그인 후 다시 들어와주세요.</p>";
    }
    return;
  }

  document.getElementById("loginCheck").innerHTML =
    "<h2>✅ 준비 완료</h2><p>2026년 토정비결 리포트를 불러오는 중…</p>";

  // JSON 로드 (DB.loadJSON이 없을 수도 있으니 fetch fallback)
  let db = null;
  try{
    if(window.DB?.loadJSON){
      db = await window.DB.loadJSON("/data/tojung_2026.json");
    }else{
      const res = await fetch("/data/tojung_2026.json", { cache: "no-store" });

      if(!res.ok){
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }

      const text = await res.text();

      try{
        db = JSON.parse(text);
      }catch(parseErr){
        console.error("[tojung.js] JSON parse error", parseErr);
        console.error("[tojung.js] invalid json preview:", text.slice(0, 300));
        throw new Error("JSON_PARSE_ERROR");
      }
    }
  }catch(e){
    console.warn("tojung db load failed", e);
    db = null;
  }

  if(!db){
    document.getElementById("loginCheck").innerHTML =
      "<h2>⚠ 데이터 로드 실패</h2><p>토정비결 데이터를 불러오지 못했어요.</p><p class='small'>잠시 후 다시 시도해주세요. 문제가 계속되면 운영자에게 문의해주세요.</p>";
    return;
  }

  const seed = ymdToSeed(birth);

  // 데이터 꺼내기 (너 JSON 구조 그대로)
  const summaryArr   = db.summary || [];
  const checklistArr = db.checklist || [];
  const scores       = db.scores || {};
  const scoreGuide   = db.scoreGuide || {};
  const wealthArr    = db.wealth || [];
  const loveArr      = db.love || [];
  const careerArr    = db.career || [];
  const healthArr    = db.health || [];
  const monthsObj    = db.months || {};
  const lucky        = db.lucky || {};
  const cautionArr   = db.caution || [];

  const totalScore = Number(scores?.total ?? 0);
  const cats = scores?.categories || {};

  // 1) 기본정보
  document.getElementById("basicInfo").innerHTML = `
    <p><b>${escapeHtml(name)}</b></p>
    <p>생년월일: ${escapeHtml(birth)}</p>
    <p class="small">※ 같은 생년월일이면 같은 리포트가 나오도록 고정되어 있어요.</p>
  `;

  // 2) 한줄 총평 + 키워드 + 밴드 해석
  const oneLine = scores?.oneLine || seededPick(summaryArr, seed, 1) || "2026년은 정리와 선택이 중요한 해입니다.";
  const band = findBand(scoreGuide, totalScore);

  const keywordsHtml = renderKeywords(scores?.keywords || []);
  const summaryHtml = `
    <div>
      <span class="badge">총점 ${escapeHtml(totalScore)}점 · ${escapeHtml(band.title)}</span>
      <p style="margin-top:10px;"><b>${escapeHtml(oneLine)}</b></p>
      <p class="small">${escapeHtml(band.text)}</p>
      ${keywordsHtml}
    </div>
  `;
  document.getElementById("summaryBox").innerHTML = summaryHtml;

  // 3) 디테일(자동해석 본문)
  const detailParts = [];

  // (a) 점수 바
  detailParts.push(`
    <h3 style="margin:16px 0 8px;">📊 2026 점수 리포트</h3>
    ${renderBars(cats)}
  `);

  // (b) 카테고리 팁(있으면 사용)
  const catTips = scoreGuide?.categoryTips || {};
  const tipsBlock = `
    <h3 style="margin:16px 0 8px;">🧭 자동 해석 포인트</h3>
    <p><b>💰 재물운:</b> ${(catTips.wealth?.[0] ? escapeHtml(catTips.wealth[0]) : "지출 통제와 조건 확인이 핵심입니다.")}</p>
    <p><b>💖 연애운:</b> ${(catTips.love?.[0] ? escapeHtml(catTips.love[0]) : "말과 타이밍이 관계 흐름을 좌우합니다.")}</p>
    <p><b>🏢 직장/사업운:</b> ${(catTips.career?.[0] ? escapeHtml(catTips.career[0]) : "상반기 정비, 하반기 확장이 유리합니다.")}</p>
    <p><b>💪 건강운:</b> ${(catTips.health?.[0] ? escapeHtml(catTips.health[0]) : "수면과 과로 관리가 전체 흐름을 받칩니다.")}</p>
  `;
  detailParts.push(tipsBlock);

  // (c) 영역별 상세 문장(각 3개씩, seed 고정)
  detailParts.push(renderList("💰 재물운 자세히", wealthArr, seed, 200, 3));
  detailParts.push(renderList("💖 연애운 자세히", loveArr, seed, 300, 3));
  detailParts.push(renderList("🏢 직장/사업운 자세히", careerArr, seed, 400, 3));
  detailParts.push(renderList("💪 건강운 자세히", healthArr, seed, 500, 3));

  // (d) 이번 달 운
  detailParts.push(renderThisMonthFortune(monthsObj, seed));

  // (e) 체크리스트(5개 추천)
  detailParts.push(renderList("✅ 올해 체크리스트(추천 5개)", checklistArr, seed, 600, 5));

  // (f) 럭키 + 주의사항(주의 5개)
  detailParts.push(renderLucky(lucky, seed));
  detailParts.push(renderList("⚠️ 올해 주의사항(추천 5개)", cautionArr, seed, 700, 5));

  document.getElementById("detailBox").innerHTML = detailParts.join("");

  // 결과 표시
  document.getElementById("result").style.display = "block";

  // 포인트 +1 (하루 1회)
  await rewardOncePerDay("tojung");

  // loginCheck 문구 교체
  document.getElementById("loginCheck").innerHTML =
    "<h2>✅ 리포트 생성 완료</h2><p class='small'>점수 기반 자동 해석으로 구성된 2026 토정비결입니다.</p>";
});

console.log("[tojung.js] loaded ✅");

const TOJUNG_DEFAULT_BIRTH = "1940-01-01";
const TOJUNG_FALLBACK_YEAR = 2026;
const TOJUNG_ACTIVE_YEAR =
  window.FortuneConfig?.year ||
  window.APP_CONFIG?.fortuneYear ||
  new Date().getFullYear();

// -----------------------------
// birth / mode
// -----------------------------
function getActiveBirthForTojung(){
  return localStorage.getItem("birth")
    || localStorage.getItem("guest_birth")
    || TOJUNG_DEFAULT_BIRTH;
}

function getTojungMode(){
  const phone = localStorage.getItem("phone");
  const guestBirth = localStorage.getItem("guest_birth");

  if(phone) return "member";
  if(guestBirth) return "guest";
  return "default";
}

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
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  return (y * 10000) + (mo * 100) + d;
}

function seededPick(arr, seed, offset){
  if(!Array.isArray(arr) || arr.length === 0) return "";
  const idx = Math.abs((seed + (offset || 0)) % arr.length);
  return arr[idx];
}

function getTodayStamp(){
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

function barColorClass(score){
  if(score >= 85) return "bar-high";
  if(score >= 70) return "bar-good";
  if(score >= 55) return "bar-mid";
  return "bar-low";
}

function findBand(scoreGuide, score){
  const bands = scoreGuide?.bands;
  if(!Array.isArray(bands) || bands.length === 0){
    return { title:"보통", text:"기본기 관리가 핵심입니다." };
  }

  const sorted = [...bands].sort((a, b)=>(b.min ?? 0) - (a.min ?? 0));
  const hit = sorted.find(b => Number(score) >= Number(b.min ?? 0)) || sorted[sorted.length - 1];

  return {
    title: hit?.title || "보통",
    text: hit?.text || ""
  };
}

function renderBars(categories){
  const rows = [
    { k:"wealth", label:"💰 재물운" },
    { k:"love", label:"💖 연애운" },
    { k:"career", label:"🏢 직장/사업운" },
    { k:"health", label:"💪 건강운" }
  ];

  return `
    <div style="margin-top:10px;">
      ${rows.map(r=>{
        const v = Number(categories?.[r.k] ?? 0);
        return `
          <div class="score-row">
            <div class="score-head">
              <span>${r.label}</span>
              <span><b>${escapeHtml(v)}점</b></span>
            </div>
            <div class="score-bar">
              <div class="score-fill ${barColorClass(v)}" style="width:${Math.max(0, Math.min(100, v))}%;"></div>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function getThisMonth(){
  return new Date().getMonth() + 1;
}

function renderList(title, arr, seed, baseOffset, limit){
  const list = Array.isArray(arr) ? arr : [];
  const n = Math.min(limit || 5, list.length);
  if(n <= 0) return "";

  const picked = [];
  for(let i = 0; i < n; i++){
    const t = seededPick(list, seed, (baseOffset || 0) + i * 7);
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
  const badges = arr.slice(0, 8).map(k=>`<span class="badge">${escapeHtml(k)}</span>`).join("");
  return `<div style="margin-top:6px;">${badges}</div>`;
}

function renderLucky(lucky, seed){
  const pick = (arr, off)=>{
    const v = seededPick(Array.isArray(arr) ? arr : [], seed, off);
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
// UI helpers
// -----------------------------
function renderPointBoxTojung(){
  const box = document.getElementById("pointBox");
  if(!box) return;

  const phone = localStorage.getItem("phone");

  if(phone){
    const point = Number(localStorage.getItem("point") || localStorage.getItem("points") || 0);
    box.innerHTML = `
      <h2>🎁 포인트 안내</h2>
      <p>현재 포인트: <b>${point}P</b></p>
      <p class="small">회원은 토정비결 결과를 확인하면 1일 1회 1포인트가 적립됩니다.</p>
    `;
    return;
  }

  box.innerHTML = `
    <h2>🎁 포인트 안내</h2>
    <p>게스트는 포인트 적립 없이 콘텐츠를 이용할 수 있습니다.</p>
    <p class="small">포인트 적립과 생년월일 자동 저장을 원하면 회원가입 후 이용해주세요.</p>
  `;
}

function renderTojungEntryState(){
  const loginCheck = document.getElementById("loginCheck");
  const guestBirthCard = document.getElementById("guestBirthCard");

  const mode = getTojungMode();
  const birth = getActiveBirthForTojung();
  const name = localStorage.getItem("name") || "회원";

  if(guestBirthCard){
    guestBirthCard.style.display = (mode === "guest" || mode === "default") ? "block" : "none";
  }

  if(loginCheck){
    if(mode === "member"){
      loginCheck.innerHTML = `
        <h2>✅ 준비 완료</h2>
        <p><b>${escapeHtml(name)}</b>님 생년월일이 자동 적용되었습니다.</p>
        <p class="small">${TOJUNG_ACTIVE_YEAR}년 토정비결 리포트를 불러오는 중입니다.</p>
      `;
    }else if(mode === "guest"){
      loginCheck.innerHTML = `
        <h2>✅ 게스트 기준 적용 완료</h2>
        <p>생년월일: <b>${escapeHtml(birth)}</b></p>
        <p class="small">${TOJUNG_ACTIVE_YEAR}년 토정비결 리포트를 불러오는 중입니다.</p>
      `;
    }else{
      loginCheck.innerHTML = `
        <h2>✅ 기본 기준으로 바로 보기</h2>
        <p>현재는 <b>${escapeHtml(TOJUNG_DEFAULT_BIRTH)}</b> 기준으로 결과를 볼 수 있습니다.</p>
        <p class="small">게스트는 아래에서 생년월일을 입력해 본인 기준으로 다시 볼 수 있습니다.</p>
      `;
    }
  }

  return true;
}

async function applyGuestBirthForTojung(){
  const birthEl = document.getElementById("guestBirthInline");
  const birthTypeEl = document.getElementById("guestBirthTypeInline");
  const leapEl = document.getElementById("guestIsLeapInline");

  const rawBirth = (birthEl?.value || "").trim();
  const birthTypeInput = (birthTypeEl?.value || "solar").trim();
  const isLeap = !!(leapEl && leapEl.checked);

  if(!/^\d{4}-\d{2}-\d{2}$/.test(rawBirth)){
    alert("생년월일을 입력해주세요.");
    return;
  }

  try{
    await window.BirthUtil?.loadIpchunDB?.();
  }catch(e){}

  let solarBirth = rawBirth;

  if(birthTypeInput === "lunar"){
    if(typeof window.BirthUtil?.lunarToSolar !== "function"){
      alert("음력 변환 기능을 불러오지 못했어요.");
      return;
    }

    try{
      solarBirth = await window.BirthUtil.lunarToSolar(rawBirth, isLeap);
    }catch(e){
      alert("음력→양력 변환 실패: " + String(e));
      return;
    }

    if(!solarBirth || !/^\d{4}-\d{2}-\d{2}$/.test(solarBirth)){
      alert("음력 생년월일을 양력으로 변환하지 못했어요.");
      return;
    }
  }

  localStorage.setItem("guestMode", "true");
  localStorage.setItem("guest_birth", solarBirth);
  localStorage.setItem("guest_birthType", "solar");
  localStorage.setItem("guest_birth_input", rawBirth);
  localStorage.setItem("guest_birth_input_type", birthTypeInput);
  localStorage.setItem("guest_birth_input_isLeap", isLeap ? "1" : "0");

  const zodiac = window.BirthUtil?.calcZodiacByIpchun ? window.BirthUtil.calcZodiacByIpchun(solarBirth) : "";
  const gapja = window.BirthUtil?.calcGapjaByIpchun ? window.BirthUtil.calcGapjaByIpchun(solarBirth) : "";

  if(zodiac) localStorage.setItem("guest_zodiac", zodiac);
  if(gapja) localStorage.setItem("guest_gapja", gapja);

  renderTojungEntryState();
  renderPointBoxTojung();

  await loadTojungResult();

  alert("게스트 기준 생년월일이 적용되었습니다 ✅");
}

function bindTojungShare(){
  const btn = document.getElementById("shareBtn");
  if(!btn) return;

  btn.addEventListener("click", async ()=>{
    const shareData = {
      title: document.title,
      text: `${TOJUNG_ACTIVE_YEAR}년 토정비결 결과를 확인해보세요.`,
      url: window.location.href
    };

    try{
      if(navigator.share){
        await navigator.share(shareData);
      }else if(navigator.clipboard){
        await navigator.clipboard.writeText(window.location.href);
        alert("현재 페이지 주소를 복사했어요.");
      }else{
        alert("공유 기능을 사용할 수 없는 환경입니다.");
      }
    }catch(e){
      console.warn("[tojung.js] share cancelled", e);
    }
  });
}

// -----------------------------
// reward
// -----------------------------
async function rewardTojungOncePerDay(){
  const phone = localStorage.getItem("phone");
  if(!phone) return;

  const key = `tojung_${getTodayStamp()}`;
  if(localStorage.getItem(key) === "1") return;

  if(window.rewardContent){
    try{
      const res = await window.rewardContent("tojung");

      if(res?.status === "ok"){
        localStorage.setItem(key, "1");

        if(window.loadMyPoint){
          await window.loadMyPoint();
        }

        renderPointBoxTojung();
        alert("포인트가 적립되었습니다 ✅");
      }else if(res?.status === "already"){
        localStorage.setItem(key, "1");
      }
    }catch(e){
      console.warn("[tojung.js] reward failed", e);
    }
  }
}

// -----------------------------
// data load
// -----------------------------
async function loadTojungDB(){
  const currentPath = `/data/tojung_${TOJUNG_ACTIVE_YEAR}.json`;
  const fallbackPath = `/data/tojung_${TOJUNG_FALLBACK_YEAR}.json`;

  try{
    if(window.DB?.loadJSON){
      return await window.DB.loadJSON(currentPath);
    }else{
      const res = await fetch(currentPath, { cache: "no-store" });
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    }
  }catch(e){
    console.warn("[tojung.js] current year db load failed -> fallback", e);

    try{
      if(window.DB?.loadJSON){
        return await window.DB.loadJSON(fallbackPath);
      }else{
        const res = await fetch(fallbackPath, { cache: "no-store" });
        if(!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      }
    }catch(e2){
      console.warn("[tojung.js] fallback db load failed", e2);
      return null;
    }
  }
}

// -----------------------------
// render
// -----------------------------
async function loadTojungResult(){
  const birth = getActiveBirthForTojung();
  const mode = getTojungMode();
  const name =
    mode === "member"
      ? (localStorage.getItem("name") || "회원")
      : (mode === "guest" ? "게스트" : "기본 기준");

  if(!birth){
    document.getElementById("result").style.display = "none";
    return;
  }

  const pageTitle = document.getElementById("pageTitle");
  const yearTitle = document.getElementById("yearTitle");

  if(pageTitle){
    pageTitle.textContent = `📜 ${TOJUNG_ACTIVE_YEAR} 토정비결`;
  }
  if(yearTitle){
    yearTitle.textContent = `🔮 ${TOJUNG_ACTIVE_YEAR}년 토정비결 요약`;
  }

  const db = await loadTojungDB();

  if(!db){
    document.getElementById("loginCheck").innerHTML =
      "<h2>⚠ 데이터 로드 실패</h2><p>토정비결 데이터를 불러오지 못했어요.</p><p class='small'>잠시 후 다시 시도해주세요.</p>";
    document.getElementById("result").style.display = "none";
    return;
  }

  const seed = ymdToSeed(birth);

  const summaryArr = db.summary || [];
  const checklistArr = db.checklist || [];
  const scores = db.scores || {};
  const scoreGuide = db.scoreGuide || {};
  const wealthArr = db.wealth || [];
  const loveArr = db.love || [];
  const careerArr = db.career || [];
  const healthArr = db.health || [];
  const monthsObj = db.months || {};
  const lucky = db.lucky || {};
  const cautionArr = db.caution || [];

  const totalScore = Number(scores?.total ?? 0);
  const cats = scores?.categories || {};

  const modeLabel =
    mode === "member" ? "회원 기준"
    : mode === "guest" ? "게스트 기준"
    : "기본 기준";

  document.getElementById("basicInfo").innerHTML = `
    <p><b>${escapeHtml(name)}</b></p>
    <p>생년월일: ${escapeHtml(birth)}</p>
    <p class="small">※ ${modeLabel} · 같은 생년월일이면 같은 리포트가 나오도록 고정되어 있어요.</p>
  `;

  const oneLine = scores?.oneLine || seededPick(summaryArr, seed, 1) || "올해는 정리와 선택이 중요한 해입니다.";
  const band = findBand(scoreGuide, totalScore);

  document.getElementById("summaryBox").innerHTML = `
    <div>
      <span class="badge">총점 ${escapeHtml(totalScore)}점 · ${escapeHtml(band.title)}</span>
      <p style="margin-top:10px;"><b>${escapeHtml(oneLine)}</b></p>
      <p class="small">${escapeHtml(band.text)}</p>
      ${renderKeywords(scores?.keywords || [])}
    </div>
  `;

  const catTips = scoreGuide?.categoryTips || {};
  const detailParts = [];

  detailParts.push(`
    <h3 style="margin:16px 0 8px;">📊 ${TOJUNG_ACTIVE_YEAR} 점수 리포트</h3>
    ${renderBars(cats)}
  `);

  detailParts.push(`
    <h3 style="margin:16px 0 8px;">🧭 자동 해석 포인트</h3>
    <p><b>💰 재물운:</b> ${(catTips.wealth?.[0] ? escapeHtml(catTips.wealth[0]) : "지출 통제와 조건 확인이 핵심입니다.")}</p>
    <p><b>💖 연애운:</b> ${(catTips.love?.[0] ? escapeHtml(catTips.love[0]) : "말과 타이밍이 관계 흐름을 좌우합니다.")}</p>
    <p><b>🏢 직장/사업운:</b> ${(catTips.career?.[0] ? escapeHtml(catTips.career[0]) : "상반기 정비, 하반기 확장이 유리합니다.")}</p>
    <p><b>💪 건강운:</b> ${(catTips.health?.[0] ? escapeHtml(catTips.health[0]) : "수면과 과로 관리가 전체 흐름을 받칩니다.")}</p>
  `);

  detailParts.push(renderList("💰 재물운 자세히", wealthArr, seed, 200, 3));
  detailParts.push(renderList("💖 연애운 자세히", loveArr, seed, 300, 3));
  detailParts.push(renderList("🏢 직장/사업운 자세히", careerArr, seed, 400, 3));
  detailParts.push(renderList("💪 건강운 자세히", healthArr, seed, 500, 3));
  detailParts.push(renderThisMonthFortune(monthsObj, seed));
  detailParts.push(renderList("✅ 올해 체크리스트(추천 5개)", checklistArr, seed, 600, 5));
  detailParts.push(renderLucky(lucky, seed));
  detailParts.push(renderList("⚠️ 올해 주의사항(추천 5개)", cautionArr, seed, 700, 5));

  document.getElementById("detailBox").innerHTML = detailParts.join("");
  document.getElementById("result").style.display = "block";

  await rewardTojungOncePerDay();

  document.getElementById("loginCheck").innerHTML =
    mode === "member"
      ? `<h2>✅ 리포트 생성 완료</h2><p class='small'>회원 생년월일 기준 ${TOJUNG_ACTIVE_YEAR}년 토정비결입니다.</p>`
      : mode === "guest"
        ? `<h2>✅ 리포트 생성 완료</h2><p class='small'>게스트 생년월일 기준 ${TOJUNG_ACTIVE_YEAR}년 토정비결입니다.</p>`
        : `<h2>✅ 리포트 생성 완료</h2><p class='small'>기본 기준(${TOJUNG_DEFAULT_BIRTH}) ${TOJUNG_ACTIVE_YEAR}년 토정비결입니다.</p>`;
}

// -----------------------------
// init
// -----------------------------
document.addEventListener("DOMContentLoaded", async ()=>{
  if(window.loadMyPoint){
    await window.loadMyPoint();
  }

  renderTojungEntryState();
  renderPointBoxTojung();
  bindTojungShare();

  document.getElementById("applyGuestBirthBtn")?.addEventListener("click", applyGuestBirthForTojung);

  const canLoad = renderTojungEntryState();
  if(canLoad){
    await loadTojungResult();
  }
});

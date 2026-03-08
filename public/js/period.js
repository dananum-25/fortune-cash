let fortuneDB = {};
let dbReady = false;

const PERIOD_DEFAULT_BIRTH = "1940-01-01";
const ACTIVE_YEAR =
  window.FortuneConfig?.year ||
  window.APP_CONFIG?.fortuneYear ||
  new Date().getFullYear();

/* =========================
   DB 로딩
========================= */
async function loadDB(){
  try{
    const res = await fetch("/data/fortunes_ko.json", { cache: "no-store" });
    if(!res.ok) throw new Error("fortunes_ko.json load failed: " + res.status);

    fortuneDB = await res.json();
    dbReady = true;

    console.log("[period.js] DB loaded ✅", {
      dailyMain: fortuneDB?.daily?.main?.length || 0,
      yearMain: fortuneDB?.year?.main?.length || 0
    });
  }catch(e){
    dbReady = false;
    console.error("[period.js] loadDB error ❌", e);
  }
}

/* =========================
   공통 유틸
========================= */
function hashString(str){
  let h = 2166136261;
  for(let i = 0; i < str.length; i++){
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededPick(arr, seed, fallback = "운세 데이터가 준비되지 않았습니다."){
  if(!Array.isArray(arr) || arr.length === 0) return fallback;
  const idx = hashString(seed) % arr.length;
  return arr[idx];
}

function buildSeed(birth, targetKey, scope){
  return `${birth}|${targetKey}|${scope}`;
}

function formatDateLocal(date){
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getTodayTargetDate(){
  return new Date();
}

function getTomorrowTargetDate(){
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d;
}

function getPeriodBirth(){
  return localStorage.getItem("birth")
    || localStorage.getItem("guest_birth")
    || PERIOD_DEFAULT_BIRTH;
}

function getPeriodMode(){
  const phone = localStorage.getItem("phone");
  const guestBirth = localStorage.getItem("guest_birth");

  if(phone) return "member";
  if(guestBirth) return "guest";
  return "default";
}

function hasPersonalBirthSelected(){
  return !!(localStorage.getItem("birth") || localStorage.getItem("guest_birth"));
}

/* =========================
   정보 카드
========================= */
function renderMyInfoBox(){
  const el = document.getElementById("myInfoBox");
  if(!el) return;

  const mode = getPeriodMode();
  const birth = getPeriodBirth();
  const name = localStorage.getItem("name") || "회원";
  const guestBirthCard = document.getElementById("guestBirthCard");

  if(guestBirthCard){
    guestBirthCard.style.display = mode === "guest" ? "block" : "none";
  }

  if(mode === "member"){
    el.innerHTML = `
      <h2>👤 나의 기준 정보</h2>
      <p><b>${name}</b>님</p>
      <p>생년월일: ${birth}</p>
      <p class="small">로그인 상태라 저장된 생년월일이 자동 적용되고 있어요.</p>
    `;
    return;
  }

  if(mode === "guest"){
    el.innerHTML = `
      <h2>🎟 게스트 기준 정보</h2>
      <p>생년월일: ${birth}</p>
      <p class="small">게스트로 입력한 생년월일이 적용되고 있어요. 포인트 적립은 제공되지 않습니다.</p>
    `;
    return;
  }

  el.innerHTML = `
    <h2>📌 기본 기준 정보</h2>
    <p>기본 예시 생년월일: ${PERIOD_DEFAULT_BIRTH}</p>
    <p class="small">지금은 기본 예시 기준으로 결과가 보이고 있어요.</p>
  `;
}

function renderPointBoxCustom(){
  const box = document.getElementById("pointBox");
  if(!box) return;

  const phone = localStorage.getItem("phone");

  if(phone){
    const point = Number(localStorage.getItem("point") || localStorage.getItem("points") || 0);
    box.innerHTML = `
      <h2>🎁 포인트 안내</h2>
      <p>현재 포인트: <b>${point}P</b></p>
      <p class="small">회원은 심층 해석 버튼을 눌러 상세 운세를 확인하면 1일 1회 1포인트가 적립됩니다.</p>
    `;
    return;
  }

  box.innerHTML = `
    <h2>🎁 포인트 안내</h2>
    <p>게스트는 포인트 적립 없이 콘텐츠를 이용할 수 있습니다.</p>
    <p class="small">포인트 적립과 생년월일 자동 저장을 원하면 회원가입 후 이용해주세요.</p>
  `;
}

/* =========================
   가이드 / 기준
========================= */
function renderGuide(type){
  if(type === "today"){
    return `
      <h3>🔎 오늘 운세 해설</h3>
      <p>오늘 운세는 하루의 감정, 인간관계, 일정 흐름을 가볍게 점검하는 데 적합합니다. 큰 결론보다 작은 선택의 방향을 점검하는 기준으로 활용해보세요.</p>
      <p>운세는 참고용입니다. 좋은 흐름은 적극 활용하고, 조심해야 할 시기는 신중하게 대응하세요.</p>
    `;
  }

  if(type === "tomorrow"){
    return `
      <h3>🔎 내일 운세 해설</h3>
      <p>내일 운세는 미리 준비하고 대비하는 데 도움이 됩니다. 일정, 감정, 지출 계획을 오늘 가볍게 점검하면 내일의 흐름이 더 안정될 수 있습니다.</p>
      <p>운세는 참고용입니다. 좋은 흐름은 적극 활용하고, 조심해야 할 시기는 신중하게 대응하세요.</p>
    `;
  }

  return `
    <h3>🔎 ${ACTIVE_YEAR}년 연간운세 해설</h3>
    <p>${ACTIVE_YEAR}년 연간운세는 한 해의 큰 방향을 참고하는 자료입니다. 단기적인 하루 운보다 긴 호흡의 흐름을 살피는 데 적합합니다.</p>
    <p>연간운세는 절대적인 미래 예언이 아니라 참고용 콘텐츠입니다.</p>
  `;
}

function renderMethod(type, birth, targetText){
  let bullets = [];

  if(type === "today"){
    bullets = [
      `기준 생년월일: ${birth}`,
      `운세 대상 날짜: ${targetText}`,
      "출생 정보와 오늘 날짜를 조합한 고정 결과",
      "기본 운세 + 심층 해석 DB를 함께 반영"
    ];
  }else if(type === "tomorrow"){
    bullets = [
      `기준 생년월일: ${birth}`,
      `운세 대상 날짜: ${targetText}`,
      "출생 정보와 내일 날짜를 조합한 고정 결과",
      "다음날 오늘 운세와 동일한 결과 구조"
    ];
  }else{
    bullets = [
      `기준 생년월일: ${birth}`,
      `운세 대상 연도: ${ACTIVE_YEAR}`,
      "출생 정보와 올해 연도를 조합한 고정 결과",
      "연간 흐름 + 심층 해석 DB를 함께 반영"
    ];
  }

  return `
    <h4>🔎 운세 참고 기준</h4>
    <p>이 운세는 아래 기준을 참고해 같은 조건에서는 같은 결과가 나오도록 구성되어 있습니다.</p>
    <ul>
      ${bullets.map(v => `<li>${v}</li>`).join("")}
    </ul>
    <p class="small">운세는 참고 자료이며 절대적인 미래 예언이 아닙니다.</p>
  `;
}

/* =========================
   결과 렌더링
========================= */
function renderResultBlock(type, title, content, targetText){
  const birth = getPeriodBirth();
  const mode = getPeriodMode();

  let modeText = "기본 예시 기준";
  if(mode === "member") modeText = "회원 기준";
  if(mode === "guest") modeText = "게스트 기준";

  let resultId = "";
  let guideId = "";
  let methodId = "";

  if(type === "today"){
    resultId = "todayResult";
    guideId = "todayGuide";
    methodId = "todayMethod";
  }else if(type === "tomorrow"){
    resultId = "tomorrowResult";
    guideId = "tomorrowGuide";
    methodId = "tomorrowMethod";
  }else{
    resultId = "yearResult";
    guideId = "yearGuide";
    methodId = "yearMethod";
  }

  const resultEl = document.getElementById(resultId);
  const guideEl = document.getElementById(guideId);
  const methodEl = document.getElementById(methodId);

  if(resultEl){
    resultEl.innerHTML = `
      <h3>${title}</h3>
      <p class="small">${modeText} · 기준 생년월일 ${birth}</p>
      <p class="small">${type === "year" ? `기준 연도 ${ACTIVE_YEAR}` : `운세 대상 날짜 ${targetText}`}</p>
      <p>${content}</p>
    `;
  }

  if(guideEl){
    guideEl.innerHTML = `
      ${renderGuide(type)}
      <div id="${type}DeepWrap" style="margin-top:14px;">
        <button class="btn" type="button" onclick="openDeepFortune('${type}')">
          ${type === "today"
            ? "오늘 운세 심층 해석 보기"
            : type === "tomorrow"
              ? "내일 운세 심층 해석 보기"
              : `${ACTIVE_YEAR}년 연간운세 심층 해석 보기`}
        </button>
        <div id="${type}Deep" style="margin-top:12px;"></div>
      </div>
    `;
  }

  if(methodEl){
    methodEl.innerHTML = renderMethod(type, birth, targetText);
  }
}

/* =========================
   DB 접근
========================= */
function getDailyKey(type){
  if(type === "today"){
    return formatDateLocal(getTodayTargetDate());
  }
  if(type === "tomorrow"){
    return formatDateLocal(getTomorrowTargetDate());
  }
  return String(ACTIVE_YEAR);
}

function buildDeepFortune(type){
  const birth = getPeriodBirth();
  const targetKey = getDailyKey(type);

  const seedBase = buildSeed(birth, targetKey, type);
  const section = type === "year" ? fortuneDB?.year || {} : fortuneDB?.daily || {};

  return {
    love: seededPick(section?.love, seedBase + "|love", "연애운 데이터가 준비되지 않았습니다."),
    money: seededPick(section?.money, seedBase + "|money", "재물운 데이터가 준비되지 않았습니다."),
    health: seededPick(section?.health, seedBase + "|health", "건강운 데이터가 준비되지 않았습니다."),
    work: seededPick(section?.work, seedBase + "|work", "일운 데이터가 준비되지 않았습니다."),
    relationship: seededPick(section?.relationship, seedBase + "|relationship", "대인운 데이터가 준비되지 않았습니다."),
    advice: seededPick(section?.advice, seedBase + "|advice", "조언 데이터가 준비되지 않았습니다."),
    luckyColor: seededPick(section?.lucky_color, seedBase + "|luckyColor", "행운 색 정보가 준비되지 않았습니다."),
    luckyNumber: seededPick(section?.lucky_number, seedBase + "|luckyNumber", "행운 숫자 정보가 준비되지 않았습니다."),
    keyword: seededPick(section?.keywords, seedBase + "|keyword", "")
  };
}

function renderDeepFortuneHtml(type){
  const deep = buildDeepFortune(type);

  return `
    <div class="fortune-method">
      <h4>💘 연애운</h4>
      <p>${deep.love}</p>

      <h4>💰 재물운</h4>
      <p>${deep.money}</p>

      <h4>🩺 건강운</h4>
      <p>${deep.health}</p>

      <h4>💼 일운</h4>
      <p>${deep.work}</p>

      <h4>🤝 대인운</h4>
      <p>${deep.relationship}</p>

      <h4>🔢 행운 숫자</h4>
      <p>${deep.luckyNumber}</p>

      <h4>🎨 행운 색</h4>
      <p>${deep.luckyColor}</p>

      ${type === "year" && deep.keyword ? `
      <h4>🏷️ 올해 키워드</h4>
      <p>${deep.keyword}</p>
      ` : ""}

      <h4>💡 오늘의 조언</h4>
      <p>${deep.advice}</p>
    </div>
  `;
}

/* =========================
   포인트
========================= */
function getDeepRewardStorageKey(){
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `period_deep_reward_${yyyy}${mm}${dd}`;
}

async function rewardDeepFortuneOnce(){
  const phone = localStorage.getItem("phone");
  if(!phone) return;
  if(!hasPersonalBirthSelected()) return;

  const key = getDeepRewardStorageKey();
  if(localStorage.getItem(key) === "1") return;

  localStorage.setItem(key, "1");

  if(window.rewardContent){
    try{
      await window.rewardContent("fortune_view");
      if(window.loadMyPoint) await window.loadMyPoint();
      renderPointBoxCustom();
      alert("포인트가 적립되었습니다 ✅");
    }catch(e){
      console.warn("[period.js] rewardContent failed", e);
    }
  }
}

/* =========================
   기본 운세
========================= */
function showToday(_fromClick = false){
  if(!dbReady){
    alert("운세 데이터를 불러오는 중입니다. 잠시 후 다시 눌러주세요.");
    return;
  }

  const birth = getPeriodBirth();
  const targetKey = formatDateLocal(getTodayTargetDate());

  const content = seededPick(
    fortuneDB?.daily?.main,
    buildSeed(birth, targetKey, "daily-main"),
    "오늘 운세 데이터가 준비되지 않았습니다."
  );

  renderResultBlock("today", "오늘 운세", content, targetKey);
}

function showTomorrow(_fromClick = false){
  if(!dbReady){
    alert("운세 데이터를 불러오는 중입니다. 잠시 후 다시 눌러주세요.");
    return;
  }

  const birth = getPeriodBirth();
  const targetKey = formatDateLocal(getTomorrowTargetDate());

  const content = seededPick(
    fortuneDB?.daily?.main,
    buildSeed(birth, targetKey, "daily-main"),
    "내일 운세 데이터가 준비되지 않았습니다."
  );

  renderResultBlock("tomorrow", "내일 운세", content, targetKey);
}

function showYear(_fromClick = false){
  if(!dbReady){
    alert("운세 데이터를 불러오는 중입니다. 잠시 후 다시 눌러주세요.");
    return;
  }

  const birth = getPeriodBirth();
  const targetKey = String(ACTIVE_YEAR);

  const content = seededPick(
    fortuneDB?.year?.main,
    buildSeed(birth, targetKey, "year-main"),
    "연간운세 데이터가 준비되지 않았습니다."
  );

  renderResultBlock("year", `${ACTIVE_YEAR}년 연간운세`, content, targetKey);
}

/* =========================
   심층 해석
========================= */
async function openDeepFortune(type){
  const target = document.getElementById(`${type}Deep`);
  if(!target) return;

  if(target.innerHTML.trim() !== ""){
    return;
  }

  target.innerHTML = renderDeepFortuneHtml(type);
  await rewardDeepFortuneOnce();
}

/* =========================
   게스트 생년월일 적용
========================= */
async function applyGuestBirthInline(){
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

  renderMyInfoBox();
  renderPointBoxCustom();

  showToday(false);
  showTomorrow(false);
  showYear(false);

  alert("게스트 기준 생년월일이 적용되었습니다 ✅");
}

/* =========================
   공유 / 연도 텍스트
========================= */
function bindShare(){
  const btn = document.getElementById("shareBtn");
  if(!btn) return;

  btn.addEventListener("click", async ()=>{
    const shareData = {
      title: document.title,
      text: `오늘 운세 · 내일 운세 · ${ACTIVE_YEAR}년 연간운세를 확인해보세요.`,
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
      console.warn("[period.js] share cancelled", e);
    }
  });
}

function applyDynamicYearText(){
  const pageTitle = document.getElementById("pageTitle");
  if(pageTitle){
    pageTitle.textContent = `📆 오늘 운세 · 내일 운세 · ${ACTIVE_YEAR}년 연간운세 무료 보기`;
  }

  const yearTitle = document.getElementById("yearTitle");
  if(yearTitle){
    yearTitle.innerText = `📅 ${ACTIVE_YEAR}년 연간운세`;
  }
}

/* =========================
   시작
========================= */
document.addEventListener("DOMContentLoaded", async ()=>{
  await loadDB();
  applyDynamicYearText();

  renderMyInfoBox();

  if(window.loadMyPoint){
    await window.loadMyPoint();
  }
  renderPointBoxCustom();

  document.getElementById("applyGuestBirthBtn")?.addEventListener("click", applyGuestBirthInline);
  bindShare();

  showToday(false);
  showTomorrow(false);
  showYear(false);
});

window.showToday = showToday;
window.showTomorrow = showTomorrow;
window.showYear = showYear;
window.openDeepFortune = openDeepFortune;

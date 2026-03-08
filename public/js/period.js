let todayDB = {};
let tomorrowDB = {};
let yearDB = {};
let adviceDB = [];
let dbReady = false;

const PERIOD_DEFAULT_BIRTH = "1940-01-01";
const FORTUNE_YEAR =
  window.FortuneConfig?.year ||
  window.APP_CONFIG?.fortuneYear ||
  2026;

const clickedState = {
  today: false,
  tomorrow: false,
  year: false
};

async function loadDB(){
  try{
    const [t1, t2, t3, t4] = await Promise.all([
      fetch("/data/fortunes_ko_today.json", { cache: "no-store" }).then(r=>{
        if(!r.ok) throw new Error("today json load failed: " + r.status);
        return r.json();
      }),
      fetch("/data/fortunes_ko_tomorrow.json", { cache: "no-store" }).then(r=>{
        if(!r.ok) throw new Error("tomorrow json load failed: " + r.status);
        return r.json();
      }),
      fetch(`/data/fortunes_ko_${FORTUNE_YEAR}.json`, { cache: "no-store" }).then(r=>{
        if(!r.ok) throw new Error(`year json load failed: ${r.status} (${FORTUNE_YEAR})`);
        return r.json();
      }),
      fetch("/data/daily_advice_ko.json", { cache: "no-store" }).then(r=>{
        if(!r.ok) throw new Error("daily advice json load failed: " + r.status);
        return r.json();
      })
    ]);

    todayDB = t1;
    tomorrowDB = t2;
    yearDB = t3;
    adviceDB = Array.isArray(t4?.advice) ? t4.advice : [];
    dbReady = true;

    console.log("[period.js] DB loaded ✅", {
      year: FORTUNE_YEAR,
      today: !!todayDB?.pools?.today?.length,
      tomorrow: !!tomorrowDB?.pools?.tomorrow?.length,
      yearPool: !!yearDB?.pools?.year_all?.length,
      advice: adviceDB.length
    });
  }catch(e){
    dbReady = false;
    console.error("[period.js] loadDB error ❌", e);
  }
}

let yearDB = {};

async function loadYearDB(){

  const year = new Date().getFullYear();

  try{

    const r = await fetch(`/data/fortunes_ko_${year}.json`);

    if(!r.ok) throw "no file";

    yearDB = await r.json();

  }catch(e){

    console.warn("연간 운세 DB 없음 → 기본 2026 사용");

    const r = await fetch(`/data/fortunes_ko_2026.json`);
    yearDB = await r.json();

  }

}

function getPeriodBirth(){
  return (window.getActiveBirth && window.getActiveBirth())
    || localStorage.getItem("birth")
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
  const memberBirth = localStorage.getItem("birth");
  const guestBirth = localStorage.getItem("guest_birth");
  return !!(memberBirth || guestBirth);
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

function hashString(str){
  let h = 2166136261;
  for(let i = 0; i < str.length; i++){
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededPick(arr, seed){
  if(!Array.isArray(arr) || arr.length === 0){
    return "운세 데이터가 준비되지 않았습니다.";
  }
  const idx = hashString(seed) % arr.length;
  return arr[idx];
}

function seededNumber(seed, min, max){
  const range = max - min + 1;
  return min + (hashString(seed) % range);
}

function seededPick(arr, seed){
  if(!Array.isArray(arr) || arr.length === 0){
    return "운세 데이터가 준비되지 않았습니다.";
  }
  const idx = hashString(seed) % arr.length;
  return arr[idx];
}

function buildSeed(birth, targetKey, scope){
  return `${birth}|${targetKey}|${scope}`;
}

function renderMyInfoBox(){
  const el = document.getElementById("myInfoBox");
  if(!el) return;

  const mode = getPeriodMode();
  const birth = getPeriodBirth();
  const name = localStorage.getItem("name") || "회원";

  if(mode === "member"){
    el.innerHTML = `
      <h2>👤 나의 기준 정보</h2>
      <p><b>${name}</b>님</p>
      <p>생년월일: ${birth}</p>
      <p class="small">로그인 상태라 저장된 정보가 자동 적용되고 있어요.</p>
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
    <p class="small">지금은 기본 예시 기준으로 결과가 보이고 있어요. 생년월일을 입력하면 본인 기준으로 다시 확인할 수 있습니다.</p>
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
      <p class="small">회원은 생년월일이 적용된 상태에서 오늘/내일/${FORTUNE_YEAR} 연간운세 버튼을 모두 직접 눌러 확인하면 1일 1회 1포인트가 적립됩니다.</p>
    `;
    return;
  }

  box.innerHTML = `
    <h2>🎁 포인트 안내</h2>
    <p>게스트는 포인트 적립 없이 콘텐츠를 이용할 수 있습니다.</p>
    <p class="small">포인트 적립과 생년월일 자동 저장을 원하면 회원가입 후 이용해주세요.</p>
  `;
}

function renderGuide(type){
  if(type === "today"){
    return `
      <h3>🔎 오늘 운세 해설</h3>
      <p>오늘은 현재 리듬과 감정 흐름을 점검하는 데 의미가 있습니다. 작은 선택 하나가 하루 분위기를 바꿀 수 있으니 급한 판단보다 균형감을 우선해보세요.</p>
      <p>운세는 참고용입니다. 좋은 흐름은 적극 활용하고, 조심해야 할 시기는 신중하게 대응하세요.</p>
    `;
  }

  if(type === "tomorrow"){
    return `
      <h3>🔎 내일 운세 해설</h3>
      <p>내일 운세는 미리 준비하고 대비하는 데 도움이 됩니다. 감정, 일정, 지출 계획을 가볍게 정리하면 더 안정적으로 흐름을 탈 수 있습니다.</p>
      <p>운세는 참고용입니다. 좋은 흐름은 적극 활용하고, 조심해야 할 시기는 신중하게 대응하세요.</p>
    `;
  }

  return `
    <h3>🔎 ${FORTUNE_YEAR}년 연간운세 해설</h3>
    <p>${FORTUNE_YEAR}년 연간운세는 한 해의 큰 흐름을 참고하는 자료입니다. 단기적인 하루 운보다 긴 호흡의 방향과 생활 리듬을 점검하는 데 적합합니다.</p>
    <p>연간운세는 절대적인 미래 예언이 아니라 참고용 콘텐츠입니다.</p>
  `;
}

function renderMethod(type, birth, targetDateText){
  let title = "🔎 운세 참고 기준";
  let bullets = [];

  if(type === "today"){
    bullets = [
      `기준 생년월일: ${birth}`,
      `운세 대상 날짜: ${targetDateText}`,
      "출생 정보와 대상 날짜를 조합한 고정 결과",
      "일반 운세 해석 데이터와 조언 DB를 함께 반영"
    ];
  }else if(type === "tomorrow"){
    bullets = [
      `기준 생년월일: ${birth}`,
      `운세 대상 날짜: ${targetDateText}`,
      "내일 날짜 기준 고정 결과",
      "오늘이 아니라 대상 날짜를 기준으로 동일 결과 제공"
    ];
  }else{
    bullets = [
      `기준 생년월일: ${birth}`,
      `운세 대상 연도: ${FORTUNE_YEAR}`,
      "연도 기준 고정 결과",
      "한 해의 큰 흐름을 참고하는 연간 해석과 조언 반영"
    ];
  }

  return `
    <h4>${title}</h4>
    <p>이 운세는 아래 기준을 참고해 같은 조건에서는 같은 결과가 나오도록 구성되어 있습니다.</p>
    <ul>
      ${bullets.map(v => `<li>${v}</li>`).join("")}
    </ul>
    <p class="small">운세는 참고 자료이며 절대적인 미래 예언이 아닙니다.</p>
  `;
}

function renderResultBlock(type, title, content, targetDateText){
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
      <p class="small">${type === "year" ? `기준 연도 ${FORTUNE_YEAR}` : `운세 대상 날짜 ${targetDateText}`}</p>
      <p>${content}</p>
    `;
  }

  if(guideEl){
    guideEl.innerHTML = `
      ${renderGuide(type)}
      <div id="${type}DeepWrap" style="margin-top:14px;">
        <button class="btn" type="button" onclick="openDeepFortune('${type}')">
          ${type === "today" ? "오늘 운세 심층 해석 보기" : type === "tomorrow" ? "내일 운세 심층 해석 보기" : `${FORTUNE_YEAR}년 연간운세 심층 해석 보기`}
        </button>
        <div id="${type}Deep" style="margin-top:12px;"></div>
      </div>
    `;
  }

  if(methodEl){
    methodEl.innerHTML = renderMethod(type, birth, targetDateText);
  }
}

function generateDeepFortune(seed, type){
  const lovePool = [
    "가까운 사람과의 대화가 관계 흐름을 좋게 만듭니다.",
    "감정 표현을 너무 미루지 말고 자연스럽게 전하는 것이 좋습니다.",
    "작은 오해가 생길 수 있으니 표현을 부드럽게 하면 도움이 됩니다.",
    "익숙한 관계 속에서 안정감을 찾기 쉬운 흐름입니다.",
    "지금은 상대를 바꾸기보다 내 태도를 점검하는 편이 좋습니다."
  ];

  const moneyPool = [
    "지출을 점검하면 생각보다 빠르게 흐름이 안정될 수 있습니다.",
    "작은 절약과 정리가 재물운을 좋게 만드는 날입니다.",
    "급한 소비보다 필요한 지출만 남기는 운영이 중요합니다.",
    "당장 큰 이익보다 새는 구멍을 막는 것이 더 유리합니다.",
    "금전 관련 약속은 조건을 한 번 더 확인하는 것이 좋습니다."
  ];

  const healthPool = [
    "수면 리듬을 지키는 것이 전체 컨디션에 가장 중요합니다.",
    "과한 일정은 피하고 체력을 남겨두는 운영이 좋습니다.",
    "가벼운 산책이나 스트레칭이 컨디션 회복에 도움이 됩니다.",
    "스트레스를 오래 끌지 말고 중간중간 쉬어가는 것이 좋습니다.",
    "몸이 보내는 작은 피로 신호를 무시하지 않는 것이 중요합니다."
  ];

  const colorPool = ["빨강", "파랑", "노랑", "초록", "보라", "검정", "흰색", "금색", "은색", "네이비"];
  const extraAdvicePool = adviceDB.length ? adviceDB : [
    "오늘은 한 번 더 확인하는 습관이 흐름을 안정시킵니다."
  ];

  return {
    love: seededPick(lovePool, seed + "|love"),
    money: seededPick(moneyPool, seed + "|money"),
    health: seededPick(healthPool, seed + "|health"),
    color: seededPick(colorPool, seed + "|color"),
    number: seededNumber(seed + "|number", 1, 33),
    advice: seededPick(extraAdvicePool, seed + "|advice")
  };
}

function renderDeepFortuneHtml(type, seed){
  const deep = generateDeepFortune(seed, type);

  return `
    <div class="fortune-method">
      <h4>💘 연애운</h4>
      <p>${deep.love}</p>

      <h4>💰 재물운</h4>
      <p>${deep.money}</p>

      <h4>🩺 건강운</h4>
      <p>${deep.health}</p>

      <h4>🔢 행운 숫자</h4>
      <p>${deep.number}</p>

      <h4>🎨 행운 색</h4>
      <p>${deep.color}</p>

      <h4>💡 오늘의 조언</h4>
      <p>${deep.advice}</p>
    </div>
  `;
}

function getRewardStorageKey(){
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `period_all_reward_${yyyy}${mm}${dd}`;
}

async function rewardAfterAllViewed(){
  const phone = localStorage.getItem("phone");
  if(!phone) return;
  if(!hasPersonalBirthSelected()) return;

  const allViewed = clickedState.today && clickedState.tomorrow && clickedState.year;
  if(!allViewed) return;

  const key = getRewardStorageKey();
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

function showToday(fromClick = false){
  if(!dbReady) return alert("운세 데이터를 불러오는 중입니다. 잠시 후 다시 눌러주세요.");

  const birth = getPeriodBirth();
  const targetDate = getTodayTargetDate();
  const targetKey = formatDateLocal(targetDate);
  const arr = todayDB?.pools?.today || [];
  const content = seededPick(arr, buildSeed(birth, targetKey, "today"));

  renderResultBlock("today", "오늘의 운세", content, targetKey);

  if(fromClick){
    clickedState.today = true;
    rewardAfterAllViewed();
  }
}

function getDeepSeed(type){
  const birth = getPeriodBirth();

  if(type === "today"){
    return buildSeed(birth, formatDateLocal(getTodayTargetDate()), "today-deep");
  }

  if(type === "tomorrow"){
    return buildSeed(birth, formatDateLocal(getTomorrowTargetDate()), "tomorrow-deep");
  }

  return buildSeed(birth, String(FORTUNE_YEAR), "year-deep");
}

async function openDeepFortune(type){
  const target = document.getElementById(`${type}Deep`);
  if(!target) return;

  if(target.innerHTML.trim() !== ""){
    return;
  }

  const seed = getDeepSeed(type);
  target.innerHTML = renderDeepFortuneHtml(type, seed);

  await rewardAfterAllViewed();
}

function showTomorrow(fromClick = false){
  if(!dbReady) return alert("운세 데이터를 불러오는 중입니다. 잠시 후 다시 눌러주세요.");

  const birth = getPeriodBirth();
  const targetDate = getTomorrowTargetDate();
  const targetKey = formatDateLocal(targetDate);
  const arr = tomorrowDB?.pools?.tomorrow || [];
  const content = seededPick(arr, buildSeed(birth, targetKey, "tomorrow"));

  renderResultBlock("tomorrow", "내일의 운세", content, targetKey);

  if(fromClick){
    clickedState.tomorrow = true;
    rewardAfterAllViewed();
  }
}

function showYear(fromClick = false){
  if(!dbReady) return alert("운세 데이터를 불러오는 중입니다. 잠시 후 다시 눌러주세요.");

  const birth = getPeriodBirth();
  const targetKey = String(FORTUNE_YEAR);
  const arr = yearDB?.pools?.year_all || [];
  const content = seededPick(arr, buildSeed(birth, targetKey, "year"));

  renderResultBlock("year", `${FORTUNE_YEAR}년 연간운세`, content, targetKey);

  if(fromClick){
    clickedState.year = true;
    rewardAfterAllViewed();
  }
}

function resetDailyClickState(){
  clickedState.today = false;
  clickedState.tomorrow = false;
  clickedState.year = false;
}

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

  resetDailyClickState();

  if(window.refreshTopBar) window.refreshTopBar();
  renderMyInfoBox();
  renderPointBoxCustom();

  window.showToday = showToday;
  window.showTomorrow = showTomorrow;
  window.showYear = showYear;
  window.openDeepFortune = openDeepFortune;
  
  alert("게스트 기준 생년월일이 적용되었습니다 ✅");
}

function bindShare(){
  const btn = document.getElementById("shareBtn");
  if(!btn) return;

  btn.addEventListener("click", async ()=>{
    const shareData = {
      title: document.title,
      text: `오늘 운세 · 내일 운세 · ${FORTUNE_YEAR}년 연간운세를 확인해보세요.`,
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
    pageTitle.textContent = `📆 오늘 운세 · 내일 운세 · ${FORTUNE_YEAR}년 연간운세 무료 보기`;
  }

  const year = new Date().getFullYear();

document.getElementById("yearBtn").innerText =
`${year} 연간운세`;
  }
}

document.addEventListener("DOMContentLoaded", async ()=>{
  applyDynamicYearText();
  await loadDB();

  renderMyInfoBox();

  if(window.loadMyPoint){
    await window.loadMyPoint();
  }
  renderPointBoxCustom();

  document.getElementById("applyGuestBirthBtn")?.addEventListener("click", applyGuestBirthInline);
  bindShare();

  // 기본값/저장값 기준으로 3개 모두 즉시 표시
  showToday(false);
  showTomorrow(false);
  showYear(false);
});

window.showToday = showToday;
window.showTomorrow = showTomorrow;
window.showYear = showYear;

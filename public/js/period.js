let todayDB = {};
let tomorrowDB = {};
let yearDB = {};
let dbReady = false;

const PERIOD_DEFAULT_BIRTH = "1940-01-01";
const FORTUNE_YEAR =
  window.FortuneConfig?.year ||
  window.APP_CONFIG?.fortuneYear ||
  2026;

// 오늘/내일/연간 버튼 직접 클릭 여부
const clickedState = {
  today: false,
  tomorrow: false,
  year: false
};

async function loadDB(){
  try{
    const [t1, t2, t3] = await Promise.all([
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
    ]);

    todayDB = t1;
    tomorrowDB = t2;
    yearDB = t3;
    dbReady = true;

    console.log("[period.js] DB loaded ✅", {
      year: FORTUNE_YEAR,
      today: !!todayDB?.pools?.today?.length,
      tomorrow: !!tomorrowDB?.pools?.tomorrow?.length,
      yearPool: !!yearDB?.pools?.year_all?.length
    });
  }catch(e){
    dbReady = false;
    console.error("[period.js] loadDB error ❌", e);
  }
}

function randomPick(arr){
  if(!arr || arr.length === 0) return "운세 데이터가 준비되지 않았습니다.";
  return arr[Math.floor(Math.random() * arr.length)];
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
      <p>오늘은 작은 기회가 큰 전환점이 될 수 있습니다. 중요한 결정을 내릴 때는 한 번 더 점검하는 태도가 도움이 됩니다.</p>
      <p>운세는 참고용입니다. 좋은 흐름은 적극 활용하고, 조심해야 할 시기는 신중하게 대응하세요.</p>
    `;
  }

  if(type === "tomorrow"){
    return `
      <h3>🔎 내일 운세 해설</h3>
      <p>내일은 준비가 중요한 날입니다. 미리 일정과 감정 흐름을 정리해두면 더 부드럽게 지나갈 수 있습니다.</p>
      <p>운세는 참고용입니다. 좋은 흐름은 적극 활용하고, 조심해야 할 시기는 신중하게 대응하세요.</p>
    `;
  }

  return `
    <h3>🔎 ${FORTUNE_YEAR}년 연간운세 해설</h3>
    <p>${FORTUNE_YEAR}년은 변화와 성장의 흐름이 함께 나타나는 해입니다. 단기 판단보다 긴 호흡의 계획이 더 중요합니다.</p>
    <p>연간운세는 한 해의 큰 방향을 참고하는 자료로 가볍게 활용하세요.</p>
  `;
}

function renderResultBlock(type, title, content){
  const birth = getPeriodBirth();
  const mode = getPeriodMode();

  let modeText = "기본 예시 기준";
  if(mode === "member") modeText = "회원 기준";
  if(mode === "guest") modeText = "게스트 기준";

  let resultId = "";
  let guideId = "";

  if(type === "today"){
    resultId = "todayResult";
    guideId = "todayGuide";
  }else if(type === "tomorrow"){
    resultId = "tomorrowResult";
    guideId = "tomorrowGuide";
  }else{
    resultId = "yearResult";
    guideId = "yearGuide";
  }

  const resultEl = document.getElementById(resultId);
  const guideEl = document.getElementById(guideId);

  if(resultEl){
    resultEl.innerHTML = `
      <h3>${title}</h3>
      <p class="small">${modeText} · 생년월일 ${birth}</p>
      <p>${content}</p>
    `;
  }

  if(guideEl){
    guideEl.innerHTML = renderGuide(type);
  }
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
    }catch(e){
      console.warn("[period.js] rewardContent failed", e);
    }
  }
}

function showToday(fromClick = false){
  if(!dbReady) return alert("운세 데이터를 불러오는 중입니다. 잠시 후 다시 눌러주세요.");
  const arr = todayDB?.pools?.today || [];
  renderResultBlock("today", "오늘의 운세", randomPick(arr));

  if(fromClick){
    clickedState.today = true;
    rewardAfterAllViewed();
  }
}

function showTomorrow(fromClick = false){
  if(!dbReady) return alert("운세 데이터를 불러오는 중입니다. 잠시 후 다시 눌러주세요.");
  const arr = tomorrowDB?.pools?.tomorrow || [];
  renderResultBlock("tomorrow", "내일의 운세", randomPick(arr));

  if(fromClick){
    clickedState.tomorrow = true;
    rewardAfterAllViewed();
  }
}

function showYear(fromClick = false){
  if(!dbReady) return alert("운세 데이터를 불러오는 중입니다. 잠시 후 다시 눌러주세요.");
  const arr = yearDB?.pools?.year_all || [];
  renderResultBlock("year", `${FORTUNE_YEAR}년 연간운세`, randomPick(arr));

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

  showToday(false);
  showTomorrow(false);
  showYear(false);

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

  const yearBtn = document.getElementById("yearBtn");
  if(yearBtn){
    yearBtn.textContent = `${FORTUNE_YEAR} 연간운세`;
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

  // 버튼 안 눌러도 기본값/저장값 기준으로 3개 모두 표시
  showToday(false);
  showTomorrow(false);
  showYear(false);
});

window.showToday = showToday;
window.showTomorrow = showTomorrow;
window.showYear = showYear;

let todayDB = {};
let tomorrowDB = {};
let yearDB = {};
let dbReady = false;

const PERIOD_DEFAULT_BIRTH = "1940-01-01";
const FORTUNE_YEAR =
  window.FortuneConfig?.year ||
  window.APP_CONFIG?.fortuneYear ||
  new Date().getFullYear();

async function loadDB(){
  try{
    const [t1, t2, t3] = await Promise.all([
      fetch("/data/fortunes_ko_today.json", { cache:"no-store" }).then(r=>{
        if(!r.ok) throw new Error("today json load failed: " + r.status);
        return r.json();
      }),
      fetch("/data/fortunes_ko_tomorrow.json", { cache:"no-store" }).then(r=>{
        if(!r.ok) throw new Error("tomorrow json load failed: " + r.status);
        return r.json();
      }),
      fetch(`/data/fortunes_ko_${FORTUNE_YEAR}.json`, { cache:"no-store" }).then(r=>{
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
    <p class="small">지금은 기본 예시 기준으로 결과를 볼 수 있어요. 생년월일을 입력하면 본인 기준으로 다시 확인할 수 있습니다.</p>
  `;
}

function renderGuide(type){
  let text = "";

  if(type === "today"){
    text = "오늘은 작은 기회가 큰 전환점이 될 수 있습니다. 중요한 결정을 내릴 때 신중함이 필요합니다.";
  }else if(type === "tomorrow"){
    text = "내일은 준비가 중요한 날입니다. 미리 계획을 세우면 좋은 흐름을 만들 수 있습니다.";
  }else if(type === "year"){
    text = `${FORTUNE_YEAR}년은 변화와 성장의 흐름이 함께 나타나는 해입니다. 장기적인 계획을 세우는 것이 좋습니다.`;
  }

  document.getElementById("guideBox").innerHTML = `
    <h3>🔎 운세 해석 가이드</h3>
    <p>${text}</p>
    <p>운세는 참고용입니다. 좋은 흐름은 적극 활용하고, 조심해야 할 시기는 신중하게 대응하세요.</p>
  `;
}

function getRewardStorageKey(type){
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `period_reward_${type}_${yyyy}${mm}${dd}`;
}

async function rewardOncePerDay(type){
  const phone = localStorage.getItem("phone");
  if(!phone) return;

  const key = getRewardStorageKey(type);
  if(localStorage.getItem(key) === "1") return;

  localStorage.setItem(key, "1");

  if(window.rewardContent){
    try{
      await window.rewardContent("fortune_view");
    }catch(e){
      console.warn("[period.js] rewardContent failed", e);
    }
  }
}

function renderResult(title, content, type){
  const birth = getPeriodBirth();
  const mode = getPeriodMode();

  let modeText = "기본 예시 기준";
  if(mode === "member") modeText = "회원 기준";
  if(mode === "guest") modeText = "게스트 기준";

  document.getElementById("resultBox").innerHTML = `
    <h2>${title}</h2>
    <p class="small">${modeText} · 생년월일 ${birth}</p>
    <p>${content}</p>
  `;

  renderGuide(type);
  document.getElementById("resultSection").style.display = "block";

  rewardOncePerDay(type);
}

function showToday(){
  if(!dbReady) return alert("운세 데이터를 불러오는 중입니다. 잠시 후 다시 눌러주세요.");
  const arr = todayDB?.pools?.today || [];
  renderResult("오늘의 운세", randomPick(arr), "today");
}

function showTomorrow(){
  if(!dbReady) return alert("운세 데이터를 불러오는 중입니다. 잠시 후 다시 눌러주세요.");
  const arr = tomorrowDB?.pools?.tomorrow || [];
  renderResult("내일의 운세", randomPick(arr), "tomorrow");
}

function showYear(){
  if(!dbReady) return alert("운세 데이터를 불러오는 중입니다. 잠시 후 다시 눌러주세요.");
  const arr = yearDB?.pools?.year_all || [];
  renderResult(`${FORTUNE_YEAR}년 연간운세`, randomPick(arr), "year");
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

  if(window.refreshTopBar) window.refreshTopBar();
  renderMyInfoBox();

  alert("게스트 기준 생년월일이 적용되었습니다 ✅");
}

function bindShare(){
  const btn = document.getElementById("shareBtn");
  if(!btn) return;

  btn.addEventListener("click", async ()=>{
    const shareData = {
      title: document.title,
      text: `오늘 운세 · 내일 운세 · ${FORTUNE_YEAR} 연간운세를 확인해보세요.`,
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
  document.getElementById("pageTitle").textContent = `📆 오늘 운세 · 내일 운세 · ${FORTUNE_YEAR}년 연간운세 무료 보기`;

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
    await loadMyPoint();
  }
  if(window.Common?.renderPoint){
    Common.renderPoint();
  }

  document.getElementById("applyGuestBirthBtn")?.addEventListener("click", applyGuestBirthInline);
  bindShare();

  // 페이지 진입 시 기본 결과 자동 노출
  showToday();
});

window.showToday = showToday;
window.showTomorrow = showTomorrow;
window.showYear = showYear;

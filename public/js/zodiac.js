let zodiacDB = {};
let rewarded = false;

const ZODIAC_DEFAULT_BIRTH = "1940-01-01";

const ZODIAC_LABELS = {
  rat: "쥐띠",
  ox: "소띠",
  tiger: "호랑이띠",
  rabbit: "토끼띠",
  dragon: "용띠",
  snake: "뱀띠",
  horse: "말띠",
  goat: "양띠",
  monkey: "원숭이띠",
  rooster: "닭띠",
  dog: "개띠",
  pig: "돼지띠"
};

const ZODIAC_ORDER = [
  "rat", "ox", "tiger", "rabbit",
  "dragon", "snake", "horse", "goat",
  "monkey", "rooster", "dog", "pig"
];

function escapeHtml(s){
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getActiveYear(){
  return (
    window.FortuneConfig?.year ||
    window.APP_CONFIG?.fortuneYear ||
    new Date().getFullYear()
  );
}

function getTodayStamp(){
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

function getZodiacMode(){
  const phone = localStorage.getItem("phone");
  const guestBirth = localStorage.getItem("guest_birth");
  if(phone) return "member";
  if(guestBirth) return "guest";
  return "default";
}

function getActiveBirthForZodiac(){
  const phone = localStorage.getItem("phone");
  const memberBirth = localStorage.getItem("birth");
  const guestBirth = localStorage.getItem("guest_birth");

  if(phone && memberBirth) return memberBirth;
  if(guestBirth) return guestBirth;
  return ZODIAC_DEFAULT_BIRTH;
}

function getZodiacFromBirth(birth){
  const m = String(birth || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!m) return "dragon";

  const year = Number(m[1]);
  const map = ["monkey","rooster","dog","pig","rat","ox","tiger","rabbit","dragon","snake","horse","goat"];
  return map[year % 12] || "dragon";
}

async function loadDB(){
  const activeYear = getActiveYear();

  try{
    const res = await fetch(`/data/zodiac_${activeYear}.json`, { cache: "no-store" });
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    zodiacDB = await res.json();
  }catch(e){
    const res = await fetch("/data/zodiac_2026.json", { cache: "no-store" });
    if(!res.ok){
      throw new Error(`zodiac db load failed: ${res.status}`);
    }
    zodiacDB = await res.json();
  }
}

function renderEntryState(){
  const box = document.getElementById("loginCheck");
  if(!box) return;

  const mode = getZodiacMode();
  const birth = getActiveBirthForZodiac();
  const name = localStorage.getItem("name") || "회원";
  const zodiacKey = getZodiacFromBirth(birth);
  const zodiacLabel = ZODIAC_LABELS[zodiacKey] || "띠";

  if(mode === "member"){
    box.innerHTML = `
      <h2>✅ 준비 완료</h2>
      <p><b>${escapeHtml(name)}</b>님 저장된 생년월일이 자동 적용되었습니다.</p>
      <p class="small">현재 <b>${escapeHtml(zodiacLabel)}</b> 기준으로 운세를 바로 확인할 수 있습니다.</p>
    `;
    return;
  }

  if(mode === "guest"){
    box.innerHTML = `
      <h2>✅ 게스트 기준 적용 완료</h2>
      <p>생년월일: <b>${escapeHtml(birth)}</b></p>
      <p class="small">입력한 생년월일 기준 <b>${escapeHtml(zodiacLabel)}</b> 상담 내용을 보여줍니다.</p>
    `;
    return;
  }

  const selectedZodiac = select.value;
const zodiacLabel = ZODIAC_LABELS[zodiacKey] || "띠";

box.innerHTML = `
  <h2>✅ 기본 기준으로 바로 보기</h2>
  <p>현재는 <b>${escapeHtml(ZODIAC_DEFAULT_BIRTH)}</b> 기준으로 결과를 볼 수 있습니다.</p>
  <p class="small">기본값으로 계산된 <b>${escapeHtml(zodiacLabel)}</b> 상담 내용을 바로 보여줍니다.</p>
`;
}

function fillDefaultBirthInput(){
  const birthEl = document.getElementById("guestBirthInline");
  if(!birthEl) return;

  const activeBirth = getActiveBirthForZodiac() || ZODIAC_DEFAULT_BIRTH;
  birthEl.value = activeBirth;
}

function renderPointBoxZodiac(){
  const box = document.getElementById("pointBox");
  if(!box) return;

  const phone = localStorage.getItem("phone");

  if(phone){
    const point = Number(localStorage.getItem("point") || localStorage.getItem("points") || 0);
    box.innerHTML = `
      <h2>🎁 포인트 안내</h2>
      <p>현재 포인트: <b>${point}P</b></p>
      <p class="small">회원은 띠별 운세 결과를 확인하면 1일 1회 1포인트가 적립됩니다.</p>
    `;
    return;
  }

  box.innerHTML = `
    <h2>🎁 포인트 안내</h2>
    <p>게스트와 비회원은 포인트 적립 없이 콘텐츠를 이용할 수 있습니다.</p>
    <p class="small">포인트 적립과 생년월일 자동 저장을 원하면 회원가입 후 이용해주세요.</p>
  `;
}

function renderMyZodiacInfo(currentKey){
  const box = document.getElementById("myZodiacInfo");
  if(!box) return;

  const mode = getZodiacMode();
  const birth = getActiveBirthForZodiac();
  const myKey = getZodiacFromBirth(birth);
  const myLabel = ZODIAC_LABELS[myKey] || "띠";
  const currentLabel = ZODIAC_LABELS[currentKey] || "띠";
  const name = mode === "member"
    ? (localStorage.getItem("name") || "회원")
    : (mode === "guest" ? "게스트" : "기본 기준");

  if(myKey === currentKey){
    box.innerHTML = `
      <p class="info-text"><b>${escapeHtml(name)}</b></p>
      <p class="info-text" style="margin-top:8px;">생년월일: ${escapeHtml(birth)}</p>
      <p class="info-text" style="margin-top:8px;">당신의 띠는 <b style="color:#ffd56b;">${escapeHtml(myLabel)}</b> 입니다.</p>
      <p class="info-text" style="margin-top:8px;">현재 내 띠 기준 운세를 보고 있어요.</p>
    `;
    return;
  }

  box.innerHTML = `
    <p class="info-text"><b>${escapeHtml(name)}</b></p>
    <p class="info-text" style="margin-top:8px;">생년월일: ${escapeHtml(birth)}</p>
    <p class="info-text" style="margin-top:8px;">당신의 띠는 <b style="color:#ffd56b;">${escapeHtml(myLabel)}</b> 입니다.</p>
    <p class="info-text" style="margin-top:8px;">지금 보고 있는 결과는 <b style="color:#ffd56b;">${escapeHtml(currentLabel)}</b> 기준 운세예요.</p>
  `;
}

function fillDefaultBirthInput(){
  const birthEl = document.getElementById("guestBirthInline");
  if(!birthEl) return;

  birthEl.value = getActiveBirthForZodiac();
}

function renderGuide(){
  const box = document.getElementById("guideBox");
  if(!box) return;

  box.innerHTML = `
    <div class="card">
      <h2>🔎 해석 가이드</h2>
      <p class="info-text">
        띠별 운세는 한 해의 흐름을 참고하는 자료입니다.
        좋은 흐름은 적극 활용하고, 조심해야 할 시기는 속도를 조절하며 대응하세요.
      </p>
      <p class="info-text">
        재물, 관계, 건강, 일상 전반을 균형 있게 보는 방식으로 활용하는 것이 좋습니다.
      </p>
    </div>
  `;
}

function buildZodiacOptions(){
  const select = document.getElementById("zodiacSelect");
  const related = document.getElementById("relatedZodiacGrid");
  if(!select || !related) return;

  select.innerHTML = ZODIAC_ORDER.map(key => {
    return `<option value="${key}">${ZODIAC_LABELS[key]}</option>`;
  }).join("");

  related.innerHTML = ZODIAC_ORDER.map(key => {
    return `<button class="action-link" type="button" data-zodiac-key="${key}">${ZODIAC_LABELS[key]}</button>`;
  }).join("");

  related.querySelectorAll("[data-zodiac-key]").forEach(btn => {
    btn.addEventListener("click", ()=>{
      select.value = btn.dataset.zodiacKey;
      showZodiac();
    });
  });
}

function updateSeoMeta(zodiacKey){
  const label = ZODIAC_LABELS[zodiacKey] || "띠별";
  const activeYear = getActiveYear();
  const title = `${activeYear}년 ${label} 운세 | 띠별 연간운세 무료 보기`;
  const desc = `${label} 기준 ${activeYear}년 운세를 참고용으로 확인하세요. 재물운, 애정운, 직장운, 건강운 흐름을 제공합니다.`;
  const url = "https://fortune-cash.vercel.app/pages/zodiac/zodiac.html";

  document.title = title;

  const metaDesc = document.querySelector('meta[name="description"]');
  if(metaDesc) metaDesc.setAttribute("content", desc);

  const canonical = document.getElementById("canonicalLink");
  if(canonical) canonical.setAttribute("href", url);

  const ogTitle = document.getElementById("ogTitle");
  const ogDescription = document.getElementById("ogDescription");
  const ogUrl = document.getElementById("ogUrl");
  const twitterTitle = document.getElementById("twitterTitle");
  const twitterDescription = document.getElementById("twitterDescription");

  if(ogTitle) ogTitle.setAttribute("content", title);
  if(ogDescription) ogDescription.setAttribute("content", desc);
  if(ogUrl) ogUrl.setAttribute("content", url);
  if(twitterTitle) twitterTitle.setAttribute("content", title);
  if(twitterDescription) twitterDescription.setAttribute("content", desc);

  const pageTitle = document.getElementById("pageTitle");
  if(pageTitle) pageTitle.textContent = `${activeYear}년 띠별 연간 운세`;
}

function showZodiac(){
  const select = document.getElementById("zodiacSelect");
  const resultSection = document.getElementById("resultSection");
  const resultBox = document.getElementById("resultBox");
  if(!select || !resultSection || !resultBox) return;

  const value = select.value;
  const label = ZODIAC_LABELS[value] || "띠";
  const item = zodiacDB[selectedZodiac];

  let overall = "";
  let wealth = "";
  let love = "";
  let career = "";
  let health = "";
  let tipsHtml = "";

  if(item && typeof item === "object" && !Array.isArray(item)){
    overall = item.overall || "올해 흐름을 차분하게 살피며 균형 있게 운영하는 것이 좋습니다.";
    wealth = item.wealth || "지출 관리와 현실적인 계획이 중요합니다.";
    love = item.love || "관계에서는 대화와 배려가 중요하게 작용합니다.";
    career = item.career || "일과 목표는 무리한 확장보다 안정적인 진행이 좋습니다.";
    health = item.health || "생활 리듬과 컨디션 관리를 꾸준히 해주세요.";

    if(Array.isArray(item.tips) && item.tips.length){
      tipsHtml = `
        <div class="card">
          <h2>🧭 운영 팁</h2>
          <ul class="list">
            ${item.tips.map(v => `<li>${escapeHtml(v)}</li>`).join("")}
          </ul>
        </div>
      `;
    }
  }else{
    const text = Array.isArray(item) && item.length
      ? item[Math.floor(Math.random() * item.length)]
      : "운세 데이터가 준비되지 않았습니다.";

    overall = text;
    wealth = "재물은 무리한 확장보다 관리 중심으로 보는 것이 좋습니다.";
    love = "관계는 감정보다 대화와 균형이 중요합니다.";
    career = "일은 순서를 정하고 차근차근 진행하는 것이 좋습니다.";
    health = "생활 리듬을 무너뜨리지 않는 것이 중요합니다.";
  }

  updateSeoMeta(value);
  renderMyZodiacInfo(value);
  renderGuide();

  resultBox.innerHTML = `
    <div class="card">
      <h2>${escapeHtml(label)} ${escapeHtml(getActiveYear())}년 운세</h2>
      <p class="info-text">${escapeHtml(overall)}</p>
    </div>

    <div class="card">
      <h2>💰 재물운</h2>
      <p class="info-text">${escapeHtml(wealth)}</p>
    </div>

    <div class="card">
      <h2>❤️ 애정운</h2>
      <p class="info-text">${escapeHtml(love)}</p>
    </div>

    <div class="card">
      <h2>💼 직장운</h2>
      <p class="info-text">${escapeHtml(career)}</p>
    </div>

    <div class="card">
      <h2>💪 건강운</h2>
      <p class="info-text">${escapeHtml(health)}</p>
    </div>

    ${tipsHtml}
  `;

  resultSection.style.display = "block";
  rewardZodiacOncePerDay();
}

async function rewardZodiacOncePerDay(){
  const phone = localStorage.getItem("phone");
  if(!phone || rewarded) return;

  const key = `zodiac_${getTodayStamp()}`;
  if(localStorage.getItem(key) === "1"){
    rewarded = true;
    return;
  }

  if(window.rewardContent){
    try{
      const res = await window.rewardContent("zodiac");
      if(res?.status === "ok"){
        localStorage.setItem(key, "1");
        rewarded = true;

        if(window.loadMyPoint){
          await window.loadMyPoint();
        }

        renderPointBoxZodiac();
        alert("포인트가 적립되었습니다 ✅");
      }else if(res?.status === "already"){
        localStorage.setItem(key, "1");
        rewarded = true;
      }
    }catch(e){
      console.warn("[zodiac.js] reward failed", e);
    }
  }
}

function applyGuestBirthForZodiac(){
  const birthEl = document.getElementById("guestBirthInline");
  const rawBirth = String(birthEl?.value || "").trim();

  if(!/^\d{4}-\d{2}-\d{2}$/.test(rawBirth)){
    alert("생년월일을 입력해주세요.");
    return;
  }

  localStorage.setItem("guestMode", "true");
  localStorage.setItem("guest_birth", rawBirth);

  const myZodiac = getZodiacFromBirth(rawBirth);
  const select = document.getElementById("zodiacSelect");

  if(select){
    select.value = myZodiac;
  }

  renderEntryState();
  renderMyZodiacInfo(myZodiac);
  showZodiac();
}

function bindShare(){
  const btn = document.getElementById("shareBtn");
  if(!btn) return;

  btn.addEventListener("click", async ()=>{
    const data = {
      title: document.title,
      text: "띠별 운세를 확인해보세요.",
      url: window.location.href
    };

    try{
      if(navigator.share){
        await navigator.share(data);
      }else if(navigator.clipboard){
        await navigator.clipboard.writeText(window.location.href);
        alert("현재 페이지 주소를 복사했어요.");
      }else{
        alert("공유 기능을 사용할 수 없는 환경입니다.");
      }
    }catch(e){
      console.warn("[zodiac.js] share cancelled", e);
    }
  });
}

document.addEventListener("DOMContentLoaded", async ()=>{
  try{
    if(window.loadMyPoint){
      await window.loadMyPoint();
    }

    await loadIpchunDB();
    await loadDB();

    buildZodiacOptions();
    fillDefaultBirthInput();
    renderEntryState();
    renderPointBoxZodiac();
// ⭐ 기본값 띠 계산 강제 실행
    const birth = getActiveBirthForZodiac() || "1940-01-01";
    const zodiac = getZodiacFromBirth(birth);

    const select = document.getElementById("zodiacSelect");
    if(select){
      select.value = zodiac;
    }

    renderMyZodiacInfo(zodiac);

    // ⭐ 결과 바로 출력
    showZodiac();
    const activeBirth = getActiveBirthForZodiac();
    const myZodiac = getZodiacFromBirth(activeBirth);
    const select = document.getElementById("zodiacSelect");

    if(select){
      select.value = myZodiac;
    }

    renderMyZodiacInfo(myZodiac);
    bindShare();

    document.getElementById("showZodiacBtn")?.addEventListener("click", showZodiac);
    document.getElementById("applyGuestBirthBtn")?.addEventListener("click", applyGuestBirthForZodiac);

    showZodiac();
  }catch(err){
    console.error("[zodiac.js] init failed", err);

    const resultSection = document.getElementById("resultSection");
    const resultBox = document.getElementById("resultBox");

    if(resultSection) resultSection.style.display = "block";
    if(resultBox){
      resultBox.innerHTML = `
        <div class="card">
          <h2>⚠ 결과 생성 실패</h2>
          <p class="info-text">띠별 운세 데이터를 불러오지 못했어요. 잠시 후 다시 시도해주세요.</p>
        </div>
      `;
    }
  }
});

console.log("[star-detail.js] loaded ✅");

let starDB = {};

const STAR_DEFAULT_BIRTH = "1940-01-01";

function escapeHtml(s){
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getQueryParam(name){
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function getActiveBirthForStar(){
  return localStorage.getItem("birth")
    || localStorage.getItem("guest_birth")
    || STAR_DEFAULT_BIRTH;
}

function getStarMode(){
  const phone = localStorage.getItem("phone");
  const guestBirth = localStorage.getItem("guest_birth");
  if(phone) return "member";
  if(guestBirth) return "guest";
  return "default";
}

function getTodayStamp(){
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

function getActiveYear(){
  return (
    window.FortuneConfig?.year ||
    window.APP_CONFIG?.fortuneYear ||
    new Date().getFullYear()
  );
}

function getStarSignFromBirth(birth){
  const m = String(birth || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!m) return null;

  const month = Number(m[2]);
  const day = Number(m[3]);

  if((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "aries";
  if((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "taurus";
  if((month === 5 && day >= 21) || (month === 6 && day <= 21)) return "gemini";
  if((month === 6 && day >= 22) || (month === 7 && day <= 22)) return "cancer";
  if((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "leo";
  if((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "virgo";
  if((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "libra";
  if((month === 10 && day >= 23) || (month === 11 && day <= 22)) return "scorpio";
  if((month === 11 && day >= 23) || (month === 12 && day <= 24)) return "sagittarius";
  if((month === 12 && day >= 25) || (month === 1 && day <= 19)) return "capricorn";
  if((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "aquarius";
  if((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "pisces";

  return null;
}

async function loadDB(){
  const activeYear = getActiveYear();

  try{
    const res = await fetch(`/data/star_${activeYear}.json`, { cache: "no-store" });
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    starDB = await res.json();
  }catch(e){
    console.warn("[star-detail.js] active year db load failed -> fallback", e);

    const res = await fetch("/data/star_2026.json", { cache: "no-store" });
    if(!res.ok){
      throw new Error(`star db load failed: ${res.status}`);
    }
    starDB = await res.json();
  }
}

function updateSeoMeta(sign, item){
  const activeYear = getActiveYear();
  const title = `${activeYear}년 ${item.name} 운세 총정리 | 연간운세 · 월별운세 · 재물운 · 애정운`;
  const desc = `${item.name} ${activeYear}년 연간 운세를 참고용으로 확인하세요. 전체 흐름, 직장운, 재물운, 애정운, 건강운, 월별 포인트를 정리했습니다.`;
  const url = `https://fortune-cash.vercel.app/pages/star/detail.html?sign=${sign}`;

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
}

function injectStructuredData(sign, item){
  const el = document.getElementById("starJsonLd");
  if(!el || !item) return;

  const activeYear = getActiveYear();
  const pageUrl = `https://fortune-cash.vercel.app/pages/star/detail.html?sign=${sign}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `${activeYear}년 ${item.name} 운세 총정리`,
    "description": `${item.name} ${activeYear}년 연간 운세, 월별 흐름, 재물운, 애정운, 직장운, 건강운 요약.`,
    "url": pageUrl,
    "inLanguage": "ko-KR",
    "author": {
      "@type": "Organization",
      "name": "무료 운세 플랫폼"
    },
    "publisher": {
      "@type": "Organization",
      "name": "무료 운세 플랫폼"
    },
    "mainEntityOfPage": pageUrl
  };

  el.textContent = JSON.stringify(jsonLd);
}

function renderKeywords(arr){
  if(!Array.isArray(arr) || arr.length === 0) return "";
  return `
    <div class="badge-wrap">
      ${arr.map(v => `<span class="badge">${escapeHtml(v)}</span>`).join("")}
    </div>
  `;
}

function renderList(arr, title){
  if(!Array.isArray(arr) || arr.length === 0) return "";
  return `
    <div class="card">
      <h2>${escapeHtml(title)}</h2>
      <ul class="list">
        ${arr.map(v => `<li>${escapeHtml(v)}</li>`).join("")}
      </ul>
    </div>
  `;
}

function renderMonths(months){
  if(!Array.isArray(months) || months.length === 0) return "";
  return `
    <div class="card">
      <h2>🗓️ 월별 운세</h2>
      <div class="month-grid">
        ${months.map(m => `
          <div class="month">
            <b>${escapeHtml(m.month)}</b><br>
            ${escapeHtml(m.text)}
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderPointBoxStar(){
  const box = document.getElementById("pointBox");
  if(!box) return;

  const phone = localStorage.getItem("phone");

  if(phone){
    const point = Number(localStorage.getItem("point") || localStorage.getItem("points") || 0);
    box.innerHTML = `
      <h2>🎁 포인트 안내</h2>
      <p>현재 포인트: <b>${point}P</b></p>
      <p class="small">회원은 별자리 결과를 확인하면 1일 1회 1포인트가 적립됩니다.</p>
    `;
    return;
  }

  box.innerHTML = `
    <h2>🎁 포인트 안내</h2>
    <p>게스트는 포인트 적립 없이 콘텐츠를 이용할 수 있습니다.</p>
    <p class="small">포인트 적립과 생년월일 자동 저장을 원하면 회원가입 후 이용해주세요.</p>
  `;
}

function renderEntryState(currentSign){
  const loginCheck = document.getElementById("loginCheck");
  const guestBirthCard = document.getElementById("guestBirthCard");
  if(!loginCheck) return;

  const mode = getStarMode();
  const birth = getActiveBirthForStar();
  const name = localStorage.getItem("name") || "회원";
  const currentLabel = starDB?.[currentSign]?.name || "별자리";

  if(guestBirthCard){
    guestBirthCard.style.display = (mode === "guest" || mode === "default") ? "block" : "none";
  }

  if(mode === "member"){
    loginCheck.innerHTML = `
      <h2>✅ 준비 완료</h2>
      <p><b>${escapeHtml(name)}</b>님 생년월일이 자동 적용되었습니다.</p>
      <p class="small">${escapeHtml(currentLabel)} 상세 운세를 불러오는 중입니다.</p>
    `;
  }else if(mode === "guest"){
    loginCheck.innerHTML = `
      <h2>✅ 게스트 기준 적용 완료</h2>
      <p>생년월일: <b>${escapeHtml(birth)}</b></p>
      <p class="small">${escapeHtml(currentLabel)} 상세 운세를 불러오는 중입니다.</p>
    `;
  }else{
    loginCheck.innerHTML = `
      <h2>✅ 기본 기준으로 바로 보기</h2>
      <p>현재는 <b>${escapeHtml(STAR_DEFAULT_BIRTH)}</b> 기준으로 결과를 볼 수 있습니다.</p>
      <p class="small">게스트는 아래에서 생년월일을 입력해 본인 기준으로 다시 볼 수 있습니다.</p>
    `;
  }
}

function renderMyInfo(currentSign){
  const box = document.getElementById("myStarInfo");
  if(!box) return;

  const mode = getStarMode();
  const birth = getActiveBirthForStar();
  const name = mode === "member"
    ? (localStorage.getItem("name") || "회원")
    : (mode === "guest" ? "게스트" : "기본 기준");

  const mySign = getStarSignFromBirth(birth);

  if(!birth || !mySign){
    box.innerHTML = `
      <p class="info-text"><b>${escapeHtml(name)}</b></p>
      <p class="info-text" style="margin-top:8px;">생년월일 정보가 없어 내 별자리를 자동 표시하지 못했어요.</p>
    `;
    return;
  }

  const myLabel = starDB?.[mySign]?.name || mySign;
  const currentLabel = starDB?.[currentSign]?.name || currentSign;

  if(mySign === currentSign){
    box.innerHTML = `
      <p class="info-text"><b>${escapeHtml(name)}</b></p>
      <p class="info-text" style="margin-top:8px;">생년월일: ${escapeHtml(birth)}</p>
      <p class="info-text" style="margin-top:8px;">당신의 별자리는 <b style="color:#ffd56b;">${escapeHtml(myLabel)}</b> 입니다.</p>
      <p class="info-text" style="margin-top:8px;">이 페이지는 내 별자리 운세를 바로 보여주고 있어요.</p>
    `;
    return;
  }

  box.innerHTML = `
    <p class="info-text"><b>${escapeHtml(name)}</b></p>
    <p class="info-text" style="margin-top:8px;">생년월일: ${escapeHtml(birth)}</p>
    <p class="info-text" style="margin-top:8px;">당신의 별자리는 <b style="color:#ffd56b;">${escapeHtml(myLabel)}</b> 입니다.</p>
    <p class="info-text" style="margin-top:8px;">지금 보고 있는 페이지는 <b style="color:#ffd56b;">${escapeHtml(currentLabel)}</b> 운세예요.</p>
    <p style="margin-top:12px;">
      <a class="action-link" href="/pages/star/detail.html?sign=${encodeURIComponent(mySign)}">${escapeHtml(myLabel)} 운세 바로 보기</a>
    </p>
  `;
}

function renderDetail(sign){
  const item = starDB?.[sign];
  const titleEl = document.getElementById("pageTitle");
  const introEl = document.getElementById("introBox");
  const detailEl = document.getElementById("detailBox");
  const activeYear = getActiveYear();

  if(!item){
    if(titleEl) titleEl.textContent = `${activeYear}년 별자리 운세`;
    if(introEl){
      introEl.innerHTML = `<p class="info-text">해당 별자리 데이터가 아직 준비되지 않았습니다.</p>`;
    }
    if(detailEl) detailEl.innerHTML = "";
    return;
  }

  updateSeoMeta(sign, item);
  injectStructuredData(sign, item);

  if(titleEl){
    titleEl.textContent = `${activeYear}년 ${item.name} 연간 운세`;
  }

  if(introEl){
    introEl.innerHTML = `
      <p class="info-text">${escapeHtml(item.intro || "")}</p>
      <p class="info-text">${escapeHtml(item.notice || "별자리 운세는 참고용 콘텐츠입니다.")}</p>
      ${renderKeywords(item.keywords)}
    `;
  }

  if(detailEl){
    detailEl.innerHTML = `
      <div class="card">
        <h2>📌 전체 흐름</h2>
        <p class="info-text">${escapeHtml(item.overall || "")}</p>
      </div>

      <div class="card">
        <h2>💼 직장운</h2>
        <p class="info-text">${escapeHtml(item.career || "")}</p>
      </div>

      <div class="card">
        <h2>💰 재물운</h2>
        <p class="info-text">${escapeHtml(item.wealth || "")}</p>
      </div>

      <div class="card">
        <h2>❤️ 애정운</h2>
        <p class="info-text">${escapeHtml(item.love || "")}</p>
      </div>

      <div class="card">
        <h2>💪 건강운</h2>
        <p class="info-text">${escapeHtml(item.health || "")}</p>
      </div>

      ${renderList(item.tips, "🧭 올해 운영 팁")}
      ${renderMonths(item.months)}
      ${renderList(item.checklist, "✔ 체크 포인트")}
    `;
  }
}

function bindShare(sign){
  const btn = document.getElementById("shareBtn");
  if(!btn) return;

  const item = starDB?.[sign];
  const starName = item?.name || "별자리";
  const activeYear = getActiveYear();

  btn.onclick = async ()=>{
    const data = {
      title: document.title,
      text: `${activeYear}년 ${starName} 운세를 확인해보세요.`,
      url: location.href
    };

    try{
      if(navigator.share){
        await navigator.share(data);
      }else if(navigator.clipboard){
        await navigator.clipboard.writeText(location.href);
        alert("주소가 복사되었습니다.");
      }else{
        alert("공유 기능을 사용할 수 없는 환경입니다.");
      }
    }catch(e){
      console.warn("[star-detail.js] share cancelled", e);
    }
  };
}

async function rewardStarDetailOncePerDay(){
  const phone = localStorage.getItem("phone");
  if(!phone) return;

  const key = `star_detail_${getTodayStamp()}`;
  if(localStorage.getItem(key) === "1") return;

  if(window.rewardContent){
    try{
      const res = await window.rewardContent("star");

      if(res?.status === "ok"){
        localStorage.setItem(key, "1");

        if(window.loadMyPoint){
          await window.loadMyPoint();
        }

        renderPointBoxStar();
        alert("포인트가 적립되었습니다 ✅");
      }else if(res?.status === "already"){
        localStorage.setItem(key, "1");
      }
    }catch(e){
      console.warn("[star-detail.js] reward failed", e);
    }
  }
}

async function applyGuestBirthForStarDetail(){
  const birthEl = document.getElementById("guestBirthInline");
  const rawBirth = String(birthEl?.value || "").trim();

  if(!/^\d{4}-\d{2}-\d{2}$/.test(rawBirth)){
    alert("생년월일을 입력해주세요.");
    return;
  }

  localStorage.setItem("guestMode", "true");
  localStorage.setItem("guest_birth", rawBirth);

  const mySign = getStarSignFromBirth(rawBirth);
  if(mySign){
    location.href = `/pages/star/detail.html?sign=${encodeURIComponent(mySign)}`;
    return;
  }

  alert("별자리 계산에 실패했어요.");
}

document.addEventListener("DOMContentLoaded", async ()=>{
  const requestedSign = getQueryParam("sign");
  const sign = requestedSign || getStarSignFromBirth(getActiveBirthForStar()) || "capricorn";

  try{
    if(window.loadMyPoint){
      await window.loadMyPoint();
    }

    await loadDB();
    renderEntryState(sign);
    renderPointBoxStar();
    renderMyInfo(sign);
    renderDetail(sign);
    bindShare(sign);

    document.getElementById("applyGuestBirthBtn")?.addEventListener("click", applyGuestBirthForStarDetail);

    await rewardStarDetailOncePerDay();

    const loginCheck = document.getElementById("loginCheck");
    const item = starDB?.[sign];
    const activeYear = getActiveYear();

    if(loginCheck && item){
      loginCheck.innerHTML = `
        <h2>✅ 리포트 생성 완료</h2>
        <p class="small">${activeYear}년 ${escapeHtml(item.name)} 상세 운세입니다.</p>
      `;
    }
  }catch(err){
    console.error("[star-detail.js] init failed", err);

    const titleEl = document.getElementById("pageTitle");
    const introEl = document.getElementById("introBox");
    const detailEl = document.getElementById("detailBox");

    if(titleEl) titleEl.textContent = `${getActiveYear()}년 별자리 운세`;
    if(introEl){
      introEl.innerHTML = `
        <p class="info-text">별자리 데이터를 불러오지 못했어요. 잠시 후 다시 시도해주세요.</p>
      `;
    }
    if(detailEl) detailEl.innerHTML = "";
  }
});

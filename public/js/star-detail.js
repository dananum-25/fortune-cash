let starDB = {};
let rewarded = false;

/* -----------------------
공통 유틸
----------------------- */
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

/* -----------------------
별자리 계산
----------------------- */
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

/* -----------------------
DB 로드
----------------------- */
async function loadDB(){
  const res = await fetch("/data/star_2026.json", { cache: "no-store" });
  if(!res.ok){
    throw new Error(`star_2026.json load failed: ${res.status}`);
  }
  starDB = await res.json();
}

/* -----------------------
SEO / 메타
----------------------- */
function updateSeoMeta(sign, item){
  const title = `2026년 ${item.name} 운세 총정리 | 연간운세 · 월별운세 · 재물운 · 애정운`;
  const desc = `${item.name} 2026년 연간 운세를 참고용으로 확인하세요. 전체 흐름, 직장운, 재물운, 애정운, 건강운, 월별 포인트를 정리했습니다.`;
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

/* -----------------------
구조화 데이터
----------------------- */
function injectStructuredData(sign, item){
  const el = document.getElementById("starJsonLd");
  if(!el || !item) return;

  const pageUrl = `https://fortune-cash.vercel.app/pages/star/detail.html?sign=${sign}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `2026년 ${item.name} 운세 총정리`,
    "description": `${item.name} 2026년 연간 운세, 월별 흐름, 재물운, 애정운, 직장운, 건강운 요약.`,
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

/* -----------------------
UI 조각 렌더
----------------------- */
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

/* -----------------------
내 정보
----------------------- */
function renderMyInfo(currentSign){
  const box = document.getElementById("myStarInfo");
  if(!box) return;

  const name = localStorage.getItem("name") || "회원";
  const birth = localStorage.getItem("birth") || "";
  const mySign = getStarSignFromBirth(birth);

  if(!birth || !mySign){
    box.innerHTML = `
      <p class="info-text"><b>${escapeHtml(name)}</b>님</p>
      <p class="info-text" style="margin-top:8px;">
        로그인된 생년월일 정보가 없어 내 별자리를 자동 표시하지 못했어요.
      </p>
    `;
    return;
  }

  const myLabel = starDB?.[mySign]?.name || mySign;
  const currentLabel = starDB?.[currentSign]?.name || currentSign;

  if(mySign === currentSign){
    box.innerHTML = `
      <p class="info-text"><b>${escapeHtml(name)}</b>님</p>
      <p class="info-text" style="margin-top:8px;">생년월일: ${escapeHtml(birth)}</p>
      <p class="info-text" style="margin-top:8px;">
        당신의 별자리는 <b style="color:#ffd56b;">${escapeHtml(myLabel)}</b> 입니다.
      </p>
      <p class="info-text" style="margin-top:8px;">
        이 페이지는 내 별자리 운세를 바로 확인할 수 있도록 보여주고 있어요.
      </p>
    `;
    return;
  }

  box.innerHTML = `
    <p class="info-text"><b>${escapeHtml(name)}</b>님</p>
    <p class="info-text" style="margin-top:8px;">생년월일: ${escapeHtml(birth)}</p>
    <p class="info-text" style="margin-top:8px;">
      당신의 별자리는 <b style="color:#ffd56b;">${escapeHtml(myLabel)}</b> 입니다.
    </p>
    <p class="info-text" style="margin-top:8px;">
      지금 보고 있는 페이지는 <b style="color:#ffd56b;">${escapeHtml(currentLabel)}</b> 운세예요.
    </p>
    <p style="margin-top:12px;">
      <a class="action-link" href="/pages/star/detail.html?sign=${encodeURIComponent(mySign)}">
        ${escapeHtml(myLabel)} 운세 바로 보기
      </a>
    </p>
  `;
}

/* -----------------------
상세 본문
----------------------- */
function renderDetail(sign){
  const item = starDB?.[sign];
  const titleEl = document.getElementById("pageTitle");
  const introEl = document.getElementById("introBox");
  const detailEl = document.getElementById("detailBox");

  if(!item){
    if(titleEl) titleEl.textContent = "2026년 별자리 운세";
    if(introEl){
      introEl.innerHTML = `<p class="info-text">해당 별자리 데이터가 아직 준비되지 않았습니다.</p>`;
    }
    if(detailEl) detailEl.innerHTML = "";
    return;
  }

  updateSeoMeta(sign, item);
  injectStructuredData(sign, item);

  if(titleEl){
    titleEl.textContent = `2026년 ${item.name} 연간 운세`;
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

/* -----------------------
공유하기
----------------------- */
function bindShare(sign){
  const btn = document.getElementById("shareBtn");
  if(!btn) return;

  const item = starDB?.[sign];
  const starName = item?.name || "별자리";

  btn.onclick = async () => {
    const data = {
      title: document.title,
      text: `2026년 ${starName} 운세를 확인해보세요.`,
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
      console.warn("share cancelled or failed", e);
    }
  };
}

/* -----------------------
포인트 1회 지급
----------------------- */
async function rewardOnce(){
  if(rewarded) return;
  rewarded = true;

  if(window.rewardContent){
    await rewardContent("fortune_view");
  }
}

/* -----------------------
실행
----------------------- */
document.addEventListener("DOMContentLoaded", async () => {
  const sign = getQueryParam("sign") || "aquarius";

  try{
    await loadDB();
    renderMyInfo(sign);
    renderDetail(sign);
    bindShare(sign);
    await rewardOnce();
  }catch(err){
    console.error("[star-detail.js] init failed", err);

    const titleEl = document.getElementById("pageTitle");
    const introEl = document.getElementById("introBox");
    const detailEl = document.getElementById("detailBox");

    if(titleEl) titleEl.textContent = "2026년 별자리 운세";
    if(introEl){
      introEl.innerHTML = `
        <p class="info-text">별자리 데이터를 불러오지 못했어요. 잠시 후 다시 시도해주세요.</p>
      `;
    }
    if(detailEl) detailEl.innerHTML = "";
  }
});

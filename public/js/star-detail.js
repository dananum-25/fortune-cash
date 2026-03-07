let starDB = {};
let rewarded = false;

function getQueryParam(name){
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
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

function getStarLabel(key){
  const map = {
    aries: "양자리",
    taurus: "황소자리",
    gemini: "쌍둥이자리",
    cancer: "게자리",
    leo: "사자자리",
    virgo: "처녀자리",
    libra: "천칭자리",
    scorpio: "전갈자리",
    sagittarius: "사수자리",
    capricorn: "염소자리",
    aquarius: "물병자리",
    pisces: "물고기자리"
  };
  return map[key] || "별자리";
}

async function loadDB(){
  const res = await fetch("/data/star_2026.json", { cache: "no-store" });
  if(!res.ok){
    throw new Error("star_2026.json load failed");
  }
  starDB = await res.json();
}

async function rewardOnce(){
  if(rewarded) return;
  rewarded = true;

  if(window.rewardContent){
    await rewardContent("fortune_view");
  }
}

function renderBadges(arr){
  if(!Array.isArray(arr) || arr.length === 0) return "";
  return `
    <div class="badge-wrap">
      ${arr.map(v => `<span class="badge">${v}</span>`).join("")}
    </div>
  `;
}

function renderMonthGrid(months){
  if(!Array.isArray(months) || months.length === 0) return "";

  return `
    <div class="card">
      <h2>🗓️ 월별 운세</h2>
      <div class="month-grid">
        ${months.map(item => `
          <div class="month">
            <b>${item.month}</b><br>
            ${item.text}
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderTips(title, arr){
  if(!Array.isArray(arr) || arr.length === 0) return "";
  return `
    <div class="card">
      <h2>${title}</h2>
      <ul class="list">
        ${arr.map(v => `<li>${v}</li>`).join("")}
      </ul>
    </div>
  `;
}

function renderMyInfo(currentSign){
  const box = document.getElementById("myStarInfo");
  if(!box) return;

  const name = localStorage.getItem("name") || "회원";
  const birth = localStorage.getItem("birth") || "";
  const mySign = getStarSignFromBirth(birth);

  if(!birth || !mySign){
    box.innerHTML = `
      <p class="info-text"><b>${name}</b>님</p>
      <p class="info-text" style="margin-top:8px;">로그인된 생년월일 정보가 없어 내 별자리를 자동 표시하지 못했어요.</p>
    `;
    return;
  }

  const myLabel = getStarLabel(mySign);
  const currentLabel = getStarLabel(currentSign);

  if(mySign === currentSign){
    box.innerHTML = `
      <p class="info-text"><b>${name}</b>님</p>
      <p class="info-text" style="margin-top:8px;">생년월일: ${birth}</p>
      <p class="info-text" style="margin-top:8px;">당신의 별자리는 <b style="color:#ffd56b;">${myLabel}</b> 입니다.</p>
      <p class="info-text" style="margin-top:8px;">이 페이지는 내 별자리 운세를 바로 확인할 수 있도록 보여주고 있어요.</p>
    `;
    return;
  }

  box.innerHTML = `
    <p class="info-text"><b>${name}</b>님</p>
    <p class="info-text" style="margin-top:8px;">생년월일: ${birth}</p>
    <p class="info-text" style="margin-top:8px;">당신의 별자리는 <b style="color:#ffd56b;">${myLabel}</b> 입니다.</p>
    <p class="info-text" style="margin-top:8px;">지금 보고 있는 페이지는 <b style="color:#ffd56b;">${currentLabel}</b> 운세예요.</p>
    <p style="margin-top:12px;">
      <a class="action-link" href="/pages/star/detail.html?sign=${mySign}">${myLabel} 운세 바로 보기</a>
    </p>
  `;
}

function renderDetail(sign){
  const item = starDB?.[sign];
  const titleEl = document.getElementById("pageTitle");
  const introEl = document.getElementById("introBox");
  const detailEl = document.getElementById("detailBox");

  if(!item){
    titleEl.textContent = "2026년 별자리 운세";
    introEl.innerHTML = `<p class="info-text">해당 별자리 데이터가 아직 준비되지 않았습니다.</p>`;
    detailEl.innerHTML = "";
    return;
  }

  document.title = `2026년 ${item.name} 운세 총정리 | 연간운세 · 월별운세`;
  titleEl.textContent = `2026년 ${item.name} 연간 운세`;

  introEl.innerHTML = `
    <p class="info-text">${item.intro || ""}</p>
    <p class="info-text">${item.notice || "별자리 운세는 참고용 콘텐츠입니다."}</p>
    ${renderBadges(item.keywords)}
  `;

  detailEl.innerHTML = `
    <div class="card">
      <h2>📌 전체 흐름</h2>
      <p class="info-text">${item.overall || ""}</p>
    </div>

    <div class="card">
      <h2>💼 직장운 / 일운</h2>
      <p class="info-text">${item.career || ""}</p>
    </div>

    <div class="card">
      <h2>💰 재물운</h2>
      <p class="info-text">${item.wealth || ""}</p>
    </div>

    <div class="card">
      <h2>❤️ 애정운 / 관계운</h2>
      <p class="info-text">${item.love || ""}</p>
    </div>

    <div class="card">
      <h2>💪 건강운</h2>
      <p class="info-text">${item.health || ""}</p>
    </div>

    ${renderTips("🧭 올해의 운영 팁", item.tips)}
    ${renderMonthGrid(item.months)}
    ${renderTips("✅ 올해 체크 포인트", item.checklist)}
  `;
}

function bindShare(){
  const shareBtn = document.getElementById("shareBtn");
  if(!shareBtn) return;

  shareBtn.addEventListener("click", async ()=>{
    const shareData = {
      title: document.title,
      text: "2026년 별자리 운세를 확인해보세요.",
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
    }catch(err){
      console.warn("share cancelled or failed", err);
    }
  });
}

document.addEventListener("DOMContentLoaded", async ()=>{
  const sign = getQueryParam("sign") || "aquarius";

  try{
    await loadDB();
    renderMyInfo(sign);
    renderDetail(sign);
    bindShare();
    await rewardOnce();
  }catch(err){
    console.error(err);

    const titleEl = document.getElementById("pageTitle");
    const introEl = document.getElementById("introBox");
    const detailEl = document.getElementById("detailBox");

    if(titleEl) titleEl.textContent = "별자리 운세";
    if(introEl) introEl.innerHTML = `<p class="info-text">별자리 데이터를 불러오지 못했어요.</p>`;
    if(detailEl) detailEl.innerHTML = "";
  }
});

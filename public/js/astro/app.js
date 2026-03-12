import { buildAstroBaseProfile } from "/js/astro/engine/astro.engine.js";
import { renderAstroReport } from "/js/astro/interpreter/astro.render.js";
import { getAstroInput, saveAstroInput } from "/js/astro/astro.storage.js";

function getActiveName(){
  return localStorage.getItem("name") || "기본 기준";
}

function fillDefaultInputs(){
  const saved = getAstroInput();

  const birthDateEl = document.getElementById("astroBirthDate");
  const birthTimeEl = document.getElementById("astroBirthTime");
  const birthPlaceEl = document.getElementById("astroBirthPlace");

  if(birthDateEl && !birthDateEl.value){
    birthDateEl.value = saved.birthDate;
  }

  if(birthTimeEl && !birthTimeEl.value){
    birthTimeEl.value = saved.birthTime;
  }

  if(birthPlaceEl && !birthPlaceEl.value){
    birthPlaceEl.value = saved.birthPlaceText;
  }
}

async function renderAstro(){
  const saved = getAstroInput();

  const birthDate = document.getElementById("astroBirthDate")?.value || saved.birthDate;
  const birthTime = document.getElementById("astroBirthTime")?.value || saved.birthTime;
  const birthPlaceText = document.getElementById("astroBirthPlace")?.value || saved.birthPlaceText;

  saveAstroInput({ birthDate, birthTime, birthPlaceText });

  const profile = buildAstroBaseProfile({
    birthDate,
    birthTime,
    birthPlaceText,
    targetDate: new Date().toISOString().slice(0, 10)
  });

  const resultBox = document.getElementById("astroResult");
  if(!resultBox) return;

  if(!profile){
    resultBox.innerHTML = `
      <div class="card">
        <h2>⚠ 결과 생성 실패</h2>
        <p>입력값을 다시 확인해주세요.</p>
      </div>
    `;
    return;
  }

  const name = getActiveName();
  const geoLabel = profile?.geo?.geoLabel || birthPlaceText;

  const star = getStarSignFromBirth(birthDate);
  const starDB = await loadStarDB();
  const starItem = star && starDB ? starDB[star.key] : null;

  resultBox.innerHTML = `
    <div class="card">
      <h2>👤 입력 기준</h2>
      <p><b>${name}</b></p>
      <p>생년월일: ${birthDate}</p>
      <p>출생시간: ${birthTime}</p>
      <p>출생지: ${geoLabel}</p>
      ${
        profile?.geo?.geoMatched === false
          ? `<p class="small">※ 출생지는 기본 매핑으로 처리되어 서울 기준 좌표가 적용되었을 수 있습니다.</p>`
          : ""
      }
    </div>

    ${renderAstroReport(profile)}

    ${renderStarHelperCard(star, starItem)}
  `;
}

function getStarSignFromBirth(birth){
  const m = String(birth || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!m) return null;

  const month = Number(m[2]);
  const day = Number(m[3]);

  if((month === 3 && day >= 21) || (month === 4 && day <= 19)) return { key:"aries", name:"양자리" };
  if((month === 4 && day >= 20) || (month === 5 && day <= 20)) return { key:"taurus", name:"황소자리" };
  if((month === 5 && day >= 21) || (month === 6 && day <= 21)) return { key:"gemini", name:"쌍둥이자리" };
  if((month === 6 && day >= 22) || (month === 7 && day <= 22)) return { key:"cancer", name:"게자리" };
  if((month === 7 && day >= 23) || (month === 8 && day <= 22)) return { key:"leo", name:"사자자리" };
  if((month === 8 && day >= 23) || (month === 9 && day <= 22)) return { key:"virgo", name:"처녀자리" };
  if((month === 9 && day >= 23) || (month === 10 && day <= 22)) return { key:"libra", name:"천칭자리" };
  if((month === 10 && day >= 23) || (month === 11 && day <= 22)) return { key:"scorpio", name:"전갈자리" };
  if((month === 11 && day >= 23) || (month === 12 && day <= 24)) return { key:"sagittarius", name:"사수자리" };
  if((month === 12 && day >= 25) || (month === 1 && day <= 19)) return { key:"capricorn", name:"염소자리" };
  if((month === 1 && day >= 20) || (month === 2 && day <= 18)) return { key:"aquarius", name:"물병자리" };
  if((month === 2 && day >= 19) || (month === 3 && day <= 20)) return { key:"pisces", name:"물고기자리" };

  return null;
}

async function loadStarDB(){
  const activeYear =
    window.FortuneConfig?.year ||
    window.APP_CONFIG?.fortuneYear ||
    new Date().getFullYear();

  try{
    const res = await fetch(`/data/star_${activeYear}.json`, { cache: "no-store" });
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }catch(e){
    const res = await fetch("/data/star_2026.json", { cache: "no-store" });
    if(!res.ok) return null;
    return await res.json();
  }
}

function renderStarHelperCard(star, starItem){
  if(!star || !starItem) return "";

  return `
    <div class="card">
      <h2>⭐ 내 태양별자리 보조 해석</h2>
      <p><b>내 별자리:</b> ${star.name}</p>
      <p class="small">점성술 전체 리포트와 별개로, 태양별자리 기준 공통 흐름도 함께 참고할 수 있어요.</p>

      <div class="hr"></div>

      <p><b>전체 흐름</b><br>${starItem.overall || ""}</p>
      <p><b>직장운</b><br>${starItem.career || ""}</p>
      <p><b>재물운</b><br>${starItem.wealth || ""}</p>
      <p><b>애정운</b><br>${starItem.love || ""}</p>
      <p><b>건강운</b><br>${starItem.health || ""}</p>

      <p style="margin-top:12px;">
        <a class="action-link" href="/pages/star/detail.html?sign=${encodeURIComponent(star.key)}">${star.name} 상세 운세 보기</a>
      </p>
    </div>
  `;
}

function bindShare(){
  const btn = document.getElementById("shareBtn");
  if(!btn) return;

  btn.addEventListener("click", async ()=>{
    const data = {
      title: document.title,
      text: "개인 점성술 리포트를 확인해보세요.",
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
      console.warn("[astro/app.js] share cancelled", e);
    }
  });
}

document.addEventListener("DOMContentLoaded", async ()=>{
  fillDefaultInputs();
  bindShare();

  document.getElementById("runAstroBtn")?.addEventListener("click", renderAstro);

  await renderAstro();
});

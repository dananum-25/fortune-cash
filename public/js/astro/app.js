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

function renderAstro(){
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

document.addEventListener("DOMContentLoaded", ()=>{
  fillDefaultInputs();
  bindShare();

  document.getElementById("runAstroBtn")?.addEventListener("click", renderAstro);

  renderAstro();
});

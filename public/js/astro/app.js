import { buildAstroBaseProfile } from "/js/astro/engine/astro.engine.js";
import { renderAstroReport } from "/js/astro/interpreter/astro.render.js";
import { getAstroInput, saveAstroInput } from "/js/astro/astro.storage.js";
import { buildAstronomySnapshot } from "/js/astro/adapters/astronomy-engine.adapter.js";
import { buildPlanetAspects, buildAspectNarratives } from "/js/astro/adapters/astronomy-aspect.adapter.js";
import { buildAscendantSnapshot } from "/js/astro/adapters/astronomy-ascendant.adapter.js";

const DEFAULT_BIRTH_YMD = "1940-01-01";
const DEFAULT_BIRTH_TIME = "11:00";
const DEFAULT_BIRTH_PLACE = "서울특별시 종로구";

function getActiveName(){
  return localStorage.getItem("name") || "기본 기준";
}

function getActiveYear(){
  return (
    window.FortuneConfig?.year ||
    window.APP_CONFIG?.fortuneYear ||
    new Date().getFullYear()
  );
}

function getResolvedInput(){
  const saved = getAstroInput();

  const phone = localStorage.getItem("phone");
  const guestBirth = localStorage.getItem("guest_birth");

  const birthDate =
    phone
      ? (localStorage.getItem("birth") || saved.birthDate || DEFAULT_BIRTH_YMD)
      : guestBirth
        ? (localStorage.getItem("guest_birth") || saved.birthDate || DEFAULT_BIRTH_YMD)
        : (saved.birthDate || DEFAULT_BIRTH_YMD);

  const birthTime =
    phone
      ? (localStorage.getItem("birthTime") || saved.birthTime || DEFAULT_BIRTH_TIME)
      : guestBirth
        ? (localStorage.getItem("guest_birthTime") || saved.birthTime || DEFAULT_BIRTH_TIME)
        : (saved.birthTime || DEFAULT_BIRTH_TIME);

  const birthPlaceText =
    phone
      ? (localStorage.getItem("birthPlaceText") || saved.birthPlaceText || DEFAULT_BIRTH_PLACE)
      : guestBirth
        ? (localStorage.getItem("guest_birthPlaceText") || saved.birthPlaceText || DEFAULT_BIRTH_PLACE)
        : (saved.birthPlaceText || DEFAULT_BIRTH_PLACE);

  return {
    birthDate: birthDate || DEFAULT_BIRTH_YMD,
    birthTime: birthTime || DEFAULT_BIRTH_TIME,
    birthPlaceText: birthPlaceText || DEFAULT_BIRTH_PLACE
  };
}

function renderPlanetReasonCard(snapshot){
  const planets = snapshot?.planets;
  if(!planets) return "";

  const sun = planets.sun;
  const moon = planets.moon;
  const mercury = planets.mercury;
  const venus = planets.venus;
  const mars = planets.mars;
  const jupiter = planets.jupiter;
  const saturn = planets.saturn;

  const aspects = buildPlanetAspects(planets);
  const narratives = buildAspectNarratives(aspects);

  return `
    <div class="card">
      <h2>🪐 오늘 하늘 기준 설명</h2>

      <p>
        오늘 태양은 <b>${sun.signName} ${sun.degree}°</b>에 위치합니다.
        태양은 현재 전체적인 방향성과 중심 주제를 읽는 핵심 기준이기 때문에,
        오늘의 기본 분위기를 설명할 때 가장 먼저 참고합니다.
      </p>

      <p>
        달은 <b>${moon.signName} ${moon.degree}°</b>에 있습니다.
        달은 감정 반응, 컨디션, 관계에서의 체감 흐름을 보여주므로
        오늘 기분 변화와 정서적 반응을 읽는 데 중요합니다.
      </p>

      <p>
        수성은 <b>${mercury.signName} ${mercury.degree}°</b>에 있어
        대화, 일정 조율, 전달 방식, 실수 가능성 같은 커뮤니케이션 흐름을 볼 때 참고합니다.
      </p>

      <p>
        금성은 <b>${venus.signName} ${venus.degree}°</b>에 있고,
        화성은 <b>${mars.signName} ${mars.degree}°</b>에 있습니다.
        금성은 관계와 호감, 화성은 행동과 추진력을 뜻하므로
        사람 사이 분위기와 실제 행동 패턴을 함께 설명할 때 자주 사용합니다.
      </p>

      <p>
        목성은 <b>${jupiter.signName} ${jupiter.degree}°</b>에 있어
        확장과 기회를 해석할 때 참고하고,
        토성은 <b>${saturn.signName} ${saturn.degree}°</b>에 있어
        현실 점검, 책임, 제약, 구조화가 필요한 부분을 설명할 때 사용합니다.
      </p>

      ${
        narratives.length
          ? `
            <div class="hr"></div>
            <h3>📐 오늘 주요 각도 해석</h3>
            ${narratives.map(line => `<p>${line}</p>`).join("")}
          `
          : ""
      }

      <p class="small">
        이 설명은 실제 하늘의 행성 위치와 행성 간 각도를 바탕으로 현재 흐름을 읽는 방식입니다.
      </p>
    </div>
  `;
}

function renderEntryState(){
  const box = document.getElementById("loginCheck");
  if(!box) return;

  const phone = localStorage.getItem("phone");
  const guestBirth = localStorage.getItem("guest_birth");
  const name = localStorage.getItem("name") || "회원";
  const saved = getResolvedInput();

  if(phone){
    box.innerHTML = `
      <h2>✅ 준비 완료</h2>
      <p><b>${name}</b>님 저장된 생년월일이 자동 적용되었습니다.</p>
      <p class="small">출생시간과 출생지를 함께 입력하면 더 자세한 내 별자리운세 흐름을 볼 수 있어요.</p>
    `;
    return;
  }

  if(guestBirth){
    box.innerHTML = `
      <h2>✅ 게스트 기준 적용 완료</h2>
      <p>생년월일: <b>${saved.birthDate}</b></p>
      <p>출생시간: <b>${saved.birthTime}</b></p>
      <p>출생지: <b>${saved.birthPlaceText}</b></p>
      <p class="small">입력한 기준으로 내 별자리운세를 다시 볼 수 있어요.</p>
    `;
    return;
  }

  box.innerHTML = `
    <h2>✅ 기본 기준으로 바로 보기</h2>
    <p>현재는 <b>${DEFAULT_BIRTH_YMD}</b> / <b>${DEFAULT_BIRTH_TIME}</b> / <b>${DEFAULT_BIRTH_PLACE}</b> 기준으로 결과를 볼 수 있습니다.</p>
    <p class="small">원하는 값으로 바꿔서 내 기준으로 다시 볼 수 있어요.</p>
  `;
}

function fillDefaultInputs(){
  const saved = getResolvedInput();

  const birthDateEl = document.getElementById("astroBirthDate");
  const birthTimeEl = document.getElementById("astroBirthTime");
  const birthPlaceEl = document.getElementById("astroBirthPlace");
  const runBtn = document.getElementById("runAstroBtn");

  if(birthDateEl){
    birthDateEl.value = saved.birthDate || DEFAULT_BIRTH_YMD;
  }

  if(birthTimeEl){
    birthTimeEl.value = saved.birthTime || DEFAULT_BIRTH_TIME;
  }

  if(birthPlaceEl){
    birthPlaceEl.value = saved.birthPlaceText || DEFAULT_BIRTH_PLACE;
  }

  if(runBtn){
    runBtn.disabled = false;
  }
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
  const activeYear = getActiveYear();

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
      <h2>⭐ 내 태양별자리 공통 해석</h2>
      <p><b>내 별자리:</b> ${star.name}</p>
      <p class="small">위 리포트는 내 기준 개인 흐름이고, 아래 내용은 태양별자리 기준 공통 해석입니다.</p>

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
function renderAscendantCard(ascendant){
  if(!ascendant) return "";

  return `
    <div class="card">
      <h2>⬆ 상승궁(Ascendant)</h2>

      <p>
        상승궁은 태어난 순간 동쪽 지평선에서 떠오르던 별자리입니다.
        태양별자리가 기본 성향을 본다면, 상승궁은 외부에 드러나는 첫인상과
        세상에 반응하는 방식, 시작할 때의 태도를 읽을 때 중요하게 봅니다.
      </p>

      <div class="hr"></div>

      <p><b>상승궁:</b> ${ascendant.ascendantSignName}</p>
      <p><b>도수:</b> ${ascendant.ascendantDegree}°</p>
      <p><b>출생 기준:</b> ${ascendant.birthDate} ${ascendant.birthTime}</p>

      <p class="small">
        상승궁은 출생시간과 출생지 영향을 크게 받기 때문에,
        시간이 달라지면 결과가 달라질 수 있습니다.
      </p>
    </div>
  `;
}

async function renderAstro(){
  const fallback = getResolvedInput();

  const birthDate = document.getElementById("astroBirthDate")?.value || fallback.birthDate;
  const birthTime = document.getElementById("astroBirthTime")?.value || fallback.birthTime;
  const birthPlaceText = document.getElementById("astroBirthPlace")?.value || fallback.birthPlaceText;

  saveAstroInput({ birthDate, birthTime, birthPlaceText });
  renderEntryState();

  const targetDate = new Date().toISOString().slice(0, 10);

  const profile = buildAstroBaseProfile({
    birthDate,
    birthTime,
    birthPlaceText,
    targetDate
  });

  const astronomySnapshot = buildAstronomySnapshot(new Date(`${targetDate}T12:00:00Z`));
  const ascendantSnapshot = buildAscendantSnapshot({
    birthDate,
    birthTime,
    geo: profile?.geo
  });

  console.log("[astronomy snapshot]", astronomySnapshot);
  console.log("[astronomy aspects]", buildPlanetAspects(astronomySnapshot?.planets));
  console.log("[ascendant snapshot]", ascendantSnapshot);
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
    <section class="card">
      <h2 class="fortune-title">👤 입력 기준</h2>
      <p><b>${name}</b></p>
      <p>생년월일: ${birthDate}</p>
      <p>출생시간: ${birthTime}</p>
      <p>출생지: ${geoLabel}</p>
      ${
        profile?.geo?.geoMatched === false
          ? `<p class="small">※ 출생지는 기본 매핑으로 처리되어 서울 기준 좌표가 적용되었을 수 있습니다.</p>`
          : ""
      }
    </section>

    ${renderAscendantCard(ascendantSnapshot)}

    ${renderPlanetReasonCard(astronomySnapshot)}

    ${renderAstroReport(profile)}

    ${renderStarHelperCard(star, starItem)}
  `;
}

function bindShare(){
  const btn = document.getElementById("shareBtn");
  if(!btn) return;

  btn.addEventListener("click", async ()=>{
    const data = {
      title: document.title,
      text: "내 별자리운세를 확인해보세요.",
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
  renderEntryState();
  fillDefaultInputs();
  bindShare();

  document.getElementById("runAstroBtn")?.addEventListener("click", renderAstro);

  await renderAstro();
});

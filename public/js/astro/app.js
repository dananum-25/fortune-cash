import { buildAstroBaseProfile } from "/js/astro/engine/astro.engine.js";
import { renderAstroReport } from "/js/astro/interpreter/astro.render.js";
import { getAstroInput, saveAstroInput } from "/js/astro/astro.storage.js";
import { buildAstronomySnapshot, buildAstronomySnapshotFromBirth } from "/js/astro/adapters/astronomy-engine.adapter.js";
import { buildPlanetAspects, buildAspectNarratives } from "/js/astro/adapters/astronomy-aspect.adapter.js";
import { buildAscendantSnapshot } from "/js/astro/adapters/astronomy-ascendant.adapter.js";
import { buildEqualHouseCusps, buildPlanetHousePlacements } from "/js/astro/adapters/astronomy-house.adapter.js";
import { buildTransitToNatalAspects, buildTransitNarratives } from "/js/astro/adapters/astronomy-transit.adapter.js";
import { buildLifeAreaInterpretation } from "/js/astro/interpreter/astro.life.interpret.js";
import { buildMonthlyAstroSummary } from "/js/astro/interpreter/astro.monthly.interpret.js";
import { buildRetrogradeStatus } from "/js/astro/adapters/astronomy-retrograde.adapter.js";

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

function buildMonthlySnapshots(year){
  const data = [];
  const safeYear = Number(year) || new Date().getFullYear();

  for(let month = 1; month <= 12; month++){
    const date = new Date(Date.UTC(safeYear, month - 1, 15, 12, 0, 0));

    console.log("[monthly date check]", month, date, date instanceof Date, Number.isNaN(date.getTime()));

    if(!(date instanceof Date) || Number.isNaN(date.getTime())){
      continue;
    }

    const snapshot = buildAstronomySnapshot(date);
    const aspects = buildPlanetAspects(snapshot?.planets);

    data.push({
      month,
      planets: snapshot?.planets || null,
      aspects
    });
  }

  return data;
}

function renderLifeAreaCard(planets, houses){

  const life = buildLifeAreaInterpretation(planets, houses);

  return `
  <div class="card">
    <h2>📊 생활 영역 흐름</h2>

    <p><b>💼 직업 / 일</b><br>${life.career}</p>

    <p style="margin-top:10px;">
    <b>❤️ 관계 / 연애</b><br>${life.love}</p>

    <p style="margin-top:10px;">
    <b>💰 재물 / 소비</b><br>${life.money}</p>

    <p style="margin-top:10px;">
    <b>💪 건강 / 생활</b><br>${life.health}</p>

  </div>
  `;
}

function renderRetrogradeCard(retro){

  if(!retro) return "";

  const items = Object.keys(retro).map(key=>{

    const item = retro[key];

    const state =
      item.motion === "retrograde"
        ? "🔴 역행"
        : "🟢 순행";

    return `
      <p>
      <b>${item.label}</b> : ${state}
      </p>
    `;
  }).join("");

  return `
  <div class="card">

  <h2>🪐 현재 행성 상태</h2>

  <p class="small">
  행성이 역행 상태일 때는 해당 영역의 흐름이 느려지거나
  점검이 필요한 시기로 해석하기도 합니다.
  </p>

  <div class="hr"></div>

  ${items}

  </div>
  `;
}

function renderMonthlyAstroCard(year, monthlySummaries){
  if(!Array.isArray(monthlySummaries) || monthlySummaries.length === 0){
    return "";
  }

  return `
    <div class="card">
      <h2>🗓 ${year} 월간 점성술 흐름</h2>

      <p class="small">
        각 달의 중순 기준 하늘 흐름을 바탕으로 월별 분위기를 요약한 참고 자료입니다.
      </p>

      <div class="hr"></div>

      ${monthlySummaries.map(item => `
        <p>
          <b>${item.label}</b><br>
          ${item.summary}
        </p>
      `).join("")}
    </div>
  `;
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

function getSunMeaning(signName){
  const map = {
    "양자리": "빠르게 시작하고 직접 부딪히는 성향이 강합니다.",
    "황소자리": "안정감과 지속성을 중요하게 보는 편입니다.",
    "쌍둥이자리": "정보, 대화, 변화에 민감하게 반응하는 편입니다.",
    "게자리": "정서적 안정과 친밀한 관계를 중요하게 여깁니다.",
    "사자자리": "표현력, 존재감, 자존감을 중요하게 보는 편입니다.",
    "처녀자리": "정리, 분석, 실용성을 중시하는 성향이 강합니다.",
    "천칭자리": "균형, 관계, 조화를 중요하게 여깁니다.",
    "전갈자리": "깊이, 집중, 강한 몰입을 보이는 편입니다.",
    "사수자리": "확장, 자유, 시야 넓히기를 중요하게 여깁니다.",
    "염소자리": "책임감, 성취, 구조를 중요하게 보는 편입니다.",
    "물병자리": "독립성, 새로움, 차별화된 시각이 강합니다.",
    "물고기자리": "감수성, 직감, 공감력이 크게 작동하는 편입니다."
  };

  return map[signName] || "";
}

function getMoonMeaning(signName){
  const map = {
    "양자리": "감정 반응이 빠르고 즉각적으로 드러나는 편입니다.",
    "황소자리": "감정이 안정적으로 유지될 때 편안함을 느낍니다.",
    "쌍둥이자리": "기분이 생각과 말로 빠르게 연결되는 편입니다.",
    "게자리": "정서적 거리와 친밀감에 매우 민감한 편입니다.",
    "사자자리": "감정 표현이 분명하고 인정 욕구가 섞이기 쉽습니다.",
    "처녀자리": "감정을 분석적으로 처리하려는 경향이 있습니다.",
    "천칭자리": "관계의 분위기에 따라 감정 균형이 달라질 수 있습니다.",
    "전갈자리": "감정이 깊고 한 번 들어가면 오래 가는 편입니다.",
    "사수자리": "감정이 답답하면 바로 벗어나고 싶어지는 편입니다.",
    "염소자리": "감정을 쉽게 드러내기보다 안쪽에서 정리하는 편입니다.",
    "물병자리": "감정을 조금 떨어져서 객관적으로 보려는 편입니다.",
    "물고기자리": "주변 분위기와 감정을 잘 흡수하는 편입니다."
  };

  return map[signName] || "";
}

function getAscMeaning(signName){
  const map = {
    "양자리": "처음 보이는 인상은 빠르고 직선적이며 추진력이 있어 보일 수 있습니다.",
    "황소자리": "차분하고 안정감 있는 인상으로 보이기 쉽습니다.",
    "쌍둥이자리": "가볍고 말이 잘 통하는 인상으로 보일 수 있습니다.",
    "게자리": "부드럽고 조심스러운 분위기로 보이기 쉽습니다.",
    "사자자리": "존재감 있고 눈에 띄는 인상을 줄 가능성이 큽니다.",
    "처녀자리": "깔끔하고 세심한 사람처럼 보일 수 있습니다.",
    "천칭자리": "균형감 있고 호감형 이미지로 보이기 쉽습니다.",
    "전갈자리": "강한 눈빛과 깊은 분위기로 보일 수 있습니다.",
    "사수자리": "시원하고 활달한 인상으로 보일 가능성이 큽니다.",
    "염소자리": "성실하고 단정한 이미지로 보이기 쉽습니다.",
    "물병자리": "독특하고 자기 방식이 분명한 인상으로 보일 수 있습니다.",
    "물고기자리": "부드럽고 감성적인 분위기로 보일 가능성이 큽니다."
  };

  return map[signName] || "";
}

function renderBig3Card(natalSnapshot, ascendantSnapshot){
  const sun = natalSnapshot?.planets?.sun;
  const moon = natalSnapshot?.planets?.moon;
  const asc = ascendantSnapshot;

  if(!sun || !moon || !asc) return "";

  return `
    <div class="card">
      <h2>🌞🌙⬆ Big 3 요약</h2>

      <p class="small">
        점성술에서 가장 먼저 보는 핵심 3요소는 태양, 달, 상승궁입니다.
        태양은 기본 성향, 달은 감정 반응, 상승궁은 외부로 보이는 인상을 설명합니다.
      </p>

      <div class="hr"></div>

      <p>
        <b>태양:</b> ${sun.signName} ${sun.degree}°<br>
        ${getSunMeaning(sun.signName)}
      </p>

      <p>
        <b>달:</b> ${moon.signName} ${moon.degree}°<br>
        ${getMoonMeaning(moon.signName)}
      </p>

      <p>
        <b>상승궁:</b> ${asc.ascendantSignName} ${asc.ascendantDegree}°<br>
        ${getAscMeaning(asc.ascendantSignName)}
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

function getHouseMeaning(house){
  const map = {
    1: "자기표현, 첫인상, 몸, 시작 태도",
    2: "돈, 소유, 소비, 현실 감각",
    3: "대화, 학습, 이동, 정보 교환",
    4: "가정, 뿌리, 안정감, 사생활",
    5: "연애, 즐거움, 창작, 자기표현",
    6: "일상, 루틴, 건강관리, 실무",
    7: "관계, 파트너십, 계약, 타인",
    8: "공동 자원, 깊은 변화, 심리",
    9: "확장, 여행, 철학, 공부, 시야",
    10: "직업, 평판, 목표, 사회적 위치",
    11: "친구, 네트워크, 미래 계획",
    12: "휴식, 무의식, 정리, 숨은 영역"
  };

  return map[house] || "";
}

function getPlanetLabel(key){
  const map = {
    sun: "태양",
    moon: "달",
    mercury: "수성",
    venus: "금성",
    mars: "화성",
    jupiter: "목성",
    saturn: "토성",
    uranus: "천왕성",
    neptune: "해왕성",
    pluto: "명왕성"
  };

  return map[key] || key;
}

function renderHouseCard(houses, placements){
  if(!Array.isArray(houses) || !houses.length) return "";

  const majorKeys = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"];

  return `
    <div class="card">
      <h2>🏠 12하우스 배치</h2>

      <p>
        하우스는 삶의 영역을 뜻합니다.
        같은 행성이라도 어느 하우스에 들어가느냐에 따라
        돈, 관계, 일, 건강 등에서 체감되는 방식이 달라집니다.
      </p>

      <div class="hr"></div>

      <h3>하우스 시작점</h3>
      ${houses.map(item => `
        <p><b>${item.house}하우스</b> — ${item.cuspSignName} ${item.cuspDegree}°</p>
      `).join("")}

      <div class="hr"></div>

      <h3>주요 행성 배치</h3>
      ${majorKeys.map(key => {
        const item = placements?.[key];
        if(!item || !item.house) return "";
        return `
          <p>
            <b>${getPlanetLabel(key)}</b> — ${item.house}하우스
            <span class="small">(${getHouseMeaning(item.house)})</span>
          </p>
        `;
      }).join("")}

      <p class="small">
        현재는 Equal House 방식으로 계산하고 있습니다.
        나중에 Placidus 등 다른 하우스 체계로 확장할 수 있습니다.
      </p>
    </div>
  `;
}

function renderTransitNatalCard(aspects){
  if(!Array.isArray(aspects) || aspects.length === 0){
    return `
      <div class="card">
        <h2>🔭 내 출생 차트와 오늘 하늘의 관계</h2>
        <p>오늘은 내 출생 차트와 강하게 맞물리는 주요 각도가 뚜렷하지 않습니다.</p>
        <p class="small">이 경우에는 전체 흐름보다 기본 루틴 유지와 균형 관리가 더 중요할 수 있습니다.</p>
      </div>
    `;
  }

  const lines = buildTransitNarratives(aspects);

  return `
    <div class="card">
      <h2>🔭 내 출생 차트와 오늘 하늘의 관계</h2>

      <p>
        아래 내용은 내 출생 행성과 오늘 하늘의 행성이 어떤 각도를 이루는지 보는 해석입니다.
        이 부분이 들어가야 “전체적인 운세”가 아니라 “내 기준 운세”에 더 가까워집니다.
      </p>

      <div class="hr"></div>

      ${lines.map(line => `<p>${line}</p>`).join("")}
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
  const natalSnapshot = buildAstronomySnapshotFromBirth({
    birthDate,
    birthTime
  });

  const ascendantSnapshot = buildAscendantSnapshot({
    birthDate,
    birthTime,
    geo: profile?.geo
  });

  const houses = ascendantSnapshot
    ? buildEqualHouseCusps(ascendantSnapshot.ascendantLongitude)
    : [];

  const housePlacements = astronomySnapshot?.planets
    ? buildPlanetHousePlacements(astronomySnapshot.planets, houses)
    : {};

  const transitNatalAspects =
    natalSnapshot?.planets && astronomySnapshot?.planets
      ? buildTransitToNatalAspects(natalSnapshot.planets, astronomySnapshot.planets)
      : [];

  const retroBaseDate = new Date();
console.log("[retro base date]", retroBaseDate, retroBaseDate instanceof Date, Number.isNaN(retroBaseDate.getTime()));

const retroStatus = null

console.log("[monthly year]", getActiveYear(), Number(getActiveYear()));
const monthlySnapshots = [];
const monthlySummaries = [];

  console.log("[astronomy snapshot]", astronomySnapshot);
  console.log("[natal snapshot]", natalSnapshot);
  console.log("[astronomy aspects]", buildPlanetAspects(astronomySnapshot?.planets));
  console.log("[ascendant snapshot]", ascendantSnapshot);
  console.log("[house cusps]", houses);
  console.log("[house placements]", housePlacements);
  console.log("[transit to natal aspects]", transitNatalAspects);
  console.log("[monthly snapshots]", monthlySnapshots);
  
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

    ${renderBig3Card(natalSnapshot, ascendantSnapshot)}

    ${renderAscendantCard(ascendantSnapshot)}

    ${renderHouseCard(houses, housePlacements)}

    ${renderRetrogradeCard(retroStatus)}

    ${renderLifeAreaCard(astronomySnapshot?.planets, housePlacements)}

    ${renderTransitNatalCard(transitNatalAspects)}

    ${renderMonthlyAstroCard(getActiveYear(), monthlySummaries)}

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
})

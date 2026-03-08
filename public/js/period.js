let todayDB = {};
let tomorrowDB = {};
let yearDB = {};
let adviceDB = [];

let dbReady = false;

const PERIOD_DEFAULT_BIRTH = "1940-01-01";

const ACTIVE_YEAR =
  window.FortuneConfig?.year ||
  window.APP_CONFIG?.fortuneYear ||
  new Date().getFullYear();



/* =========================
   DB 로딩
========================= */

async function loadDB(){

  try{

    const [db, advice] = await Promise.all([

      fetch("/data/fortunes_ko.json",{cache:"no-store"})
      .then(r=>{
        if(!r.ok) throw new Error("fortune json load failed");
        return r.json();
      }),

      fetch("/data/daily_advice_ko.json",{cache:"no-store"})
      .then(r=>{
        if(!r.ok) throw new Error("advice json load failed");
        return r.json();
      })

    ]);


    todayDB = { pools:{ today: db.pools.today }};
    tomorrowDB = { pools:{ tomorrow: db.pools.tomorrow }};
    yearDB = { pools:{ year_all: db.pools.year_all }};

    adviceDB = Array.isArray(advice?.advice)
      ? advice.advice
      : [];

    dbReady = true;

    console.log("fortune DB loaded");

  }catch(e){

    dbReady = false;
    console.error("DB load error",e);

  }

}



/* =========================
   유틸
========================= */

function hashString(str){

  let h = 2166136261;

  for(let i=0;i<str.length;i++){

    h ^= str.charCodeAt(i);
    h = Math.imul(h,16777619);

  }

  return h >>> 0;

}



function seededPick(arr,seed){

  if(!Array.isArray(arr) || arr.length===0){

    return "운세 데이터가 준비되지 않았습니다.";

  }

  const idx = hashString(seed)%arr.length;

  return arr[idx];

}



function seededNumber(seed,min,max){

  const range = max-min+1;

  return min+(hashString(seed)%range);

}



function buildSeed(birth,targetKey,scope){

  return `${birth}|${targetKey}|${scope}`;

}



function formatDateLocal(date){

  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,"0");
  const d = String(date.getDate()).padStart(2,"0");

  return `${y}-${m}-${d}`;

}



function getTodayTargetDate(){

  return new Date();

}



function getTomorrowTargetDate(){

  const d = new Date();
  d.setDate(d.getDate()+1);
  return d;

}



/* =========================
   사용자 정보
========================= */

function getPeriodBirth(){

  return localStorage.getItem("birth")
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



/* =========================
   안내 카드
========================= */

function renderMyInfoBox(){

  const el = document.getElementById("myInfoBox");

  if(!el) return;

  const birth = getPeriodBirth();
  const mode = getPeriodMode();

  if(mode==="member"){

    const name = localStorage.getItem("name") || "회원";

    el.innerHTML=`
    <h2>👤 나의 기준 정보</h2>
    <p>${name}님</p>
    <p>생년월일: ${birth}</p>
    `;

    return;

  }

  if(mode==="guest"){

    el.innerHTML=`
    <h2>🎟 게스트 기준 정보</h2>
    <p>생년월일: ${birth}</p>
    `;

    return;

  }

  el.innerHTML=`
  <h2>📌 기본 기준 정보</h2>
  <p>기본 예시 생년월일: ${PERIOD_DEFAULT_BIRTH}</p>
  `;

}



/* =========================
   결과 출력
========================= */

function renderResultBlock(type,title,content,targetDateText){

  const birth = getPeriodBirth();

  let resultId="";
  let guideId="";
  let methodId="";

  if(type==="today"){

    resultId="todayResult";
    guideId="todayGuide";
    methodId="todayMethod";

  }

  if(type==="tomorrow"){

    resultId="tomorrowResult";
    guideId="tomorrowGuide";
    methodId="tomorrowMethod";

  }

  if(type==="year"){

    resultId="yearResult";
    guideId="yearGuide";
    methodId="yearMethod";

  }

  const resultEl = document.getElementById(resultId);

  if(resultEl){

    resultEl.innerHTML=`
    <h3>${title}</h3>
    <p class="small">기준 생년월일 ${birth}</p>
    <p>${content}</p>
    `;

  }

}



/* =========================
   운세
========================= */

function showToday(){

  if(!dbReady) return;

  const birth = getPeriodBirth();
  const target = getTodayTargetDate();
  const key = formatDateLocal(target);

  const arr = todayDB?.pools?.today || [];

  const content = seededPick(arr,buildSeed(birth,key,"today"));

  renderResultBlock("today","오늘 운세",content,key);

}



function showTomorrow(){

  if(!dbReady) return;

  const birth = getPeriodBirth();
  const target = getTomorrowTargetDate();
  const key = formatDateLocal(target);

  const arr = tomorrowDB?.pools?.tomorrow || [];

  const content = seededPick(arr,buildSeed(birth,key,"tomorrow"));

  renderResultBlock("tomorrow","내일 운세",content,key);

}



function showYear(){

  if(!dbReady) return;

  const birth = getPeriodBirth();

  const arr = yearDB?.pools?.year_all || [];

  const content = seededPick(arr,buildSeed(birth,String(ACTIVE_YEAR),"year"));

  renderResultBlock("year",`${ACTIVE_YEAR} 연간운세`,content,ACTIVE_YEAR);

}



/* =========================
   공유
========================= */

function bindShare(){

  const btn = document.getElementById("shareBtn");

  if(!btn) return;

  btn.addEventListener("click",async()=>{

    const shareData = {

      title:document.title,
      text:`오늘 운세 · 내일 운세 · ${ACTIVE_YEAR} 연간운세`,
      url:window.location.href

    };

    try{

      if(navigator.share){

        await navigator.share(shareData);

      }

      else{

        await navigator.clipboard.writeText(window.location.href);
        alert("주소가 복사되었습니다.");

      }

    }catch(e){}

  });

}



/* =========================
   시작
========================= */

document.addEventListener("DOMContentLoaded",async()=>{

  await loadDB();

  renderMyInfoBox();

  bindShare();

  showToday();
  showTomorrow();
  showYear();

});

window.showToday = showToday;
window.showTomorrow = showTomorrow;
window.showYear = showYear;

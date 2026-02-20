let todayDB = {};
let tomorrowDB = {};
let yearDB = {};

let rewarded = false;

async function loadDB(){
  todayDB = await fetch("/data/fortunes_ko_today.json").then(r=>r.json());
  tomorrowDB = await fetch("/data/fortunes_ko_tomorrow.json").then(r=>r.json());
  yearDB = await fetch("/data/fortunes_ko_2026.json").then(r=>r.json());
}

function randomPick(arr){
  if(!arr || arr.length === 0) return "운세 데이터가 준비되지 않았습니다.";
  return arr[Math.floor(Math.random()*arr.length)];
}

function ensureLogin(){
  const phone = localStorage.getItem("phone");
  if(!phone){
    alert("로그인 후 이용 가능합니다.");
    if(window.openLoginModal) openLoginModal();
    return false;
  }
  return true;
}

function renderGuide(type){
  let text = "";

  if(type === "today"){
    text = "오늘은 작은 기회가 큰 전환점이 될 수 있습니다. 중요한 결정을 내릴 때 신중함이 필요합니다.";
  }

  if(type === "tomorrow"){
    text = "내일은 준비가 중요한 날입니다. 미리 계획을 세우면 좋은 흐름을 만들 수 있습니다.";
  }

  if(type === "year"){
    text = "2026년은 변화와 성장의 흐름이 함께 나타나는 해입니다. 장기적인 계획을 세우는 것이 좋습니다.";
  }

  document.getElementById("guideBox").innerHTML = `
    <h3>🔎 운세 해석 가이드</h3>
    <p>${text}</p>
    <p>
    운세는 참고용입니다. 좋은 흐름은 적극 활용하고,
    조심해야 할 시기는 신중하게 대응하세요.
    </p>
  `;
}

function renderResult(title, content, type){

  document.getElementById("resultBox").innerHTML = `
    <h2>${title}</h2>
    <p>${content}</p>
  `;

  renderGuide(type);

  document.getElementById("actionSection").style.display = "none";
  document.getElementById("resultSection").style.display = "block";

  if(!rewarded){
    rewarded = true;
    if(window.rewardContent){
      rewardContent("period");
    }
  }
}

function showToday(){
  if(!ensureLogin()) return;
  const arr = todayDB?.pools?.today || [];
  renderResult("오늘의 운세", randomPick(arr), "today");
}

function showTomorrow(){
  if(!ensureLogin()) return;
  const arr = tomorrowDB?.pools?.tomorrow || [];
  renderResult("내일의 운세", randomPick(arr), "tomorrow");
}

function showYear(){
  if(!ensureLogin()) return;
  const arr = yearDB?.pools?.year_all || [];
  renderResult("2026년 연간운세", randomPick(arr), "year");
}

document.addEventListener("DOMContentLoaded", async ()=>{
  await loadDB();

  if(window.loadMyPoint){
    await loadMyPoint();
  }

  if(window.Common?.renderPoint){
    Common.renderPoint();
  }
});

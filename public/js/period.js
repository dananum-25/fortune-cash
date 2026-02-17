let todayDB = {};
let tomorrowDB = {};
let yearDB = {};

async function loadDB(){
  todayDB = await fetch("/data/fortunes_ko_today.json").then(r=>r.json());
  tomorrowDB = await fetch("/data/fortunes_ko_tomorrow.json").then(r=>r.json());
  yearDB = await fetch("/data/fortunes_ko_2026.json").then(r=>r.json());
}

function randomPick(arr){
  return arr[Math.floor(Math.random()*arr.length)];
}

function renderFortune(){
  const todayArr = todayDB?.pools?.today || [];
  const tomorrowArr = tomorrowDB?.pools?.tomorrow || [];
  const yearArr = yearDB?.pools?.year_all || [];

  document.getElementById("todayBox").innerText =
    randomPick(todayArr) || "운세 데이터 없음";

  document.getElementById("tomorrowBox").innerText =
    randomPick(tomorrowArr) || "운세 데이터 없음";

  document.getElementById("yearBox").innerText =
    randomPick(yearArr) || "운세 데이터 없음";
}

document.addEventListener("DOMContentLoaded", async ()=>{
  await loadDB();
  renderFortune();
});

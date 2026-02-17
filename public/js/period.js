let todayDB={}, tomorrowDB={}, yearDB={};

async function loadDB(){
  todayDB = await fetch("/data/fortunes_ko_today.json").then(r=>r.json());
  tomorrowDB = await fetch("/data/fortunes_ko_tomorrow.json").then(r=>r.json());
  yearDB = await fetch("/data/fortunes_ko_2026.json").then(r=>r.json());
}

function randomPick(arr){
  return arr[Math.floor(Math.random()*arr.length)];
}

function showResult(){

  const birth = document.getElementById("birthInput").value;

  if(!birth){
    alert("생년월일을 입력해주세요");
    return;
  }

  const todayArr = todayDB?.pools?.today || [];
  const tomorrowArr = tomorrowDB?.pools?.tomorrow || [];
  const yearArr = yearDB?.pools?.year_all || [];

  const html = `
    <b>오늘의 운세</b><br>${randomPick(todayArr)}<br><br>
    <b>내일의 운세</b><br>${randomPick(tomorrowArr)}<br><br>
    <b>2026년 운세</b><br>${randomPick(yearArr)}
  `;

  document.getElementById("resultBox").innerHTML = html;

  document.getElementById("inputSection").style.display="none";
  document.getElementById("resultSection").style.display="block";

  Common.addPoint(1);
  Common.renderPoint();
}

document.addEventListener("DOMContentLoaded", async ()=>{
  await loadDB();
  Common.renderPoint();
});

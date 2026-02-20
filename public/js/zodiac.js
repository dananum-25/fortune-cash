let zodiacDB = {};
let rewarded = false;

async function loadDB(){
  zodiacDB = await fetch("/data/zodiac_2026.json").then(r=>r.json());
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

function renderGuide(){
  document.getElementById("guideBox").innerHTML = `
    <h3>🔎 해석 가이드</h3>
    <p>
    띠별 운세는 한 해의 흐름을 참고하는 자료입니다.
    좋은 운은 적극 활용하고, 조심해야 할 시기는 신중하게 대응하세요.
    </p>
  `;
}

function showZodiac(){
  if(!ensureLogin()) return;

  const value = document.getElementById("zodiacSelect").value;
  const arr = zodiacDB?.[value] || [];

  const text = arr.length ? arr[Math.floor(Math.random()*arr.length)] :
    "운세 데이터가 준비되지 않았습니다.";

  document.getElementById("resultBox").innerHTML = `
    <h2>${document.getElementById("zodiacSelect").selectedOptions[0].text} 2026년 운세</h2>
    <p>${text}</p>
  `;

  renderGuide();

  document.getElementById("resultSection").style.display = "block";

  if(!rewarded){
    rewarded = true;
    if(window.rewardContent){
      rewardContent("zodiac");
    }
  }
}

document.addEventListener("DOMContentLoaded", async ()=>{
  await loadDB();
  if(window.loadMyPoint) await loadMyPoint();
  if(window.Common?.renderPoint) Common.renderPoint();
});

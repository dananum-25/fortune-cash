let starDB = {};
let rewarded = false;

async function loadDB(){
  // ✅ 별자리 데이터 파일 (없으면 네 파일명에 맞게 바꾸면 됨)
  starDB = await fetch("/data/star_2026.json").then(r=>r.json());
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
    별자리 운세는 한 해의 흐름을 참고하기 위한 자료입니다.
    좋은 흐름은 적극 활용하고, 조심해야 할 시기는 신중하게 대응하세요.
    </p>
    <p>
    운세는 맹신보다 참고가 중요합니다. 스스로의 선택이 가장 큰 변수가 됩니다.
    </p>
  `;
}

function showStar(){
  if(!ensureLogin()) return;

  const sel = document.getElementById("starSelect");
  const key = sel.value;
  const label = sel.selectedOptions[0].text;

  const arr = starDB?.[key] || [];
  const text = arr.length
    ? arr[Math.floor(Math.random() * arr.length)]
    : "운세 데이터가 준비되지 않았습니다.";

  document.getElementById("resultBox").innerHTML = `
    <h2>${label} 2026년 운세</h2>
    <p>${text}</p>
  `;

  renderGuide();

  document.getElementById("resultSection").style.display = "block";

  if(!rewarded){
    rewarded = true;
    if(window.rewardContent){
      rewardContent("star");
    }
  }
}

document.addEventListener("DOMContentLoaded", async ()=>{
  await loadDB();

  if(window.loadMyPoint) await loadMyPoint();
  if(window.Common?.renderPoint) Common.renderPoint();
});

let tarotDB = {};
let todayCard = null;

const MBTI_TYPES = [
"INTJ","INTP","ENTJ","ENTP",
"INFJ","INFP","ENFJ","ENFP",
"ISTJ","ISFJ","ESTJ","ESFJ",
"ISTP","ISFP","ESTP","ESFP"
];

async function loadDB(){
  tarotDB = await fetch("data/tarot_db_ko.json").then(r=>r.json());
  initMBTI();
  initMBTITest();
}

loadDB();

function initMBTI(){
  const sel=document.getElementById("mbtiSelect");
  MBTI_TYPES.forEach(t=>{
    const o=document.createElement("option");
    o.value=t;
    o.textContent=t;
    sel.appendChild(o);
  });
}

function initMBTITest(){
  const box=document.getElementById("mbtiQuestions");
  for(let i=1;i<=16;i++){
    box.innerHTML += `
      <div>
        Q${i}. 질문 ${i}
        <select>
          <option>왼쪽</option>
          <option>오른쪽</option>
        </select>
      </div>
    `;
  }
}

function setMBTIMode(m){
  document.getElementById("mbtiDirect").style.display=
    m==="direct"?"block":"none";
  document.getElementById("mbtiTest").style.display=
    m==="test"?"block":"none";
}

function showResult(){
  const name=document.getElementById("name").value;
  const birth=document.getElementById("birth").value;
  const mbti=document.getElementById("mbtiSelect").value;

  if(!name){
    alert("성명을 입력해주세요");
    return;
  }

  if(!birth){
    alert("생년월일을 선택해주세요");
    return;
  }

  if(!mbti){
    alert("MBTI를 선택해주세요");
    return;
  }

  document.getElementById("inputSection").style.display="none";
  document.getElementById("resultSection").style.display="block";

  document.getElementById("resultBox").innerHTML=
    `${name}님의 운세 결과<br>${birth}<br>MBTI: ${mbti}`;
}

function drawTarot(){
  if(todayCard){
    renderTarot(todayCard);
    return;
  }

  const allCards = [
    ...tarotDB.majors,
    ...tarotDB.minors.cups,
    ...tarotDB.minors.wands,
    ...tarotDB.minors.swords,
    ...tarotDB.minors.pentacles
  ];

  const idx=Math.floor(Math.random()*allCards.length);
  todayCard=allCards[idx];

  renderTarot(todayCard);
}

function renderTarot(c){
  document.getElementById("tarotBox").innerHTML=`
    <img src="${c.image}" style="width:100%">
    <div>${c.name_ko}</div>
    <div>${c.upright.summary}</div>
  `;
}

function goTarotApp(){
  location.href="https://my-fortune-lake.vercel.app/";
}

function goGame(){
  location.href="https://game-time-kappa.vercel.app/";
}

function back(){
  location.reload();
}

function copyURL(){
  navigator.clipboard.writeText(location.href);
  alert("복사되었습니다!");
}

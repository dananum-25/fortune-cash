let zodiacMap = {};
let mbtiDB = {};
let tarotDB = [];
let todayCard = null;

const MBTI_TYPES = [
"INTJ","INTP","ENTJ","ENTP",
"INFJ","INFP","ENFJ","ENFP",
"ISTJ","ISFJ","ESTJ","ESFJ",
"ISTP","ISFP","ESTP","ESFP"
];

async function loadDB(){
  zodiacMap = await fetch("data/lunar_new_year_1920_2026.json").then(r=>r.json());
  mbtiDB = await fetch("data/mbti_traits_ko.json").then(r=>r.json());
  tarotDB = await fetch("data/tarot_db_ko.json").then(r=>r.json());

  initMBTI();
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

  sel.onchange=showMBTITrait;
}

function showMBTITrait(){
  const t=document.getElementById("mbtiSelect").value;
  document.getElementById("mbtiTrait").innerText=
    mbtiDB.traits[t].keywords.join(" · ");
}

function setMBTIMode(m){
  document.getElementById("mbtiDirect").style.display=
    m==="direct"?"block":"none";
  document.getElementById("mbtiTest").style.display=
    m==="test"?"block":"none";
}

function zodiacFromBirth(b){
  const d=new Date(b);
  const y=d.getFullYear();
  return (y-4)%12;
}

function showResult(){
  document.getElementById("inputSection").style.display="none";
  document.getElementById("resultSection").style.display="block";

  const name=document.getElementById("name").value;
  const mbti=document.getElementById("mbtiSelect").value;

  document.getElementById("resultBox").innerHTML=
    `${name}님의 운세 결과<br>MBTI:${mbti}`;

  drawTarot();
}

function drawTarot(){
  const idx=Math.floor(Math.random()*tarotDB.majors.length);
  const c=tarotDB.majors[idx];

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
  alert("복사됨");
}

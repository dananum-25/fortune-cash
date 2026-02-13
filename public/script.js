/* ===============================
POINT SYSTEM
================================ */
let point = parseInt(localStorage.getItem("point") || "0");

function renderPoint(){
  const el = document.getElementById("pointBox");
  if(el) el.innerText = "보유 포인트 : " + point + "P";
}

/* ===============================
GLOBAL DB
================================ */
let zodiacDB={}, todayDB={}, tomorrowDB={};
let lunarMap={}, mbtiDB={}, sajuDB={}, tarotDB={};
let currentZodiac=null;

/* ===============================
MBTI
================================ */
const MBTI_TYPES = [
"INTJ","INTP","ENTJ","ENTP",
"INFJ","INFP","ENFJ","ENFP",
"ISTJ","ISFJ","ESTJ","ESFJ",
"ISTP","ISFP","ESTP","ESFP"
];

function initMBTI(){
  const sel = document.getElementById("mbtiSelect");
  if(!sel) return;

  sel.innerHTML = "<option value=''>MBTI 선택</option>";

  MBTI_TYPES.forEach(t=>{
    const o=document.createElement("option");
    o.value=t;
    o.textContent=t;
    sel.appendChild(o);
  });
}

/* ===============================
MBTI TEST
================================ */
const MBTI_Q16=[
["EI","사람들과 함께 있을 때 에너지가 올라간다","혼자 있는 시간이 에너지를 채운다"],
["SN","구체적인 사실이 중요하다","아이디어가 중요하다"],
["TF","논리 중심 결정","감정 중심 결정"],
["JP","계획형","즉흥형"]
];

function initMBTITest(){
  const box=document.getElementById("mbtiQuestions");
  if(!box) return;

  box.innerHTML="";

  MBTI_Q16.forEach((q,i)=>{
    box.innerHTML+=`
      <div class="qrow">
        <div class="qtext">${q[1]}</div>
        <input type="radio" name="q${i}" value="left">
      </div>
      <div class="qrow">
        <div class="qtext">${q[2]}</div>
        <input type="radio" name="q${i}" value="right">
      </div>
    `;
  });

  box.innerHTML+=`<button onclick="submitMBTI()">MBTI 확정</button>`;
}

function submitMBTI(){
  alert("MBTI 저장 완료");
}

function setMBTIMode(m){
  document.getElementById("mbtiDirect").style.display =
    m==="direct" ? "block" : "none";

  document.getElementById("mbtiTest").style.display =
    m==="test" ? "block" : "none";
}

/* ===============================
DB LOAD
================================ */
async function loadDB(){
  zodiacDB = await fetch("/data/zodiac_fortunes_ko_2026.json").then(r=>r.json());
  todayDB = await fetch("/data/fortunes_ko_today.json").then(r=>r.json());
  tomorrowDB = await fetch("/data/fortunes_ko_tomorrow.json").then(r=>r.json());
  lunarMap = await fetch("/data/lunar_new_year_1920_2026.json").then(r=>r.json());
  mbtiDB = await fetch("/data/mbti_traits_ko.json").then(r=>r.json());
  sajuDB = await fetch("/data/saju_ko.json").then(r=>r.json());
  tarotDB = await fetch("/data/tarot_db_ko.json").then(r=>r.json());

  initMBTI();
  initMBTITest();
}

/* ===============================
ZODIAC
================================ */
const zodiacAnimals=[
"원숭이","닭","개","돼지",
"쥐","소","호랑이","토끼",
"용","뱀","말","양"
];

const zodiacMap={
"쥐":"rat","소":"ox","호랑이":"tiger","토끼":"rabbit",
"용":"dragon","뱀":"snake","말":"horse","양":"sheep",
"원숭이":"monkey","닭":"rooster","개":"dog","돼지":"pig"
};

function initZodiac(){
  const birthInput = document.getElementById("birthInput");
  if(!birthInput) return;

  birthInput.addEventListener("change",function(){
    const [y,m,d]=this.value.split("-").map(Number);
    let zodiacYear=y;

    const lunar=lunarMap[y];
    if(lunar){
      const [lm,ld]=lunar.split("-").map(Number);
      if(m<lm||(m===lm&&d<ld)) zodiacYear=y-1;
    }

    const zodiac=zodiacAnimals[zodiacYear%12];
    currentZodiac=zodiac;

    document.getElementById("zodiacResult").innerText=
      `음력 기준 ${zodiac}띠`;
  });
}

/* ===============================
TAROT
================================ */
function drawTarot(){
  if(!tarotDB.majors) return;

  const cards=tarotDB.majors;
  const card=cards[Math.floor(Math.random()*cards.length)];

  document.getElementById("tarotImg").src="/"+card.image;
}

/* ===============================
SHOW RESULT
================================ */
function showResult(){

  const name = document.getElementById("name").value;
  const birth = document.getElementById("birthInput").value;
  const mbti = document.getElementById("mbtiSelect").value;

  if(!name || !birth || !mbti){
    alert("정보를 모두 입력해주세요");
    return;
  }

  const todayArr=todayDB?.pools?.today||[];
  const tomorrowArr=tomorrowDB?.pools?.tomorrow||[];

  const todayFortune=todayArr[Math.floor(Math.random()*todayArr.length)]||"";
  const tomorrowFortune=tomorrowArr[Math.floor(Math.random()*tomorrowArr.length)]||"";

  const key=zodiacMap[currentZodiac];
  const yearArr=zodiacDB[key]?.year||[];
  const zodiacFortune=yearArr[Math.floor(Math.random()*yearArr.length)]||"";

  const mbtiTrait = mbtiDB?.[mbti]?.summary || "";

  const elements=["wood","fire","earth","metal","water"];
  const sajuKey=elements[new Date(birth).getFullYear()%5];
  const sajuMsg=sajuDB?.elements?.[sajuKey]?.pools?.overall?.[0]||"";

  document.getElementById("resultBox").innerHTML=`
    <b>${name}님의 운세 결과</b><br><br>
    ${document.getElementById("zodiacResult").innerText}<br><br>

    <b>띠 운세</b><br>${zodiacFortune}<br><br>
    <b>MBTI 특징</b><br>${mbtiTrait}<br><br>
    <b>사주 한마디</b><br>${sajuMsg}<br><br>

    <b>오늘의 운세</b><br>${todayFortune}<br><br>
    <b>내일의 운세</b><br>${tomorrowFortune}<br><br>
  `;

  document.getElementById("inputSection").style.display="none";
  document.getElementById("resultSection").style.display="block";
}

/* ===============================
INIT
================================ */
document.addEventListener("DOMContentLoaded", async function(){
  await loadDB();
  initZodiac();
  renderPoint();
});

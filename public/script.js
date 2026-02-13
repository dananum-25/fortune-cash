const API_URL = "https://script.google.com/macros/s/AKfycbwL01pmMt2DFpaGIZrQr3rVL8wAj2806Ys3ssKgLqH4cylrQf6wUc83YOo1lDuYTyhHlQ/exec";

/* ===============================
POINT SYSTEM
================================ */
let point = parseInt(localStorage.getItem("point") || "0");

function renderPoint(){
  const el = document.getElementById("pointBox");
  if(el) el.innerText = "보유 포인트 : " + point + "P";
}

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

  sel.innerHTML = "";
  MBTI_TYPES.forEach(t=>{
    const o=document.createElement("option");
    o.value=t;
    o.textContent=t;
    sel.appendChild(o);
  });
}

/* ===============================
DB LOAD
================================ */
let zodiacDB={}, todayDB={}, tomorrowDB={};
let currentZodiac=null;
let lunarMap={};

async function loadDB(){
  zodiacDB = await fetch("/data/zodiac_fortunes_ko_2026.json").then(r=>r.json());
  todayDB = await fetch("/data/fortunes_ko_today.json").then(r=>r.json());
  tomorrowDB = await fetch("/data/fortunes_ko_tomorrow.json").then(r=>r.json());
  lunarMap = await fetch("/data/lunar_new_year_1920_2026.json").then(r=>r.json());

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

    const name=document.getElementById("name").value||"선택한 생년월일";
    document.getElementById("zodiacResult").innerText=
      `음력을 적용한 ${name}님은 ${zodiac}띠 입니다`;
  });
}

/* ===============================
SHOW RESULT
================================ */
async function showResult(){

  const name = document.getElementById("name").value;
  const birth = document.getElementById("birthInput").value;
  const mbti = document.getElementById("mbtiSelect").value;

  if(!name || !birth || !mbti){
    alert("정보를 모두 입력해주세요");
    return;
  }

  let todayFortune="";
  if(todayDB?.pools?.today){
    const arr=todayDB.pools.today;
    todayFortune=arr[Math.floor(Math.random()*arr.length)];
  }

  let tomorrowFortune="";
  if(tomorrowDB?.pools?.tomorrow){
    const arr=tomorrowDB.pools.tomorrow;
    tomorrowFortune=arr[Math.floor(Math.random()*arr.length)];
  }

  let zodiacFortune="";
  if(currentZodiac && zodiacDB[currentZodiac]){
    const arr=zodiacDB[currentZodiac].year;
zodiacFortune=arr[Math.floor(Math.random()*arr.length)];
  }

  document.getElementById("resultBox").innerHTML=`
    <b>${name}님의 운세 결과</b><br><br>
    ${document.getElementById("zodiacResult").innerText}<br><br>
    <b>오늘의 운세</b><br>${todayFortune}<br><br>
    <b>내일의 운세</b><br>${tomorrowFortune}<br><br>
    <b>2026년 운세</b><br>${zodiacFortune}<br><br>
    MBTI: ${mbti}
  `;

  document.getElementById("inputSection").style.display="none";
  document.getElementById("resultSection").style.display="block";
}

/* ===============================
INIT
================================ */
document.addEventListener("DOMContentLoaded", function(){
  loadDB();
  initZodiac();
  renderPoint();
});
function submitMBTI(){
  alert("MBTI 저장 완료");
      }

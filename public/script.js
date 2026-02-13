const API_URL = "https://script.google.com/macros/s/AKfycbwL01pmMt2DFpaGIZrQr3rVL8wAj2806Ys3ssKgLqH4cylrQf6wUc83YOo1lDuYTyhHlQ/exec";

/* ===============================
POINT SYSTEM
================================ */
let point = parseInt(localStorage.getItem("point") || "0");
let inviteCode = localStorage.getItem("inviteCode");

if(!inviteCode){
  inviteCode = Math.random().toString(36).substring(2,8);
  localStorage.setItem("inviteCode", inviteCode);
}

if(!localStorage.getItem("welcomePoint")){
  point += 100;
  localStorage.setItem("welcomePoint","1");
  localStorage.setItem("point",point);
}

function renderPoint(){
  const el = document.getElementById("pointBox");
  if(el) el.innerText = "보유 포인트 : " + point + "P";
}

renderPoint();

/* ===============================
USER API
================================ */
async function registerUser(name, phone){
  const res = await fetch(API_URL,{
    method:"POST",
    body:JSON.stringify({ action:"register", name, phone })
  });
  return await res.json();
}

async function checkin(phone){
  const res = await fetch(API_URL,{
    method:"POST",
    body:JSON.stringify({ action:"checkin", phone })
  });
  return await res.json();
}

async function getUser(phone){
  const res = await fetch(API_URL,{
    method:"POST",
    body:JSON.stringify({ action:"getUser", phone })
  });
  return await res.json();
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
  const sel=document.getElementById("mbtiSelect");
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

async function loadDB(){
  zodiacDB = await fetch("data/zodiac_fortunes_ko_2026.json").then(r=>r.json());
  todayDB = await fetch("data/fortunes_ko_today.json").then(r=>r.json());
  tomorrowDB = await fetch("data/fortunes_ko_tomorrow.json").then(r=>r.json());

  initMBTI();
}
loadDB();

/* ===============================
ZODIAC
================================ */
let lunarMap={};

fetch("/data/lunar_new_year_1920_2026.json")
.then(r=>r.json())
.then(d=>lunarMap=d);

const zodiacAnimals=[
"원숭이","닭","개","돼지",
"쥐","소","호랑이","토끼",
"용","뱀","말","양"
];

document.getElementById("birthInput").addEventListener("change",function(){
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

/* ===============================
SHOW RESULT
================================ */
async function showResult(){
  const name=document.getElementById("name").value;
  const birth=document.getElementById("birthInput").value;
  const mbti=document.getElementById("mbtiSelect").value;
  const phone="01000000000";

  if(!name){ alert("성명을 입력해주세요"); return; }
  if(!birth){ alert("생년월일을 선택해주세요"); return; }
  if(!mbti){ alert("MBTI를 선택해주세요"); return; }

  await registerUser(name,phone);
  await checkin(phone);
  const user=await getUser(phone);

  document.getElementById("inputSection").style.display="none";
  document.getElementById("resultSection").style.display="block";

  let zodiacFortune="";
  if(currentZodiac && zodiacDB[currentZodiac]){
    zodiacFortune=zodiacDB[currentZodiac].year||"";
  }

  const todayFortune=todayDB[mbti]||"";
  const tomorrowFortune=tomorrowDB[mbti]||"";

  document.getElementById("resultBox").innerHTML=`
    <b>${name}님의 운세 결과</b><br><br>
    ${document.getElementById("zodiacResult").innerText}<br><br>
    <b>오늘의 운세</b><br>${todayFortune}<br><br>
    <b>내일의 운세</b><br>${tomorrowFortune}<br><br>
    <b>2026년 운세</b><br>${zodiacFortune}<br><br>
    MBTI: ${mbti}<br><br>
    포인트: ${user.points}
  `;
}

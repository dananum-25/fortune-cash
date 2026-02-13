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

async function loadDB(){
  zodiacDB = await fetch("/data/zodiac_fortunes_ko_2026.json").then(r=>r.json());
  todayDB = await fetch("/data/fortunes_ko_today.json").then(r=>r.json());
  tomorrowDB = await fetch("/data/fortunes_ko_tomorrow.json").then(r=>r.json());

  initMBTI();
  initMBTITest();
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

  const name = document.getElementById("name").value;
  const birth = document.getElementById("birthInput").value;
  const mbti = document.getElementById("mbtiSelect").value;

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

  /* 오늘 운세 */
  let todayFortune = "";
  if(todayDB?.pools?.today){
    const arr = todayDB.pools.today;
    todayFortune = arr[Math.floor(Math.random()*arr.length)];
  }

  /* 내일 운세 */
  let tomorrowFortune = "";
  if(tomorrowDB?.pools?.tomorrow){
    const arr = tomorrowDB.pools.tomorrow;
    tomorrowFortune = arr[Math.floor(Math.random()*arr.length)];
  }

  /* 띠 운세 */
  let zodiacFortune = "";
  if(currentZodiac && zodiacDB[currentZodiac]){
    zodiacFortune = zodiacDB[currentZodiac].year || "";
  }

  document.getElementById("resultBox").innerHTML = `
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

  // 🔹 백그라운드 저장
  registerUser(name,phone);
  checkin(phone);
}
function initMBTITest(){
  const box=document.getElementById("mbtiQuestions");
  if(!box) return;

  box.innerHTML="";

  MBTI_Q16.forEach((q,i)=>{
    box.innerHTML+=`
      <div class="qrow">
        <div class="qtext">${i+1}. ${q[1]}</div>
        <input type="radio" name="q${i}" value="left">
      </div>
      <div class="qrow">
        <div class="qtext">${q[2]}</div>
        <input type="radio" name="q${i}" value="right">
      </div>
    `;
  });

  box.innerHTML+=`<button onclick="submitMBTI()">제출하고 MBTI 확정</button>`;
}

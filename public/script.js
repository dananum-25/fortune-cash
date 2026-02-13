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

const MBTI_Q16 = [
["EI","사람들과 함께 있을 때 에너지가 올라간다","혼자 있는 시간이 에너지를 채운다"],
["EI","처음 보는 사람과도 금방 친해진다","낯선 사람은 적응 시간이 필요하다"],
["EI","생각을 말하면서 정리한다","생각을 정리한 뒤 말한다"],
["EI","주말엔 약속이 좋다","혼자 쉬는 게 좋다"],
["SN","구체적인 사실이 중요하다","아이디어가 중요하다"],
["SN","현실 문제 해결이 먼저","미래 가능성이 먼저"],
["SN","경험을 믿는다","직감을 믿는다"],
["SN","디테일 설명 선호","큰 그림 설명 선호"],
["TF","논리 중심 결정","감정 중심 결정"],
["TF","직설 피드백 선호","부드러운 피드백 선호"],
["TF","원인 해결 중심","관계 회복 중심"],
["TF","공정함 우선","조화 우선"],
["JP","계획형","즉흥형"],
["JP","미리 끝낸다","마감 직전"],
["JP","정리된 환경","어수선해도 OK"],
["JP","일정 확정 선호","유동적 일정 선호"]
];
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

document.addEventListener("DOMContentLoaded", function(){

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

});
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
function setMBTIMode(m){
  document.getElementById("mbtiDirect").style.display =
    m==="direct" ? "block" : "none";

  document.getElementById("mbtiTest").style.display =
    m==="test" ? "block" : "none";
}
document.addEventListener("DOMContentLoaded", function(){
  loadDB();
  renderPoint();
});

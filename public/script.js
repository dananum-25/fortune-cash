let tarotDB = {};
let todayCard = null;

const MBTI_TYPES = [
"INTJ","INTP","ENTJ","ENTP",
"INFJ","INFP","ENFJ","ENFP",
"ISTJ","ISFJ","ESTJ","ESFJ",
"ISTP","ISFP","ESTP","ESFP"
];

function initMBTI(){
  const sel=document.getElementById("mbtiSelect");
  if(!sel) return;

  MBTI_TYPES.forEach(t=>{
    const o=document.createElement("option");
    o.value=t;
    o.textContent=t;
    sel.appendChild(o);
  });
}

async function loadDB(){
  tarotDB = await fetch("data/tarot_db_ko.json").then(r=>r.json());
  initMBTI();
  initMBTITest();
}

loadDB();

function setMBTIMode(m){
  document.getElementById("mbtiDirect").style.display=
    m==="direct"?"block":"none";
  document.getElementById("mbtiTest").style.display=
    m==="test"?"block":"none";
}

/* ===============================
MBTI TEST (UI 개선)
================================ */
const MBTI_Q16 = [
["EI","사람들과 함께 있을 때 에너지가 올라간다","혼자 있는 시간이 에너지를 채운다"],
["EI","처음 보는 사람과도 금방 친해지는 편이다","낯선 사람은 적응 시간이 필요하다"],
["EI","생각을 말하면서 정리하는 편이다","생각을 정리한 뒤 말하는 편이다"],
["EI","주말엔 약속이 있으면 좋다","주말엔 혼자 쉬고 싶다"],
["SN","구체적인 사실/데이터가 편하다","가능성/아이디어가 편하다"],
["SN","현재의 현실 문제 해결이 우선이다","미래의 큰 방향이 우선이다"],
["SN","경험을 기반으로 판단한다","직감/영감을 믿는 편이다"],
["SN","설명은 디테일이 중요하다","설명은 큰 그림이 중요하다"],
["TF","결정은 논리/원칙이 우선이다","결정은 사람/상황 배려가 우선이다"],
["TF","피드백은 직설이 좋다","피드백은 부드러운 방식이 좋다"],
["TF","갈등은 원인-해결이 핵심이다","갈등은 감정-관계가 핵심이다"],
["TF","공정함이 최우선이다","조화로움이 최우선이다"],
["JP","계획대로 진행해야 마음이 편하다","유연하게 바뀌어도 괜찮다"],
["JP","마감 전에 미리 끝내는 편이다","마감 직전에 몰아서 하는 편이다"],
["JP","정리/정돈이 되어야 편하다","어수선해도 진행 가능하다"],
["JP","일정이 확정되어야 안심된다","상황 따라 바뀌는 게 자연스럽다"],
];

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

function submitMBTI(){
  let scores={E:0,I:0,S:0,N:0,T:0,F:0,J:0,P:0};

  MBTI_Q16.forEach((q,i)=>{
    const sel=document.querySelector(`input[name=q${i}]:checked`);
    if(!sel) return;

    if(sel.value==="left"){
      scores[q[0][0]]++;
    }else{
      scores[q[0][1]]++;
    }
  });

  const mbti =
    (scores.E>=scores.I?"E":"I")+
    (scores.S>=scores.N?"S":"N")+
    (scores.T>=scores.F?"T":"F")+
    (scores.J>=scores.P?"J":"P");

  document.getElementById("mbtiSelect").value=mbti;
  alert("당신의 MBTI는 "+mbti);
}
/* =========================
띠 자동 계산 (달력 선택 시)
========================= */

let lunarMap = {};

fetch("/data/lunar_new_year_1920_2026.json")
  .then(r=>r.json())
  .then(d=> lunarMap = d);

const zodiacAnimals = [
"원숭이","닭","개","돼지",
"쥐","소","호랑이","토끼",
"용","뱀","말","양"
];

document.getElementById("birthInput").addEventListener("change", function(){
  const value = this.value;
  if(!value) return;

  const [y,m,d] = value.split("-").map(Number);
  let zodiacYear = y;

  const lunar = lunarMap[y];
  if(lunar){
    const [lm,ld] = lunar.split("-").map(Number);
    if(m < lm || (m === lm && d < ld)){
      zodiacYear = y - 1;
    }
  }

  const zodiac = zodiacAnimals[zodiacYear % 12];

  const name = document.getElementById("name").value || "선택한 생년월일";

document.getElementById("zodiacResult").innerText =
`음력을 적용한 ${name}님은 ${zodiac}띠 입니다`;
});

/* ===============================
TAROT 78 RANDOM
================================ */

const majors = [
"00_the_fool.png","01_the_magician.png","02_the_high_priestess.png",
"03_the_empress.png","04_the_emperor.png","05_the_hierophant.png",
"06_the_lovers.png","07_the_chariot.png","08_strength.png",
"09_the_hermit.png","10_wheel_of_fortune.png","11_justice.png",
"12_the_hanged_man.png","13_death.png","14_temperance.png",
"15_the_devil.png","16_the_tower.png","17_the_star.png",
"18_the_moon.png","19_the_sun.png","20_judgement.png","21_the_world.png"
];

const suits = ["wands","cups","swords","pentacles"];

const minorNames = [
"01_ace.png","02_two.png","03_three.png","04_four.png","05_five.png",
"06_six.png","07_seven.png","08_eight.png","09_nine.png","10_ten.png",
"11_page.png","12_knight.png","13_queen.png","14_king.png"
];

let tarotCards = [];

majors.forEach(file=>{
  tarotCards.push("/tarot/majors/" + file);
});

suits.forEach(suit=>{
  minorNames.forEach(file=>{
    tarotCards.push("/tarot/minors/" + suit + "/" + file);
  });
});

function drawTarot(){
  const today = new Date().toISOString().slice(0,10);

  const saved = localStorage.getItem("todayTarot");
  if(saved){
    const obj = JSON.parse(saved);
    if(obj.date === today){
      document.getElementById("tarotImg").src = obj.card;
      flipCard();
      return;
    }
  }

  const randomCard = tarotCards[Math.floor(Math.random()*tarotCards.length)];
  document.getElementById("tarotImg").src = randomCard;

  localStorage.setItem("todayTarot", JSON.stringify({
    date: today,
    card: randomCard
  }));

  flipCard();
}

function flipCard(){
  const img = document.getElementById("tarotImg");
  img.classList.remove("flip");
  void img.offsetWidth;
  img.classList.add("flip");
}

function showResult(){
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
function goTarotApp(){
  location.href="https://my-fortune-lake.vercel.app/";
}

function goGame(){
  location.href="https://game-time-kappa.vercel.app/";
}

function back(){
  location.reload();
}
  document.getElementById("inputSection").style.display="none";
  document.getElementById("resultSection").style.display="block";

  const zodiacText =
    document.getElementById("zodiacResult").innerText;

  document.getElementById("resultBox").innerHTML =
    `${name}님의 운세 결과<br>${birth}<br>${zodiacText}<br>MBTI: ${mbti}`;
}

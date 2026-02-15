/* ===============================
POINT SYSTEM
================================ */
let point = parseInt(localStorage.getItem("point") || "0");

function renderPoint(){
  const el = document.getElementById("pointBox");
  if(el) el.innerText = "보유 포인트 : " + point + "P";
}

/* ===============================
MBTI TYPES
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
DB LOAD
================================ */
let zodiacDB={}, todayDB={}, tomorrowDB={}, yearDB={};
let mbtiDB={}, sajuDB={}, tarotDB={};
let lunarMap={};
let currentZodiac=null;

async function loadDB(){
  zodiacDB = await fetch("/data/zodiac_fortunes_ko_2026.json").then(r=>r.json());
  todayDB = await fetch("/data/fortunes_ko_today.json").then(r=>r.json());
  tomorrowDB = await fetch("/data/fortunes_ko_tomorrow.json").then(r=>r.json());
  yearDB = await fetch("/data/fortunes_ko_2026.json").then(r=>r.json());
  mbtiDB = await fetch("/data/mbti_traits_ko.json").then(r=>r.json());
  sajuDB = await fetch("/data/saju_ko.json").then(r=>r.json());
  tarotDB = await fetch("/data/tarot_reading_db_ko.json").then(r=>r.json());
  lunarMap = await fetch("/data/lunar_new_year_1920_2026.json").then(r=>r.json());

  initMBTI();
  initMBTITest();
}

/* ===============================
ZODIAC
================================ */
const zodiacAnimals = [
"쥐","소","호랑이","토끼",
"용","뱀","말","양",
"원숭이","닭","개","돼지"
];

const zodiacKeyMap = {
  "쥐":"rat",
  "소":"ox",
  "호랑이":"tiger",
  "토끼":"rabbit",
  "용":"dragon",
  "뱀":"snake",
  "말":"horse",
  "양":"sheep",
  "원숭이":"monkey",
  "닭":"rooster",
  "개":"dog",
  "돼지":"pig"
};

function initZodiac(){
  const birthInput = document.getElementById("birthInput");
  if(!birthInput) return;

  birthInput.addEventListener("change", function(){

    const [y,m,d] = this.value.split("-").map(Number);
    let zodiacYear = y;

    const lunar = lunarMap?.[y];

    if(lunar){
      const [ly,lm,ld] = lunar.split("-").map(Number);

      if(m < lm || (m === lm && d < ld)){
        zodiacYear = y - 1;
      }
    }

    // ⭐ 기준연도 보정 (2020 = 쥐)
    const zodiacIndex = (zodiacYear - 2020 + 120) % 12;
    const zodiac = zodiacAnimals[zodiacIndex];

    currentZodiac = zodiac;

    const name = document.getElementById("name").value || "선택한 생년월일";

    document.getElementById("zodiacResult").innerText =
      `음력을 적용한 ${name}님은 ${zodiac}띠 입니다`;
  });
}
    
/* ===============================
MBTI TEST
================================ */
const MBTI_Q16=[
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
["JP","정리된 환경 선호","어수선해도 OK"],
["JP","일정 확정 선호","유동적 일정 선호"]
];

function initMBTITest(){
  const box=document.getElementById("mbtiQuestions");
  if(!box) return;

  box.innerHTML="";

  MBTI_Q16.forEach((q,i)=>{
    box.innerHTML+=`
      <div class="qbox">

        <div class="qrow">
          <div class="qtext">${i+1}. A ${q[1]}</div>
          <input type="radio" name="q${i}" value="left">
        </div>

        <div class="qrow">
          <div class="qtext">B ${q[2]}</div>
          <input type="radio" name="q${i}" value="right">
        </div>

      </div>
    `;
  });

  box.innerHTML+=`<button onclick="submitMBTI()">MBTI 확정</button>`;
}

function submitMBTI(){
  alert("MBTI 저장 완료");
}

function setMBTIMode(mode){
  const test = document.getElementById("mbtiQuestions");
  if(!test) return;

  if(mode === "test"){
    if(test.style.display === "block"){
      test.style.display = "none";
    }else{
      test.style.display = "block";
      initMBTITest();
    }
  }
}

const tarotSound = new Audio("/tarot_reveal.mp3");
tarotSound.volume = 0.7;

function drawTarot(){

  const todayKey = new Date().toISOString().slice(0,10);
  const lockKey = "tarot_draw_" + todayKey;

  if(localStorage.getItem(lockKey)){
    alert("타로뽑기는 1일 1회 고정값 입니다.\n\n아래 버튼에서 타로 전용앱을 이용해보세요.");
    return;
  }

  const birth = document.getElementById("birthInput").value;
  if(!birth){
    alert("생년월일을 먼저 입력해주세요");
    return;
  }

  tarotSound.currentTime = 0;
  tarotSound.play();

  const seedString = birth + todayKey;

  let seed = 0;
  for(let i=0;i<seedString.length;i++){
    seed += seedString.charCodeAt(i);
  }

  const keys = Object.keys(tarotDB);
  const cardKey = keys[seed % keys.length];
  const card = tarotDB[cardKey];

  const tarotImg = document.getElementById("tarotImg");

tarotImg.classList.remove("flip");
tarotImg.src = "/tarot/back.png";

setTimeout(()=>{
  tarotImg.src = getCardImagePath(cardKey);
  tarotImg.classList.add("flip");
},400);

  document.getElementById("resultBox").innerHTML += `
    <br><b>타로카드</b><br>
    ${cardKey}<br>
    ${card.core}
  `;

  localStorage.setItem(lockKey, cardKey);
}

function getCardImagePath(cardKey){

  // 메이저 카드
  if(cardKey.includes("the_")){
    return "/tarot/majors/" + cardKey + ".png";
  }

  // 마이너 카드
  const [suit, name] = cardKey.split("_");

  const order = {
    ace:"01",
    two:"02",
    three:"03",
    four:"04",
    five:"05",
    six:"06",
    seven:"07",
    eight:"08",
    nine:"09",
    ten:"10",
    page:"11",
    knight:"12",
    queen:"13",
    king:"14"
  };

  return `/tarot/minors/${suit}/${order[name]}_${name}.png`;
}
/* ===============================
SHOW RESULT
================================ */
function showResult(){

  const name = document.getElementById("name").value;
  const mbti = document.getElementById("mbtiSelect").value;

  const todayArr=todayDB?.pools?.today||[];
  const tomorrowArr=tomorrowDB?.pools?.tomorrow||[];
  const yearArr=yearDB?.pools?.year_all||[];

  const todayFortune=todayArr[Math.floor(Math.random()*todayArr.length)]||"";
  const tomorrowFortune=tomorrowArr[Math.floor(Math.random()*tomorrowArr.length)]||"";
  const yearFortune=yearArr[Math.floor(Math.random()*yearArr.length)]||"";


  
let zodiacFortune = "";

const zodiacKey = zodiacKeyMap[currentZodiac];

if(zodiacKey && zodiacDB[zodiacKey]){
  const arr = zodiacDB[zodiacKey].today || [];

  const todayKey = new Date().toISOString().slice(0,10);
  const storageKey = "zodiac_" + currentZodiac + "_" + todayKey;

  let saved = localStorage.getItem(storageKey);

  if(saved){
    zodiacFortune = saved;
  }else{
    zodiacFortune = arr[Math.floor(Math.random()*arr.length)] || "";
    localStorage.setItem(storageKey, zodiacFortune);
  }
}
  const mbtiData = mbtiDB.traits?.[mbti];
const mbtiText = mbtiData
  ? `${mbtiData.label} — ${mbtiData.one_liner}`
  : "";
  const elements = sajuDB.elements || [];
  const sajuText =
    elements[Math.floor(Math.random()*elements.length)]?.pools?.overall?.[0] || "";

  document.getElementById("resultBox").innerHTML=`
    <b>${name}님의 운세 결과</b><br><br>
    <b>오늘의 운세</b><br>${todayFortune}<br><br>
    <b>내일의 운세</b><br>${tomorrowFortune}<br><br>
    <b>2026년 운세</b><br>${yearFortune}<br><br>
    <b>띠 운세</b><br>${zodiacFortune}<br><br>
    <b>MBTI 특징</b><br>${mbtiText}<br><br>
    <b>사주 한마디</b><br>${sajuText}
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

  const btn = document.getElementById("mbtiTestBtn");
  const box = document.getElementById("mbtiQuestions");

  btn.onclick = () => {
    if(box.style.display === "block"){
      box.style.display = "none";
    }else{
      box.style.display = "block";
      initMBTITest();
    }
  };
});

/* ===============================
RESULT BUTTON ACTIONS
================================ */

async function copyURL(){

  const shareData = {
    title: "무료 운세앱",
    text: "무료 운세앱 앱테크 해보기",
    url: location.href
  };

  if(navigator.share){
    try{
      await navigator.share(shareData);

      // 공유 성공 → 포인트 지급
      point += 50;
      localStorage.setItem("point", point);
      renderPoint();

      alert("공유 완료! +50P 지급 🎉");

    }catch(e){
      console.log("공유 취소");
    }
  }else{
    navigator.clipboard.writeText(location.href);
    alert("URL이 복사되었습니다!");
  }
}

function goTarotApp(){
  window.open("https://my-fortune-lake.vercel.app/", "_blank");
}

function goGame(){
  window.open("https://game-time-kappa.vercel.app/", "_blank");
}

function back(){
  document.getElementById("resultSection").style.display="none";
  document.getElementById("inputSection").style.display="block";
}

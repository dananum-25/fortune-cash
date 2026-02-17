const zodiacAnimals = ["쥐","소","호랑이","토끼","용","뱀","말","양","원숭이","닭","개","돼지"];
const zodiacKeyMap = {
  "쥐":"rat","소":"ox","호랑이":"tiger","토끼":"rabbit","용":"dragon","뱀":"snake",
  "말":"horse","양":"sheep","원숭이":"monkey","닭":"rooster","개":"dog","돼지":"pig"
};

let currentZodiac = null;
let zodiacDB = {};
let lunarMap = {};

function calcZodiacFromBirth(yyyy, mm, dd){
  let zodiacYear = yyyy;

  const lunar = lunarMap?.[yyyy];
  if(lunar){
    const [ly,lm,ld] = lunar.split("-").map(Number);
    if(mm < lm || (mm === lm && dd < ld)){
      zodiacYear = yyyy - 1;
    }
  }

  // 2020 = 쥐 기준
  const zodiacIndex = (zodiacYear - 2020 + 120) % 12;
  return zodiacAnimals[zodiacIndex];
}

document.addEventListener("DOMContentLoaded", async ()=>{
  Common.renderPoint();
  document.getElementById("shareBtn").onclick = Common.shareAndReward;

  zodiacDB = await DB.loadJSON("/data/zodiac_fortunes_ko_2026.json");
  lunarMap  = await DB.loadJSON("/data/lunar_new_year_1920_2026.json");

  const birthInput = document.getElementById("birthInput");
  birthInput.addEventListener("change", ()=>{
    if(!birthInput.value) return;
    const [y,m,d] = birthInput.value.split("-").map(Number);

    currentZodiac = calcZodiacFromBirth(y,m,d);

    const name = (document.getElementById("name").value || "").trim() || "선택한 생년월일";
    document.getElementById("zodiacResult").innerText =
      `음력을 적용한 ${name}님은 ${currentZodiac}띠 입니다`;
  });

  document.getElementById("btn").onclick = ()=>{
    const box = document.getElementById("resultBox");
    if(!currentZodiac){
      alert("생년월일을 먼저 입력해주세요.");
      return;
    }

    const zodiacKey = zodiacKeyMap[currentZodiac];
    const arr = zodiacDB?.[zodiacKey]?.today || [];
    const todayKey = new Date().toISOString().slice(0,10);
    const storageKey = "zodiac_" + currentZodiac + "_" + todayKey;

    let msg = localStorage.getItem(storageKey);
    if(!msg){
      msg = arr[Math.floor(Math.random()*arr.length)] || "오늘은 균형이 중요한 날이에요.";
      localStorage.setItem(storageKey, msg);
    }

    box.style.display = "block";
    box.innerHTML = `<b>${currentZodiac}띠 운세</b><br><br>${msg}`;
  };
});

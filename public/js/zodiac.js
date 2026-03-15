const DEFAULT_BIRTH_YMD = "1940-01-01";
const DEFAULT_BIRTH_TIME = "11:00";

let fortuneDB = null;
let ipchunDB = null;
let rewarded = false;

const ZODIAC_ANIMALS = [
  "rat", "ox", "tiger", "rabbit",
  "dragon", "snake", "horse", "goat",
  "monkey", "rooster", "dog", "pig"
];

const ZODIAC_NAMES = {
  rat: "쥐띠",
  ox: "소띠",
  tiger: "호랑이띠",
  rabbit: "토끼띠",
  dragon: "용띠",
  snake: "뱀띠",
  horse: "말띠",
  goat: "양띠",
  monkey: "원숭이띠",
  rooster: "닭띠",
  dog: "개띠",
  pig: "돼지띠"
};

const ELEMENTS = [
  "wood", "wood",
  "fire", "fire",
  "earth", "earth",
  "metal", "metal",
  "water", "water"
];

const ELEMENT_NAMES = {
  wood: "목",
  fire: "화",
  earth: "토",
  metal: "금",
  water: "수"
};

const RELATION_LABELS = {
  he: "합",
  chong: "충",
  normal: "평"
};

const RELATION_TEXT = {
  he: "오늘 지지와 내 띠 흐름이 비교적 잘 맞는 날입니다. 사람, 일정, 제안 흐름을 부드럽게 연결하기 좋습니다.",
  chong: "오늘 지지와 내 띠 흐름이 부딪히는 날입니다. 말실수, 일정 엇갈림, 감정 반응을 조금 더 조심하는 편이 좋습니다.",
  normal: "오늘 지지와 내 띠 흐름은 큰 충돌 없이 무난한 편입니다. 무리한 확장보다 안정적인 운영이 잘 맞습니다."
};

const ZODIAC_RELATION = {
  rat: { chong: "horse", he: "ox" },
  ox: { chong: "goat", he: "rat" },
  tiger: { chong: "monkey", he: "pig" },
  rabbit: { chong: "rooster", he: "dog" },
  dragon: { chong: "dog", he: "rooster" },
  snake: { chong: "pig", he: "monkey" },
  horse: { chong: "rat", he: "goat" },
  goat: { chong: "ox", he: "horse" },
  monkey: { chong: "tiger", he: "snake" },
  rooster: { chong: "rabbit", he: "dragon" },
  dog: { chong: "dragon", he: "rabbit" },
  pig: { chong: "snake", he: "tiger" }
};

const SUBTYPE_TEXT = {
  wood: "성장, 확장, 배움 쪽 감각을 살릴수록 흐름이 좋아집니다.",
  fire: "표현력과 추진력이 강하게 살아날 수 있어 속도 조절이 중요합니다.",
  earth: "안정, 유지, 현실 감각을 살릴 때 운의 체감이 좋아집니다.",
  metal: "기준, 정리, 정확성을 살릴수록 결과가 단단해집니다.",
  water: "흐름 파악, 유연성, 관계 조율이 강점으로 작용할 수 있습니다."
};

const AGE_GROUP_TEXT = {
  child: "보호자, 생활리듬, 환경 안정이 운세 체감에 더 크게 작용하는 구간입니다.",
  teen: "학업, 집중, 친구 관계, 생활패턴 관리가 핵심으로 작용하는 구간입니다.",
  young: "진로, 이동, 선택, 인간관계 폭이 운세 체감에 크게 연결되는 구간입니다.",
  adult: "일, 돈, 책임, 관계 균형이 가장 중요한 구간입니다.",
  mid: "유지, 재정 관리, 생활 안정, 관계 정리가 중요한 구간입니다.",
  senior: "건강 리듬, 생활 균형, 가까운 관계의 편안함이 더 중요하게 작용하는 구간입니다."
};

async function loadDB(){
  const [fortuneRes, ipchunRes] = await Promise.all([
    fetch("/data/fortune_ko.json", { cache: "no-store" }),
    fetch("/data/ipchun_db.json", { cache: "no-store" })
  ]);

  if(!fortuneRes.ok){
    throw new Error(`fortune_ko.json 로드 실패: ${fortuneRes.status}`);
  }

  if(!ipchunRes.ok){
    throw new Error(`ipchun.json 로드 실패: ${ipchunRes.status}`);
  }

  fortuneDB = await fortuneRes.json();
  ipchunDB = await ipchunRes.json();
}

function safePad(n){
  return String(n).padStart(2, "0");
}

function toDateOnlyText(date){
  return `${date.getFullYear()}-${safePad(date.getMonth()+1)}-${safePad(date.getDate())}`;
}

function getTodayKSTDate(){
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function getSavedBirthInput(){
  const phone = localStorage.getItem("phone");
  const guestBirth = localStorage.getItem("guest_birth");

  if(phone){
    return {
      birthDate: localStorage.getItem("birth") || DEFAULT_BIRTH_YMD,
      birthTime: localStorage.getItem("birthTime") || DEFAULT_BIRTH_TIME,
      mode: "member"
    };
  }

  if(guestBirth){
    return {
      birthDate: localStorage.getItem("guest_birth") || DEFAULT_BIRTH_YMD,
      birthTime: localStorage.getItem("guest_birthTime") || DEFAULT_BIRTH_TIME,
      mode: "guest"
    };
  }

  return {
    birthDate: DEFAULT_BIRTH_YMD,
    birthTime: DEFAULT_BIRTH_TIME,
    mode: "default"
  };
}

function parseBirthDate(birthDate){
  const m = String(birthDate || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!m){
    return new Date(DEFAULT_BIRTH_YMD);
  }

  const year = Number(m[1]);
  const month = Number(m[2]) - 1;
  const day = Number(m[3]);

  return new Date(year, month, day);
}

function getIpchunText(year){
  return ipchunDB?.[String(year)] || "02-04";
}

function getZodiacYear(birthDateText){
  const d = parseBirthDate(birthDateText);
  const year = d.getFullYear();
  const md = `${safePad(d.getMonth()+1)}-${safePad(d.getDate())}`;
  const ipchun = getIpchunText(year);

  return md < ipchun ? year - 1 : year;
}

function getZodiacAnimal(zodiacYear){
  let index = (zodiacYear - 4) % 12;
  if(index < 0) index += 12;
  return ZODIAC_ANIMALS[index];
}

function getBirthElement(zodiacYear){
  let stemIndex = (zodiacYear - 4) % 10;
  if(stemIndex < 0) stemIndex += 10;
  return ELEMENTS[stemIndex];
}

function getAgeGroup(zodiacYear){
  const currentYear = getTodayKSTDate().getFullYear();
  const age = currentYear - zodiacYear + 1;

  if(age < 13) return "child";
  if(age < 20) return "teen";
  if(age < 30) return "young";
  if(age < 45) return "adult";
  if(age < 60) return "mid";
  return "senior";
}

function getDayBranch(targetDate){
  const base = new Date(1900, 0, 1);
  const diffDays = Math.floor((targetDate - base) / 86400000);
  let index = diffDays % 12;
  if(index < 0) index += 12;
  return ZODIAC_ANIMALS[index];
}

function getRelation(animal, dayBranch){
  const rel = ZODIAC_RELATION?.[animal];
  if(!rel) return "normal";
  if(rel.chong === dayBranch) return "chong";
  if(rel.he === dayBranch) return "he";
  return "normal";
}

function hashString(str){
  let hash = 0;
  for(let i = 0; i < str.length; i++){
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickStable(arr, seed){
  if(!Array.isArray(arr) || arr.length === 0) return "";
  const index = hashString(seed) % arr.length;
  return arr[index];
}

function buildDailySeed(profile, section, targetDate){
  return [
    profile.birthDate,
    profile.birthTime,
    profile.zodiacYear,
    profile.animal,
    profile.element,
    profile.ageGroup,
    profile.relation,
    toDateOnlyText(targetDate),
    section
  ].join("|");
}

function buildYearSeed(profile, section, targetDate){
  return [
    profile.birthDate,
    profile.birthTime,
    profile.zodiacYear,
    profile.animal,
    profile.element,
    profile.ageGroup,
    targetDate.getFullYear(),
    section
  ].join("|");
}

function buildProfile(){
  const input = getSavedBirthInput();
  const zodiacYear = getZodiacYear(input.birthDate);
  const animal = getZodiacAnimal(zodiacYear);
  const element = getBirthElement(zodiacYear);
  const ageGroup = getAgeGroup(zodiacYear);

  const today = getTodayKSTDate();
  const dayBranch = getDayBranch(today);
  const relation = getRelation(animal, dayBranch);

  return {
    ...input,
    zodiacYear,
    animal,
    animalName: ZODIAC_NAMES[animal],
    element,
    elementName: ELEMENT_NAMES[element],
    ageGroup,
    dayBranch,
    relation,
    relationLabel: RELATION_LABELS[relation]
  };
}

function pickDailyFinal(daily, relation, animal, element, section, seed){

  const relationPool = daily?.relation_bonus?.[relation]?.[section];
  if(Array.isArray(relationPool) && relationPool.length){
    return pickStable(relationPool, seed);
  }

  const animalPool = daily?.animal_bonus?.[animal]?.[section];
  if(Array.isArray(animalPool) && animalPool.length){
    return pickStable(animalPool, seed);
  }

  const elementPool = daily?.element_bonus?.[element]?.[section];
  if(Array.isArray(elementPool) && elementPool.length){
    return pickStable(elementPool, seed);
  }

  const basePool = daily?.[section];
  return pickStable(basePool, seed);
}

function pickDailyWithAnimal(daily, animal, section, seed){
  const animalPool = daily?.animal_bonus?.[animal]?.[section];
  const basePool = daily?.[section];

  if(Array.isArray(animalPool) && animalPool.length){
    return pickStable(animalPool, seed);
  }

  return pickStable(basePool, seed);
}

function pickDailyWithRelation(daily, relation, section, seed){

  const relationPool =
    daily?.relation_bonus?.[relation]?.[section];

  const basePool =
    daily?.[section];

  if(Array.isArray(relationPool) && relationPool.length){
    return pickStable(relationPool, seed);
  }

  return pickStable(basePool, seed);
}

function buildFortuneResult(profile){

  const today = getTodayKSTDate();

  const daily = fortuneDB?.daily || {};
  const yearly = fortuneDB?.year || {};
  const relation = profile?.relation || "normal";
  const animal = profile?.animal || "rat";
  const element = profile?.element || "wood";

  return {

    todayMain: pickDailyFinal(daily, relation, animal, element, "main", buildDailySeed(profile, "daily-main", today)),
    todayLove: pickDailyFinal(daily, relation, animal, element, "love", buildDailySeed(profile, "daily-love", today)),
    todayMoney: pickDailyFinal(daily, relation, animal, element, "money", buildDailySeed(profile, "daily-money", today)),
    todayHealth: pickDailyFinal(daily, relation, animal, element, "health", buildDailySeed(profile, "daily-health", today)),
    todayWork: pickDailyFinal(daily, relation, animal, element, "work", buildDailySeed(profile, "daily-work", today)),
    todayRelation: pickDailyFinal(daily, relation, animal, element, "relationship", buildDailySeed(profile, "daily-relationship", today)),
    todayAdvice: pickDailyFinal(daily, relation, animal, element, "advice", buildDailySeed(profile, "daily-advice", today)),

    todayLuckyColor: pickStable(daily.lucky_color, buildDailySeed(profile, "daily-color", today)),
    todayLuckyNumber: pickStable(daily.lucky_number, buildDailySeed(profile, "daily-number", today)),

    yearMain: pickStable(yearly.main, buildYearSeed(profile, "year-main", today)),
    yearLove: pickStable(yearly.love, buildYearSeed(profile, "year-love", today)),
    yearMoney: pickStable(yearly.money, buildYearSeed(profile, "year-money", today)),
    yearHealth: pickStable(yearly.health, buildYearSeed(profile, "year-health", today)),
    yearWork: pickStable(yearly.work, buildYearSeed(profile, "year-work", today)),
    yearRelation: pickStable(yearly.relationship, buildYearSeed(profile, "year-relationship", today)),
    yearAdvice: pickStable(yearly.advice, buildYearSeed(profile, "year-advice", today)),
    yearKeyword: pickStable(yearly.keywords, buildYearSeed(profile, "year-keyword", today)),
    yearLuckyColor: pickStable(yearly.lucky_color, buildYearSeed(profile, "year-color", today)),
    yearLuckyNumber: pickStable(yearly.lucky_number, buildYearSeed(profile, "year-number", today))

  };

}

function syncSelectToProfile(profile){
  const select = document.getElementById("zodiacSelect");
  if(!select) return;
  select.value = profile.animal;
}

function renderGuide(profile){
  const guideBox = document.getElementById("guideBox");
  if(!guideBox) return;

  guideBox.innerHTML = `
    <h3>🔎 이번 결과는 이렇게 계산했어요</h3>
    <p><b>띠 판정:</b> 생년월일을 입춘 기준으로 계산해 ${profile.animalName}로 판정했습니다.</p>
    <p><b>출생연도 타입:</b> ${profile.zodiacYear}년 기준 ${profile.elementName} 기운 서브타입을 반영했습니다.</p>
    <p><b>오늘 흐름:</b> 오늘 지지와 ${profile.animalName}의 관계는 <b>${profile.relationLabel}</b> 흐름입니다.</p>
    <p><b>연령대 보정:</b> ${AGE_GROUP_TEXT[profile.ageGroup]}</p>
    <p class="small">오늘 운세는 같은 생년월일이면 하루 동안 동일하게 유지되도록 고정 계산됩니다.</p>
  `;
}

function renderResult(profile, result){
  const resultBox = document.getElementById("resultBox");
  const resultSection = document.getElementById("resultSection");

  if(!resultBox || !resultSection) return;

  resultBox.innerHTML = `
    <h2>${profile.animalName} 오늘 운세</h2>

    <p><b>내 띠:</b> ${profile.animalName}</p>
    <p><b>출생 기준 띠 계산 연도:</b> ${profile.zodiacYear}년</p>
    <p><b>출생연도 서브타입:</b> ${profile.elementName} ${profile.animalName}</p>
    <p><b>오늘 관계 흐름:</b> ${profile.relationLabel}</p>

    <hr>

    <p><b>오늘 총운</b><br>${result.todayMain}</p>
    <p><b>애정운</b><br>${result.todayLove}</p>
    <p><b>재물운</b><br>${result.todayMoney}</p>
    <p><b>건강운</b><br>${result.todayHealth}</p>
    <p><b>일운</b><br>${result.todayWork}</p>
    <p><b>대인운</b><br>${result.todayRelation}</p>
    <p><b>오늘의 조언</b><br>${result.todayAdvice}</p>

    <p><b>행운 색상</b> ${result.todayLuckyColor}</p>
    <p><b>행운 숫자</b> ${result.todayLuckyNumber}</p>

    <hr>

    <h2>올해 운세</h2>

    <p><b>올해 총운</b><br>${result.yearMain}</p>
    <p><b>올해 애정운</b><br>${result.yearLove}</p>
    <p><b>올해 재물운</b><br>${result.yearMoney}</p>
    <p><b>올해 건강운</b><br>${result.yearHealth}</p>
    <p><b>올해 일운</b><br>${result.yearWork}</p>
    <p><b>올해 대인운</b><br>${result.yearRelation}</p>
    <p><b>올해 조언</b><br>${result.yearAdvice}</p>

    <p><b>올해 키워드</b> ${result.yearKeyword}</p>
    <p><b>올해 행운 색상</b> ${result.yearLuckyColor}</p>
    <p><b>올해 행운 숫자</b> ${result.yearLuckyNumber}</p>

    <hr>

    <h3>왜 이렇게 나왔나요?</h3>
    <p>${RELATION_TEXT[profile.relation]}</p>
    <p>${SUBTYPE_TEXT[profile.element]}</p>
  `;

  resultSection.style.display = "block";
}

function buildProfileByAnimalOverride(animalOverride){
  const input = getSavedBirthInput();
  const zodiacYear = getZodiacYear(input.birthDate);
  const baseAnimal = getZodiacAnimal(zodiacYear);
  const animal = animalOverride || baseAnimal;
  const element = getBirthElement(zodiacYear);
  const ageGroup = getAgeGroup(zodiacYear);

  const today = getTodayKSTDate();
  const dayBranch = getDayBranch(today);
  const relation = getRelation(animal, dayBranch);

  return {
    ...input,
    zodiacYear,
    animal,
    animalName: ZODIAC_NAMES[animal],
    myAnimal: baseAnimal,
    myAnimalName: ZODIAC_NAMES[baseAnimal],
    element,
    elementName: ELEMENT_NAMES[element],
    ageGroup,
    dayBranch,
    relation,
    relationLabel: RELATION_LABELS[relation]
  };
}

function showZodiac(){
  const selectedAnimal = document.getElementById("zodiacSelect")?.value || null;
  const profile = buildProfileByAnimalOverride(selectedAnimal);
  const result = buildFortuneResult(profile);

  renderLoginState(profile);
  renderMyZodiacInfo(profile);
  renderResult(profile, result);
  renderGuide(profile);

  if(!rewarded){
    rewarded = true;
    if(window.rewardContent){
      rewardContent("zodiac");
    }
  }
}

function renderZodiacOptions(){
  const select = document.getElementById("zodiacSelect");
  if(!select) return;

  select.innerHTML = ZODIAC_ANIMALS.map(animal => `
    <option value="${animal}">${ZODIAC_NAMES[animal]}</option>
  `).join("");
}

function renderLoginState(profile){
  const box = document.getElementById("loginCheck");
  if(!box) return;

  if(profile.mode === "member"){
    box.innerHTML = `
      <p class="info-text"><b>회원 기준</b> 저장된 생년월일로 띠를 계산했습니다.</p>
      <p class="small">출생일: ${profile.birthDate}</p>
    `;
    return;
  }

  if(profile.mode === "guest"){
    box.innerHTML = `
      <p class="info-text"><b>게스트 기준</b> 입력한 생년월일로 띠를 계산했습니다.</p>
      <p class="small">출생일: ${profile.birthDate}</p>
    `;
    return;
  }

  box.innerHTML = `
    <p class="info-text"><b>비회원 기본 기준</b> 1940-01-01 기준으로 띠를 계산했습니다.</p>
    <p class="small">원하는 생년월일을 입력하면 내 기준으로 다시 볼 수 있습니다.</p>
  `;
}

function renderMyZodiacInfo(profile){
  const box = document.getElementById("myZodiacInfo");
  if(!box) return;

  box.innerHTML = `
    <p class="info-text"><b>내 띠</b> ${profile.animalName}</p>
    <p class="info-text"><b>입춘 기준 적용 연도</b> ${profile.zodiacYear}년</p>
    <p class="info-text"><b>출생연도 서브타입</b> ${profile.elementName} ${profile.animalName}</p>
    <p class="info-text"><b>오늘 관계 흐름</b> ${profile.relationLabel}</p>
  `;
}

function fillGuestBirthInput(profile){
  const input = document.getElementById("guestBirthInline");
  if(!input) return;
  input.value = profile.birthDate || DEFAULT_BIRTH_YMD;
}

function applyGuestBirth(){
  const input = document.getElementById("guestBirthInline");
  if(!input) return;

  const birthDate = input.value || DEFAULT_BIRTH_YMD;

  localStorage.setItem("guest_birth", birthDate);
  localStorage.setItem("guest_birthTime", DEFAULT_BIRTH_TIME);

  const profile = buildProfile();
  const result = buildFortuneResult(profile);

  syncSelectToProfile(profile);
  renderLoginState(profile);
  renderMyZodiacInfo(profile);
  fillGuestBirthInput(profile);
  renderResult(profile, result);
  renderGuide(profile);
}

function renderRelatedZodiacGrid(){
  const grid = document.getElementById("relatedZodiacGrid");
  if(!grid) return;

  grid.innerHTML = ZODIAC_ANIMALS.map(animal => `
    <button class="action-btn related-zodiac-btn" type="button" data-animal="${animal}">
      ${ZODIAC_NAMES[animal]}
    </button>
  `).join("");

  grid.querySelectorAll(".related-zodiac-btn").forEach(btn => {
    btn.addEventListener("click", ()=>{
      const select = document.getElementById("zodiacSelect");
      if(select){
        select.value = btn.dataset.animal;
      }
      showZodiac();
    });
  });
}

function bindEvents(){
  const showBtn = document.getElementById("showZodiacBtn");
  if(showBtn){
    showBtn.addEventListener("click", showZodiac);
  }

  const applyBtn = document.getElementById("applyGuestBirthBtn");
  if(applyBtn){
    applyBtn.addEventListener("click", applyGuestBirth);
  }
}

document.addEventListener("DOMContentLoaded", async ()=>{
  await loadDB();

  renderZodiacOptions();
  renderRelatedZodiacGrid();

  if(window.loadMyPoint) await loadMyPoint();
  if(window.Common?.renderPoint) Common.renderPoint();

  const profile = buildProfile();
  const result = buildFortuneResult(profile);

  syncSelectToProfile(profile);
  renderLoginState(profile);
  renderMyZodiacInfo(profile);
  fillGuestBirthInput(profile);
  bindEvents();

  renderResult(profile, result);
  renderGuide(profile);
});

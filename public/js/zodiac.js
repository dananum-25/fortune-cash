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

const STEMS = [
  "갑", "을", "병", "정", "무",
  "기", "경", "신", "임", "계"
];

const BRANCHES = [
  "자", "축", "인", "묘", "진", "사",
  "오", "미", "신", "유", "술", "해"
];

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
  he: "잘 맞는 흐름 (합)",
  chong: "조심할 흐름 (충)",
  normal: "무난한 흐름 (평)"
};

const ELEMENT_FLOW_LABELS = {
  same: "균형 흐름 (동행)",
  support: "도움 흐름 (상생)",
  output: "활동 흐름 (설기)",
  control: "조정 흐름 (상극)",
  pressure: "부담 흐름 (역극)"
};

const RELATION_TEXT = {
  he: "오늘은 사람, 일정, 제안 흐름이 비교적 자연스럽게 이어질 가능성이 있습니다. 혼자 밀기보다 연결을 잘 활용하는 편이 좋습니다.",
  chong: "오늘은 말실수, 일정 엇갈림, 감정 반응을 조금 더 조심하는 편이 좋습니다. 무리하게 밀어붙이기보다 조정이 중요할 수 있습니다.",
  normal: "오늘은 큰 충돌보다 안정적인 운영이 더 잘 맞는 흐름입니다. 과하게 흔들기보다 기본을 지키는 편이 좋습니다."
};

const YEAR_RELATION_TEXT = {
  he: "올해는 사람, 기회, 협력 흐름이 비교적 잘 이어질 가능성이 있습니다.",
  chong: "올해는 무리한 확장보다 조정과 균형이 더 중요하게 작용할 수 있습니다.",
  normal: "올해는 큰 충돌보다 안정적인 운영과 기본 관리가 더 중요할 수 있습니다."
};

const ELEMENT_FLOW_TEXT = {
  same: "올해는 내 기본 성향과 익숙한 강점을 자연스럽게 살리기 좋은 흐름입니다.",
  support: "올해는 외부 환경이나 주변 흐름이 비교적 내 편으로 작용할 가능성이 있습니다.",
  output: "올해는 움직임과 실행이 늘 수 있어 성과도 나지만 소모 관리도 중요합니다.",
  control: "올해는 기준을 다시 세우고 불필요한 부분을 조정하는 일이 중요할 수 있습니다.",
  pressure: "올해는 부담이 커질 수 있어 선택과 집중, 체력 안배가 특히 중요할 수 있습니다."
};

const SUBTYPE_TEXT = {
  wood: "성장, 확장, 배움 쪽 감각을 살릴수록 흐름이 좋아질 수 있습니다.",
  fire: "표현력과 추진력이 강하게 살아날 수 있어 속도 조절이 중요할 수 있습니다.",
  earth: "안정, 유지, 현실 감각을 살릴 때 운의 체감이 좋아질 수 있습니다.",
  metal: "기준, 정리, 정확성을 살릴수록 결과가 단단해질 수 있습니다.",
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

async function safeFetchJson(url){
  const res = await fetch(url, { cache: "no-store" });
  if(!res.ok){
    throw new Error(`DB 로딩 실패: ${url} (${res.status})`);
  }
  return await res.json();
}

async function loadDB(){
  const [
    daily,
    relation,
    animal,
    element,
    year,
    yearRelation,
    yearElement,
    yearGanzhi,
    ipchun
  ] = await Promise.all([
    safeFetchJson("/data/fortune/daily.json"),
    safeFetchJson("/data/fortune/relation_bonus.json"),
    safeFetchJson("/data/fortune/animal_bonus.json"),
    safeFetchJson("/data/fortune/element_bonus.json"),
    safeFetchJson("/data/fortune/year.json"),
    safeFetchJson("/data/fortune/year_relation_bonus.json"),
    safeFetchJson("/data/fortune/year_element_bonus.json"),
    safeFetchJson("/data/fortune/year_ganzhi_bonus.json"),
    safeFetchJson("/data/ipchun_db.json")
  ]);

  fortuneDB = {
    daily: {
      ...daily,
      relation_bonus: relation,
      animal_bonus: animal,
      element_bonus: element
    },
    year: {
      ...year,
      relation_bonus: yearRelation,
      element_bonus: yearElement,
      ganzhi_bonus: yearGanzhi
    }
  };

  ipchunDB = ipchun;
}

function getAnimalFromURL(){
  const path = window.location.pathname;
  const match = path.match(/zodiac\/(rat|ox|tiger|rabbit|dragon|snake|horse|goat|monkey|rooster|dog|pig)/);
  return match ? match[1] : null;
}

function safePad(n){
  return String(n).padStart(2, "0");
}

function toDateOnlyText(date){
  return `${date.getFullYear()}-${safePad(date.getMonth() + 1)}-${safePad(date.getDate())}`;
}

function getKSTDateParts(baseDate = new Date()){
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(baseDate);

  const year = Number(parts.find(p => p.type === "year")?.value || "1970");
  const month = Number(parts.find(p => p.type === "month")?.value || "01");
  const day = Number(parts.find(p => p.type === "day")?.value || "01");

  return { year, month, day };
}

function getTodayKSTDate(){
  const { year, month, day } = getKSTDateParts(new Date());
  return new Date(year, month - 1, day);
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
    return new Date(1940, 0, 1);
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
  const md = `${safePad(d.getMonth() + 1)}-${safePad(d.getDate())}`;
  const ipchun = getIpchunText(year);

  return md < ipchun ? year - 1 : year;
}

function getGanzhi(year){
  let stemIndex = (year - 4) % 10;
  if(stemIndex < 0) stemIndex += 10;

  let branchIndex = (year - 4) % 12;
  if(branchIndex < 0) branchIndex += 12;

  let ganzhiIndex = (year - 4) % 60;
  if(ganzhiIndex < 0) ganzhiIndex += 60;

  return {
    stem: STEMS[stemIndex],
    branch: BRANCHES[branchIndex],
    name: STEMS[stemIndex] + BRANCHES[branchIndex],
    stemIndex,
    branchIndex,
    ganzhiIndex
  };
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

function getYearBranchAnimal(currentGanzhi){
  const branchIndex = currentGanzhi?.branchIndex ?? 0;
  return ZODIAC_ANIMALS[branchIndex];
}

function getYearRelation(animal, currentGanzhi){
  const yearAnimal = getYearBranchAnimal(currentGanzhi);
  return getRelation(animal, yearAnimal);
}

function getElementFlow(birthElement, currentGanzhi){
  const yearElement = ELEMENTS[currentGanzhi.stemIndex];

  if(birthElement === yearElement) return "same";

  if(
    (birthElement === "wood" && yearElement === "fire") ||
    (birthElement === "fire" && yearElement === "earth") ||
    (birthElement === "earth" && yearElement === "metal") ||
    (birthElement === "metal" && yearElement === "water") ||
    (birthElement === "water" && yearElement === "wood")
  ){
    return "output";
  }

  if(
    (yearElement === "wood" && birthElement === "fire") ||
    (yearElement === "fire" && birthElement === "earth") ||
    (yearElement === "earth" && birthElement === "metal") ||
    (yearElement === "metal" && birthElement === "water") ||
    (yearElement === "water" && birthElement === "wood")
  ){
    return "support";
  }

  if(
    (birthElement === "wood" && yearElement === "earth") ||
    (birthElement === "earth" && yearElement === "water") ||
    (birthElement === "water" && yearElement === "fire") ||
    (birthElement === "fire" && yearElement === "metal") ||
    (birthElement === "metal" && yearElement === "wood")
  ){
    return "control";
  }

  return "pressure";
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

function pickStableFromObjectPools(obj, seed, preferredTypes = []){
  if(!obj || typeof obj !== "object" || Array.isArray(obj)) return "";

  const availableTypes = Object.keys(obj).filter(
    key => Array.isArray(obj[key]) && obj[key].length > 0
  );

  if(availableTypes.length === 0) return "";

  const orderedTypes = [
    ...preferredTypes.filter(type => availableTypes.includes(type)),
    ...availableTypes.filter(type => !preferredTypes.includes(type))
  ];

  const selectedType = orderedTypes[hashString(`${seed}|type`) % orderedTypes.length];
  return pickStable(obj[selectedType], `${seed}|${selectedType}`);
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
    profile.yearRelation,
    profile.elementFlow,
    profile.currentGanzhi,
    targetDate.getFullYear(),
    section
  ].join("|");
}

function getDailyPreferredTypes(relation, section){
  if(section === "advice"){
    if(relation === "he") return ["action"];
    if(relation === "chong") return ["warning", "recovery"];
    return ["action"];
  }

  if(relation === "he") return ["opportunity", "relation", "action"];
  if(relation === "chong") return ["warning", "timing", "recovery"];
  return ["relation", "timing", "action"];
}

function getYearPreferredTypes(yearRelation, elementFlow, section){
  if(section === "advice"){
    if(yearRelation === "he") return ["connection", "expansion"];
    if(yearRelation === "chong") return ["caution", "adjustment", "foundation"];
    if(elementFlow === "support") return ["connection", "expansion"];
    if(elementFlow === "pressure") return ["caution", "foundation"];
    return ["foundation", "adjustment"];
  }

  if(yearRelation === "he"){
    return ["connection", "expansion", "harvest", "foundation"];
  }

  if(yearRelation === "chong"){
    return ["caution", "adjustment", "foundation", "harvest"];
  }

  if(elementFlow === "support"){
    return ["expansion", "connection", "harvest", "foundation"];
  }

  if(elementFlow === "pressure"){
    return ["foundation", "adjustment", "caution", "harvest"];
  }

  return ["foundation", "adjustment", "harvest", "connection", "caution", "expansion"];
}

function buildProfile(){
  const input = getSavedBirthInput();
  const zodiacYear = getZodiacYear(input.birthDate);
  const animal = getZodiacAnimal(zodiacYear);
  const element = getBirthElement(zodiacYear);
  const ageGroup = getAgeGroup(zodiacYear);

  const birthGanzhiObj = getGanzhi(zodiacYear);
  const currentYear = getTodayKSTDate().getFullYear();
  const currentGanzhiObj = getGanzhi(currentYear);

  const today = getTodayKSTDate();
  const dayBranch = getDayBranch(today);
  const relation = getRelation(animal, dayBranch);

  const yearRelation = getYearRelation(animal, currentGanzhiObj);
  const elementFlow = getElementFlow(element, currentGanzhiObj);

  return {
    ...input,
    zodiacYear,
    animal,
    animalName: ZODIAC_NAMES[animal],
    element,
    elementName: ELEMENT_NAMES[element],
    ageGroup,

    birthGanzhi: birthGanzhiObj.name,
    birthGanzhiObj,

    currentGanzhi: currentGanzhiObj.name,
    currentGanzhiObj,

    dayBranch,
    relation,
    relationLabel: RELATION_LABELS[relation],

    yearRelation,
    yearRelationLabel: RELATION_LABELS[yearRelation],

    elementFlow,
    elementFlowLabel: ELEMENT_FLOW_LABELS[elementFlow]
  };
}

function buildProfileByAnimalOverride(animalOverride){
  const input = getSavedBirthInput();
  const zodiacYear = getZodiacYear(input.birthDate);
  const baseAnimal = getZodiacAnimal(zodiacYear);
  const animal = animalOverride || baseAnimal;
  const element = getBirthElement(zodiacYear);
  const ageGroup = getAgeGroup(zodiacYear);

  const birthGanzhiObj = getGanzhi(zodiacYear);
  const currentYear = getTodayKSTDate().getFullYear();
  const currentGanzhiObj = getGanzhi(currentYear);

  const today = getTodayKSTDate();
  const dayBranch = getDayBranch(today);
  const relation = getRelation(animal, dayBranch);

  const yearRelation = getYearRelation(animal, currentGanzhiObj);
  const elementFlow = getElementFlow(element, currentGanzhiObj);

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

    birthGanzhi: birthGanzhiObj.name,
    birthGanzhiObj,

    currentGanzhi: currentGanzhiObj.name,
    currentGanzhiObj,

    dayBranch,
    relation,
    relationLabel: RELATION_LABELS[relation],

    yearRelation,
    yearRelationLabel: RELATION_LABELS[yearRelation],

    elementFlow,
    elementFlowLabel: ELEMENT_FLOW_LABELS[elementFlow]
  };
}

function pickDailyFinal(daily, relation, animal, element, section, seed){
  const preferredTypes = getDailyPreferredTypes(relation, section);

  const relationPoolObj = daily?.relation_bonus?.[relation]?.[section];
  const relationPick = pickStableFromObjectPools(
    relationPoolObj,
    `${seed}|relation`,
    preferredTypes
  );
  if(relationPick) return relationPick;

  const animalPool = daily?.animal_bonus?.[animal]?.[section];
  if(Array.isArray(animalPool) && animalPool.length){
    return pickStable(animalPool, `${seed}|animal`);
  }

  const elementPool = daily?.element_bonus?.[element]?.[section];
  if(Array.isArray(elementPool) && elementPool.length){
    return pickStable(elementPool, `${seed}|element`);
  }

  const basePoolObj = daily?.[section];
  const basePick = pickStableFromObjectPools(basePoolObj, `${seed}|base`, preferredTypes);
  if(basePick) return basePick;

  return "";
}

function pickYearFinal(yearly, profile, section, seed){
  const yearRelation = profile?.yearRelation || "normal";
  const elementFlow = profile?.elementFlow || "same";
  const currentGanzhi = profile?.currentGanzhi || "";
  const preferredTypes = getYearPreferredTypes(yearRelation, elementFlow, section);

  const ganzhiSection = yearly?.ganzhi_bonus?.[currentGanzhi]?.[section];
  if(Array.isArray(ganzhiSection) && ganzhiSection.length){
    return pickStable(ganzhiSection, `${seed}|ganzhi`);
  }
  if(ganzhiSection && typeof ganzhiSection === "object" && !Array.isArray(ganzhiSection)){
    const ganzhiPick = pickStableFromObjectPools(ganzhiSection, `${seed}|ganzhi`, preferredTypes);
    if(ganzhiPick) return ganzhiPick;
  }

  const relationPoolObj = yearly?.relation_bonus?.[yearRelation]?.[section];
  const relationPick = pickStableFromObjectPools(
    relationPoolObj,
    `${seed}|relation`,
    preferredTypes
  );
  if(relationPick) return relationPick;

  const elementPool = yearly?.element_bonus?.[elementFlow]?.[section];
  if(Array.isArray(elementPool) && elementPool.length){
    return pickStable(elementPool, `${seed}|element`);
  }

  const basePoolObj = yearly?.[section];
  const basePick = pickStableFromObjectPools(basePoolObj, `${seed}|base`, preferredTypes);
  if(basePick) return basePick;

  return "";
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

    todayLuckyColor: pickStable(daily?.lucky_color, buildDailySeed(profile, "daily-color", today)),
    todayLuckyNumber: pickStable(daily?.lucky_number, buildDailySeed(profile, "daily-number", today)),

    yearMain: pickYearFinal(yearly, profile, "main", buildYearSeed(profile, "year-main", today)),
    yearLove: pickYearFinal(yearly, profile, "love", buildYearSeed(profile, "year-love", today)),
    yearMoney: pickYearFinal(yearly, profile, "money", buildYearSeed(profile, "year-money", today)),
    yearHealth: pickYearFinal(yearly, profile, "health", buildYearSeed(profile, "year-health", today)),
    yearWork: pickYearFinal(yearly, profile, "work", buildYearSeed(profile, "year-work", today)),
    yearRelation: pickYearFinal(yearly, profile, "relationship", buildYearSeed(profile, "year-relationship", today)),
    yearAdvice: pickYearFinal(yearly, profile, "advice", buildYearSeed(profile, "year-advice", today)),

    yearKeyword: pickStable(yearly?.keywords, buildYearSeed(profile, "year-keyword", today)),
    yearLuckyColor: pickStable(yearly?.lucky_color, buildYearSeed(profile, "year-color", today)),
    yearLuckyNumber: pickStable(yearly?.lucky_number, buildYearSeed(profile, "year-number", today))
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
    <h3>왜 이런 결과가 나왔나요?</h3>

    <p><b>먼저 쉽게 보면</b></p>
    <p>${YEAR_RELATION_TEXT[profile.yearRelation]}</p>
    <p>${RELATION_TEXT[profile.relation]}</p>
    <p>${ELEMENT_FLOW_TEXT[profile.elementFlow]}</p>

    <hr>

    <p><b>조금 더 풀어서 보면</b></p>
    <p>생년월일을 입춘 기준으로 계산했을 때 내 띠는 <b>${profile.animalName}</b>입니다.</p>
    <p>태어난 해의 흐름은 <b>${profile.birthGanzhi}</b> 기준으로 보고 있습니다.</p>
    <p>올해 분위기는 <b>${profile.currentGanzhi}</b> 흐름으로 반영했습니다.</p>
    <p>올해의 띠 흐름은 <b>${profile.yearRelationLabel}</b> 쪽에 가깝고, 오늘의 흐름은 <b>${profile.relationLabel}</b> 쪽에 가깝습니다.</p>
    <p>또 출생 기운과 올해 분위기 관계는 <b>${profile.elementFlowLabel}</b>으로 해석하고 있습니다.</p>
    <p><b>연령대 보정:</b> ${AGE_GROUP_TEXT[profile.ageGroup]}</p>

    <hr>

    <p><b>참고 정보</b></p>
    <p>출생 연도 간지 : ${profile.birthGanzhi}</p>
    <p>올해 간지 : ${profile.currentGanzhi}</p>
    <p>내 띠 : ${profile.animalName}</p>
    <p>올해 띠 흐름 : ${profile.yearRelationLabel}</p>
    <p>오늘 띠 흐름 : ${profile.relationLabel}</p>
    <p>오행 흐름 : ${profile.elementFlowLabel}</p>
    <p class="small">오늘 운세는 같은 생년월일이면 하루 동안 동일하게 유지되도록 고정 계산됩니다.</p>
    <p class="small"><a href="/pages/guide/fortune-terms.html">오행·지지·간지 용어 설명 보기</a></p>
  `;
}

function renderResult(profile, result){
  const resultBox = document.getElementById("resultBox");
  const resultSection = document.getElementById("resultSection");

  if(!resultBox || !resultSection) return;

  const isOverrideView = profile.myAnimal && profile.myAnimal !== profile.animal;

  resultBox.innerHTML = `
    <h2>${profile.animalName} 오늘 운세</h2>

    ${isOverrideView ? `<p class="small">현재는 선택한 띠 기준으로 보고 있습니다. 내 실제 띠는 ${profile.myAnimalName}입니다.</p>` : ""}

    <p><b>내 띠:</b> ${profile.animalName}</p>
    <p><b>출생 기준 띠 계산 연도:</b> ${profile.zodiacYear}년</p>
    <p><b>출생 연도 간지:</b> ${profile.birthGanzhi}</p>
    <p><b>출생 기운:</b> ${profile.elementName} ${profile.animalName}</p>
    <p><b>오늘 흐름:</b> ${profile.relationLabel}</p>

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

    <p><b>올해 분위기</b> ${profile.currentGanzhi}</p>
    <p><b>올해 흐름</b> ${profile.yearRelationLabel}</p>
    <p><b>올해 오행 분위기</b> ${profile.elementFlowLabel}</p>

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
    <p>${YEAR_RELATION_TEXT[profile.yearRelation]}</p>
    <p>${RELATION_TEXT[profile.relation]}</p>
    <p>${SUBTYPE_TEXT[profile.element]}</p>
    <p>${ELEMENT_FLOW_TEXT[profile.elementFlow]}</p>
    <p class="small"><a href="/pages/guide/fortune-terms.html">오행·지지·간지 용어 설명 보기</a></p>
  `;

  resultSection.style.display = "block";
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

  const isOverrideView = profile.myAnimal && profile.myAnimal !== profile.animal;

  box.innerHTML = `
    ${isOverrideView ? `<p class="info-text"><b>내 실제 띠</b> ${profile.myAnimalName}</p>` : ""}
    <p class="info-text"><b>현재 보는 띠</b> ${profile.animalName}</p>
    <p class="info-text"><b>입춘 기준 적용 연도</b> ${profile.zodiacYear}년</p>
    <p class="info-text"><b>출생 연도 간지</b> ${profile.birthGanzhi}</p>
    <p class="info-text"><b>출생 기운</b> ${profile.elementName} ${profile.animalName}</p>
    <p class="info-text"><b>올해 분위기</b> ${profile.currentGanzhi}</p>
    <p class="info-text"><b>올해 흐름</b> ${profile.yearRelationLabel}</p>
    <p class="info-text"><b>올해 오행 분위기</b> ${profile.elementFlowLabel}</p>
    <p class="info-text"><b>오늘 흐름</b> ${profile.relationLabel}</p>
    <p class="small"><a href="/pages/guide/fortune-terms.html">용어 설명 보기</a></p>
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

  const urlAnimal = getAnimalFromURL();
const profile = urlAnimal
  ? buildProfileByAnimalOverride(urlAnimal)
  : buildProfile();
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
    btn.addEventListener("click", () => {
      const select = document.getElementById("zodiacSelect");
      if(select){
        select.value = btn.dataset.animal;
      }
      showZodiac();
    });
  });
}

function renderLoadError(err){
  console.error(err);
  const resultSection = document.getElementById("resultSection");
  const resultBox = document.getElementById("resultBox");
  if(resultSection && resultBox){
    resultBox.innerHTML = `
      <h2>띠운세를 불러오지 못했습니다</h2>
      <p>데이터 파일 경로나 JSON 형식을 한 번 확인해보세요.</p>
      <p class="small">${String(err?.message || err)}</p>
    `;
    resultSection.style.display = "block";
  }
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

document.addEventListener("DOMContentLoaded", async () => {
  try {
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
  } catch (err) {
    renderLoadError(err);
  }
});

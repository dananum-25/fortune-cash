// /js/sinsal.extra.engine.js
// ===============================
// EXTRA SHINSAL ENGINE
// 천을귀인 / 천덕귀인 / 월덕귀인 / 문창귀인 / 도화
// ===============================

const EARTHLY = ["자","축","인","묘","진","사","오","미","신","유","술","해"];

function getBranch(pillar){
  if(!pillar || pillar.length < 2) return "";
  return pillar[1];
}

function getStem(pillar){
  if(!pillar || pillar.length < 2) return "";
  return pillar[0];
}

const TIAN_YI_GUIREN = {
  "갑":["축","미"],
  "을":["자","신"],
  "병":["해","유"],
  "정":["해","유"],
  "무":["축","미"],
  "기":["자","신"],
  "경":["축","미"],
  "신":["자","신"],
  "임":["묘","사"],
  "계":["묘","사"]
};

export function checkCheonEul(dayStem, branch){
  const targets = TIAN_YI_GUIREN[dayStem] || [];
  return targets.includes(branch);
}

const CHEON_DEOK = {
  "인":"정",
  "묘":"신",
  "진":"계",
  "사":"갑",
  "오":"병",
  "미":"정",
  "신":"무",
  "유":"경",
  "술":"신",
  "해":"임",
  "자":"계",
  "축":"갑"
};

export function checkCheonDeok(monthBranch, stem){
  const target = CHEON_DEOK[monthBranch];
  return target === stem;
}

const MOON_DEOK = {
  "인":"병",
  "묘":"갑",
  "진":"임",
  "사":"경",
  "오":"병",
  "미":"갑",
  "신":"임",
  "유":"경",
  "술":"병",
  "해":"갑",
  "자":"임",
  "축":"경"
};

export function checkWolDeok(monthBranch, stem){
  const target = MOON_DEOK[monthBranch];
  return target === stem;
}

const MUNCHANG = {
  "갑":"사",
  "을":"오",
  "병":"신",
  "정":"유",
  "무":"신",
  "기":"유",
  "경":"해",
  "신":"자",
  "임":"인",
  "계":"묘"
};

export function checkMunchang(dayStem, branch){
  return MUNCHANG[dayStem] === branch;
}

const DOHWA = {
  "신자진":"유",
  "인오술":"묘",
  "해묘미":"자",
  "사유축":"오"
};

function findGroup(branch){

  if(["신","자","진"].includes(branch)) return "신자진";
  if(["인","오","술"].includes(branch)) return "인오술";
  if(["해","묘","미"].includes(branch)) return "해묘미";
  if(["사","유","축"].includes(branch)) return "사유축";

  return "";
}

export function checkDohwa(dayBranch, branch){

  const group = findGroup(dayBranch);

  const target = DOHWA[group];

  return branch === target;
}

export function getExtraSinsal(pillars){

  const dayStem = getStem(pillars.day);
  const dayBranch = getBranch(pillars.day);
  const monthBranch = getBranch(pillars.month);

  const branches = [
    getBranch(pillars.year),
    getBranch(pillars.month),
    getBranch(pillars.day),
    getBranch(pillars.hour)
  ];

  const stems = [
    getStem(pillars.year),
    getStem(pillars.month),
    getStem(pillars.day),
    getStem(pillars.hour)
  ];

  const result = [];

  branches.forEach(b=>{
    if(checkCheonEul(dayStem,b)) result.push("천을귀인");
  });

  stems.forEach(s=>{
    if(checkCheonDeok(monthBranch,s)) result.push("천덕귀인");
  });

  stems.forEach(s=>{
    if(checkWolDeok(monthBranch,s)) result.push("월덕귀인");
  });

  branches.forEach(b=>{
    if(checkMunchang(dayStem,b)) result.push("문창귀인");
  });

  branches.forEach(b=>{
    if(checkDohwa(dayBranch,b)) result.push("도화");
  });

  return [...new Set(result)];
}

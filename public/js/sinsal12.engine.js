// /js/sinsal12.engine.js  (NEW)
// ===============================
// 12 SHINSAL ENGINE
// 일지 기준 12신살 계산
// ===============================

// 기준:
// 일지 그룹별로 연지/월지/시지/대상지의 12신살을 계산
// 실무 유파별 차이가 있을 수 있으므로, 현재는
// "일지 기준 대표 매핑"으로 고정한다.

const DAY_BRANCH_GROUP_MAP = {
  "신자진": ["신", "자", "진"],
  "인오술": ["인", "오", "술"],
  "해묘미": ["해", "묘", "미"],
  "사유축": ["사", "유", "축"]
};

// 각 그룹별 시작 신살 순서
// 대상 branch를 아래 순서대로 배치
const SHINSAL_SEQUENCE = [
  "겁살", "재살", "천살", "지살", "년살", "월살",
  "망신", "장성", "반안", "역마", "육해", "화개"
];

// 그룹별 시작 지지
const GROUP_START_BRANCH = {
  "신자진": "사",
  "인오술": "해",
  "해묘미": "신",
  "사유축": "인"
};

const EARTHLY = ["자","축","인","묘","진","사","오","미","신","유","술","해"];

function findDayGroup(dayBranch){
  for (const [groupName, branches] of Object.entries(DAY_BRANCH_GROUP_MAP)) {
    if (branches.includes(dayBranch)) return groupName;
  }
  return "";
}

function rotateBranches(startBranch){
  const idx = EARTHLY.indexOf(startBranch);
  if (idx < 0) return [...EARTHLY];
  return [...EARTHLY.slice(idx), ...EARTHLY.slice(0, idx)];
}

function buildGroupMap(groupName){
  const startBranch = GROUP_START_BRANCH[groupName];
  if (!startBranch) return null;

  const rotated = rotateBranches(startBranch);
  const map = {};

  for (let i = 0; i < 12; i++) {
    map[rotated[i]] = SHINSAL_SEQUENCE[i];
  }

  return map;
}

export function get12SinsalMapByDayBranch(dayBranch){
  const groupName = findDayGroup(dayBranch);
  if (!groupName) return null;

  const sinsalMap = buildGroupMap(groupName);

  return {
    dayBranch,
    groupName,
    sinsalMap
  };
}

export function get12SinsalForBranch(dayBranch, targetBranch){
  const data = get12SinsalMapByDayBranch(dayBranch);
  if (!data || !targetBranch) return "";

  return data.sinsalMap[targetBranch] || "";
}

function getBranchFromPillar(pillar){
  if (!pillar || pillar.length < 2) return "";
  return pillar[1];
}

export function get12SinsalForPillars(pillars){
  if (!pillars?.day) return null;

  const dayBranch = getBranchFromPillar(pillars.day);

  const yearBranch = getBranchFromPillar(pillars.year);
  const monthBranch = getBranchFromPillar(pillars.month);
  const hourBranch = getBranchFromPillar(pillars.hour);

  return {
    기준일지: dayBranch,
    연지: {
      branch: yearBranch,
      sinsal: get12SinsalForBranch(dayBranch, yearBranch)
    },
    월지: {
      branch: monthBranch,
      sinsal: get12SinsalForBranch(dayBranch, monthBranch)
    },
    일지: {
      branch: dayBranch,
      sinsal: get12SinsalForBranch(dayBranch, dayBranch)
    },
    시지: {
      branch: hourBranch,
      sinsal: get12SinsalForBranch(dayBranch, hourBranch)
    }
  };
}

export function summarize12Sinsal(pillars){
  const result = get12SinsalForPillars(pillars);
  if (!result) return [];

  return [
    `연지 ${result.연지.branch}: ${result.연지.sinsal}`,
    `월지 ${result.월지.branch}: ${result.월지.sinsal}`,
    `일지 ${result.일지.branch}: ${result.일지.sinsal}`,
    `시지 ${result.시지.branch}: ${result.시지.sinsal}`
  ];
}

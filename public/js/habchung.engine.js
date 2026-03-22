// /js/habchung.engine.js  (NEW)
// ===============================
// HABCHUNG ENGINE
// 천간합 / 지지충 / 형 / 파 / 해 / 육합 / 삼합 기초
// ===============================

// -------------------------------
// 1) 기본 pair 유틸
// -------------------------------
function makePairKey(a, b){
  return [a, b].sort().join("-");
}

function getStemFromPillar(pillar){
  if(!pillar || pillar.length < 2) return "";
  return pillar[0];
}

function getBranchFromPillar(pillar){
  if(!pillar || pillar.length < 2) return "";
  return pillar[1];
}

function makePillarEntries(pillars){
  return [
    { key: "year", label: "연주", pillar: pillars?.year || "" },
    { key: "month", label: "월주", pillar: pillars?.month || "" },
    { key: "day", label: "일주", pillar: pillars?.day || "" },
    { key: "hour", label: "시주", pillar: pillars?.hour || "" }
  ];
}

// -------------------------------
// 2) 천간합
// 갑기합 / 을경합 / 병신합 / 정임합 / 무계합
// -------------------------------
const STEM_HAP_MAP = {
  "갑-기": "갑기합",
  "을-경": "을경합",
  "병-신": "병신합",
  "정-임": "정임합",
  "무-계": "무계합"
};

// -------------------------------
// 3) 지지충
// 자오충 축미충 인신충 묘유충 진술충 사해충
// -------------------------------
const BRANCH_CHUNG_MAP = {
  "자-오": "자오충",
  "축-미": "축미충",
  "인-신": "인신충",
  "묘-유": "묘유충",
  "진-술": "진술충",
  "사-해": "사해충"
};

// -------------------------------
// 4) 지지육합
// 자축 인해 묘술 진유 사신 오미
// -------------------------------
const BRANCH_YUKHAP_MAP = {
  "자-축": "자축합",
  "인-해": "인해합",
  "묘-술": "묘술합",
  "진-유": "진유합",
  "사-신": "사신합",
  "오-미": "오미합"
};

// -------------------------------
// 5) 지지형
// 인사신 형
// 축술미 형
// 자묘 형
// 진진, 오오, 유유, 해해 자형
// -------------------------------
const BRANCH_HYEONG_SETS = [
  {
    branches: ["인", "사", "신"],
    name: "인사신 형"
  },
  {
    branches: ["축", "술", "미"],
    name: "축술미 형"
  },
  {
    branches: ["자", "묘"],
    name: "자묘형"
  }
];

const SELF_HYEONG_BRANCHES = ["진", "오", "유", "해"];

// -------------------------------
// 6) 지지파
// 자유 축진 인해 묘오 사신 미술
// -------------------------------
const BRANCH_PA_MAP = {
  "자-유": "자유파",
  "축-진": "축진파",
  "인-해": "인해파",
  "묘-오": "묘오파",
  "사-신": "사신파",
  "미-술": "미술파"
};

// -------------------------------
// 7) 지지해
// 자미 축오 인사 묘진 신해 유술
// -------------------------------
const BRANCH_HAE_MAP = {
  "자-미": "자미해",
  "축-오": "축오해",
  "인-사": "인사해",
  "묘-진": "묘진해",
  "신-해": "신해해",
  "유-술": "유술해"
};

// -------------------------------
// 8) 삼합 기초
// 해묘미 목 / 인오술 화 / 사유축 금 / 신자진 수
// -------------------------------
const SAMHAP_SETS = [
  {
    branches: ["해", "묘", "미"],
    element: "목",
    name: "해묘미 목국"
  },
  {
    branches: ["인", "오", "술"],
    element: "화",
    name: "인오술 화국"
  },
  {
    branches: ["사", "유", "축"],
    element: "금",
    name: "사유축 금국"
  },
  {
    branches: ["신", "자", "진"],
    element: "수",
    name: "신자진 수국"
  }
];

// -------------------------------
// 9) 두 항목 조합 생성
// -------------------------------
function getAllPairs(entries){
  const pairs = [];

  for(let i = 0; i < entries.length; i++){
    for(let j = i + 1; j < entries.length; j++){
      pairs.push([entries[i], entries[j]]);
    }
  }

  return pairs;
}

// -------------------------------
// 10) 천간합 찾기
// -------------------------------
export function detectStemHap(pillars){
  const entries = makePillarEntries(pillars);
  const pairs = getAllPairs(entries);
  const results = [];

  for(const [a, b] of pairs){
    const stemA = getStemFromPillar(a.pillar);
    const stemB = getStemFromPillar(b.pillar);
    const key = makePairKey(stemA, stemB);

    if(STEM_HAP_MAP[key]){
      results.push({
        type: "천간합",
        name: STEM_HAP_MAP[key],
        from: [a.label, b.label],
        stems: [stemA, stemB]
      });
    }
  }

  return results;
}

// -------------------------------
// 11) 지지충 / 육합 / 파 / 해 찾기
// -------------------------------
function detectBranchPairsByMap(pillars, map, type){
  const entries = makePillarEntries(pillars);
  const pairs = getAllPairs(entries);
  const results = [];

  for(const [a, b] of pairs){
    const brA = getBranchFromPillar(a.pillar);
    const brB = getBranchFromPillar(b.pillar);
    const key = makePairKey(brA, brB);

    if(map[key]){
      results.push({
        type,
        name: map[key],
        from: [a.label, b.label],
        branches: [brA, brB]
      });
    }
  }

  return results;
}

export function detectBranchChung(pillars){
  return detectBranchPairsByMap(pillars, BRANCH_CHUNG_MAP, "지지충");
}

export function detectBranchYukhap(pillars){
  return detectBranchPairsByMap(pillars, BRANCH_YUKHAP_MAP, "지지육합");
}

export function detectBranchPa(pillars){
  return detectBranchPairsByMap(pillars, BRANCH_PA_MAP, "지지파");
}

export function detectBranchHae(pillars){
  return detectBranchPairsByMap(pillars, BRANCH_HAE_MAP, "지지해");
}

// -------------------------------
// 12) 지지형 찾기
// -------------------------------
export function detectBranchHyeong(pillars){
  const entries = makePillarEntries(pillars);
  const branches = entries.map(v => getBranchFromPillar(v.pillar)).filter(Boolean);

  const results = [];

  for(const set of BRANCH_HYEONG_SETS){
    const included = set.branches.filter(b => branches.includes(b));
    if(included.length >= 2){
      results.push({
        type: "지지형",
        name: set.name,
        branches: included
      });
    }
  }

  for(const selfBranch of SELF_HYEONG_BRANCHES){
    const count = branches.filter(b => b === selfBranch).length;
    if(count >= 2){
      results.push({
        type: "자형",
        name: `${selfBranch}${selfBranch} 자형`,
        branches: [selfBranch, selfBranch]
      });
    }
  }

  return results;
}

// -------------------------------
// 13) 삼합 찾기
// 3개 다 있으면 성립 표시
// 2개만 있으면 반합 후보 정도로 표시
// -------------------------------
export function detectSamhap(pillars){
  const entries = makePillarEntries(pillars);
  const branches = entries.map(v => getBranchFromPillar(v.pillar)).filter(Boolean);

  const results = [];

  for(const set of SAMHAP_SETS){
    const included = set.branches.filter(b => branches.includes(b));

    if(included.length === 3){
      results.push({
        type: "삼합",
        name: set.name,
        level: "complete",
        branches: included,
        element: set.element
      });
    } else if(included.length === 2){
      results.push({
        type: "반합후보",
        name: `${set.name} 후보`,
        level: "partial",
        branches: included,
        element: set.element
      });
    }
  }

  return results;
}

// -------------------------------
// 14) 통합
// -------------------------------
export function detectHabChung(pillars){
  return {
    stemHap: detectStemHap(pillars),
    branchChung: detectBranchChung(pillars),
    branchYukhap: detectBranchYukhap(pillars),
    branchHyeong: detectBranchHyeong(pillars),
    branchPa: detectBranchPa(pillars),
    branchHae: detectBranchHae(pillars),
    samhap: detectSamhap(pillars)
  };
}

// -------------------------------
// 15) 보기 쉬운 요약 문자열
// -------------------------------
export function summarizeHabChung(pillars){
  const data = detectHabChung(pillars);

  const flat = [
    ...data.stemHap,
    ...data.branchChung,
    ...data.branchYukhap,
    ...data.branchHyeong,
    ...data.branchPa,
    ...data.branchHae,
    ...data.samhap
  ];

  return flat.map(item => item.name);
}

// /js/jijangan.engine.js  (NEW)
// ===============================
// JIJANGGAN ENGINE
// 지장간 + 일간 기준 지장간 십성 확장
// ===============================

import { getTenGod } from "/js/tenGod.engine.js";

// -------------------------------
// 1) 지장간 원표
// 비율은 설명용 참고값
// 실제 서비스 출력은 stem 배열 위주로 사용
// -------------------------------
const JIJANGGAN_MAP = {
  "자": [
    { stem: "계", weight: 100 }
  ],
  "축": [
    { stem: "기", weight: 60 },
    { stem: "계", weight: 30 },
    { stem: "신", weight: 10 }
  ],
  "인": [
    { stem: "갑", weight: 60 },
    { stem: "병", weight: 30 },
    { stem: "무", weight: 10 }
  ],
  "묘": [
    { stem: "을", weight: 100 }
  ],
  "진": [
    { stem: "무", weight: 60 },
    { stem: "을", weight: 30 },
    { stem: "계", weight: 10 }
  ],
  "사": [
    { stem: "병", weight: 60 },
    { stem: "무", weight: 30 },
    { stem: "경", weight: 10 }
  ],
  "오": [
    { stem: "정", weight: 70 },
    { stem: "기", weight: 30 }
  ],
  "미": [
    { stem: "기", weight: 60 },
    { stem: "정", weight: 30 },
    { stem: "을", weight: 10 }
  ],
  "신": [
    { stem: "경", weight: 60 },
    { stem: "임", weight: 30 },
    { stem: "무", weight: 10 }
  ],
  "유": [
    { stem: "신", weight: 100 }
  ],
  "술": [
    { stem: "무", weight: 60 },
    { stem: "신", weight: 30 },
    { stem: "정", weight: 10 }
  ],
  "해": [
    { stem: "임", weight: 70 },
    { stem: "갑", weight: 30 }
  ]
};

// -------------------------------
// 2) 지지 -> 지장간 목록
// 예: "축" -> [{stem:"기", weight:60}, ...]
// -------------------------------
export function getJijangan(branch){
  if(!branch) return [];
  return JIJANGGAN_MAP[branch] ? [...JIJANGGAN_MAP[branch]] : [];
}

// -------------------------------
// 3) pillar 문자열("갑자") -> branch 추출
// -------------------------------
function getBranchFromPillar(pillar){
  if(!pillar || pillar.length < 2) return "";
  return pillar[1];
}

// -------------------------------
// 4) 특정 pillar의 지장간
// 예: "신축" -> [{stem:"기"...}, {stem:"계"...}, {stem:"신"...}]
// -------------------------------
export function getJijanganFromPillar(pillar){
  const branch = getBranchFromPillar(pillar);
  return getJijangan(branch);
}

// -------------------------------
// 5) 일간 기준 지장간 십성
// 예: dayMaster="계", pillar="신축"
// -------------------------------
export function getJijanganTenGods(dayMaster, pillar){
  const hiddenStems = getJijanganFromPillar(pillar);

  return hiddenStems.map(item => ({
    stem: item.stem,
    weight: item.weight,
    tenGod: getTenGod(dayMaster, item.stem)
  }));
}

// -------------------------------
// 6) 4기둥 전체 지장간
// 반환 예:
// {
//   year: [...],
//   month: [...],
//   day: [...],
//   hour: [...]
// }
// -------------------------------
export function getAllJijangan(pillars){
  if(!pillars) return null;

  return {
    year: getJijanganFromPillar(pillars.year),
    month: getJijanganFromPillar(pillars.month),
    day: getJijanganFromPillar(pillars.day),
    hour: getJijanganFromPillar(pillars.hour)
  };
}

// -------------------------------
// 7) 4기둥 전체 지장간 십성
// dayPillar 기준
// -------------------------------
export function getAllJijanganTenGods(dayPillar, pillars){
  if(!dayPillar || !pillars) return null;

  const dayMaster = dayPillar[0];

  return {
    year: getJijanganTenGods(dayMaster, pillars.year),
    month: getJijanganTenGods(dayMaster, pillars.month),
    day: getJijanganTenGods(dayMaster, pillars.day),
    hour: getJijanganTenGods(dayMaster, pillars.hour)
  };
}

// -------------------------------
// 8) 서비스에서 보기 쉬운 요약
// 각 기둥별 첫 번째(여기) 지장간과 십성 표시
// -------------------------------
export function summarizeJijangan(dayPillar, pillars){
  const data = getAllJijanganTenGods(dayPillar, pillars);
  if(!data) return null;

  const pickMain = (arr) => {
    if(!Array.isArray(arr) || arr.length === 0){
      return { stem: "", tenGod: "", weight: 0 };
    }
    return arr[0];
  };

  return {
    year: pickMain(data.year),
    month: pickMain(data.month),
    day: pickMain(data.day),
    hour: pickMain(data.hour)
  };
}

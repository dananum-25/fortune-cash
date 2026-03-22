// scripts/buildSolarTerms.mjs
// =====================================
// 24절기 절입시 자동 생성 (1차 후보 DB)
// - 외부 API 없이 계산
// - 결과는 "auto" / "pending" 형태로 저장
// - 반드시 KASI 샘플 대조 후 verified 승격 권장
// =====================================

import fs from "fs/promises";
import path from "path";

const KST_OFFSET_HOURS = 9;

// 생성 범위
const START_YEAR = 1940;
const END_YEAR = 2030;

// 절기 정의: 이름 + 태양 황경(deg) + 대략적인 KST 기준 날짜(검색 anchor)
const TERMS = [
  { name: "소한", angle: 285, month: 1, day: 5 },
  { name: "대한", angle: 300, month: 1, day: 20 },
  { name: "입춘", angle: 315, month: 2, day: 4 },
  { name: "우수", angle: 330, month: 2, day: 19 },
  { name: "경칩", angle: 345, month: 3, day: 6 },
  { name: "춘분", angle: 0, month: 3, day: 21 },
  { name: "청명", angle: 15, month: 4, day: 5 },
  { name: "곡우", angle: 30, month: 4, day: 20 },
  { name: "입하", angle: 45, month: 5, day: 5 },
  { name: "소만", angle: 60, month: 5, day: 21 },
  { name: "망종", angle: 75, month: 6, day: 6 },
  { name: "하지", angle: 90, month: 6, day: 21 },
  { name: "소서", angle: 105, month: 7, day: 7 },
  { name: "대서", angle: 120, month: 7, day: 23 },
  { name: "입추", angle: 135, month: 8, day: 7 },
  { name: "처서", angle: 150, month: 8, day: 23 },
  { name: "백로", angle: 165, month: 9, day: 7 },
  { name: "추분", angle: 180, month: 9, day: 23 },
  { name: "한로", angle: 195, month: 10, day: 8 },
  { name: "상강", angle: 210, month: 10, day: 23 },
  { name: "입동", angle: 225, month: 11, day: 7 },
  { name: "소설", angle: 240, month: 11, day: 22 },
  { name: "대설", angle: 255, month: 12, day: 7 },
  { name: "동지", angle: 270, month: 12, day: 22 }
];

// -------------------------------------
// 수학 유틸
// -------------------------------------
function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

function normalize360(deg) {
  let v = deg % 360;
  if (v < 0) v += 360;
  return v;
}

// [-180, 180)
function normalize180(deg) {
  let v = normalize360(deg);
  if (v >= 180) v -= 360;
  return v;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

// -------------------------------------
// 날짜 유틸
// JS Date는 UTC 밀리초 기반으로 다루고,
// 출력할 때만 KST(+09:00)로 포맷
// -------------------------------------
function createUtcDateFromKst(year, month, day, hour = 0, minute = 0, second = 0) {
  // KST 시각 -> UTC Date
  return new Date(Date.UTC(year, month - 1, day, hour - KST_OFFSET_HOURS, minute, second));
}

function formatKstIso(date) {
  const kst = new Date(date.getTime() + KST_OFFSET_HOURS * 3600 * 1000);

  const y = kst.getUTCFullYear();
  const m = pad2(kst.getUTCMonth() + 1);
  const d = pad2(kst.getUTCDate());
  const hh = pad2(kst.getUTCHours());
  const mm = pad2(kst.getUTCMinutes());
  const ss = pad2(kst.getUTCSeconds());

  return `${y}-${m}-${d}T${hh}:${mm}:${ss}+09:00`;
}

// -------------------------------------
// Julian Day
// -------------------------------------
function toJulianDay(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

// -------------------------------------
// 태양 겉보기 황경 (간이 정밀)
// Meeus/NOAA 계열 근사
// - 절입시 1차 후보 생성용
// - verified 전 샘플 대조 권장
// -------------------------------------
function solarApparentLongitude(date) {
  const jd = toJulianDay(date);
  const T = (jd - 2451545.0) / 36525.0;

  const L0 = normalize360(
    280.46646 +
      36000.76983 * T +
      0.0003032 * T * T
  );

  const M = normalize360(
    357.52911 +
      35999.05029 * T -
      0.0001537 * T * T +
      (T * T * T) / 24490000
  );

  const Mrad = degToRad(M);

  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
    0.000289 * Math.sin(3 * Mrad);

  const trueLongitude = L0 + C;

  const omega = 125.04 - 1934.136 * T;
  const lambda =
    trueLongitude -
    0.00569 -
    0.00478 * Math.sin(degToRad(omega));

  return normalize360(lambda);
}

// -------------------------------------
// 특정 절기 타깃 각도와의 차이
// crossing 시 음수 -> 양수 변화를 찾는다
// -------------------------------------
function angleDiff(date, targetAngle) {
  const lon = solarApparentLongitude(date);
  return normalize180(lon - targetAngle);
}

// -------------------------------------
// 브래킷 찾기
// anchor KST 기준 ±3일, 30분 step으로 스캔
// -------------------------------------
function findBracket(year, term) {
  const anchor = createUtcDateFromKst(year, term.month, term.day, 0, 0, 0);
  const start = new Date(anchor.getTime() - 3 * 86400000);
  const end = new Date(anchor.getTime() + 3 * 86400000);

  const stepMs = 30 * 60 * 1000;

  let prev = start;
  let prevVal = angleDiff(prev, term.angle);

  for (let t = start.getTime() + stepMs; t <= end.getTime(); t += stepMs) {
    const curr = new Date(t);
    const currVal = angleDiff(curr, term.angle);

    // 음수 -> 양수 crossing
    if (prevVal <= 0 && currVal >= 0) {
      return [prev, curr];
    }

    prev = curr;
    prevVal = currVal;
  }

  return null;
}

// -------------------------------------
// 이분 탐색으로 절입시 추정
// -------------------------------------
function solveTermDate(year, term) {
  const bracket = findBracket(year, term);

  if (!bracket) {
    throw new Error(`${year} ${term.name} bracket 탐색 실패`);
  }

  let [lo, hi] = bracket;
  let loVal = angleDiff(lo, term.angle);

  for (let i = 0; i < 80; i++) {
    const mid = new Date((lo.getTime() + hi.getTime()) / 2);
    const midVal = angleDiff(mid, term.angle);

    if (midVal === 0) {
      return mid;
    }

    if (loVal <= 0 && midVal >= 0) {
      hi = mid;
    } else {
      lo = mid;
      loVal = midVal;
    }
  }

  return new Date((lo.getTime() + hi.getTime()) / 2);
}

// -------------------------------------
// 결과 생성
// -------------------------------------
function buildAutoData(startYear, endYear) {
  const result = {};

  for (let year = startYear; year <= endYear; year++) {
    result[year] = {};

    for (const term of TERMS) {
      const dt = solveTermDate(year, term);
      result[year][term.name] = formatKstIso(dt);
    }
  }

  return result;
}

function buildPendingData(autoData) {
  const result = {};

  for (const [year, terms] of Object.entries(autoData)) {
    result[year] = {};

    for (const [name, datetime] of Object.entries(terms)) {
      result[year][name] = {
        datetime,
        verified: false,
        source: "auto_astronomical_candidate",
        checked_by: "",
        checked_at: "",
        note: ""
      };
    }
  }

  return result;
}

// -------------------------------------
// 저장
// -------------------------------------
async function main() {
  const autoData = buildAutoData(START_YEAR, END_YEAR);
  const pendingData = buildPendingData(autoData);

  const outDir = path.resolve("public/data/manselyeok");
  await fs.mkdir(outDir, { recursive: true });

  const autoPath = path.join(outDir, "solar_terms_auto.json");
  const pendingPath = path.join(outDir, "solar_terms_exact_pending.json");

  await fs.writeFile(autoPath, JSON.stringify(autoData, null, 2), "utf-8");
  await fs.writeFile(pendingPath, JSON.stringify(pendingData, null, 2), "utf-8");

  console.log(`완료:
- ${autoPath}
- ${pendingPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

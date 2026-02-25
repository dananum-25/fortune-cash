// scripts/build_lunar_db.mjs
// 한국천문연구원 음양력 OpenAPI를 이용해 (윤달 포함) 음력->양력, 양력->음력 매핑 DB 생성
// 출력: public/data/lunar_map.json

import fs from "fs";
import path from "path";

const SERVICE_KEY = process.env.KASI_KEY;
if (!SERVICE_KEY) {
  console.error("❌ KASI_KEY 환경변수가 없습니다. 먼저 export/setx로 설정하세요.");
  process.exit(1);
}

// data.go.kr / 한국천문연구원 음양력: getSolCalInfo(음력->양력), getLunCalInfo(양력->음력)
// 문서: https://www.data.go.kr/en/data/15012679/openapi.do
const BASE = "https://apis.data.go.kr/B090041/openapi/service/LrsrCldInfoService";

function ymd(y, m, d) {
  return `${y}${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}`;
}

function isLeapYear(y) {
  return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
}

function daysInMonth(y, m) {
  return [0,31,(isLeapYear(y)?29:28),31,30,31,30,31,31,30,31,30,31][m];
}

async function fetchJson(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status} ${await r.text()}`);
  const text = await r.text();

  // 이 API는 보통 XML로 오기 때문에 JSON으로 직접 못 받는 경우가 많음.
  // 그래서 간단 XML 파싱(정규식)으로 item 안의 태그 값 추출하는 방식 사용.
  // (라이브러리 없이 독립형)
  const itemMatch = text.match(/<item>([\s\S]*?)<\/item>/);
  if (!itemMatch) return null;

  const item = itemMatch[1];
  const get = (tag) => {
    const m = item.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
    return m ? m[1].trim() : "";
  };

  return {
    solYear: get("solYear"),
    solMonth: get("solMonth"),
    solDay: get("solDay"),
    lunYear: get("lunYear"),
    lunMonth: get("lunMonth"),
    lunDay: get("lunDay"),
    lunLeapmonth: get("lunLeapmonth"), // "평" or "윤"
  };
}

async function getSolarFromLunar(lunY, lunM, lunD, isLeap) {
  const url =
    `${BASE}/getSolCalInfo` +
    `?serviceKey=${encodeURIComponent(SERVICE_KEY)}` +
    `&lunYear=${lunY}&lunMonth=${String(lunM).padStart(2,"0")}&lunDay=${String(lunD).padStart(2,"0")}` +
    `&lunLeapmonth=${isLeap ? "윤" : "평"}`;
  return await fetchJson(url);
}

async function getLunarFromSolar(solY, solM, solD) {
  const url =
    `${BASE}/getLunCalInfo` +
    `?serviceKey=${encodeURIComponent(SERVICE_KEY)}` +
    `&solYear=${solY}&solMonth=${String(solM).padStart(2,"0")}&solDay=${String(solD).padStart(2,"0")}`;
  return await fetchJson(url);
}

async function main() {
  // 원하는 범위
  const START_YEAR = 1920;
  const END_YEAR = 2030;

  const out = {
    meta: {
      source: "KASI LrsrCldInfoService (data.go.kr)",
      generatedAt: new Date().toISOString(),
      range: { start: START_YEAR, end: END_YEAR },
      note: "Mappings include leap month (윤달). Keys are YYYY-MM-DD. Lunar keys include '-L' suffix when leap."
    },
    // solarYMD -> { lunarYMD, isLeap }
    solarToLunar: {},
    // lunarKey -> solarYMD  (lunarKey = YYYY-MM-DD or YYYY-MM-DD-L for leap month)
    lunarToSolar: {}
  };

  // 1) 양력 -> 음력 전체 채우기 (하루씩)
  console.log(`▶ solar->lunar building: ${START_YEAR}-${END_YEAR}`);
  for (let y = START_YEAR; y <= END_YEAR; y++) {
    for (let m = 1; m <= 12; m++) {
      const dim = daysInMonth(y, m);
      for (let d = 1; d <= dim; d++) {
        const res = await getLunarFromSolar(y, m, d);
        if (!res || !res.lunYear) continue;

        const sol = `${res.solYear}-${String(res.solMonth).padStart(2,"0")}-${String(res.solDay).padStart(2,"0")}`;
        const lun = `${res.lunYear}-${String(res.lunMonth).padStart(2,"0")}-${String(res.lunDay).padStart(2,"0")}`;
        const isLeap = res.lunLeapmonth === "윤";

        out.solarToLunar[sol] = { lunar: lun, isLeap };

        const lunarKey = isLeap ? `${lun}-L` : lun;
        // lunarToSolar은 1:1이므로 그대로 저장
        out.lunarToSolar[lunarKey] = sol;
      }
    }
    console.log(`  ...done year ${y}`);
  }

  // 저장
  const outPath = path.join(process.cwd(), "public", "data", "lunar_map.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), "utf-8");
  console.log(`✅ saved: ${outPath}`);
}

main().catch((e) => {
  console.error("❌ failed:", e);
  process.exit(1);
});

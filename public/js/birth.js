/* =========================================
   BIRTH UTIL (birth.js)
   - 입춘 DB 기반 띠 계산 / 갑자 계산
   - 오프라인 음력DB(lunar_map.json) 기반 음력<->양력 변환 (윤달 포함)
========================================= */

/* ==============================
   0) 공통: YYYY-MM-DD 로컬 파서 (UTC 밀림 방지)
============================== */
function parseYmdLocal(ymd){
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(ymd || "").trim());
  if(!m) return null;
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  return new Date(y, mo-1, d); // ✅ 로컬 기준 생성
}

/* ==============================
   1) 입춘 DB
============================== */
window.IPCHUN_DB_URL = "/data/ipchun_db.json";
window.__IPCHUN_DB__ = null;

// 입춘: 해당 연도 "02-03" 같은 MM-DD를 Date로
function getIpchunDateOfYear(year){
  // DB가 아직 없으면 안전 기본값: 2/4
  const mmdd = (window.__IPCHUN_DB__ && window.__IPCHUN_DB__[String(year)]) || "02-04";
  const [mm,dd] = String(mmdd).split("-").map(Number);
  return new Date(year, (mm||2)-1, (dd||4));
}

async function loadIpchunDB(){
  if(window.__IPCHUN_DB__) return window.__IPCHUN_DB__;
  try{
    const r = await fetch(window.IPCHUN_DB_URL, { cache:"no-store" });
    const db = await r.json();
    window.__IPCHUN_DB__ = db;
    console.log("[birth.js] ipchun db loaded ✅", Object.keys(db).length);
    return db;
  }catch(e){
    console.warn("[birth.js] ipchun db load failed -> fallback(02-04)", e);
    window.__IPCHUN_DB__ = null;
    return null;
  }
}

// ✅ 입춘 기준 "띠의 기준 연도"를 확정 (입춘 전이면 전년도)
function resolveZodiacYearByIpchun(solarYmd){
  const dt = parseYmdLocal(solarYmd);
  if(!dt) return null;

  const y = dt.getFullYear();
  const ip = getIpchunDateOfYear(y);

  // 생일 < 입춘 이면 띠 기준연도는 y-1
  return (dt < ip) ? (y - 1) : y;
}

// ✅ 띠 계산 (입춘 기준)
function calcZodiacByIpchun(solarYmd){
  const zodiacYear = resolveZodiacYearByIpchun(solarYmd);
  if(!zodiacYear) return "";

  const animals = ["쥐","소","호랑이","토끼","용","뱀","말","양","원숭이","닭","개","돼지"];
  // 기준: 2020=쥐
  return animals[(zodiacYear - 2020 + 120) % 12];
}

// ✅ 육십갑자(년주) 계산 (입춘 기준 연도 사용) / 기준: 1984=갑자
function calcGapjaByIpchun(solarYmd){
  const zodiacYear = resolveZodiacYearByIpchun(solarYmd);
  if(!zodiacYear) return "";

  const stems = ["갑","을","병","정","무","기","경","신","임","계"];
  const branches = ["자","축","인","묘","진","사","오","미","신","유","술","해"];

  const idx = ((zodiacYear - 1984) % 60 + 60) % 60;
  return stems[idx % 10] + branches[idx % 12] + "년";
}

/* ==============================
   2) 오프라인 음력 DB 변환 (윤달 포함)
   - /data/lunar_map.json
   - 형식: { "map": { "YYYY-MM-DD": "YYYY-MM-DD|0/1", ... } }
   - solarYmd -> "lunarYmd|leap"
============================== */

let __LUNAR_DB__ = null;
let __LUNAR_REV__ = null;

async function loadLunarDB(){
  if(__LUNAR_DB__) return __LUNAR_DB__;

  const res = await fetch("/data/lunar_map.json", { cache:"force-cache" });
  __LUNAR_DB__ = await res.json();

  const map = __LUNAR_DB__.map || {};

  // 역방향 인덱스: "lunar|leap" -> solar
  __LUNAR_REV__ = {};
  for(const solar in map){
    __LUNAR_REV__[map[solar]] = solar;
  }

  console.log("[lunar] DB loaded:", Object.keys(map).length);
  return __LUNAR_DB__;
}

// 음력 → 양력
// lunarYmd: "YYYY-MM-DD"
// isLeap: boolean
async function lunarToSolar(lunarYmd, isLeap=false){
  await loadLunarDB();
  const key = `${lunarYmd}|${isLeap ? 1 : 0}`;
  return __LUNAR_REV__[key] || "";
}

// 양력 → 음력
async function solarToLunar(solarYmd){
  await loadLunarDB();
  const map = __LUNAR_DB__.map || {};
  const value = map[solarYmd];
  if(!value) return null;

  const [lun, leap] = value.split("|");
  return { lunar: lun, isLeap: leap === "1" };
}

/* ==============================
   3) 전역 Export
============================== */
window.BirthUtil = window.BirthUtil || {};
window.BirthUtil.loadIpchunDB = loadIpchunDB;
window.BirthUtil.resolveZodiacYearByIpchun = resolveZodiacYearByIpchun;
window.BirthUtil.calcZodiacByIpchun = calcZodiacByIpchun;
window.BirthUtil.calcGapjaByIpchun = calcGapjaByIpchun;

window.BirthUtil.loadLunarDB = loadLunarDB;
window.BirthUtil.lunarToSolar = lunarToSolar;
window.BirthUtil.solarToLunar = solarToLunar;

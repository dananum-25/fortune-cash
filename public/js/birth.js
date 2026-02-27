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

// ==============================
// LUNAR <-> SOLAR (Offline, no DB)
// Uses Intl (ICU) chinese calendar in Asia/Seoul
// ==============================

function _ymdToDateSeoul(ymd){
  // "YYYY-MM-DD" -> Date (KST 자정 고정)
  return new Date(`${ymd}T00:00:00+09:00`);
}

function _dateToYMDSeoul(date){
  // Date -> "YYYY-MM-DD" (KST 기준)
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return dtf.format(date); // YYYY-MM-DD
}

function _solarToLunarParts(solarYmd){
  const d = _ymdToDateSeoul(solarYmd);

  const fmt = new Intl.DateTimeFormat("ko-KR-u-ca-chinese", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  const parts = fmt.formatToParts(d);
  const year = Number(parts.find(p => p.type === "year")?.value);
  const monthRaw = parts.find(p => p.type === "month")?.value || "";
  const day = Number(parts.find(p => p.type === "day")?.value);

  const isLeap =
    /윤/.test(monthRaw) ||
    /bis/i.test(monthRaw) ||
    /\(윤\)/.test(monthRaw);

  const month = Number(String(monthRaw).replace(/[^0-9]/g, ""));

  const lunarYmd =
    `${String(year).padStart(4,"0")}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

  return { lunarYmd, isLeap, year, month, day, monthRaw };
}

// 양력 -> 음력
async function solarToLunar(solarYmd){
  const { lunarYmd, isLeap } = _solarToLunarParts(solarYmd);
  return { lunar: lunarYmd, isLeap };
}

// 음력 -> 양력 (역변환은 범위 브루트포스)
async function lunarToSolar(lunarYmd, isLeap=false){
  const [y] = lunarYmd.split("-").map(Number);

  const start = _ymdToDateSeoul(`${y-1}-01-01`);
  const end   = _ymdToDateSeoul(`${y+1}-12-31`);

  for(let cur = new Date(start); cur <= end; cur.setDate(cur.getDate()+1)){
    const solarYmd = _dateToYMDSeoul(cur);
    const p = _solarToLunarParts(solarYmd);
    if(p.lunarYmd === lunarYmd && p.isLeap === !!isLeap){
      return solarYmd;
    }
  }
  return "";
}

// BirthUtil 확장(필수 export)
window.BirthUtil = window.BirthUtil || {};

// ✅ 입춘/띠/갑자 기능 export
window.BirthUtil.loadIpchunDB = loadIpchunDB;
window.BirthUtil.resolveZodiacYearByIpchun = resolveZodiacYearByIpchun;
window.BirthUtil.calcZodiacByIpchun = calcZodiacByIpchun;
window.BirthUtil.calcGapjaByIpchun = calcGapjaByIpchun;

// ✅ 음력<->양력 변환 export
window.BirthUtil.lunarToSolar = lunarToSolar;
window.BirthUtil.solarToLunar = solarToLunar;

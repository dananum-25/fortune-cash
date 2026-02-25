/* =========================================
   BIRTH UTIL (birth.js)
   - 입춘 DB 기반 띠 계산
   - 육십갑자(년주) 계산
   - (A) 음력 변환은 제거/미사용
========================================= */

window.IPCHUN_DB_URL = "/data/ipchun_db.json";
window.__IPCHUN_DB__ = null;

/* 양력 YYYY-MM-DD -> Date(로컬) */
function parseYmdToDate(ymd){
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(ymd || "").trim());
  if(!m) return null;
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  return new Date(y, mo-1, d); // ✅ 로컬 기준
}

/* ✅ DB 값이 "MM-DD" 또는 "YYYY-MM-DD" 둘 다 올 수 있음 */
function parseIpchunToMonthDay(v){
  const s = String(v || "").trim();
  if(!s) return { mm:2, dd:4 };

  const parts = s.split("-").map(n => Number(n));
  if(parts.length === 2){
    return { mm: parts[0] || 2, dd: parts[1] || 4 };
  }
  if(parts.length === 3){
    // YYYY-MM-DD
    return { mm: parts[1] || 2, dd: parts[2] || 4 };
  }
  return { mm:2, dd:4 };
}

/* 입춘: 해당 연도의 Date로 */
function getIpchunDateOfYear(year){
  const raw = (window.__IPCHUN_DB__ && window.__IPCHUN_DB__[String(year)]) || "02-04";
  const { mm, dd } = parseIpchunToMonthDay(raw);
  return new Date(year, (mm||2)-1, (dd||4));
}

/* 입춘 DB 로드 (1회만) */
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

/* ✅ 입춘 기준 "띠의 기준 연도" (입춘 전이면 전년도) */
function resolveZodiacYearByIpchun(birthYmd){
  const dt = parseYmdToDate(birthYmd);
  if(!dt) return null;

  const y = dt.getFullYear();
  const ip = getIpchunDateOfYear(y);
  return (dt < ip) ? (y - 1) : y;
}

/* ✅ 띠 계산 (입춘 기준) */
function calcZodiacByIpchun(birthYmd){
  const zodiacYear = resolveZodiacYearByIpchun(birthYmd);
  if(!zodiacYear) return "";

  const animals = ["쥐","소","호랑이","토끼","용","뱀","말","양","원숭이","닭","개","돼지"];
  // 기준: 2020=쥐
  return animals[(zodiacYear - 2020 + 120) % 12];
}

/* ✅ 육십갑자(년주) 계산 (입춘 기준 연도 사용) - 1984=갑자 */
function calcGapjaByIpchun(birthYmd){
  const zodiacYear = resolveZodiacYearByIpchun(birthYmd);
  if(!zodiacYear) return "";

  const stems = ["갑","을","병","정","무","기","경","신","임","계"];
  const branches = ["자","축","인","묘","진","사","오","미","신","유","술","해"];

  const idx = ((zodiacYear - 1984) % 60 + 60) % 60;
  return stems[idx % 10] + branches[idx % 12] + "년";
}

window.BirthUtil = {
  loadIpchunDB,
  calcZodiacByIpchun,
  calcGapjaByIpchun,
  resolveZodiacYearByIpchun
};

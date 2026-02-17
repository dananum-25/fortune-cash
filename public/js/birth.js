/* =========================================
   BIRTH UTIL (birth.js)
   - 입춘 DB 기반 띠 계산
   - 육십갑자(년주) 계산
========================================= */

window.IPCHUN_DB_URL = "/data/ipchun_db.json";
window.__IPCHUN_DB__ = null;

/* 양력 YYYY-MM-DD -> Date(로컬) */
function parseYmdToDate(ymd){
  const [y,m,d] = String(ymd || "").split("-").map(Number);
  if(!y || !m || !d) return null;
  return new Date(y, m-1, d);
}

/* 입춘: 해당 연도 "02-03" 같은 MM-DD를 Date로 */
function getIpchunDateOfYear(year){
  // DB가 아직 없으면 안전 기본값: 2/4
  const mmdd = (window.__IPCHUN_DB__ && window.__IPCHUN_DB__[String(year)]) || "02-04";
  const [mm,dd] = String(mmdd).split("-").map(Number);
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

/* ✅ 입춘 기준 "띠의 기준 연도"를 확정 (입춘 전이면 전년도) */
function resolveZodiacYearByIpchun(birthYmd){
  const dt = parseYmdToDate(birthYmd);
  if(!dt) return null;

  const y = dt.getFullYear();
  const ip = getIpchunDateOfYear(y);

  // 생일 < 입춘 이면 띠 기준연도는 y-1
  return (dt < ip) ? (y - 1) : y;
}

/* ✅ 띠 계산 (입춘 기준) */
function calcZodiacByIpchun(birthYmd){
  const zodiacYear = resolveZodiacYearByIpchun(birthYmd);
  if(!zodiacYear) return "";

  const animals = ["쥐","소","호랑이","토끼","용","뱀","말","양","원숭이","닭","개","돼지"];

  // 기준: 2020=쥐 (기존 너 DB 규칙과 동일)
  return animals[(zodiacYear - 2020 + 120) % 12];
}

/* ✅ 육십갑자(년주) 계산 (입춘 기준 연도 사용)
   기준: 1984 = 갑자
*/
function calcGapjaByIpchun(birthYmd){
  const zodiacYear = resolveZodiacYearByIpchun(birthYmd);
  if(!zodiacYear) return "";

  const stems = ["갑","을","병","정","무","기","경","신","임","계"];
  const branches = ["자","축","인","묘","진","사","오","미","신","유","술","해"];

  const idx = ((zodiacYear - 1984) % 60 + 60) % 60;
  return stems[idx % 10] + branches[idx % 12];
}

/* 전역으로 쓰기 쉽게 */
window.BirthUtil = {
  loadIpchunDB,
  calcZodiacByIpchun,
  calcGapjaByIpchun,
  resolveZodiacYearByIpchun
};

/* =========================================
   BIRTH UTIL (birth.js)
   - 입춘 DB 기반 띠 계산
   - 육십갑자(년주) 계산
   - (추가) 음력→양력 변환 훅(lunarToSolar) 제공
   - (개선) Date객체 비교 제거(타임존 이슈 방지)
========================================= */

window.IPCHUN_DB_URL = "/data/ipchun_db.json";
window.__IPCHUN_DB__ = null;

/* YYYY-MM-DD 파싱 -> {y,m,d} */
function parseYmd(ymd){
  const m = String(ymd || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!m) return null;
  return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
}

/* MM-DD 파싱 -> {m,d} */
function parseMmdd(mmdd){
  const m = String(mmdd || "").match(/^(\d{2})-(\d{2})$/);
  if(!m) return null;
  return { m: Number(m[1]), d: Number(m[2]) };
}

/* 날짜 비교(연-월-일) -> 숫자키 */
function ymdKey(y, m, d){
  return (y * 10000) + (m * 100) + d;
}

/* 입춘: 해당 연도 "MM-DD" */
function getIpchunMmddOfYear(year){
  // DB가 아직 없으면 기본값: 02-04
  return (window.__IPCHUN_DB__ && window.__IPCHUN_DB__[String(year)]) || "02-04";
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

/* ✅ 입춘 기준 "띠/년주의 기준 연도" 확정 (입춘 전이면 전년도) */
function resolveZodiacYearByIpchun(birthYmd){
  const dt = parseYmd(birthYmd);
  if(!dt) return null;

  const ipMmdd = parseMmdd(getIpchunMmddOfYear(dt.y));
  if(!ipMmdd) return dt.y;

  // 같은 연도에서, 생일이 입춘보다 "이전"이면 전년도 기준
  const birthK = ymdKey(dt.y, dt.m, dt.d);
  const ipK    = ymdKey(dt.y, ipMmdd.m, ipMmdd.d);

  return (birthK < ipK) ? (dt.y - 1) : dt.y;
}

/* ✅ 띠 계산 (입춘 기준) */
function calcZodiacByIpchun(birthYmd){
  const zodiacYear = resolveZodiacYearByIpchun(birthYmd);
  if(!zodiacYear) return "";

  const animals = ["쥐","소","호랑이","토끼","용","뱀","말","양","원숭이","닭","개","돼지"];
  // 기준: 2020=쥐
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
  return stems[idx % 10] + branches[idx % 12] + "년";
}

/* =========================================
   ✅ (추가) 음력 → 양력 변환 훅
   - 기본은 "함수 없음" 상태로 두면 auth.js에서 경고가 뜸
   - 아래 2번 안내대로 라이브러리 붙이면 실제 변환 가능
========================================= */

function lunarToSolar(lunarYmd){
  // 구현 전: 그대로 반환(= 음력 변환 미적용)
  // auth.js에서 lunar 선택 시 이 함수가 "실제 변환"을 하도록 만드는 게 목표
  return lunarYmd;
}

window.BirthUtil = {
  loadIpchunDB,
  calcZodiacByIpchun,
  calcGapjaByIpchun,
  resolveZodiacYearByIpchun,
  lunarToSolar
};

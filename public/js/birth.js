/* =========================================
   BIRTH UTIL (birth.js)
   - (1) 입력: 양력 YYYY-MM-DD
   - (2) 음력 변환: lunar.js 사용(있으면)
   - (3) 띠/간지(년주): "입춘 기준 연도"로 계산
========================================= */

window.IPCHUN_DB_URL = "/data/ipchun_db.json";
window.__IPCHUN_DB__ = null;

/* 양력 YYYY-MM-DD -> Date(로컬) */
function parseYmdToDate(ymd){
  const [y,m,d] = String(ymd || "").split("-").map(Number);
  if(!y || !m || !d) return null;
  return new Date(y, m-1, d);
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

/* DB 값이 "MM-DD" 또는 "YYYY-MM-DD" 둘 다 허용 */
function getIpchunDateOfYear(year){
  const raw = (window.__IPCHUN_DB__ && window.__IPCHUN_DB__[String(year)]) || "02-04";

  // raw가 YYYY-MM-DD면 그대로 사용
  if(/^\d{4}-\d{2}-\d{2}$/.test(raw)){
    return parseYmdToDate(raw);
  }

  // raw가 MM-DD면 year 붙여서 사용
  const [mm, dd] = String(raw).split("-").map(Number);
  return new Date(year, (mm||2)-1, (dd||4));
}

/* ✅ 입춘 기준 "띠/간지 기준 연도" 확정 (입춘 전이면 전년도) */
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

/* ✅ 육십갑자(년주) 계산 (입춘 기준)
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

/* ✅ (옵션) lunar.js가 있으면 음력도 같이 뽑아줌 */
function calcLunarYmdIfAvailable(solarYmd){
  try{
    // 라이브러리마다 API가 조금 다를 수 있어서 “있으면 쓰고 없으면 빈값”
    // 가장 안전하게: demo.html에 있는 사용 예가 있으면 그 API로 맞춰주면 됨.
    if(typeof Solar !== "undefined" && Solar.fromYmd){
      const [y,m,d] = solarYmd.split("-").map(Number);
      const solar = Solar.fromYmd(y,m,d);
      const lunar = solar.getLunar?.();
      if(lunar && lunar.getYear && lunar.getMonth && lunar.getDay){
        const yy = lunar.getYear();
        const mm = String(lunar.getMonth()).padStart(2,"0");
        const dd = String(lunar.getDay()).padStart(2,"0");
        return `${yy}-${mm}-${dd}`;
      }
    }
  }catch(e){}
  return "";
}

window.BirthUtil = {
  loadIpchunDB,
  calcZodiacByIpchun,
  calcGapjaByIpchun,
  resolveZodiacYearByIpchun,
  calcLunarYmdIfAvailable
};

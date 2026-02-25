/* =========================================
   BIRTH UTIL (birth.js)
   - 입춘 DB 기반 띠 계산
   - 육십갑자(년주) 계산
   - (추가) 음력 -> 양력 변환 어댑터: BirthUtil.lunarToSolar()
========================================= */

window.IPCHUN_DB_URL = "/data/ipchun_db.json";
window.__IPCHUN_DB__ = null;

/* 양력 YYYY-MM-DD -> Date(로컬) */
function parseYmdToDate(ymd){
  const [y,m,d] = String(ymd || "").split("-").map(Number);
  if(!y || !m || !d) return null;
  return new Date(y, m-1, d); // ✅ 로컬 기준
}

/* Date -> YYYY-MM-DD */
function dateToYmdLocal(dt){
  if(!dt || Number.isNaN(dt.getTime())) return "";
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth()+1).padStart(2,"0");
  const dd = String(dt.getDate()).padStart(2,"0");
  return `${yyyy}-${mm}-${dd}`;
}

/* 입춘: 해당 연도 "MM-DD"를 Date로 */
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

/* ✅ 입춘 기준 "띠의 기준 연도" 확정 (입춘 전이면 전년도) */
function resolveZodiacYearByIpchun(solarBirthYmd){
  const dt = parseYmdToDate(solarBirthYmd);
  if(!dt) return null;

  const y = dt.getFullYear();
  const ip = getIpchunDateOfYear(y);

  // 생일 < 입춘 이면 띠 기준연도는 y-1
  return (dt < ip) ? (y - 1) : y;
}

/* ✅ 띠 계산 (입춘 기준) */
function calcZodiacByIpchun(solarBirthYmd){
  const zodiacYear = resolveZodiacYearByIpchun(solarBirthYmd);
  if(!zodiacYear) return "";

  const animals = ["쥐","소","호랑이","토끼","용","뱀","말","양","원숭이","닭","개","돼지"];
  // 기준: 2020=쥐
  return animals[(zodiacYear - 2020 + 120) % 12];
}

/* ✅ 육십갑자(년주) 계산 (입춘 기준 연도 사용)
   기준: 1984 = 갑자
*/
function calcGapjaByIpchun(solarBirthYmd){
  const zodiacYear = resolveZodiacYearByIpchun(solarBirthYmd);
  if(!zodiacYear) return "";

  const stems = ["갑","을","병","정","무","기","경","신","임","계"];
  const branches = ["자","축","인","묘","진","사","오","미","신","유","술","해"];

  const idx = ((zodiacYear - 1984) % 60 + 60) % 60;
  return stems[idx % 10] + branches[idx % 12] + "년";
}

/* =========================================================
   ✅ 음력 -> 양력 변환 (핵심)
   - lunar.js가 어떤 구현인지(라이브러리마다 API가 다름) 몰라도
     "자동 감지(adapter)"로 최대한 지원
   - 반환: "YYYY-MM-DD" (양력)
   - 윤달(isLeap) 지원: 기본 false (UI에 윤달 옵션 없으면 그대로 둬도 됨)
========================================================= */

function lunarToSolar(lunarYmd, isLeap=false){
  // 입력 검증
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(lunarYmd || "").trim());
  if(!m) throw new Error("lunarToSolar: invalid ymd (need YYYY-MM-DD)");
  const y = Number(m[1]), mo = Number(m[2]), da = Number(m[3]);

  // 1) LunarSolarConverter 계열 (중국/한국 변환기에서 자주 나옴)
  //    예: converter.lunarToSolar(y, m, d, isLeap) -> {year,month,day}
  const conv = window.LunarSolarConverter || window.lunarSolarConverter;
  if(conv){
    const fn =
      conv.lunarToSolar ||
      conv.LunarToSolar ||
      conv.lunar2solar ||
      conv.lunarToGregorian;

    if(typeof fn === "function"){
      const out = fn.call(conv, y, mo, da, !!isLeap);
      if(out && (out.year || out.y) && (out.month || out.m) && (out.day || out.d)){
        const oy = out.year || out.y;
        const om = out.month || out.m;
        const od = out.day || out.d;
        return `${String(oy).padStart(4,"0")}-${String(om).padStart(2,"0")}-${String(od).padStart(2,"0")}`;
      }
    }
  }

  // 2) 전역 함수형 (브라우저 변환 스니펫에서 흔함)
  //    예: window.lunar2solar(y,m,d,isLeap) -> {cYear,cMonth,cDay} 등
  if(typeof window.lunar2solar === "function"){
    const out = window.lunar2solar(y, mo, da, !!isLeap);
    if(out){
      const oy = out.cYear || out.year || out.y;
      const om = out.cMonth || out.month || out.m;
      const od = out.cDay || out.day || out.d;
      if(oy && om && od){
        return `${String(oy).padStart(4,"0")}-${String(om).padStart(2,"0")}-${String(od).padStart(2,"0")}`;
      }
    }
  }

  // 3) 6tail/lunar-javascript 계열 추정 (window.Lunar / window.Solar 객체가 있는 경우가 많음)
  //    API는 배포본마다 다르므로 최대한 방어적으로 시도
  try{
    if(window.Lunar && window.Solar){
      // 후보: Solar.fromYmd(y,m,d) / Lunar.fromYmd(y,m,d)
      if(typeof window.Lunar.fromYmd === "function"){
        const lunarObj = window.Lunar.fromYmd(y, mo, da); // 윤달 미지원일 수 있음
        if(lunarObj && typeof lunarObj.getSolar === "function"){
          const solarObj = lunarObj.getSolar();
          if(solarObj && typeof solarObj.toYmd === "function"){
            return solarObj.toYmd();
          }
        }
      }
    }
  }catch(e){}

  // 여기까지 왔으면 변환 실패 = 라이브러리 API가 다르거나 파일이 없음
  throw new Error(
    "lunarToSolar: lunar.js API를 감지하지 못했습니다. " +
    "현재 /js/lib/lunar.js가 어떤 라이브러리인지 확인이 필요합니다."
  );
}

/* (선택) 양력 -> 음력도 필요하면 나중에 붙일 수 있음 */
// function solarToLunar(solarYmd){ ... }

/* 전역으로 쓰기 쉽게 */
window.BirthUtil = {
  loadIpchunDB,
  calcZodiacByIpchun,
  calcGapjaByIpchun,
  resolveZodiacYearByIpchun,
  lunarToSolar // ✅ auth.js가 이걸 찾음
};

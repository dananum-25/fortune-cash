// ==============================
// LUNAR DB (offline optimized)
// ==============================

let __LUNAR_DB__ = null;
let __LUNAR_REV__ = null;

// DB 1회 로드 + 역맵 생성
async function loadLunarDB(){
  if(__LUNAR_DB__) return __LUNAR_DB__;

  const res = await fetch("/data/lunar_map.json", { cache: "force-cache" });
  __LUNAR_DB__ = await res.json();

  const map = __LUNAR_DB__.map || {};

  // 🔥 역방향 인덱스 생성 (속도 개선)
  __LUNAR_REV__ = {};
  for(const solar in map){
    const value = map[solar];          // "YYYY-MM-DD|0"
    __LUNAR_REV__[value] = solar;      // "lunar|leap" -> solar
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

  return {
    lunar: lun,
    isLeap: leap === "1"
  };
}

// BirthUtil 확장
window.BirthUtil = window.BirthUtil || {};
window.BirthUtil.lunarToSolar = lunarToSolar;
window.BirthUtil.solarToLunar = solarToLunar;

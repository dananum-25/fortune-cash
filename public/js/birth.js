// ==============================
// LUNAR DB (offline)
// ==============================

let __LUNAR_DB__ = null;

async function loadLunarDB(){
  if(__LUNAR_DB__) return __LUNAR_DB__;
  const res = await fetch("/data/lunar_map.json", { cache: "force-cache" });
  __LUNAR_DB__ = await res.json();
  return __LUNAR_DB__;
}

// 음력 → 양력
// lunarYmd: "YYYY-MM-DD"
// isLeap: boolean
async function lunarToSolar(lunarYmd, isLeap=false){
  const db = await loadLunarDB();
  const map = db.map || {};

  // DB 저장형식: solarYmd -> "lunarYmd|leap"
  // 그래서 reverse lookup 필요

  for(const solar in map){
    const value = map[solar];
    const [lun, leap] = value.split("|");

    if(lun === lunarYmd && Number(leap) === (isLeap ? 1 : 0)){
      return solar;
    }
  }

  return "";
}

// 양력 → 음력
async function solarToLunar(solarYmd){
  const db = await loadLunarDB();
  const map = db.map || {};
  const value = map[solarYmd];
  if(!value) return null;

  const [lun, leap] = value.split("|");

  return {
    lunar: lun,
    isLeap: leap === "1"
  };
}

window.BirthUtil = window.BirthUtil || {};
window.BirthUtil.lunarToSolar = lunarToSolar;
window.BirthUtil.solarToLunar = solarToLunar;

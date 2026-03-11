// /js/astro/core/astro.utils.js

export function escapeHtml(s){
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function clamp(value, min, max){
  const n = Number(value);
  if(Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

export function normalizeYmd(v){
  const s = String(v || "").trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : "";
}

export function normalizeHm(v){
  const s = String(v || "").trim();
  const m = s.match(/^(\d{1,2}):(\d{2})$/);
  if(!m) return "";
  const hh = String(Math.min(23, Math.max(0, Number(m[1])))).padStart(2, "0");
  const mm = String(Math.min(59, Math.max(0, Number(m[2])))).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function parseBirthParts(ymd, hm = "12:00"){
  const y = normalizeYmd(ymd);
  const t = normalizeHm(hm) || "12:00";

  const m1 = y.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const m2 = t.match(/^(\d{2}):(\d{2})$/);

  if(!m1 || !m2) return null;

  return {
    year: Number(m1[1]),
    month: Number(m1[2]),
    day: Number(m1[3]),
    hour: Number(m2[1]),
    minute: Number(m2[2]),
    ymd: y,
    hm: t
  };
}

export function toSeedFromBirth(ymd, hm = "12:00"){
  const p = parseBirthParts(ymd, hm);
  if(!p) return 194001011200;
  return Number(`${p.year}${String(p.month).padStart(2,"0")}${String(p.day).padStart(2,"0")}${String(p.hour).padStart(2,"0")}${String(p.minute).padStart(2,"0")}`);
}

export function seededPick(arr, seed, offset = 0){
  if(!Array.isArray(arr) || arr.length === 0) return "";
  const idx = Math.abs((Number(seed) + Number(offset)) % arr.length);
  return arr[idx] || "";
}

export function getCurrentYear(){
  return (
    window.FortuneConfig?.year ||
    window.APP_CONFIG?.fortuneYear ||
    new Date().getFullYear()
  );
}

export function getTodayStamp(){
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

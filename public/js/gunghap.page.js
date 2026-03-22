let gunghapDB = null;
import { calculateGunghapV2 } from "/js/gunghap.v2.engine.js";
import { loadGunghapDB, buildGunghapDbInterpretation } from "/js/gunghap.db.engine.js";

const $ = (id) => document.getElementById(id);

function fillTimeOptions(hourId, minuteId){
  const hourSel = $(hourId);
  const minuteSel = $(minuteId);

  for(let h = 0; h <= 23; h++){
    const opt = document.createElement("option");
    opt.value = String(h);
    opt.textContent = `${String(h).padStart(2, "0")}시`;
    if(h === 12) opt.selected = true;
    hourSel.appendChild(opt);
  }

  for(let m = 0; m <= 59; m++){
    const opt = document.createElement("option");
    opt.value = String(m);
    opt.textContent = `${String(m).padStart(2, "0")}분`;
    if(m === 0) opt.selected = true;
    minuteSel.appendChild(opt);
  }
}

async function ensureGunghapDBLoaded(){
  if(gunghapDB) return gunghapDB;
  gunghapDB = await loadGunghapDB();
  return gunghapDB;
}

function renderList(id, items){
  const el = $(id);
  el.innerHTML = "";

  const arr = Array.isArray(items) ? items : [];
  if(!arr.length){
    const li = document.createElement("li");
    li.textContent = "내용 없음";
    el.appendChild(li);
    return;
  }

  arr.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    el.appendChild(li);
  });
}

function setText(id, value){
  const el = $(id);
  if(!el) return;
  el.textContent = value ?? "";
}

function formatPillars(pillars){
  if(!pillars) return "-";
  return [
    `연주 ${pillars.year || "-"}`,
    `월주 ${pillars.month || "-"}`,
    `일주 ${pillars.day || "-"}`,
    `시주 ${pillars.hour || "-"}`
  ].join(" / ");
}

function formatCrossRelations(relations){
  if(!Array.isArray(relations) || !relations.length) return "중립";
  return relations.map(v => `${v.a}-${v.b} ${v.label}`).join(", ");
}

function formatArray(arr){
  return Array.isArray(arr) && arr.length ? arr.join(", ") : "없음";
}

function formatJijanganMain(info, fallbackLabel){
  if(!info){
    return fallbackLabel || "내용 없음";
  }

  const stem = info.aMain || info.bMain || "";
  if(!stem){
    return fallbackLabel || "내용 없음";
  }

  return stem;
}

function renderResult(result, nameA, nameB, dbInterp){
  const aTitle = nameA || "첫 번째 사람";
  const bTitle = nameB || "두 번째 사람";

  setText("resultTitle", `${aTitle} × ${bTitle} 궁합`);
  const summaryParts = [];

if (dbInterp?.score?.summary) summaryParts.push(...dbInterp.score.summary);
if (dbInterp?.dayBranch?.summary) summaryParts.push(...dbInterp.dayBranch.summary);
if (dbInterp?.jijangan?.summary) summaryParts.push(...dbInterp.jijangan.summary);

if (Array.isArray(dbInterp?.special)) {
  dbInterp.special.forEach((item) => {
    if (item?.summary) summaryParts.push(...item.summary);
  });
}

setText(
  "resultSummary",
  summaryParts.length
    ? summaryParts.join(" ")
    : (result?.relation?.scoreSummary?.summary || "")
);

  setText("personATitle", aTitle);
  setText("personBTitle", bTitle);

  setText("personAPillars", formatPillars(result?.personA?.pillars));
  setText("personBPillars", formatPillars(result?.personB?.pillars));

  setText("dayStemRel", result?.relation?.dayStemRelation?.label || "-");
  setText("dayBranchRel", result?.relation?.dayBranchRelation?.label || "-");
  setText("fiveRel", formatCrossRelations(result?.relation?.crossRelations));
  setText(
    "totalScore",
    `${result?.relation?.totalScore ?? 0}점 / ${result?.relation?.scoreSummary?.label || "-"}`
  );

  setText(
    "aJijanganMain",
    result?.relation?.jijanganInfo?.aMain
      ? `${result.relation.jijanganInfo.aMain}`
      : "내용 없음"
  );

  setText(
    "bJijanganMain",
    result?.relation?.jijanganInfo?.bMain
      ? `${result.relation.jijanganInfo.bMain}`
      : "내용 없음"
  );

  setText(
    "sharedExtraSinsal",
    formatArray(result?.relation?.sinsalInfo?.sharedExtra)
  );

  setText(
    "aExtraSinsal",
    formatArray(result?.relation?.sinsalInfo?.aExtra)
  );

  setText(
    "bExtraSinsal",
    formatArray(result?.relation?.sinsalInfo?.bExtra)
  );

  const a12 = result?.relation?.sinsalInfo?.a12;
  const b12 = result?.relation?.sinsalInfo?.b12;

  const sinsalHint = [
    a12?.연지?.sinsal ? `A 연지 ${a12.연지.sinsal}` : "",
    a12?.월지?.sinsal ? `A 월지 ${a12.월지.sinsal}` : "",
    b12?.연지?.sinsal ? `B 연지 ${b12.연지.sinsal}` : "",
    b12?.월지?.sinsal ? `B 월지 ${b12.월지.sinsal}` : ""
  ].filter(Boolean).join(" / ");

  setText("sinsalHint", sinsalHint || "내용 없음");

  const adviceList = [
  ...(result?.advice || []),
  ...(dbInterp?.score?.advice || []),
  ...(dbInterp?.dayBranch?.advice || []),
  ...(dbInterp?.jijangan?.advice || [])
];

if (Array.isArray(dbInterp?.special)) {
  dbInterp.special.forEach((item) => {
    if (item?.advice) adviceList.push(...item.advice);
  });
}

renderList("adviceList", adviceList);
  $("resultWrap").classList.remove("hidden");
}

$("gunghapForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nameA = $("nameA").value.trim();
  const nameB = $("nameB").value.trim();

  const personA = {
    ymd: $("birthDateA").value,
    gender: $("genderA").value,
    hour: Number($("hourA").value || 12),
    minute: Number($("minuteA").value || 0)
  };

  const personB = {
    ymd: $("birthDateB").value,
    gender: $("genderB").value,
    hour: Number($("hourB").value || 12),
    minute: Number($("minuteB").value || 0)
  };

  const result = calculateGunghapV2(personA, personB);
  if(!result) return;

  const db = await ensureGunghapDBLoaded();
  const dbInterp = buildGunghapDbInterpretation(db, result);

  renderResult(result, nameA, nameB, dbInterp);
});

fillTimeOptions("hourA", "minuteA");
fillTimeOptions("hourB", "minuteB");

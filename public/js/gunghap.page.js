import { calculateGunghapV2 } from "/js/gunghap.v2.engine.js";

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

function renderResult(result, nameA, nameB){
  $("resultTitle").textContent = `${nameA || "첫 번째 사람"} × ${nameB || "두 번째 사람"} 궁합`;
  $("resultSummary").textContent = result?.relation?.scoreSummary?.summary || "";

  $("dayStemRel").textContent = result?.relation?.dayStemRelation?.label || "-";
$("dayBranchRel").textContent = result?.relation?.dayBranchRelation?.label || "-";

const crossText = Array.isArray(result?.relation?.crossRelations) && result.relation.crossRelations.length
  ? result.relation.crossRelations.map(v => `${v.a}-${v.b} ${v.label}`).join(", ")
  : "중립";

$("fiveRel").textContent = crossText;

  renderList("adviceList", result?.advice || []);
  $("resultWrap").classList.remove("hidden");
}

$("gunghapForm").addEventListener("submit", (e) => {
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

  renderResult(result, nameA, nameB);
});

fillTimeOptions("hourA", "minuteA");
fillTimeOptions("hourB", "minuteB");

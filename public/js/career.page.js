import { calculateCareerResult } from "/js/career.engine.js";

const $ = (id) => document.getElementById(id);

function fillTimeOptions(){
  const hourSel = $("birthHour");
  const minuteSel = $("birthMinute");

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

function setText(id, value){
  const el = $(id);
  if(!el) return;
  el.textContent = value ?? "";
}

function renderResult(result, userName){
  const title = userName ? `${userName}님의 직업 적성 결과` : "직업 적성 결과";
  setText("resultTitle", title);

  const summaryParts = [];
  if(result?.career?.typeMessage?.summary){
    summaryParts.push(...result.career.typeMessage.summary);
  }
  if(result?.career?.strengthMessage?.summary){
    summaryParts.push(...result.career.strengthMessage.summary);
  }
  if(result?.career?.extraHints){
    summaryParts.push(...result.career.extraHints);
  }

  setText("resultSummary", summaryParts.join(" "));
  setText("mainTenGod", result?.career?.mainTenGod || "-");
  setText("careerType", result?.career?.careerType || "-");
  setText("strengthLabel", result?.career?.strengthLabel || "-");
  setText("fiveElementHint", result?.career?.fiveElementHint || "-");

  renderList("jobList", result?.career?.typeMessage?.jobs || []);

  const advice = [
    ...(result?.career?.typeMessage?.advice || []),
    ...(result?.career?.strengthMessage?.summary || [])
  ];

  renderList("adviceList", advice);
  $("resultWrap").classList.remove("hidden");
}

$("careerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const userName = $("userName").value.trim();

  const input = {
    ymd: $("birthDate").value,
    gender: $("gender").value,
    hour: Number($("birthHour").value || 12),
    minute: Number($("birthMinute").value || 0)
  };

  const result = await calculateCareerResult(input);
  if(!result) return;

  renderResult(result, userName);
});

fillTimeOptions();

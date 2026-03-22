import { calculateSajuLegacyCompat } from "/js/saju.compat.engine.js";

const $ = (id) => document.getElementById(id);

const form = $("sajuForm");
const errorBox = $("errorBox");
const resultWrap = $("resultWrap");

function fillSelectOptions() {
  const hourSel = $("birthHour");
  const minuteSel = $("birthMinute");

  for (let h = 0; h <= 23; h++) {
    const opt = document.createElement("option");
    opt.value = String(h);
    opt.textContent = `${String(h).padStart(2, "0")}시`;
    if (h === 12) opt.selected = true;
    hourSel.appendChild(opt);
  }

  for (let m = 0; m <= 59; m++) {
    const opt = document.createElement("option");
    opt.value = String(m);
    opt.textContent = `${String(m).padStart(2, "0")}분`;
    if (m === 0) opt.selected = true;
    minuteSel.appendChild(opt);
  }
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

function hideError() {
  errorBox.textContent = "";
  errorBox.classList.add("hidden");
}

function setText(id, value) {
  $(id).textContent = value ?? "";
}

function renderList(id, items) {
  const el = $(id);
  el.innerHTML = "";

  const arr = Array.isArray(items) ? items : [];
  if (arr.length === 0) {
    const li = document.createElement("li");
    li.textContent = "내용 없음";
    el.appendChild(li);
    return;
  }

  arr.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    el.appendChild(li);
  });
}

function renderResult(result) {
  setText("yearPillar", result?.saju?.year);
  setText("monthPillar", result?.saju?.month);
  setText("dayPillar", result?.saju?.day);
  setText("hourPillar", result?.saju?.hour);

  setText(
    "dayMaster",
    `${result?.dayMaster?.stem || ""} (${result?.dayMaster?.element || ""}, ${result?.dayMaster?.yinYang || ""})`
  );

  setText(
    "monthBranch",
    `${result?.monthBranch?.branch || ""} (${result?.monthBranch?.element || ""})`
  );

  const tg = result?.tenGods || {};
  setText(
    "tenGods",
    `연간 ${tg.year || "-"} / 월간 ${tg.month || "-"} / 일간 ${tg.day || "-"} / 시간 ${tg.hour || "-"}`
  );

  const fe = result?.fiveElements || {};
  setText(
    "fiveElements",
    `목 ${fe.wood ?? 0} · 화 ${fe.fire ?? 0} · 토 ${fe.earth ?? 0} · 금 ${fe.metal ?? 0} · 수 ${fe.water ?? 0}`
  );

  const daewoon = result?.daewoon || {};
  setText(
    "daewoonMeta",
    `방향: ${daewoon.direction || "-"} / 시작나이: ${daewoon.startAge ?? "-"} / 기준: ${daewoon.precision || "-"}`
  );

  renderList(
    "daewoonList",
    Array.isArray(daewoon.list) ? daewoon.list.map(v => v.label) : []
  );

  setText("summaryText", result?.text?.summary || "");
  renderList("strengthList", result?.text?.strengths || []);
  renderList("cautionList", result?.text?.cautions || []);
  renderList("adviceList", result?.text?.advice || []);

  resultWrap.classList.remove("hidden");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  hideError();

  const ymd = $("birthDate").value;
  const gender = $("gender").value;
  const hour = Number($("birthHour").value || 12);
  const minute = Number($("birthMinute").value || 0);

  if (!ymd) {
    showError("생년월일을 입력해 주세요.");
    return;
  }

  if (!gender) {
    showError("성별을 선택해 주세요.");
    return;
  }

  try {
    const result = calculateSajuLegacyCompat({
      ymd,
      hour,
      minute,
      gender
    });

    if (!result) {
      showError("사주 결과를 계산하지 못했습니다.");
      return;
    }

    renderResult(result);
  } catch (err) {
    console.error(err);
    showError(err?.message || "분석 중 오류가 발생했습니다.");
  }
});

fillSelectOptions();

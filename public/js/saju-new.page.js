import { calculateSajuResultV2 } from "/js/saju.result.v2.engine.js";
import { loadMyeongriDB, buildDbInterpretation } from "/js/myeongri.db.engine.js";
import { summarize12Sinsal } from "/js/sinsal12.engine.js";

const $ = (id) => document.getElementById(id);

const form = $("sajuForm");
const errorBox = $("errorBox");
const resultWrap = $("resultWrap");
const shareBtn = $("shareBtn");

let myeongriDB = null;

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
  const el = $(id);
  if (!el) return;
  el.textContent = value ?? "";
}

function renderList(id, items) {
  const el = $(id);
  if (!el) return;

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

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildDbSummaryText(dbInterp) {
  const lines = [];

  if (dbInterp?.dayMaster?.summary) {
    lines.push(...safeArray(dbInterp.dayMaster.summary));
  }

  if (dbInterp?.tenGod?.summary) {
    lines.push(...safeArray(dbInterp.tenGod.summary));
  }

  if (dbInterp?.strength?.summary) {
    lines.push(...safeArray(dbInterp.strength.summary));
  }

  if (Array.isArray(dbInterp?.sinsal12)) {
    dbInterp.sinsal12.forEach((item) => {
      if (item?.summary) lines.push(...safeArray(item.summary));
    });
  }

  if (dbInterp?.bridges?.flow) {
    lines.push(...safeArray(dbInterp.bridges.flow));
  }

  return lines.join(" ");
}

function buildDbStrengthList(dbInterp) {
  const list = [];

  if (dbInterp?.dayMaster?.title) list.push(dbInterp.dayMaster.title);
  if (dbInterp?.tenGod?.title) list.push(dbInterp.tenGod.title);
  if (dbInterp?.strength?.title) list.push(dbInterp.strength.title);

  return list;
}

function buildDbCautionList(dbInterp) {
  const list = [];

  if (dbInterp?.dayMaster?.caution) list.push(...safeArray(dbInterp.dayMaster.caution));
  if (dbInterp?.tenGod?.caution) list.push(...safeArray(dbInterp.tenGod.caution));
  if (dbInterp?.strength?.caution) list.push(...safeArray(dbInterp.strength.caution));

  if (Array.isArray(dbInterp?.habchung)) {
    dbInterp.habchung.forEach((item) => {
      if (item?.summary) list.push(...safeArray(item.summary));
    });
  }

  if (Array.isArray(dbInterp?.sinsal12)) {
    dbInterp.sinsal12.forEach((item) => {
      if (item?.caution) list.push(...safeArray(item.caution));
    });
  }

  return list;
}

function renderResult(result, dbInterp) {
  setText("yearPillar", result?.pillars?.year);
  setText("monthPillar", result?.pillars?.month);
  setText("dayPillar", result?.pillars?.day);
  setText("hourPillar", result?.pillars?.hour);

  setText(
    "dayMaster",
    `${result?.dayMaster?.stem || ""} (${result?.dayMaster?.element || ""})`
  );

  setText(
    "monthBranch",
    `${result?.monthBranch?.branch || ""} (${result?.monthBranch?.element || ""})`
  );

  const tg = result?.tenGods || {};
  setText(
    "tenGods",
    `연간 ${tg.yearStemTenGod || "-"} / 월간 ${tg.monthStemTenGod || "-"} / 일간 ${tg.dayStemTenGod || "-"} / 시간 ${tg.hourStemTenGod || "-"}`
  );

  const fe = result?.fiveElements || {};
  setText(
    "fiveElements",
    `목 ${fe["목"] ?? 0} · 화 ${fe["화"] ?? 0} · 토 ${fe["토"] ?? 0} · 금 ${fe["금"] ?? 0} · 수 ${fe["수"] ?? 0}`
  );

  const strengthLabel = result?.strength?.raw?.judgment?.label || "-";
  const strengthSummary = result?.strength?.summary?.summary || "";
  setText(
    "strengthInfo",
    `${strengthLabel}${strengthSummary ? " / " + strengthSummary : ""}`
  );

  const jijanganSummary = result?.jijangan?.summary || {};
  const jijanganText = [
    jijanganSummary?.year?.stem ? `연 ${jijanganSummary.year.stem}(${jijanganSummary.year.tenGod})` : "",
    jijanganSummary?.month?.stem ? `월 ${jijanganSummary.month.stem}(${jijanganSummary.month.tenGod})` : "",
    jijanganSummary?.day?.stem ? `일 ${jijanganSummary.day.stem}(${jijanganSummary.day.tenGod})` : "",
    jijanganSummary?.hour?.stem ? `시 ${jijanganSummary.hour.stem}(${jijanganSummary.hour.tenGod})` : ""
  ].filter(Boolean).join(" / ");

  setText("jijanganInfo", jijanganText || "내용 없음");

  const habchungSummary = Array.isArray(result?.habchung?.summary)
    ? result.habchung.summary.join(", ")
    : "";
  setText("habchungInfo", habchungSummary || "해당 없음");

  const sinsalSummary = summarize12Sinsal(result?.pillars);
  setText(
    "sinsalInfo",
    Array.isArray(sinsalSummary) && sinsalSummary.length
      ? sinsalSummary.join(" / ")
      : "내용 없음"
  );
  
  const daewoon = result?.daewoon || {};
  setText(
    "daewoonMeta",
    `방향: ${daewoon.direction || "-"} / 시작나이: ${daewoon.startAge ?? "-"} / 기준: ${daewoon.precision || "-"}`
  );

  renderList(
    "daewoonList",
    Array.isArray(daewoon.list)
      ? daewoon.list.map(v => `${v.ganji} (${v.fromAge}~${v.toAge})`)
      : []
  );

  const summaryText = buildDbSummaryText(dbInterp);
  const strengthList = buildDbStrengthList(dbInterp);
  const cautionList = buildDbCautionList(dbInterp);
  const adviceList = buildDbAdviceList(dbInterp, result);

  setText("summaryText", summaryText);
  renderList("strengthList", strengthList);
  renderList("cautionList", cautionList);
  renderList("adviceList", adviceList);

  resultWrap.classList.remove("hidden");
}

async function shareCurrentPage() {
  const shareData = {
    title: "정밀 사주 분석",
    text: "신규 명리 엔진 기반 사주 분석 페이지",
    url: window.location.href
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    alert("페이지 주소가 복사되었습니다.");
  } catch (err) {
    console.error(err);
    alert("공유에 실패했습니다.");
  }
}

async function ensureDBLoaded() {
  if (myeongriDB) return myeongriDB;
  myeongriDB = await loadMyeongriDB();
  return myeongriDB;
}

form.addEventListener("submit", async (e) => {
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
    const db = await ensureDBLoaded();

    const result = calculateSajuResultV2({
      ymd,
      hour,
      minute,
      gender
    });

    if (!result) {
      showError("사주 결과를 계산하지 못했습니다.");
      return;
    }

    const dbInterp = buildDbInterpretation(db, result);
    renderResult(result, dbInterp);
  } catch (err) {
    console.error(err);
    showError(err?.message || "분석 중 오류가 발생했습니다.");
  }
});

if (shareBtn) {
  shareBtn.addEventListener("click", shareCurrentPage);
}

fillSelectOptions();

import { calculateSajuResultV2 } from "/js/saju.result.v2.engine.js";
import { loadMyeongriDB, buildDbInterpretation } from "/js/myeongri.db.engine.js";
import { summarize12Sinsal } from "/js/sinsal12.engine.js";
import { calculateFlowInterpretation } from "/js/flow.engine.js";
import { hasVerifiedSolarTerm } from "/js/solarTerms.exact.db.js";

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

function buildFlowKeywordText(flow) {
  const parts = [];

  if (flow?.sewoonType) parts.push(`세운 ${flow.sewoonType}`);
  if (flow?.daewoonType) parts.push(`대운 ${flow.daewoonType}`);

  return parts.length ? parts.join(" / ") : "내용 없음";
}

function buildFlowSummary(message) {
  if (!message) return [];
  return [
    ...safeArray(message.summary)
  ];
}

function buildFlowAdvice(flow) {
  const list = [];

  if (flow?.sewoonMessage?.advice) {
    list.push(...safeArray(flow.sewoonMessage.advice));
  }

  if (flow?.daewoonMessage?.advice) {
    list.push(...safeArray(flow.daewoonMessage.advice));
  }

  return list;
}

function renderFlow(flow) {
  if (!flow) {
    setText("currentAge", "-");
    setText("currentSeWoon", "-");
    setText("currentDaewoon", "-");
    setText("flowKeywords", "내용 없음");
    renderList("sewoonSummaryList", []);
    renderList("daewoonSummaryList", []);
    renderList("flowAdviceList", []);
    return;
  }

  setText("currentAge", flow?.currentAge != null ? `${flow.currentAge}세` : "-");
  setText(
    "currentSeWoon",
    flow?.sewoon?.ganji ? `${flow.sewoon.ganji} (${flow.sewoon.year}년)` : "-"
  );
  setText(
    "currentDaewoon",
    flow?.currentDaewoon?.ganji
      ? `${flow.currentDaewoon.ganji} (${flow.currentDaewoon.fromAge}~${flow.currentDaewoon.toAge})`
      : "-"
  );

  setText("flowKeywords", buildFlowKeywordText(flow));
  renderList("sewoonSummaryList", buildFlowSummary(flow?.sewoonMessage));
  renderList("daewoonSummaryList", buildFlowSummary(flow?.daewoonMessage));
  renderList("flowAdviceList", buildFlowAdvice(flow));
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildResultTitle(name) {
  if (!name) return "사주 분석 결과";
  return `${name}님의 사주 분석 결과`;
}

function buildResultSubTitle({ birthPlace, ymd, hour, minute, gender }) {
  const parts = [];

  if (birthPlace) parts.push(`${birthPlace} 기준`);
  if (ymd) parts.push(ymd);
  parts.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
  if (gender) parts.push(gender);

  return parts.join(" / ");
}

async function buildPrecisionNotice(ymd, hour = 12, minute = 0) {
  const year = Number(String(ymd || "").slice(0, 4));
  const month = Number(String(ymd || "").slice(5, 7));
  const day = Number(String(ymd || "").slice(8, 10));

  if (!year) {
    return "절입시 검증 상태를 확인할 수 없습니다.";
  }

  const verifiedIpchun = await hasVerifiedSolarTerm(year, "입춘");
  const verifiedGyeongchip = await hasVerifiedSolarTerm(year, "경칩");

  const isIpchunBoundary = month === 2 && day >= 2 && day <= 6;
  const isGyeongchipBoundary = month === 3 && day >= 4 && day <= 7;

  if (verifiedIpchun && isIpchunBoundary) {
    return `입춘 경계일 구간입니다. 현재 입력 시각 ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} 은 검증된 입춘 절입시와 비교됩니다.`;
  }

  if (verifiedGyeongchip && isGyeongchipBoundary) {
    return `경칩 경계일 구간입니다. 현재 입력 시각 ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} 은 검증된 경칩 절입시와 비교됩니다.`;
  }

  if (verifiedIpchun && verifiedGyeongchip) {
    return "이 연도는 주요 월주 경계 절기 일부에 대해 검증된 절입시를 우선 사용합니다.";
  }

  if (verifiedIpchun) {
    return "이 연도는 입춘 절입시에 한해 검증된 시각 데이터를 우선 사용합니다.";
  }

  return "현재 이 연도는 절입시 검증 전 단계라서 날짜 기반 또는 미검증 시각값이 포함될 수 있습니다.";
}

function buildDbAdviceList(dbInterp, result, extraInput) {
  const list = [];

  if (dbInterp?.dayMaster?.advice) list.push(...safeArray(dbInterp.dayMaster.advice));
  if (dbInterp?.tenGod?.advice) list.push(...safeArray(dbInterp.tenGod.advice));
  if (dbInterp?.strength?.advice) list.push(...safeArray(dbInterp.strength.advice));

  if (Array.isArray(dbInterp?.habchung)) {
    dbInterp.habchung.forEach((item) => {
      if (item?.advice) list.push(...safeArray(item.advice));
    });
  }

  if (Array.isArray(dbInterp?.sinsal12)) {
    dbInterp.sinsal12.forEach((item) => {
      if (item?.advice) list.push(...safeArray(item.advice));
    });
  }

  if (result?.daewoon?.startAge != null) {
    list.push(`현재 엔진 기준 첫 대운 시작은 약 ${result.daewoon.startAge}세로 계산되었습니다.`);
  }

  if (extraInput?.birthPlace) {
    list.push(`${extraInput.birthPlace} 기준 입력 정보로 분석을 표시했습니다. 현재 엔진의 절입 계산은 한국 표준시 기준입니다.`);
  }

  if (dbInterp?.bridges?.advice) {
    list.push(...safeArray(dbInterp.bridges.advice));
  }

  return list;
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

async function renderResult(result, dbInterp, flow, extraInput) {
  setText("resultTitle", buildResultTitle(extraInput?.userName));
  setText("resultSubTitle", buildResultSubTitle(extraInput || {}));
  setText("yearPillar", result?.pillars?.year);
  setText("monthPillar", result?.pillars?.month);
  setText("dayPillar", result?.pillars?.day);
  setText("hourPillar", result?.pillars?.hour);
  setText(
  "precisionNotice",
  await buildPrecisionNotice(
    extraInput?.ymd,
    extraInput?.hour ?? 12,
    extraInput?.minute ?? 0
  )
);
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

  setText(
  "extraSinsal",
  Array.isArray(result?.extraSinsal)
    ? result.extraSinsal.join(", ")
    : "-"
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
  const adviceList = buildDbAdviceList(dbInterp, result, extraInput);
  setText("summaryText", summaryText);
  renderList("strengthList", strengthList);
  renderList("cautionList", cautionList);
  renderList("adviceList", adviceList);
  renderFlow(flow);
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

  const userName = $("userName").value.trim();
const birthPlace = $("birthPlace").value;

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
   await renderResult(result, dbInterp, null, {
  userName,
  birthPlace,
  ymd,
  hour,
  minute,
  gender
});
  } catch (err) {
    console.error(err);
    showError(err?.message || "분석 중 오류가 발생했습니다.");
  }
});

if (shareBtn) {
  shareBtn.addEventListener("click", shareCurrentPage);
}

fillSelectOptions();

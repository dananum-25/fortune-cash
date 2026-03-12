// /js/astro/interpreter/astro.render.js

function escapeHtml(s){
  return String(s ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

function scoreColor(score){
  if(score >= 80) return "bar-high";
  if(score >= 65) return "bar-good";
  if(score >= 50) return "bar-mid";
  return "bar-low";
}

function renderScoreRow(label, score){
  const width = Math.max(0, Math.min(100, score));

  return `
  <div class="score-row">
    <div class="score-head">
      <span>${label}</span>
      <span><b>${score}점</b></span>
    </div>
    <div class="score-bar">
      <div class="score-fill ${scoreColor(score)}" style="width:${width}%"></div>
    </div>
  </div>
  `;
}

export function renderAstroScores(scores){
  if(!scores) return "";

  return `
  <div class="card">
    <h2>📊 기본 운세 점수</h2>
    ${renderScoreRow("전체 흐름", scores.overall)}
    ${renderScoreRow("직업/일운", scores.career)}
    ${renderScoreRow("재물운", scores.wealth)}
    ${renderScoreRow("연애/관계운", scores.love)}
    ${renderScoreRow("건강운", scores.health)}
  </div>
  `;
}

export function renderTodayAstro(today){
  if(!today) return "";

  return `
  <div class="card">
    <h2>☀ 오늘의 흐름</h2>
    <p class="info-text"><b>${escapeHtml(today.headline || "")}</b></p>

    <div class="hr"></div>

    ${renderScoreRow("오늘 전체 흐름", today?.scores?.overall || 60)}
    ${renderScoreRow("오늘 직업/일운", today?.scores?.career || 60)}
    ${renderScoreRow("오늘 재물운", today?.scores?.wealth || 60)}
    ${renderScoreRow("오늘 연애/관계운", today?.scores?.love || 60)}
    ${renderScoreRow("오늘 건강운", today?.scores?.health || 60)}

    <div class="hr"></div>

    <p><b>전체</b><br>${escapeHtml(today.overall || "")}</p>
    <p><b>직업 / 일</b><br>${escapeHtml(today.career || "")}</p>
    <p><b>재물</b><br>${escapeHtml(today.wealth || "")}</p>
    <p><b>연애 / 관계</b><br>${escapeHtml(today.love || "")}</p>
    <p><b>건강</b><br>${escapeHtml(today.health || "")}</p>

    ${
      Array.isArray(today.highlights) && today.highlights.length
        ? `
          <div class="hr"></div>
          <ul class="list">
            ${today.highlights.map(v => `<li>${escapeHtml(v)}</li>`).join("")}
          </ul>
        `
        : ""
    }
  </div>
  `;
}

export function renderAstroMonth(month){
  if(!month?.current) return "";

  const current = month.current;

  return `
  <div class="card">
    <h2>📅 이번 달 흐름</h2>

    <p class="info-text"><b>${escapeHtml(current.headline || "")}</b></p>

    <div class="hr"></div>

    ${renderScoreRow(`${current.month}월 전체 흐름`, current?.scores?.overall || 60)}
    ${renderScoreRow(`${current.month}월 직업/일운`, current?.scores?.career || 60)}
    ${renderScoreRow(`${current.month}월 재물운`, current?.scores?.wealth || 60)}
    ${renderScoreRow(`${current.month}월 연애/관계운`, current?.scores?.love || 60)}
    ${renderScoreRow(`${current.month}월 건강운`, current?.scores?.health || 60)}

    <div class="hr"></div>

    <p><b>전체</b><br>${escapeHtml(current.overall || "")}</p>
    <p><b>직업 / 일</b><br>${escapeHtml(current.career || "")}</p>
    <p><b>재물</b><br>${escapeHtml(current.wealth || "")}</p>
    <p><b>연애 / 관계</b><br>${escapeHtml(current.love || "")}</p>
    <p><b>건강</b><br>${escapeHtml(current.health || "")}</p>
  </div>
  `;
}

export function renderAstroYear(year){
  if(!year) return "";

  return `
  <div class="card">
    <h2>🗓 올해 흐름</h2>

    <p class="info-text"><b>${escapeHtml(year.headline || "")}</b></p>

    <div class="hr"></div>

    ${renderScoreRow("올해 전체 흐름", year?.scores?.overall || 60)}
    ${renderScoreRow("올해 직업/일운", year?.scores?.career || 60)}
    ${renderScoreRow("올해 재물운", year?.scores?.wealth || 60)}
    ${renderScoreRow("올해 연애/관계운", year?.scores?.love || 60)}
    ${renderScoreRow("올해 건강운", year?.scores?.health || 60)}

    <div class="hr"></div>

    <p><b>가장 강한 영역</b><br>${escapeHtml(year?.strongest?.label || "")} (${year?.strongest?.value || 0}점)</p>
    <p><b>조금 더 챙길 영역</b><br>${escapeHtml(year?.weakest?.label || "")} (${year?.weakest?.value || 0}점)</p>
    <p><b>운영 전략</b><br>${escapeHtml(year.strategy || "")}</p>

    ${
      Array.isArray(year.checklist) && year.checklist.length
        ? `
          <div class="hr"></div>
          <ul class="list">
            ${year.checklist.map(v => `<li>${escapeHtml(v)}</li>`).join("")}
          </ul>
        `
        : ""
    }
  </div>
  `;
}

export function renderAstroSummary(summary){
  if(!summary) return "";

  return `
  <div class="card">
    <h2>🔮 기본 성향 요약</h2>
    <p class="info-text">${escapeHtml(summary.headline || "")}</p>
    <div class="hr"></div>
    <p class="info-text">${escapeHtml(summary.identityText || "")}</p>
  </div>
  `;
}

export function renderAstroDetails(summary){
  if(!summary) return "";

  return `
  <div class="card">
    <h2>📌 기본 영역 해석</h2>
    <p><b>전체 흐름</b><br>${escapeHtml(summary.overall || "")}</p>
    <p><b>직업 / 일</b><br>${escapeHtml(summary.career || "")}</p>
    <p><b>재물</b><br>${escapeHtml(summary.wealth || "")}</p>
    <p><b>연애 / 관계</b><br>${escapeHtml(summary.love || "")}</p>
    <p><b>건강</b><br>${escapeHtml(summary.health || "")}</p>
  </div>
  `;
}

export function renderAstroPlanets(summary){
  if(!summary?.planetLines?.length) return "";

  return `
  <div class="card">
    <h2>🪐 주요 행성 포인트</h2>
    <ul class="list">
      ${summary.planetLines.map(v => `<li>${escapeHtml(v)}</li>`).join("")}
    </ul>
  </div>
  `;
}

export function renderAstroAspect(summary){
  if(!summary?.aspectText) return "";

  return `
  <div class="card">
    <h2>📐 차트 구조</h2>
    <p class="info-text">${escapeHtml(summary.aspectText)}</p>
  </div>
  `;
}

export function renderAstroReport(profile){
  if(!profile) return "";

  const scores = profile?.scores;
  const summary = profile?.summary;
  const today = profile?.today;
  const month = profile?.month;
  const year = profile?.year;

  return `
    ${renderTodayAstro(today)}
    ${renderAstroMonth(month)}
    ${renderAstroYear(year)}
    ${renderAstroSummary(summary)}
    ${renderAstroScores(scores)}
    ${renderAstroDetails(summary)}
    ${renderAstroPlanets(summary)}
    ${renderAstroAspect(summary)}
  `;
}

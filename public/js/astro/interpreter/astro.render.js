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
      <div class="score-fill ${scoreColor(score)}"
        style="width:${width}%"></div>
    </div>
  </div>
  `;
}

export function renderAstroScores(scores){

  if(!scores) return "";

  return `
  <div class="card">
    <h2>📊 운세 점수</h2>

    ${renderScoreRow("전체 흐름", scores.overall)}
    ${renderScoreRow("직업/일운", scores.career)}
    ${renderScoreRow("재물운", scores.wealth)}
    ${renderScoreRow("연애/관계운", scores.love)}
    ${renderScoreRow("건강운", scores.health)}

  </div>
  `;
}

export function renderAstroSummary(summary){

  if(!summary) return "";

  return `
  <div class="card">

    <h2>🔮 운세 요약</h2>

    <p class="info-text">
      ${escapeHtml(summary.headline)}
    </p>

    <div class="hr"></div>

    <p class="info-text">
      ${escapeHtml(summary.identityText)}
    </p>

  </div>
  `;
}

export function renderAstroDetails(summary){

  if(!summary) return "";

  return `
  <div class="card">

    <h2>📌 영역별 해석</h2>

    <p><b>전체 흐름</b><br>
    ${escapeHtml(summary.overall)}</p>

    <p><b>직업 / 일</b><br>
    ${escapeHtml(summary.career)}</p>

    <p><b>재물</b><br>
    ${escapeHtml(summary.wealth)}</p>

    <p><b>연애 / 관계</b><br>
    ${escapeHtml(summary.love)}</p>

    <p><b>건강</b><br>
    ${escapeHtml(summary.health)}</p>

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

    <p class="info-text">
      ${escapeHtml(summary.aspectText)}
    </p>

  </div>
  `;
}

export function renderAstroReport(profile){

  if(!profile) return "";

  const scores = profile?.scores;
  const summary = profile?.summary;

  return `
  ${renderAstroSummary(summary)}

  ${renderAstroScores(scores)}

  ${renderAstroDetails(summary)}

  ${renderAstroPlanets(summary)}

  ${renderAstroAspect(summary)}
  `;
}

// /js/saju.ui.js  (type="module")

import {
  normalizeBirthYMD,
  parseYMDLocalNoon,
  getYearPillar, getMonthPillar, getDayPillar, getHourPillar,
  heavenly, earthly
} from "/js/saju.core.js";
// /js/saju.js
// fortune-cash - saju page engine (clean + fixed)
// - Local date parsing (UTC 밀림 방지)
// - Button binding (no inline onclick needed)
// - Save/Load report with elementCounts
// - Expert SAJU Engine (B): hidden stems + season weight + rooting + DM strength + yongshin heuristic

// ===============================
// 0) Date helpers (UTC-safe)
// ===============================


// ===============================
// 5) 5 elements (simple distribution)
// ===============================
function getElement(char){
  const wood  = ["갑","을","인","묘"];
  const fire  = ["병","정","사","오"];
  const earth = ["무","기","진","술","축","미"];
  const metal = ["경","신","유"];
  const water = ["임","계","해","자"];

  if(wood.includes(char))  return "목";
  if(fire.includes(char))  return "화";
  if(earth.includes(char)) return "토";
  if(metal.includes(char)) return "금";
  if(water.includes(char)) return "수";
  if(char === "신") return "금";
  return "";
}

function analyzeElements(pillars){
  const counts = {목:0, 화:0, 토:0, 금:0, 수:0};
  pillars.forEach(p=>{
    for(const ch of p){
      const el = getElement(ch);
      if(el) counts[el]++;
    }
  });
  return counts;
}

function generateElementInterpretation(counts){
  let text = "";
  const elements = ["목","화","토","금","수"];

  elements.forEach(el=>{
    if(counts[el] >= 3){
      text += `<p><b>${el}</b> 기운이 강합니다. 이 오행이 성향/선택을 주도하기 쉽습니다.</p>`;
    }else if(counts[el] === 0){
      text += `<p><b>${el}</b> 기운이 부족합니다. 해당 오행을 보완하면 운의 체감이 좋아질 수 있어요.</p>`;
    }
  });

  if(counts["목"] === 0) text += "<p>🌿 목 보완: 자연/초록색/독서/기획·성장 루틴</p>";
  if(counts["화"] === 0) text += "<p>🔥 화 보완: 운동/햇빛/표현·발표/따뜻한 관계</p>";
  if(counts["토"] === 0) text += "<p>🪨 토 보완: 규칙/저축/체력관리/기반 만들기</p>";
  if(counts["금"] === 0) text += "<p>⚙ 금 보완: 정리정돈/규칙/문서화/금융 공부</p>";
  if(counts["수"] === 0) text += "<p>💧 수 보완: 휴식/학습/여행/명상/수영</p>";

  return text || "<p>오행이 비교적 고르게 분포되어 있어, ‘한 방’보다 ‘꾸준함’이 강점입니다.</p>";
}

// ===============================
// 6) 2026 sewoon (合沖)
// ===============================
const BRANCH_CLASH = {
  "자":"오","오":"자",
  "축":"미","미":"축",
  "인":"신","신":"인",
  "묘":"유","유":"묘",
  "진":"술","술":"진",
  "사":"해","해":"사"
};

const BRANCH_COMBO = {
  "자":"축","축":"자",
  "인":"해","해":"인",
  "묘":"술","술":"묘",
  "진":"유","유":"진",
  "사":"신","신":"사",
  "오":"미","미":"오"
};

const STEM_COMBO = {
  "갑":"기","기":"갑",
  "을":"경","경":"을",
  "병":"신","신":"병",
  "정":"임","임":"정",
  "무":"계","계":"무"
};

function sewoonAnalyze(pillars){
  const sewoon = "병오";
  const sStem = sewoon[0];
  const sBranch = sewoon[1];

  const hits = { branchCombo: [], branchClash: [], stemCombo: [] };

  pillars.forEach((p, idx)=>{
    const label = ["연주","월주","일주","시주"][idx] || "기둥";
    const pStem = p[0];
    const pBranch = p[1];

    if(BRANCH_COMBO[pBranch] === sBranch){
      hits.branchCombo.push(`${label}(${p}) ↔ 세운(${sewoon}) 지지합`);
    }
    if(BRANCH_CLASH[pBranch] === sBranch){
      hits.branchClash.push(`${label}(${p}) ↔ 세운(${sewoon}) 지지충`);
    }
    if(STEM_COMBO[pStem] === sStem){
      hits.stemCombo.push(`${label}(${p}) ↔ 세운(${sewoon}) 천간합`);
    }
  });

  let html = `<p><b>2026년 세운:</b> <span class="badge">${sewoon}</span> (화(火) 기운 강: “속도/결정/노출” 강조)</p>`;

  if(!hits.branchCombo.length && !hits.branchClash.length && !hits.stemCombo.length){
    html += `<p>합충 신호가 강하게 잡히진 않습니다. 기본 사주 흐름(오행/일간 강약)을 우선으로 보세요.</p>`;
    html += `<p class="small">※ 병오년 특성상 “속도전/노출/결정” 이슈는 누구에게나 생길 수 있습니다.</p>`;
    return html;
  }

  if(hits.branchCombo.length){
    html += `<h3>✅ 합(合)</h3><p>연결/협력/도움이 생기기 쉬운 구조</p>`;
    hits.branchCombo.forEach(t=> html += `<p>• ${t}</p>`);
  }

  if(hits.stemCombo.length){
    html += `<h3>✅ 천간합</h3><p>협상/계약 타이밍이 맞는 느낌이 오기 쉬움(조건 체크 필수)</p>`;
    hits.stemCombo.forEach(t=> html += `<p>• ${t}</p>`);
  }

  if(hits.branchClash.length){
    html += `<h3>⚠️ 충(沖)</h3><p>변화·이동·정리 이슈(급발진만 주의하면 기회로 전환 가능)</p>`;
    hits.branchClash.forEach(t=> html += `<p>• ${t}</p>`);
    html += `<p class="small">충: 이직/이사/관계 재정렬/루틴 변화 가능. 안전/건강/충동소비 관리 추천.</p>`;
  }

  return html;
}

function analyzeSeowoonWithElements(elementCounts){
  const fireCount = elementCounts["화"] || 0;
  let text = `<h3>🔥 2026년(병오) 화(火) 영향</h3>`;

  if(fireCount >= 3){
    text += `
      <p>원국에 화(火)가 이미 강한 편 → 2026년엔 과열/속도전/감정기복이 커질 수 있습니다.</p>
      <p><b>주의:</b> 충동소비/급한 결정/관계 갈등</p>
      <p><b>기회:</b> 마케팅·노출·발표·SNS·콘텐츠</p>
    `;
  } else if(fireCount === 0){
    text += `
      <p>원국에 화(火)가 부족 → 2026년은 부족한 화를 채워 “시작/도전”에 유리합니다.</p>
      <p><b>기회:</b> 이직/창업/브랜딩/새 프로젝트 착수</p>
    `;
  } else{
    text += `
      <p>화(火)가 적당 → 2026년은 추진력 상승, “움직이면 성과”가 나기 쉬운 해입니다.</p>
    `;
  }
  return text;
}

// ===============================
// 7) Score / graph (UI helpers)
// ===============================
function calculateFortuneScores(elementCounts, currentDaewoon){
  let scores = { wealth:60, love:60, career:60, health:60 };

  const fire = elementCounts["화"] || 0;
  const water = elementCounts["수"] || 0;
  const metal = elementCounts["금"] || 0;
  const wood = elementCounts["목"] || 0;
  const earth = elementCounts["토"] || 0;

  if(fire >= 3){
    scores.career += 10;
    scores.love += 5;
    scores.health -= 5;
  } else if(fire === 0){
    scores.career += 5;
    scores.wealth += 5;
  }

  if(metal >= 2) scores.wealth += 10;
  if(water >= 2) scores.wealth += 5;
  if(wood >= 2) scores.love += 10;
  if(earth >= 2) scores.health += 10;

  const dBranch = currentDaewoon[1];
  if(dBranch === "오" || dBranch === "사"){
    scores.career += 5;
  }

  Object.keys(scores).forEach(k=>{
    if(scores[k] > 95) scores[k] = 95;
    if(scores[k] < 30) scores[k] = 30;
  });

  return scores;
}

function generateScoreInterpretation(scores){
  function interpret(score){
    if(score >= 80) return "매우 강한 흐름. 적극적으로 움직이면 성과가 큽니다.";
    if(score >= 65) return "좋은 흐름. 준비한 만큼 결과가 나옵니다.";
    if(score >= 50) return "평균 흐름. 무리하지 않는 운영이 중요합니다.";
    return "주의 필요. 보수적 운영이 유리합니다.";
  }

  return `
    <h3>🧠 2026년 종합 해석</h3>
    <p><b>💰 재물운:</b> ${interpret(scores.wealth)}</p>
    <p><b>💖 연애운:</b> ${interpret(scores.love)}</p>
    <p><b>🏢 직장/사업운:</b> ${interpret(scores.career)}</p>
    <p><b>💪 건강운:</b> ${interpret(scores.health)}</p>
  `;
}

function generateScoreGraph(scores){
  function getClass(score){
    if(score >= 80) return "bar-high";
    if(score >= 65) return "bar-good";
    if(score >= 50) return "bar-mid";
    return "bar-low";
  }
  function barRow(label, score, key){
    return `
      <div class="bar-wrap">
        <div class="bar-label">
          <span>${label}</span>
          <span><b>${score}점</b></span>
        </div>
        <div class="bar">
          <div id="bar-${key}" class="bar-fill ${getClass(score)}"></div>
        </div>
      </div>
    `;
  }
  return `
    <h3>📊 2026 운세 그래프</h3>
    ${barRow("💰 재물운", scores.wealth, "wealth")}
    ${barRow("💖 연애운", scores.love, "love")}
    ${barRow("🏢 직장/사업운", scores.career, "career")}
    ${barRow("💪 건강운", scores.health, "health")}
  `;
}

function generateMonthlyGraph(scores){
  return generateMonthlyGraphAll(scores);
}

function generateMonthlyGraphAll(scores){
  const categories = [
    {key:"wealth", label:"💰 재물운"},
    {key:"love", label:"💖 연애운"},
    {key:"career", label:"🏢 직장/사업운"},
    {key:"health", label:"💪 건강운"}
  ];

  const max = 100;
  const height = 160;
  const widthStep = 100 / 11;

  function genMonthly(baseScore){
    const arr = [];
    for(let i=0;i<12;i++){
      const variance = Math.floor(Math.random()*15) - 7;
      let value = baseScore + variance;
      if(value > 95) value = 95;
      if(value < 30) value = 30;
      arr.push(value);
    }
    return arr;
  }

  let html = `<div class="month-graph"><h3>📅 2026 월별 운세 변화</h3>`;
  const monthlyData = {};

  categories.forEach(cat=>{
    const monthly = genMonthly(scores[cat.key]);
    monthlyData[cat.key] = monthly;

    let points = "";
    let dots = "";

    monthly.forEach((score,i)=>{
      const x = i * widthStep;
      const y = height - (score / max * height);
      points += `${x},${y} `;
      dots += `<circle cx="${x}" cy="${y}" r="2" class="graph-dot"></circle>`;
    });

    html += `
      <h4 style="margin-top:18px">${cat.label}</h4>
      <svg viewBox="0 0 100 ${height}">
        <polyline points="${points}" class="graph-line"></polyline>
        ${dots}
      </svg>
    `;
  });

  html += `</div>`;
  html += generateMonthlyTextAll(monthlyData);
  return html;
}

function generateMonthlyTextAll(monthlyData){
  function interpret(score, type){
    if(score >= 80){
      if(type==="wealth") return "수익 확장 가능성 높음. 투자·사업 기회 검토 가능.";
      if(type==="love") return "연애/관계 진전 가능성 매우 높음.";
      if(type==="career") return "성과·승진·평가 상승 가능성.";
      if(type==="health") return "컨디션 양호. 활동량 늘리기 좋음.";
    }
    if(score >= 65) return "안정적 상승 흐름. 무리하지 않으면 성과 가능.";
    if(score >= 50) return "평균 흐름. 리스크 관리 중요.";
    return "주의 필요. 휴식·보수적 운영 추천.";
  }

  const monthNames = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
  const types = { wealth:"💰 재물운", love:"💖 연애운", career:"🏢 직장/사업운", health:"💪 건강운" };

  let html = "<h3>🗓 2026 월별 종합 해석</h3>";

  monthNames.forEach((month,i)=>{
    html += `<h4 style="margin-top:14px">${month}</h4>`;
    Object.keys(types).forEach(type=>{
      const score = monthlyData[type][i];
      html += `<p>${types[type]}: ${interpret(score,type)}</p>`;
    });
  });

  return html;
}

function generateYearSummary(scores){
  const avg = Math.round((scores.wealth + scores.love + scores.career + scores.health) / 4);
  let comment = "";

  if(avg >= 80) comment = "🔥 2026년은 인생 흐름이 강하게 상승. 확장과 도전이 성과로 이어질 가능성 큼.";
  else if(avg >= 65) comment = "✨ 2026년은 안정적 성장 흐름. 준비된 영역에서 결과 가능성 큼.";
  else if(avg >= 50) comment = "⚖ 2026년은 유지/관리의 해. 큰 모험보다 전략적 운영이 유리.";
  else comment = "⚠ 2026년은 리스크 관리가 핵심. 보수적 판단과 체력 관리에 집중.";

  return `
    <div class="card">
      <h2>📌 2026년 한 줄 총평</h2>
      <p style="font-size:16px;line-height:1.8;">${comment}</p>
    </div>
  `;
}

function getTodayString(){
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${yyyy}-${mm}-${dd}`;
}

function generateFullReport(name, pillars, elementCounts, scores){
  const strongest = Object.keys(elementCounts).reduce((a,b)=> elementCounts[a] > elementCounts[b] ? a : b);
  const avg = Math.round((scores.wealth + scores.love + scores.career + scores.health) / 4);

  let text = `
    <div class="card">
      <h2>🧾 2026년 AI 종합 리포트</h2>
      <p style="font-size:12px;opacity:.6;">생성일: ${getTodayString()} | 발행: fortune-cash.vercel.app</p>

      <p><b>${name}</b>님의 사주 구조는 <b>${pillars.join(" / ")}</b> 흐름으로 구성되어 있습니다.</p>

      <p>오행 분포(참고) 기준으로 <b>${strongest}</b> 기운이 상대적으로 두드러집니다.</p>

      <p>2026년은 병오년(丙午)으로 화(火)의 기운이 강하게 작용합니다.
      평균 운세 점수는 <b>${avg}점</b>이며, ${avg >= 70 ? "상승 기류가 감지되는 해" : "관리 중심 전략이 필요한 해"}입니다.</p>
  `;

  if(scores.wealth >= 75) text += `<p>재물운: 확장 가능성이 높습니다. 수익 모델 확장/투자 검토에 적합.</p>`;
  else if(scores.wealth < 55) text += `<p>재물운: 방어 전략 필요. 현금흐름/지출 통제가 핵심.</p>`;

  if(scores.love >= 75) text += `<p>연애·관계: 발전 가능성 높음. 적극적 표현이 유리.</p>`;
  else if(scores.love < 55) text += `<p>연애·관계: 갈등 관리 중요. 감정 기복 조절이 관건.</p>`;

  if(scores.career >= 75) text += `<p>직장·사업: 성과 창출 가능성 높음. 브랜딩/노출 활동 유리.</p>`;
  if(scores.health < 55) text += `<p>건강: 체력 관리 필요. 과로/수면부족 경계.</p>`;

  text += `
      <p style="margin-top:15px;">
        종합적으로 2026년은 “강한 것(확장) + 약한 것(관리)” 균형이 성과를 만듭니다.
      </p>
    </div>
  `;
  return text;
}

function generateSummaryContent(name, pillars, scores){
  return `
<div id="summaryPrintArea" style="position:relative;">
  <div style="
    position:fixed;
    top:40%;
    left:50%;
    transform:translate(-50%,-50%) rotate(-30deg);
    font-size:48px;
    color:rgba(0,0,0,0.08);
    pointer-events:none;
    white-space:nowrap;
  ">fortune-cash.vercel.app</div>

  <h1>${name}님 2026 사주 요약 리포트</h1>
  <p style="font-size:12px;opacity:.6;">생성일: ${getTodayString()} | 발행: fortune-cash.vercel.app</p>

  <p><b>이름:</b> ${name}</p>
  <p><b>사주:</b> ${pillars.join(" / ")}</p>

  <h3>📊 운세 점수</h3>
  <p>💰 재물운: ${scores.wealth}점</p>
  <p>💖 연애운: ${scores.love}점</p>
  <p>🏢 직장/사업운: ${scores.career}점</p>
  <p>💪 건강운: ${scores.health}점</p>

  <p style="margin-top:15px;">본 리포트는 무료 운세 플랫폼 자동 생성 리포트입니다.</p>
</div>
  `;
}

function setupPdfButtons(name, pillars, scores){
  const fullBtn = document.getElementById("pdfFullBtn");
  const summaryBtn = document.getElementById("pdfSummaryBtn");

  if(fullBtn){
    fullBtn.onclick = ()=>{
      const birth = localStorage.getItem("birth") || "";
      const safeName = String(name || "회원").replace(/\s+/g,"");
      const safeBirth = String(birth).replace(/[^0-9\-]/g,"");

      const originalTitle = document.title;
      document.title = `${safeName}_${safeBirth}_2026사주리포트(전체)`;
      window.print();
      setTimeout(()=>{ document.title = originalTitle; }, 300);
    };
  }

  if(summaryBtn){
    summaryBtn.onclick = ()=>{
      const originalContent = document.body.innerHTML;

      document.body.innerHTML = generateSummaryContent(name, pillars, scores);

      const birth = localStorage.getItem("birth") || "";
      const safeName = String(name || "회원").replace(/\s+/g,"");
      const safeBirth = String(birth).replace(/[^0-9\-]/g,"");

      const originalTitle = document.title;
      document.title = `${safeName}_${safeBirth}_2026사주리포트(요약)`;

      window.print();

      document.title = originalTitle;
      document.body.innerHTML = originalContent;
      location.reload();
    };
  }
}

// ===============================
// 8) Save/Load reports
// ===============================
function saveReport(data){
  const existing = JSON.parse(localStorage.getItem("myReports") || "[]");
  existing.unshift(data);
  localStorage.setItem("myReports", JSON.stringify(existing.slice(0,5)));
}

function showSavedReports(){
  const list = JSON.parse(localStorage.getItem("myReports") || "[]");
  if(!list.length){
    alert("저장된 리포트가 없습니다.");
    return;
  }

  let html = "<div class='card'><h2>📚 저장된 리포트</h2>";
  list.forEach((r,i)=>{
    html += `
      <p style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        ${i+1}. ${r.name} / ${r.birth} / ${r.hour}시
        <button class="btn-load-report"
        data-index="${i}"style="width:auto;padding:8px 10px;border-radius:10px;">불러오기</button>
      </p>
    `;
  });
  html += "</div>";

  document.getElementById("analysisBox").innerHTML = html;
  // ✅ inline onclick 대신, 클릭 이벤트 위임 추가
document.getElementById("analysisBox").addEventListener("click", (e)=>{
  const btn = e.target.closest(".btn-load-report");
  if(!btn) return;

  const i = Number(btn.dataset.index);
  if(!Number.isFinite(i)) return;

  loadReport(i);
});
}

function loadReport(index){
  const list = JSON.parse(localStorage.getItem("myReports") || "[]");
  const r = list[index];
  if(!r) return;

  const elementCounts = r.elementCounts || analyzeElements(r.pillars);

  // 원래 계산 카드로 다시 보여주고 싶으면 여기서 UI 복구도 가능
  document.getElementById("analysisBox").innerHTML =
    generateFullReport(r.name, r.pillars, elementCounts, r.scores);
}

// ===============================
// 9) Daewoon (simple)
// ===============================
function generateDaewoon(_startYearPillar, birthYear){
  const baseYear = 1984;
  const yearIndex = ((birthYear - baseYear) % 60 + 60) % 60;

  let html = "<h3>📈 대운(10년 운) 흐름</h3>";
  for(let i=1;i<=8;i++){
    const ageStart = i*10;
    const pillarIndex = (yearIndex + i) % 60;
    const stem = heavenly[pillarIndex % 10];
    const branch = earthly[pillarIndex % 12];
    html += `<p><b>${ageStart}세 ~ ${ageStart+9}세</b> : <span class="badge">${stem}${branch}</span></p>`;
  }
  html += `<p class="small">※ 참고용 간이 흐름입니다. (절기/순행·역행/대운 시작나이 미적용)</p>`;
  return html;
}

function getCurrentDaewoonPillar(birthYear){
  const currentYear = 2026;
  const age = currentYear - birthYear;
  const daewoonIndex = Math.floor(age / 10);

  const baseYear = 1984;
  const yearIndex = ((birthYear - baseYear) % 60 + 60) % 60;

  const pillarIndex = (yearIndex + daewoonIndex) % 60;
  const stem = heavenly[pillarIndex % 10];
  const branch = earthly[pillarIndex % 12];
  return stem + branch;
}

function analyzeDaewoonVsSeowoon(currentDaewoon){
  const seowoon = "병오";
  const sBranch = seowoon[1];
  const dBranch = currentDaewoon[1];

  let html = "<h3>🔥 (참고) 대운 × 2026 세운</h3>";

  if(BRANCH_CLASH[dBranch] === sBranch){
    html += `
      <p><b>⚠ 변화 운</b></p>
      <p>대운(${currentDaewoon})과 세운(${seowoon})이 충 → 이직/이사/관계 재정렬 가능</p>
    `;
  } else if(BRANCH_COMBO[dBranch] === sBranch){
    html += `
      <p><b>✅ 확장 운</b></p>
      <p>대운과 세운이 합 → 협력/확장/관계 도움 운 상승</p>
    `;
  } else{
    html += `<p>큰 충합 구조는 아닙니다. 기본 흐름을 안정적으로 유지하는 해입니다.</p>`;
  }
  return html;
}

// ===============================
// 10) EXPERT SAJU ENGINE (B)
// ===============================

// 10-1) 오행 매핑 (천간/지지)
const STEM_ELEMENT = {
  "갑":"목","을":"목",
  "병":"화","정":"화",
  "무":"토","기":"토",
  "경":"금","신":"금",
  "임":"수","계":"수",
};

const BRANCH_ELEMENT = {
  "자":"수","축":"토","인":"목","묘":"목","진":"토","사":"화",
  "오":"화","미":"토","신":"금","유":"금","술":"토","해":"수"
};

// 10-2) 지장간(표준)
const HIDDEN_STEMS = {
  "자":["계"],
  "축":["기","계","신"],
  "인":["갑","병","무"],
  "묘":["을"],
  "진":["무","을","계"],
  "사":["병","무","경"],
  "오":["정","기"],
  "미":["기","정","을"],
  "신":["경","임","무"],
  "유":["신"],
  "술":["무","신","정"],
  "해":["임","갑"],
};

// 10-3) 월령(계절) 가중치 (서비스 표준값)
const SEASON_WEIGHT = {
  "인": { "목": 1.35, "화": 1.10, "수": 1.05, "금": 0.75, "토": 0.95 },
  "묘": { "목": 1.40, "화": 1.10, "수": 1.00, "금": 0.70, "토": 0.95 },
  "진": { "목": 1.15, "화": 1.05, "수": 1.00, "금": 0.85, "토": 1.10 },

  "사": { "화": 1.35, "토": 1.15, "목": 1.05, "수": 0.70, "금": 0.85 },
  "오": { "화": 1.45, "토": 1.15, "목": 1.00, "수": 0.65, "금": 0.80 },
  "미": { "화": 1.15, "토": 1.25, "목": 1.00, "수": 0.75, "금": 0.90 },

  "신": { "금": 1.35, "수": 1.10, "토": 1.05, "화": 0.80, "목": 0.80 },
  "유": { "금": 1.45, "수": 1.05, "토": 1.00, "화": 0.75, "목": 0.75 },
  "술": { "금": 1.10, "토": 1.25, "화": 1.00, "수": 0.90, "목": 0.85 },

  "해": { "수": 1.35, "목": 1.10, "금": 1.00, "화": 0.75, "토": 0.85 },
  "자": { "수": 1.45, "목": 1.05, "금": 1.00, "화": 0.70, "토": 0.80 },
  "축": { "수": 1.10, "토": 1.25, "금": 1.05, "화": 0.80, "목": 0.85 },
};

function hasRoot(dayStem, branches){
  const dmEl = STEM_ELEMENT[dayStem];
  if(!dmEl) return false;

  for(const br of branches){
    const hidden = HIDDEN_STEMS[br] || [];
    for(const hs of hidden){
      if(STEM_ELEMENT[hs] === dmEl) return true;
    }
  }
  return false;
}

function calcDayMasterStrength(pillarsObj){
  // pillarsObj: [{stem:"갑", branch:"자"}, ...] 4개
  const dayStem = pillarsObj[2].stem;
  const monthBranch = pillarsObj[1].branch;
  const dmEl = STEM_ELEMENT[dayStem];

  const season = SEASON_WEIGHT[monthBranch] || {};
  const seasonMul = season[dmEl] || 1.0;

  let score = 50;

  // (a) season
  score += (seasonMul - 1.0) * 30;

  // (b) rooting
  const branches = pillarsObj.map(p=>p.branch);
  const rooted = hasRoot(dayStem, branches);
  if(rooted) score += 10;

  // (c) support vs drain (오행 관계 근사)
  const SUPPORT = {
    "목": ["목","수"],
    "화": ["화","목"],
    "토": ["토","화"],
    "금": ["금","토"],
    "수": ["수","금"],
  };
  const DRAIN = {
    "목": ["화","금"],
    "화": ["토","수"],
    "토": ["금","목"],
    "금": ["수","화"],
    "수": ["목","토"],
  };

  let supportCnt = 0;
  let drainCnt = 0;

  for(const p of pillarsObj){
    const se = STEM_ELEMENT[p.stem];
    const be = BRANCH_ELEMENT[p.branch];

    if(SUPPORT[dmEl]?.includes(se)) supportCnt++;
    if(SUPPORT[dmEl]?.includes(be)) supportCnt++;

    if(DRAIN[dmEl]?.includes(se)) drainCnt++;
    if(DRAIN[dmEl]?.includes(be)) drainCnt++;
  }

  score += supportCnt * 2.5;
  score -= drainCnt * 2.5;

  if(score > 95) score = 95;
  if(score < 5) score = 5;

  let verdict = "중화";
  if(score >= 65) verdict = "신강";
  else if(score <= 35) verdict = "신약";

  return {
    dayStem,
    dmEl,
    monthBranch,
    seasonMul,
    hasRoot: rooted,
    supportCnt,
    drainCnt,
    score: Math.round(score),
    verdict
  };
}
// ===============================
// 10-4) 격국 추정
// ===============================
function estimateStructure(pillarsObj){
  const monthBranch = pillarsObj[1].branch;
  const dayStem = pillarsObj[2].stem;
  const dmEl = STEM_ELEMENT[dayStem];

  const monthEl = BRANCH_ELEMENT[monthBranch];

  if(dmEl === monthEl){
    return "건록격(월령득지)";
  }

  if(
    (dmEl === "화" && monthEl === "목") ||
    (dmEl === "목" && monthEl === "수") ||
    (dmEl === "금" && monthEl === "토") ||
    (dmEl === "수" && monthEl === "금")
  ){
    return "통근·생조격";
  }

  return "평격(특수격 아님)";
}
function pickYongShin(dmEl, verdict){
  const PRODUCE = { "목":"화","화":"토","토":"금","금":"수","수":"목" };
  const PRODUCED_BY = { "목":"수","화":"목","토":"화","금":"토","수":"금" };
  const CONTROLLED_BY = { "목":"금","화":"수","토":"목","금":"화","수":"토" };
  
  if(verdict === "신약"){
    return { yong: PRODUCED_BY[dmEl], hee: dmEl };
  }
  if(verdict === "신강"){
    return { yong: PRODUCE[dmEl], hee: CONTROLLED_BY[dmEl] };
  }
  return { yong: PRODUCE[dmEl], hee: PRODUCED_BY[dmEl] };
}

// ===============================
// 11) Main calculate
// ===============================
function calculateSaju(){
  const name = localStorage.getItem("name") || "회원";
  const birth = normalizeBirthYMD(localStorage.getItem("birth"));

  const hourEl = document.getElementById("birthHour");
  const hour = parseInt(hourEl?.value, 10);
  
  
  if(!birth){
    alert("로그인이 필요합니다. (생년월일 정보가 없습니다)");
    return;
  }
  if(Number.isNaN(hour) || hour < 0 || hour > 23){
    alert("출생 시간을 0~23 사이로 입력해주세요.");
    return;
  }

  // ✅ 검증 통과 후 저장
  localStorage.setItem("birthHour", String(hour));

  const birthDate = parseYMDLocalNoon(birth);
  if(!birthDate){
    alert("생년월일 형식이 이상합니다. 다시 로그인/저장 후 시도해주세요.");
    return;
  }

  const year = birthDate.getFullYear();

  const yearPillar  = getYearPillar(year);
  const monthPillar = getMonthPillar(birthDate);
  const dayPillar   = getDayPillar(birth);              // ✅ window.SajuCore 제거
  const hourPillar  = getHourPillar(dayPillar, hour);   // ✅ window.SajuCore 제거

  const pillars = [yearPillar, monthPillar, dayPillar, hourPillar];

  // UI
  document.getElementById("timeInputBox").style.display="none";
  document.getElementById("sajuResult").style.display="block";

  document.getElementById("basicInfo").innerHTML =
    `<p><b>${name}</b></p>
     <p>생년월일: ${birth}</p>
     <p>출생시간: ${hour}시</p>`;

  document.getElementById("sajuBox").innerHTML =
    `<span class="badge">연주: ${yearPillar}</span>
     <span class="badge">월주: ${monthPillar}</span>
     <span class="badge">일주: ${dayPillar}</span>
     <span class="badge">시주: ${hourPillar}</span>`;

  // 오행(분포)
  const elementResult = analyzeElements(pillars);
  const strongest = Object.keys(elementResult).reduce((a,b)=> elementResult[a] > elementResult[b] ? a : b);

  let elementHtml = "";
  ["목","화","토","금","수"].forEach(k=>{
    elementHtml += `<p><b>${k}</b>: ${elementResult[k]}개</p>`;
  });
  elementHtml += `<p class="small">※ 위 값은 “8글자 분포(참고)”입니다. ‘내 오행’은 아래 전문가 분석의 “일간 오행”을 보세요.</p>`;

  document.getElementById("elementBox").innerHTML = elementHtml;
  document.getElementById("elementInterpretation").innerHTML = generateElementInterpretation(elementResult);

  // 세운
  let seowoonHtml = sewoonAnalyze(pillars);
  seowoonHtml += analyzeSeowoonWithElements(elementResult);
  document.getElementById("sewoonBox").innerHTML = seowoonHtml;

  // ✅ 전문가(B) 분석: 내 오행(일간), 신강/신약, 용신/희신
  const pillarsObj = pillars.map(p => ({ stem: p[0], branch: p[1] }));
  const st = calcDayMasterStrength(pillarsObj);
  const ys = pickYongShin(st.dmEl, st.verdict);
  const structure = estimateStructure(pillarsObj);
  const climate = analyzeClimate(pillarsObj);

  const expertHtml = `
    <div class="card">
      <h2>🧠 명리학 전문가 분석</h2>
      <p><b>일간(내 오행):</b> ${st.dayStem} (${st.dmEl})</p>
      <p><b>신강/신약:</b> ${st.verdict} (점수 ${st.score})</p>
      <p class="small">
        월지 ${st.monthBranch} / 월령가중치 ${st.seasonMul.toFixed(2)}
        / 통근 ${st.hasRoot ? "있음" : "없음"}
        / 생조 ${st.supportCnt} / 설·극 ${st.drainCnt}
      </p>
      <p><b>용신:</b> ${ys.yong} / <b>희신:</b> ${ys.hee}</p>
      <p><b>격국 추정:</b> ${structure}</p>
      <p><b>조후 분석:</b> ${climate}</p>
      <p class="small">※ 서비스 자동 추정(1차)입니다. 실제 용신은 격국/용희/조후 등으로 추가 정밀화 가능합니다.</p>
    </div>
  `;

  // 종합
  let analysis = "";
  analysis += expertHtml; // ✅ 전문가 카드 맨 위
  analysis += `<p>당신의 4기둥은 <b>${yearPillar} / ${monthPillar} / ${dayPillar} / ${hourPillar}</b> 흐름입니다.</p>`;
  analysis += `<p>오행 분포(참고)에서는 <b>${strongest}</b> 기운이 상대적으로 두드러집니다.</p>`;
  analysis += `<p class="small">TIP) 이 페이지는 “무료/간편 해석” 버전입니다. (추후 절기/대운 정밀/용신 정교화 가능)</p>`;

  const daewoonHtml = generateDaewoon(yearPillar, year);
  analysis += daewoonHtml;

  const currentDaewoon = getCurrentDaewoonPillar(year);
  analysis += analyzeDaewoonVsSeowoon(currentDaewoon);

  const scores = calculateFortuneScores(elementResult, currentDaewoon);
  analysis += generateScoreGraph(scores);
  analysis += generateScoreInterpretation(scores);
  analysis += generateMonthlyGraph(scores);
  analysis += generateYearSummary(scores);
  analysis += generateFullReport(name, pillars, elementResult, scores);

  document.getElementById("analysisBox").innerHTML = analysis;

  // 저장(오행 포함)
  saveReport({
    name,
    birth,
    hour,
    pillars,
    elementCounts: elementResult,
    scores,
    createdAt: new Date().toISOString()
  });

  setupPdfButtons(name, pillars, scores);

  // bar 애니메이션
  setTimeout(()=>{
    Object.keys(scores).forEach(key=>{
      const el = document.getElementById("bar-"+key);
      if(el) el.style.width = scores[key] + "%";
    });
  }, 200);
}
function analyzeClimate(pillarsObj){
  const monthBranch = pillarsObj[1].branch;

  const coldMonths = ["해","자","축"];
  const hotMonths = ["사","오","미"];

  if(coldMonths.includes(monthBranch)){
    return "한기 존재 → 화(火) 필요";
  }

  if(hotMonths.includes(monthBranch)){
    return "열기 강 → 수(水) 필요";
  }

  return "한열 균형";
}
// ===============================
// 12) Globals for safety (if HTML uses onclick anywhere)
// ===============================
window.calculateSaju = calculateSaju;
window.showSavedReports = showSavedReports;
window.loadReport = loadReport;

// ===============================
// 13) INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const loginCheck = document.getElementById("loginCheck");
  const timeInputBox = document.getElementById("timeInputBox");

  // birth 체크: raw가 ISO여도 normalize로 판단
  const birthRaw = localStorage.getItem("birth");
  const birth = normalizeBirthYMD(birthRaw);

  if(!birth){
    if(loginCheck){
      loginCheck.innerHTML =
        "<h2>⚠ 로그인 필요</h2><p>사주 계산은 로그인 후 생년월일이 저장되어야 가능합니다.</p><p class='small'>메인으로 가서 로그인(회원가입) 후 다시 들어와주세요.</p>";
    }
    if(timeInputBox) timeInputBox.style.display = "none";
    return;
  }

  // ISO가 들어있어도 YYYY-MM-DD로 고정 저장 (다른 페이지 꼬임 방지)
  localStorage.setItem("birth", birth);

  if(loginCheck){
    loginCheck.innerHTML =
      "<h2>✅ 준비 완료</h2><p>출생 시간을 입력하면 4기둥 + 오행 + 2026 세운 분석을 보여줄게요.</p>";
  }
  if(timeInputBox) timeInputBox.style.display = "block";

  // 저장된 출생시간 자동 복원
  const savedHour = localStorage.getItem("birthHour");
  const hourEl = document.getElementById("birthHour");
  if(hourEl && savedHour !== null && savedHour !== ""){
    hourEl.value = savedHour;
  }

  // 버튼 바인딩
  document.getElementById("calcBtn")?.addEventListener("click", calculateSaju);
  document.getElementById("reportBtn")?.addEventListener("click", showSavedReports);
});

// //js/saju.js
// (원본 saju.html 인라인 스크립트에서 이전 + 필수 버그 수정 포함)
// ✅ YYYY-MM-DD 는 무조건 로컬(Date(y,m,d))로 파싱 (UTC 밀림 방지)
function parseYmdLocal(ymd){
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(ymd || "").trim());
  if(!m) return null;
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  return new Date(y, mo - 1, d);
}

// ✅ birth 값 정규화: YYYY-MM-DD면 그대로, ISO면 앞 10자리만 (UTC 파싱 금지)
function normalizeBirthYMD(v){
  if(!v) return "";
  const s = String(v).trim();

  // 이미 YYYY-MM-DD면 그대로
  if(/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // ISO/기타 문자열이면 앞 10자리(YYYY-MM-DD)만 추출
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if(m && m[1]) return m[1];

  return "";
}

  // ISO 형태면 로컬 기준으로 YYYY-MM-DD로 변환
  const d = new Date(s);
  if(Number.isNaN(d.getTime())) return "";

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseLocalYMD(ymd){
  if(!ymd) return null;

  // ISO(Z)면 먼저 yyyy-mm-dd로 정규화
  if(String(ymd).includes("T")) {
    const d = new Date(ymd);
    if(Number.isNaN(d.getTime())) return null;
    ymd = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if(!m) return null;

  const y = Number(m[1]), mo = Number(m[2]), da = Number(m[3]);
  return new Date(y, mo-1, da); // ✅ 로컬 기준 생성 (UTC 밀림 방지)
}

// ===============================
// 0) 기본 테이블
// ===============================
const heavenly = ["갑","을","병","정","무","기","경","신","임","계"];
const earthly  = ["자","축","인","묘","진","사","오","미","신","유","술","해"];

// ===============================
// 1) 60갑자 계산 (연주/일주)
// ===============================
function getYearPillar(year){
  const baseYear = 1984; // 갑자년
  const index = (year - baseYear) % 60;
  const normalized = (index + 60) % 60;
  return heavenly[normalized % 10] + earthly[normalized % 12];
}

function getDayPillar(date){
  const baseDate = new Date(1900,0,1); // 1900-01-01 갑자일 (앵커)
  const diff = Math.floor((date - baseDate) / (1000*60*60*24));
  const normalized = (diff % 60 + 60) % 60;
  return heavenly[normalized % 10] + earthly[normalized % 12];
}

// ===============================
// 2) 월주(절기 간이) 계산
// ===============================
function getMonthBranch(date){
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if(month === 1) return "축";
  if(month === 2) return day < 4 ? "축" : "인";
  if(month === 3) return "묘";
  if(month === 4) return "진";
  if(month === 5) return "사";
  if(month === 6) return "오";
  if(month === 7) return "미";
  if(month === 8) return "신";
  if(month === 9) return "유";
  if(month === 10) return "술";
  if(month === 11) return "해";
  if(month === 12) return "자";
  return "축";
}

function getMonthPillar(date){
  const monthBranch = getMonthBranch(date);

  const year = date.getFullYear();
  const yearIndex = ((year - 1984) % 60 + 60) % 60;
  const yearStemIndex = yearIndex % 10;

  const branchIndex = earthly.indexOf(monthBranch);
  const monthStemIndex = (yearStemIndex * 2 + branchIndex) % 10;

  return heavenly[monthStemIndex] + monthBranch;
}

// ===============================
// 3) 시주 계산
// ===============================
function getHourBranch(hour){
  return earthly[Math.floor(((hour + 1) % 24) / 2)];
}

function getHourPillar(dayPillar, hour){
  const dayStem = dayPillar[0];
  const dayStemIndex = heavenly.indexOf(dayStem);

  const hourBranch = getHourBranch(hour);
  const hourBranchIndex = earthly.indexOf(hourBranch);

  const hourStemIndex = (dayStemIndex * 2 + hourBranchIndex) % 10;
  return heavenly[hourStemIndex] + hourBranch;
}

// ===============================
// 4) 오행 분석
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

  if(counts["목"] === 0) text += "<p>🌿 목 보완: 자연/초록색/독서/기획·성장 루틴이 도움.</p>";
  if(counts["화"] === 0) text += "<p>🔥 화 보완: 운동/햇빛/표현·발표/따뜻한 인간관계가 도움.</p>";
  if(counts["토"] === 0) text += "<p>🪨 토 보완: 규칙적인 생활/저축/체력관리/기반 만들기가 도움.</p>";
  if(counts["금"] === 0) text += "<p>⚙ 금 보완: 정리정돈/규칙/문서화/금융 공부가 도움.</p>";
  if(counts["수"] === 0) text += "<p>💧 수 보완: 명상/학습/여행/휴식/물과 친해지기(수영 등)가 도움.</p>";

  return text || "<p>오행이 비교적 고르게 분포되어 있어, ‘한 방’보다 ‘꾸준함’이 강점입니다.</p>";
}

// ===============================
// 5) 2026 세운(병오) 합충 분석
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

  let html = `<p><b>2026년 세운:</b> <span class="badge">${sewoon}</span> (불의 기운(화)이 강한 해로 “속도/결정/노출”이 강조됩니다.)</p>`;

  if(!hits.branchCombo.length && !hits.branchClash.length && !hits.stemCombo.length){
    html += `<p>올해(병오)와의 합충 신호가 강하게 잡히진 않습니다. 대신 기본 사주 흐름(오행 밸런스)을 우선으로 보면 좋아요.</p>`;
    html += `<p class="small">※ 그래도 ‘화(火)’ 기운이 강한 해라, 결정/발표/노출/속도전 이슈가 생길 수 있어요.</p>`;
    return html;
  }

  if(hits.branchCombo.length){
    html += `<h3>✅ 합(合) 포인트</h3>`;
    html += `<p>올해는 “연결/협력/도움”이 생기기 쉬운 구조입니다.</p>`;
    hits.branchCombo.forEach(t=> html += `<p>• ${t}</p>`);
    html += `<p class="small">합이 뜨면: 제휴/소개/협업/관계 확장이 유리한 편입니다.</p>`;
  }

  if(hits.stemCombo.length){
    html += `<h3>✅ 천간합 포인트</h3>`;
    html += `<p>일/돈/관계에서 ‘타이밍이 맞는’ 느낌이 오기 쉽습니다. 계약/협상은 조건만 잘 보세요.</p>`;
    hits.stemCombo.forEach(t=> html += `<p>• ${t}</p>`);
  }

  if(hits.branchClash.length){
    html += `<h3>⚠️ 충(沖) 포인트</h3>`;
    html += `<p>올해는 변화·이동·정리 이슈가 강하게 들어올 수 있어요. ‘급발진’만 주의하면 오히려 기회가 됩니다.</p>`;
    hits.branchClash.forEach(t=> html += `<p>• ${t}</p>`);
    html += `<p class="small">충이 뜨면: 이직/이사/관계 재정렬/루틴 변화가 생길 수 있습니다. 안전/건강/충동소비 관리 추천.</p>`;
  }

  return html;
}

function analyzeSeowoonWithElements(elementCounts){
  const fireCount = elementCounts["화"] || 0;
  let text = "";

  text += `<h3>🔥 2026년 화(火) 기운 영향</h3>`;

  if(fireCount >= 3){
    text += `
      <p>원국에 이미 화(火) 기운이 강한 편입니다.</p>
      <p>2026년은 화의 해(병오)라, 과열·속도전·감정기복이 커질 수 있습니다.</p>
      <p><b>주의:</b> 충동 소비, 급한 결정, 인간관계 갈등 관리 필요.</p>
      <p><b>기회:</b> 마케팅·노출·발표·SNS·유튜브 활동은 강점이 됩니다.</p>
    `;
  } else if(fireCount === 0){
    text += `
      <p>원국에 화(火) 기운이 부족한 편입니다.</p>
      <p>2026년은 부족한 화를 채워주는 해입니다.</p>
      <p><b>기회:</b> 도전·시작·이직·창업·브랜딩에 유리.</p>
      <p>그동안 미뤄둔 일을 실행하기 좋은 해입니다.</p>
    `;
  } else{
    text += `
      <p>화(火) 기운이 적당히 존재합니다.</p>
      <p>2026년은 활동성과 추진력이 상승하는 해입니다.</p>
      <p>적극적으로 움직이면 성과를 얻을 수 있습니다.</p>
    `;
  }

  return text;
}

// ===============================
// (버그 수정) generateMonthlyGraph 이름 불일치 해결용 별칭
// ===============================
function generateMonthlyGraph(scores){
  return generateMonthlyGraphAll(scores);
}

// ===============================
// 6) 메인 계산
// ===============================
function calculateSaju(){
  const name = localStorage.getItem("name") || "회원";
  const birth = normalizeBirthYMD(localStorage.getItem("birth"));
  const hour = parseInt(document.getElementById("birthHour").value, 10);

  if(!birth){
    alert("로그인이 필요합니다. (생년월일 정보가 없습니다)");
    return;
  }
  if(Number.isNaN(hour) || hour < 0 || hour > 23){
    alert("출생 시간을 0~23 사이로 입력해주세요.");
    return;
  }

  const birthDate = parseYmdLocal(birth);
  if(!birthDate){
    alert("생년월일 형식이 이상합니다. 다시 로그인/저장 후 시도해주세요.");
    return;
  }

  const year = birthDate.getFullYear();

  const yearPillar  = getYearPillar(year);
  const monthPillar = getMonthPillar(birthDate);
  const dayPillar   = getDayPillar(birthDate);
  const hourPillar  = getHourPillar(dayPillar, hour);

  const pillars = [yearPillar, monthPillar, dayPillar, hourPillar];

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

  const elementResult = analyzeElements(pillars);
  let strongest = Object.keys(elementResult).reduce((a,b)=> elementResult[a] > elementResult[b] ? a : b);

  let elementHtml = "";
  ["목","화","토","금","수"].forEach(k=>{
    elementHtml += `<p><b>${k}</b>: ${elementResult[k]}개</p>`;
  });
  elementHtml += `<p><b>가장 강한 기운:</b> ${strongest}</p>`;

  document.getElementById("elementBox").innerHTML = elementHtml;
  document.getElementById("elementInterpretation").innerHTML = generateElementInterpretation(elementResult);

  let seowoonHtml = sewoonAnalyze(pillars);
  seowoonHtml += analyzeSeowoonWithElements(elementResult);
  document.getElementById("sewoonBox").innerHTML = seowoonHtml;

  let analysis = "";
  analysis += `<p>당신의 4기둥은 <b>${yearPillar} / ${monthPillar} / ${dayPillar} / ${hourPillar}</b> 흐름으로 정리됩니다.</p>`;
  analysis += `<p>오행 관점에서는 <b>${strongest}</b> 기운이 상대적으로 강해, 올해는 그 특성이 “결정/선택”에 영향을 주기 쉬워요.</p>`;
  analysis += `<p class="small">TIP) 이 페이지는 “무료/간편 해석” 버전이라, 추후 대운/세운 확장하면 훨씬 더 정밀해집니다.</p>`;

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

// calculateSaju() 안 saveReport 호출부를 이렇게 변경
saveReport({
  name,
  birth,
  hour,
  pillars,
  elementCounts: elementResult,   // ✅ 추가
  scores,
  createdAt: new Date().toISOString()
});

  setupPdfButtons(name, pillars, scores);

  // bar 애니메이션
  setTimeout(()=>{
    const again = calculateFortuneScores(elementResult, currentDaewoon);
    Object.keys(again).forEach(key=>{
      const el = document.getElementById("bar-"+key);
      if(el) el.style.width = again[key] + "%";
    });
  }, 200);
}

// ===============================
// 7) 원본 하단 함수들(DOMContentLoaded 내부에 있던 것들)을
//    전역으로 꺼내서 calculateSaju에서 접근 가능하게 정리
// ===============================
function generateDaewoon(startYearPillar, birthYear){
  const baseYear = 1984;
  const yearIndex = ((birthYear - baseYear) % 60 + 60) % 60;

  let html = "<h3>📈 대운(10년 운) 흐름</h3>";

  for(let i=1;i<=8;i++){
    const ageStart = i*10;
    const pillarIndex = (yearIndex + i) % 60;

    const stem = heavenly[pillarIndex % 10];
    const branch = earthly[pillarIndex % 12];
    const pillar = stem + branch;

    html += `
      <p><b>${ageStart}세 ~ ${ageStart+9}세</b> :
      <span class="badge">${pillar}</span></p>
    `;
  }

  html += `<p class="small">
    ※ 간이 대운 계산 버전입니다. (절기·순행·역행 미적용)
  </p>`;

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

  let html = "<h3>🔥 현재 대운 × 2026 세운 분석</h3>";

  if(BRANCH_CLASH[dBranch] === sBranch){
    html += `
      <p><b>⚠ 강한 변화 운</b></p>
      <p>현재 대운(${currentDaewoon})과 세운(${seowoon})이 충합니다.</p>
      <p>이직, 이사, 관계 정리, 사업 방향 수정 가능성.</p>
    `;
  } else if(BRANCH_COMBO[dBranch] === sBranch){
    html += `
      <p><b>✅ 확장 운</b></p>
      <p>현재 대운과 세운이 합을 이룹니다.</p>
      <p>협력·확장·관계 도움 운 상승.</p>
    `;
  } else{
    html += `
      <p>큰 충합 구조는 아닙니다.</p>
      <p>기본 흐름을 안정적으로 유지하는 해입니다.</p>
    `;
  }
  return html;
}

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
    if(score >= 80) return "매우 강한 흐름입니다. 적극적으로 움직이면 성과가 큽니다.";
    if(score >= 65) return "좋은 흐름입니다. 준비한 만큼 결과가 나옵니다.";
    if(score >= 50) return "평균적인 흐름입니다. 무리하지 않는 것이 중요합니다.";
    return "주의가 필요한 시기입니다. 보수적으로 운영하는 것이 좋습니다.";
  }

  return `
  <h3>🧠 2026년 종합 해석</h3>
  <p><b>💰 재물운:</b> ${interpret(scores.wealth)}</p>
  <p><b>💖 연애운:</b> ${interpret(scores.love)}</p>
  <p><b>🏢 직장/사업운:</b> ${interpret(scores.career)}</p>
  <p><b>💪 건강운:</b> ${interpret(scores.health)}</p>

  <p style="margin-top:15px;">
  2026년은 기본적으로 화(火)의 해입니다.
  당신의 사주 구조에 따라 속도·결정·변화가 키워드가 됩니다.
  점수가 높은 영역은 과감히 확장하고,
  낮은 영역은 리스크 관리에 집중하세요.
  </p>
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
      if(type==="wealth") return "수익 확장 가능성 높음. 투자·사업 기회 검토해볼 만한 시기.";
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

  if(avg >= 80) comment = "🔥 2026년은 인생 흐름이 강하게 상승하는 해입니다. 확장과 도전이 성과로 이어질 가능성이 높습니다.";
  else if(avg >= 65) comment = "✨ 2026년은 안정적 성장 흐름입니다. 준비된 영역에서 결과가 나타날 가능성이 큽니다.";
  else if(avg >= 50) comment = "⚖ 2026년은 유지와 관리의 해입니다. 큰 모험보다 전략적 운영이 유리합니다.";
  else comment = "⚠ 2026년은 리스크 관리가 중요한 해입니다. 보수적 판단과 체력 관리에 집중하세요.";

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

    <p>오행 분석 결과 <b>${strongest}</b> 기운이 중심이 되는 구조입니다.
    강한 오행은 장점이 되지만 과하면 균형을 깨뜨릴 수 있으므로 2026년에는 균형 전략이 중요합니다.</p>

    <p>2026년은 병오년(丙午)으로 화(火)의 기운이 강하게 작용하는 해입니다.
    평균 운세 점수는 <b>${avg}점</b>으로 분석되며,
    전반적으로 ${avg >= 70 ? "상승 기류가 감지되는 해" : "관리 중심 전략이 필요한 해"}입니다.</p>
  `;

  if(scores.wealth >= 75) text += `<p>재물운은 확장 가능성이 높습니다. 새로운 수익 모델이나 투자 검토에 적합합니다.</p>`;
  else if(scores.wealth < 55) text += `<p>재물 영역은 방어 전략이 필요합니다. 현금 흐름 관리와 지출 통제가 핵심입니다.</p>`;

  if(scores.love >= 75) text += `<p>연애·인간관계는 발전 가능성이 높습니다. 적극적 표현이 좋은 결과를 만들 수 있습니다.</p>`;
  else if(scores.love < 55) text += `<p>관계 영역에서는 갈등 관리가 중요합니다. 감정 기복 조절이 관건입니다.</p>`;

  if(scores.career >= 75) text += `<p>직장·사업 영역은 성과 창출 가능성이 높습니다. 브랜딩·노출 활동이 유리합니다.</p>`;
  if(scores.health < 55) text += `<p>건강 영역은 체력 관리가 필요합니다. 과로와 수면 부족을 경계하세요.</p>`;

  text += `
    <p style="margin-top:15px;">
      종합적으로 2026년은 “${strongest}의 활용 전략”이 핵심입니다.
      강한 영역은 확장하고, 약한 영역은 관리하는 균형 운영이 가장 높은 성과를 만들 것입니다.
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
      <p>
        ${i+1}. ${r.name} / ${r.birth} / ${r.hour}시
        <button onclick="loadReport(${i})">불러오기</button>
      </p>
    `;
  });
  html += "</div>";

  document.getElementById("analysisBox").innerHTML = html;
}

function loadReport(index){
  const list = JSON.parse(localStorage.getItem("myReports") || "[]");
  const r = list[index];
  if(!r) return;

  const elementCounts = analyzeElements(r.pillars);

  document.getElementById("analysisBox").innerHTML =
    generateFullReport(r.name, r.pillars, elementCounts, r.scores);
}

// 전역 노출 (HTML에서 onclick 쓰는 버튼이 있으면 필요)
// 이번 정리버전은 reportBtn에서 addEventListener 쓰지만, 안전하게 유지
window.calculateSaju = calculateSaju;
window.showSavedReports = showSavedReports;
window.loadReport = loadReport;

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  console.log("[saju.js] DOMContentLoaded ✅");

  const birthRaw = localStorage.getItem("birth");
  const birth = normalizeBirthYMD(birthRaw);

  if(!birth){
    document.getElementById("loginCheck").innerHTML =
      "<h2>⚠ 로그인 필요</h2><p>사주 계산은 로그인 후 생년월일이 저장되어야 가능합니다.</p><p class='small'>메인으로 가서 로그인(회원가입) 후 다시 들어와주세요.</p>";
    document.getElementById("timeInputBox").style.display = "none";
    return;
  }

  // ISO가 들어있어도 YYYY-MM-DD로 고정 저장
  localStorage.setItem("birth", birth);

  document.getElementById("loginCheck").innerHTML =
    "<h2>✅ 준비 완료</h2><p>출생 시간을 입력하면 4기둥 + 오행 + 2026 세운 분석을 보여줄게요.</p>";
  document.getElementById("timeInputBox").style.display = "block";

  document.getElementById("calcBtn")?.addEventListener("click", calculateSaju);
  document.getElementById("reportBtn")?.addEventListener("click", showSavedReports);

  // (선택) 모바일 디버그 텍스트
  // const debug = document.createElement("div");
  // debug.style.cssText="background:#300;padding:10px;margin-top:10px;font-size:12px;";
  // debug.innerHTML = "birth raw: " + birthRaw + "<br>birth normalized: " + birth;
  // document.body.appendChild(debug);
});

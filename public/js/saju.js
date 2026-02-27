// /pages/saju/saju.js
(() => {
  // -----------------------------
  // 0) 유틸 (UTC 밀림 방지)
  // -----------------------------
  function normalizeBirthYMD(v){
    if(!v) return "";
    const s = String(v).trim();

    // 이미 YYYY-MM-DD면 그대로
    if(/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

    // 혹시 ISO면 앞 10자리만 우선(UTC 밀림 방지)
    const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
    if(m && m[1]) return m[1];

    return "";
  }

  function parseLocalYMD(ymd){
    if(!ymd) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
    if(!m) return null;
    const y = Number(m[1]), mo = Number(m[2]), da = Number(m[3]);
    return new Date(y, mo-1, da); // 로컬 기준 생성
  }

  // -----------------------------
  // 1) 기본 테이블
  // -----------------------------
  const heavenly = ["갑","을","병","정","무","기","경","신","임","계"];
  const earthly  = ["자","축","인","묘","진","사","오","미","신","유","술","해"];

  // -----------------------------
  // 2) 60갑자 (연/일)
  // -----------------------------
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

  // -----------------------------
  // 3) 월주(절기 간이)
  // -----------------------------
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

  // -----------------------------
  // 4) 시주
  // -----------------------------
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

  // -----------------------------
  // 5) 오행
  // -----------------------------
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

  // -----------------------------
  // 6) 2026 세운 합충
  // -----------------------------
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
    let text = `<h3>🔥 2026년 화(火) 기운 영향</h3>`;

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
    } else {
      text += `
        <p>화(火) 기운이 적당히 존재합니다.</p>
        <p>2026년은 활동성과 추진력이 상승하는 해입니다.</p>
        <p>적극적으로 움직이면 성과를 얻을 수 있습니다.</p>
      `;
    }

    return text;
  }

  // -----------------------------
  // 7) 리포트/그래프 관련 (원본 함수들 그대로 둘 수 있음)
  // ⚠️ 너 코드에서 generateMonthlyGraph(scores) 호출인데,
  // 실제 정의는 generateMonthlyGraphAll(...)라서 에러가 날 수 있음.
  // -> 래퍼로 안전하게 연결.
  // -----------------------------
  function generateMonthlyGraph(scores){
    return generateMonthlyGraphAll(scores);
  }

  // ↓↓↓ 아래 함수들은 너가 이미 가지고 있는 “그대로”를 붙여넣으면 됨.
  // (너가 준 saju.html 인라인에서: generateDaewoon, getCurrentDaewoonPillar, analyzeDaewoonVsSeowoon,
  // calculateFortuneScores, generateScoreGraph, generateScoreInterpretation, generateMonthlyGraphAll,
  // generateMonthlyTextAll, generateYearSummary, generateFullReport, generateSummaryContent,
  // setupPdfButtons, getTodayString, saveReport, showSavedReports, loadReport)

  // 여기서는 너무 길어지니, “원본 그대로 복사”만 하면 되고,
  // 단 2가지만 수정하면 돼:
  // 1) showSavedReports, loadReport는 window에 노출(버튼에서 사용하거나 디버깅용)
  // 2) calculateSaju도 window에 노출(혹시 다른 데서 호출할 수 있으니)

  // -----------------------------
  // 8) 메인 계산 (원본 기반)
  // -----------------------------
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

    const birthDate = parseLocalYMD(birth);
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

    // ✅ 표시용: 사용자가 음력 입력했다면 birth_input도 보여주면 UX 좋아짐
    const birthInput = localStorage.getItem("birth_input");
    const birthInputType = localStorage.getItem("birth_input_type");
    const birthInputIsLeap = localStorage.getItem("birth_input_isLeap");

    let birthHtml = `<p>생년월일(양력 저장): ${birth}</p>`;
    if(birthInput && birthInputType){
      birthHtml += `<p class="small">입력값: ${birthInputType === "lunar" ? "음력" : "양력"} ${birthInput}${birthInputType==="lunar" ? (birthInputIsLeap==="1" ? " (윤달)" : "") : ""}</p>`;
    }

    document.getElementById("basicInfo").innerHTML =
      `<p><b>${name}</b></p>
       ${birthHtml}
       <p>출생시간: ${hour}시</p>`;

    document.getElementById("sajuBox").innerHTML =
      `<span class="badge">연주: ${yearPillar}</span>
       <span class="badge">월주: ${monthPillar}</span>
       <span class="badge">일주: ${dayPillar}</span>
       <span class="badge">시주: ${hourPillar}</span>`;

    const elementResult = analyzeElements(pillars);
    const strongest = Object.keys(elementResult).reduce((a,b)=> elementResult[a] > elementResult[b] ? a : b);

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

    // ⚠️ 아래 “리포트/대운/점수/월별/저장/PDF” 함수들은
    // 네 원본 것을 그대로 아래에 붙여 넣으면 됨.
    // (여기서는 길이 때문에 생략)
  }

  // -----------------------------
  // 9) 초기 진입
  // -----------------------------
  function init(){
    const birth = localStorage.getItem("birth");
    const loginCheck = document.getElementById("loginCheck");
    const timeBox = document.getElementById("timeInputBox");

    if(!birth){
      if(loginCheck){
        loginCheck.innerHTML =
          "<h2>⚠ 로그인 필요</h2><p>사주 계산은 로그인 후 생년월일이 저장되어야 가능합니다.</p><p class='small'>메인으로 가서 로그인(회원가입) 후 다시 들어와주세요.</p>";
      }
      if(timeBox) timeBox.style.display="none";
      return;
    }

    if(loginCheck){
      loginCheck.innerHTML =
        "<h2>✅ 준비 완료</h2><p>출생 시간을 입력하면 4기둥 + 오행 + 2026 세운 분석을 보여줄게요.</p>";
    }
    if(timeBox) timeBox.style.display="block";

    document.getElementById("calcBtn")?.addEventListener("click", calculateSaju);
    document.getElementById("reportBtn")?.addEventListener("click", () => {
      // showSavedReports()를 너가 원본 그대로 붙일 경우 여기서 호출
      if(typeof window.showSavedReports === "function") window.showSavedReports();
      else alert("리포트 보기 기능(showSavedReports)이 아직 saju.js에 포함되지 않았어요.");
    });
  }

  // 전역 노출(필요시)
  window.calculateSaju = calculateSaju;

  document.addEventListener("DOMContentLoaded", init);
})();

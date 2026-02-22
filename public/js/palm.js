console.log("palm.js loaded (expert version)");

/* =====================================================
   상태 관리
===================================================== */

let currentHand = "left"; // left | right
let guideSvgRoot = null;

const answers = {
  left: {},
  right: {}
};

/* =====================================================
   10문항 정의 (전문화)
===================================================== */

const QUESTIONS = [
  { id:"q1",  text:"생명선과 두뇌선 시작이 붙어 있나요?", axis:"personality", line:"life_head_start" },
  { id:"q2",  text:"생명선이 길고 끊김 없이 이어져 있나요?", axis:"energy", line:"life_line" },
  { id:"q3",  text:"생명선이 굵고 깊게 보이나요?", axis:"energy", line:"life_line" },
  { id:"q4",  text:"두뇌선이 길고 선명한가요?", axis:"mind", line:"head_line" },
  { id:"q5",  text:"두뇌선이 아래로 휘어 내려가나요?", axis:"mind", line:"head_line" },
  { id:"q6",  text:"두뇌선이 끊기거나 섬 형태가 있나요?", axis:"mind", line:"head_line" },
  { id:"q7",  text:"감정선이 선명하고 안정적인가요?", axis:"emotion", line:"heart_line" },
  { id:"q8",  text:"감정선이 사슬형으로 보이나요?", axis:"emotion", line:"heart_line" },
  { id:"q9",  text:"운명선이 뚜렷하게 올라오나요?", axis:"career", line:"fate_line" },
  { id:"q10", text:"태양선(약지 아래 세로선)이 보이나요?", axis:"career", line:"sun_line" }
];

/* =====================================================
   로그인 표시
===================================================== */

function renderLoginCheck(){
  const box = document.getElementById("loginCheck");
  if(!box) return;
  const phone = localStorage.getItem("phone");

  if(phone){
    box.innerHTML = `
      <h2 style="margin:0 0 8px;">✅ 로그인 상태</h2>
      <div class="small">리딩 보기 시 하루 1회 포인트 +1 적립</div>
    `;
  }else{
    box.innerHTML = `
      <h2 style="margin:0 0 8px;">🙂 비로그인 이용 중</h2>
      <div class="small">로그인하면 포인트 적립 + 리딩 고정화 기능 가능</div>
    `;
  }
}

/* =====================================================
   질문 UI 렌더
===================================================== */

function renderQuestions(){
  const grid = document.getElementById("qGrid");
  grid.innerHTML = "";

  QUESTIONS.forEach(q=>{
    const card = document.createElement("div");
    card.className = "qCard";

    card.innerHTML = `
      <div class="qTop">
        <div>
          <div class="qTitle">${q.text}</div>
        </div>
        <div class="yn">
          <button data-val="Y">Y</button>
          <button data-val="N">N</button>
        </div>
      </div>
    `;

    const btns = card.querySelectorAll(".yn button");

    btns.forEach(btn=>{
      btn.addEventListener("click",()=>{
        answers[currentHand][q.id] = btn.dataset.val;

        btns.forEach(b=>b.classList.remove("active"));
        btn.classList.add("active");

        updateGuideLine(q.line, btn.dataset.val === "Y");
      });
    });

    grid.appendChild(card);
  });
}

/* =====================================================
   가이드 SVG 처리
===================================================== */

async function loadGuide(hand){
  const box = document.getElementById("guideBox");
  const file = hand === "left"
    ? "/assets/palm_guide_left.svg"
    : "/assets/palm_guide_right.svg";

  const txt = await fetch(file).then(r=>r.text());
  box.innerHTML = txt;
  guideSvgRoot = box.querySelector("svg");
}

function updateGuideLine(lineId, on){
  if(!guideSvgRoot) return;
  const el = guideSvgRoot.querySelector(`#${lineId}`);
  if(!el) return;
  el.style.stroke = on ? "#4da3ff" : "#ffffff33";
}

/* =====================================================
   리딩 엔진 (전문화 핵심)
===================================================== */

function analyzeHand(hand){
  const a = answers[hand] || {};
  const yes = (id)=> a[id] === "Y";
  const no  = (id)=> a[id] === "N";

  // ---------------------------
  // 0) 데이터 유효성
  // ---------------------------
  const answeredCount = QUESTIONS.filter(q => a[q.id] === "Y" || a[q.id] === "N").length;
  if(answeredCount < 6){
    return `
      <h3>체크가 조금 더 필요해요</h3>
      <p>현재 <b>${answeredCount}/10</b>개만 체크되어 있어 정확도가 떨어집니다.</p>
      <p class="small">최소 6개 이상 체크하면 리딩이 훨씬 안정적으로 나와요.</p>
    `;
  }

  // ---------------------------
  // 1) 핵심 패턴(전문가식 조합 규칙)
  // ---------------------------

  // A. 기질/결정 스타일 (Q1)
  let temperament = "";
  let temperamentAdvice = "";
  if(yes("q1")){
    temperament = "신중·안정형(리스크를 줄이고 안전하게 가는 타입)";
    temperamentAdvice = "급한 결정보다 ‘조건 정리 → 실행’이 맞습니다. 확인/검증이 강점이에요.";
  }else if(no("q1")){
    temperament = "독립·실행형(속도가 빠르고 결단이 빠른 타입)";
    temperamentAdvice = "속도가 장점이지만, 큰 계약/돈/관계 결정은 ‘하루 숙성’ 규칙을 두면 손실을 줄입니다.";
  }else{
    temperament = "기질 체크가 미완료(기본 성향 판단 보류)";
    temperamentAdvice = "Q1을 체크하면 리딩의 전체 톤이 더 정확해져요.";
  }

  // B. 체력/회복(생명선) (Q2,Q3)
  let energy = "";
  let energyAdvice = "";
  if(yes("q2") && yes("q3")){
    energy = "체력/회복력 강(지구력형)";
    energyAdvice = "강하게 몰아붙여도 버티는 편. 다만 ‘과신’이 과로로 연결되기 쉬워 휴식 루틴만 고정하세요.";
  }else if(yes("q2") && no("q3")){
    energy = "지구력은 있으나 컨디션 기복 가능(길지만 얕은 편)";
    energyAdvice = "밤샘·불규칙이 반복되면 급격히 떨어질 수 있어요. 수면/식사 리듬이 핵심.";
  }else if(no("q2")){
    energy = "체력 관리가 운의 바닥(끊김/짧음 가능)";
    energyAdvice = "무리한 확장보다 ‘회복 → 안정화’가 먼저. 일정 빡빡하게 잡으면 성과도 흔들립니다.";
  }else{
    energy = "체력 파트 정보가 애매(추가 체크 권장)";
    energyAdvice = "Q2, Q3 체크 정확도를 올리면 건강/일 흐름이 더 선명해져요.";
  }

  // C. 사고/두뇌선(집중 vs 감성 vs 스트레스) (Q4,Q5,Q6)
  let mind = "";
  let mindAdvice = "";

  // 스트레스 신호 우선
  if(yes("q6")){
    mind = "생각 과부하/스트레스 민감(두뇌선 섬/끊김 신호)";
    mindAdvice = "중요한 결정은 ‘피곤한 날 금지’. 업무는 쪼개고, 기록으로 실수 방어하는 타입이 유리합니다.";
  }else if(yes("q4") && yes("q5")){
    mind = "분석 + 창의 혼합형(기획/콘텐츠/전략에 강함)";
    mindAdvice = "아이디어를 ‘루틴/템플릿’으로 시스템화하면 돈이 됩니다. 하나를 끝까지 만드는 습관이 최강.";
  }else if(yes("q4") && no("q5")){
    mind = "분석/기획형(직관보다 논리)";
    mindAdvice = "데이터/기록 기반으로 밀면 승률이 올라갑니다. 다만 ‘완벽주의로 지연’만 조심하세요.";
  }else if(yes("q5") && no("q4")){
    mind = "감성/상상형(콘텐츠/관계/감각에 강함)";
    mindAdvice = "환경·기분 영향을 받기 쉬워요. 집중 시간대를 고정하면 생산성이 확 뛰는 타입입니다.";
  }else{
    mind = "두뇌선 스타일이 중립 또는 체크 부족";
    mindAdvice = "Q4~Q6을 다시 확인하면 ‘일/학습/결정’ 방향 제시가 더 정확해져요.";
  }

  // D. 감정선/관계 (Q7,Q8)
  let emotion = "";
  let emotionAdvice = "";
  if(yes("q7") && yes("q8")){
    // 둘 다 yes는 모순 가능(선명 + 사슬형). “부분적 사슬형”으로 처리
    emotion = "겉으론 안정적이지만 예민 구간이 존재(부분 사슬형 가능)";
    emotionAdvice = "오해가 생기면 ‘바로 확인’이 최선. 감정이 올라올수록 메시지/말은 한 박자 쉬세요.";
  }else if(yes("q7")){
    emotion = "관계 안정/표현형(감정선 안정)";
    emotionAdvice = "관계 운은 유지력이 좋아요. ‘작은 표현’이 복을 부르는 손금 흐름입니다.";
  }else if(yes("q8")){
    emotion = "예민/오해 주의(감정선 사슬형)";
    emotionAdvice = "상대 의도를 ‘추측’하면 손해. 확인 질문이 관계 운을 살립니다. 감정 소비 줄이는 게 핵심.";
  }else{
    emotion = "관계 파트 중립 또는 체크 부족";
    emotionAdvice = "Q7/Q8 중 하나라도 체크되면 연애·대인 흐름이 더 선명해져요.";
  }

  // E. 커리어/사회선(운명선/태양선) (Q9,Q10)
  let career = "";
  let careerAdvice = "";

  if(yes("q9") && yes("q10")){
    career = "커리어 + 인정운 동시(성과가 ‘보이기’ 좋은 타입)";
    careerAdvice = "포트폴리오/성과정리/공개가 운을 끌어올립니다. ‘보여주는 능력’이 돈으로 연결돼요.";
  }else if(yes("q9") && no("q10")){
    career = "책임/일 중심(성과는 쌓이지만 티가 덜 날 수 있음)";
    careerAdvice = "성과를 문서/리포트/수치로 남기면 평가가 올라갑니다. ‘보이는 결과물’이 필수.";
  }else if(no("q9") && yes("q10")){
    career = "인정/브랜딩은 있으나 루틴/조직선은 약할 수 있음";
    careerAdvice = "프리랜서/개인브랜드형으로 강점. 대신 일정·수입 구조를 시스템화해야 안정됩니다.";
  }else{
    career = "커리어선 중립 또는 체크 부족";
    careerAdvice = "Q9/Q10을 다시 보면 ‘일 방향성’이 확실히 잡혀요.";
  }

  // ---------------------------
  // 2) 손(왼/오) 의미를 합쳐서 설명
  // ---------------------------
  const handMeaning = (hand === "left")
    ? "왼손은 ‘타고난 기질/기본 흐름’"
    : "오른손은 ‘현재/노력/변화된 흐름’";

  // ---------------------------
  // 3) 최종 문장(전문가식 구조)
  // ---------------------------
  return `
    <h3>핵심 요약 (${handMeaning})</h3>
    <p><b>기질:</b> ${temperament}</p>
    <p><b>체력:</b> ${energy}</p>
    <p><b>사고/집중:</b> ${mind}</p>
    <p><b>관계/감정:</b> ${emotion}</p>
    <p><b>커리어:</b> ${career}</p>

    <div class="hr"></div>

    <h3>근거(체크된 포인트 기반)</h3>
    <ul>
      ${yes("q1") ? "<li>Q1: 시작선 결합 → 신중·안정형 경향</li>" : (no("q1") ? "<li>Q1: 시작선 분리 → 독립·실행형 경향</li>" : "")}
      ${yes("q2") ? "<li>Q2: 생명선 끊김 적음 → 회복/지구력 기반</li>" : (no("q2") ? "<li>Q2: 생명선이 약하거나 끊김 → 리듬/과로 관리 중요</li>" : "")}
      ${yes("q3") ? "<li>Q3: 생명선 굵음 → 체력 에너지 강</li>" : ""}
      ${yes("q4") ? "<li>Q4: 두뇌선 길고 선명 → 분석/기획 강</li>" : ""}
      ${yes("q5") ? "<li>Q5: 두뇌선 하강 → 감성/상상 강</li>" : ""}
      ${yes("q6") ? "<li>Q6: 두뇌선 섬/끊김 → 스트레스/과부하 신호</li>" : ""}
      ${yes("q7") ? "<li>Q7: 감정선 안정 → 관계 유지력</li>" : ""}
      ${yes("q8") ? "<li>Q8: 감정선 사슬형 → 예민/오해 주의</li>" : ""}
      ${yes("q9") ? "<li>Q9: 운명선 뚜렷 → 일/책임/커리어 중심</li>" : ""}
      ${yes("q10") ? "<li>Q10: 태양선 존재 → 인정/평판/브랜딩 운</li>" : ""}
    </ul>

    <div class="hr"></div>

    <h3>행동 조언(현실 적용)</h3>
    <p>• <b>기질:</b> ${temperamentAdvice}</p>
    <p>• <b>체력:</b> ${energyAdvice}</p>
    <p>• <b>사고:</b> ${mindAdvice}</p>
    <p>• <b>관계:</b> ${emotionAdvice}</p>
    <p>• <b>커리어:</b> ${careerAdvice}</p>

    <p class="small">※ 전문 손금도 ‘선의 형태/깊이/교차/방향’을 종합합니다. 현재는 10문항으로 압축한 간편 리딩입니다.</p>
  `;
}

/* =====================================================
   결과 출력
===================================================== */

function renderResult(single=true){
  const box = document.getElementById("textBox");
  const resultWrap = document.getElementById("result");

  if(single){
    box.innerHTML = analyzeHand(currentHand);
  }else{
    box.innerHTML = `
      <h2>왼손 리딩</h2>
      ${analyzeHand("left")}
      <hr>
      <h2>오른손 리딩</h2>
      ${analyzeHand("right")}
    `;
  }

  resultWrap.style.display="block";
  window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"});
}

/* =====================================================
   카메라 (기본형)
===================================================== */

let camStream=null;

async function openCamera(){
  const modal=document.getElementById("camModal");
  const video=document.getElementById("camVideo");
  modal.classList.add("show");

  camStream = await navigator.mediaDevices.getUserMedia({
    video:{facingMode:"environment"}
  });

  video.srcObject=camStream;
}

function closeCamera(){
  document.getElementById("camModal").classList.remove("show");
  if(camStream){
    camStream.getTracks().forEach(t=>t.stop());
  }
}

function capture(){
  const video=document.getElementById("camVideo");
  const canvas=document.createElement("canvas");
  canvas.width=video.videoWidth;
  canvas.height=video.videoHeight;
  canvas.getContext("2d").drawImage(video,0,0);

  const img=document.getElementById("previewImg");
  img.src=canvas.toDataURL("image/jpeg");
  img.style.display="block";
  document.getElementById("previewPlaceholder").style.display="none";

  closeCamera();
}

/* =====================================================
   초기화
===================================================== */

document.addEventListener("DOMContentLoaded", async()=>{

  renderLoginCheck();
  renderQuestions();
  await loadGuide("left");

  document.getElementById("btnLeft").addEventListener("click",async()=>{
    currentHand="left";
    await loadGuide("left");
  });

  document.getElementById("btnRight").addEventListener("click",async()=>{
    currentHand="right";
    await loadGuide("right");
  });

  document.getElementById("analyzeBtn").addEventListener("click",()=>{
    renderResult(true);
  });

  document.getElementById("analyzeBothBtn").addEventListener("click",()=>{
    renderResult(false);
  });

  document.getElementById("btnOpenCamera").addEventListener("click",openCamera);
  document.getElementById("btnCloseCamera").addEventListener("click",closeCamera);
  document.getElementById("btnCapture").addEventListener("click",capture);
});

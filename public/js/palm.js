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

  const a = answers[hand];

  // 축별 카운트
  const axisScore = {
    personality:0,
    energy:0,
    mind:0,
    emotion:0,
    career:0
  };

  QUESTIONS.forEach(q=>{
    if(a[q.id] === "Y"){
      axisScore[q.axis]++;
    }
  });

  // 요약
  let summary = "";
  if(axisScore.personality){
    summary += (a.q1==="Y")
      ? "신중하고 안정적인 기질을 가진 타입입니다. "
      : "독립적이고 실행력이 빠른 기질입니다. ";
  }

  if(axisScore.career>=2){
    summary += "성과와 책임이 강조되는 흐름입니다.";
  } else if(axisScore.career===1){
    summary += "직업적 변화 흐름이 들어오는 시기입니다.";
  }

  // 근거
  let reason = "<ul>";
  if(a.q1==="Y") reason+="<li>생명선·두뇌선 시작이 붙어 신중형 구조</li>";
  if(a.q9==="Y") reason+="<li>운명선이 뚜렷 → 커리어 중심</li>";
  if(a.q10==="Y") reason+="<li>태양선 존재 → 인정/평판 운</li>";
  if(a.q6==="Y") reason+="<li>두뇌선 섬 형태 → 스트레스 주의</li>";
  reason+="</ul>";

  // 조언
  let advice = "";
  if(a.q6==="Y"){
    advice="중요 결정은 하루 미루는 전략이 유리합니다.";
  } else if(a.q10==="Y"){
    advice="성과를 ‘보여주는 전략’이 운을 빠르게 끌어올립니다.";
  } else{
    advice="지금은 구조를 다지는 것이 확장보다 중요합니다.";
  }

  return `
    <h3>핵심 요약</h3>
    <p>${summary}</p>
    <h3>근거</h3>
    ${reason}
    <h3>행동 조언</h3>
    <p>${advice}</p>
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

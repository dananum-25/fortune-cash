console.log("[palm.js] loaded ✅");

let currentHand = "left";
let guideSvgRoot = null;
const answers = {}; // id: true/false

/* =========================
   10개 질문 (전문화 버전)
========================= */

const QUESTIONS = [
  { id:"life_long", title:"생명선이 길고 깊게 이어져 있다",
    desc:"엄지 아래를 크게 감싸며 끊기지 않고 선명하게 이어진다.",
    tip:"기초 체력·회복력·생활 리듬 안정성 지표" },

  { id:"life_break", title:"생명선 중간에 끊김/약한 구간이 있다",
    desc:"중간에 흐릿하거나 끊겨 보이는 구간이 있다.",
    tip:"과로·생활 변화 구간 신호" },

  { id:"head_long", title:"두뇌선이 길고 또렷하다",
    desc:"손바닥 중앙을 가로질러 길게 이어진다.",
    tip:"분석력·집중력·기획 성향" },

  { id:"head_curve", title:"두뇌선이 아래로 휘어 있다",
    desc:"손바닥 아래쪽으로 곡선형으로 내려간다.",
    tip:"감성·상상력·콘텐츠 성향" },

  { id:"heart_clear", title:"감정선이 선명하고 균형 있다",
    desc:"손가락 아래 가로선이 또렷하다.",
    tip:"관계 안정·표현력" },

  { id:"heart_chain", title:"감정선이 사슬처럼 보인다",
    desc:"끊긴 느낌·잔선이 많다.",
    tip:"예민·감정 기복" },

  { id:"fate_line", title:"운명선(세로선)이 뚜렷하다",
    desc:"손바닥 중앙에서 위로 향하는 세로선이 보인다.",
    tip:"직업 의식·책임감" },

  { id:"sun_line", title:"태양선(약지 아래 세로선)이 있다",
    desc:"약지 아래에서 위로 올라가는 세로선이 보인다.",
    tip:"명예·성과·인지도" },

  { id:"money_lines", title:"잔선/재물선이 많다",
    desc:"손바닥에 가는 세로/사선이 여러 개 보인다.",
    tip:"수입 루트 다변화" },

  { id:"cross_lines", title:"주요 선 위에 교차선이 많다",
    desc:"생명선/두뇌선 위에 가로 잔선이 많다.",
    tip:"스트레스·방해 요인" }
];


/* =========================
   기본 UI
========================= */

function renderLoginCheck(){
  const box = document.getElementById("loginCheck");
  if(!box) return;

  const phone = localStorage.getItem("phone");
  if(phone){
    box.innerHTML = `<h2 style="margin:0 0 8px;">✅ 로그인 상태</h2>
    <p class="small">하루 1회 손금 해석 시 포인트 +1</p>`;
  }else{
    box.innerHTML = `<h2 style="margin:0 0 8px;">🙂 비로그인 이용 가능</h2>
    <p class="small">로그인하면 포인트 적립 가능</p>`;
  }
}

function renderBasicInfo(){
  const box = document.getElementById("basicInfo");
  if(!box) return;
  const name = localStorage.getItem("name") || "회원";
  box.innerHTML = `<p><b>${name}</b></p>`;
}

/* =========================
   가이드 SVG 로딩
========================= */

async function loadGuide(){
  const guideBox = document.getElementById("guideBox");
  guideBox.innerHTML = `<div class="ph">가이드 로딩 중…</div>`;

  const url = currentHand === "left"
    ? "/assets/palm_guide_left.svg"
    : "/assets/palm_guide_right.svg";

  const txt = await fetch(url).then(r=>r.text());
  guideBox.innerHTML = txt;

  guideSvgRoot = guideBox.querySelector("svg");

  injectHighlightStyle();
  syncHighlights();
}

function injectHighlightStyle(){
  if(!guideSvgRoot) return;

  const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
  style.textContent = `
    [id^="hl_"]{
      stroke:#2f80ff;
      stroke-width:10;
      fill:none;
      opacity:0;
      transition:opacity .2s ease;
    }
    .on{opacity:1 !important;}
  `;
  guideSvgRoot.appendChild(style);
}

function setHighlight(id, on){
  if(!guideSvgRoot) return;
  const el = guideSvgRoot.querySelector(`#hl_${id}`);
  if(!el) return;
  el.classList.toggle("on", !!on);
}

function syncHighlights(){
  QUESTIONS.forEach(q=>{
    setHighlight(q.id, answers[q.id]);
  });
  renderGuideTip();
}

function renderGuideTip(){
  const box = document.getElementById("guideTip");
  const active = QUESTIONS.filter(q=>answers[q.id]);
  if(active.length === 0){
    box.classList.remove("show");
    box.innerHTML = "";
    return;
  }
  box.innerHTML =
    `<div class="t">선 설명</div>` +
    active.map(q=>`<div>• <b>${q.title}</b> — ${q.tip}</div>`).join("");
  box.classList.add("show");
}

/* =========================
   질문 렌더링
========================= */

function renderQuestions(){
  const grid = document.getElementById("checkGrid");
  grid.innerHTML = QUESTIONS.map(q=>`
    <div class="q">
      <div class="qTitle">${q.title}</div>
      <div class="qDesc">${q.desc}</div>
      <div class="yn">
        <button data-id="${q.id}" data-val="yes">예</button>
        <button data-id="${q.id}" data-val="no" class="no">아니오</button>
      </div>
    </div>
  `).join("");

  grid.querySelectorAll("button").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.dataset.id;
      const val = btn.dataset.val === "yes";

      answers[id] = val;

      // 버튼 스타일
      const parent = btn.closest(".yn");
      parent.querySelectorAll("button").forEach(b=>{
        b.classList.remove("activeYes","activeNo");
      });

      if(val){
        btn.classList.add("activeYes");
      }else{
        btn.classList.add("activeNo");
      }

      setHighlight(id, val);
      renderGuideTip();
    });
  });
}

/* =========================
   자동 해석 엔진 (점수 대신 조합 기반)
========================= */

function generateReading(){
  const keys = Object.keys(answers).filter(k=>answers[k]);

  const tags = [];
  let text = "";

  if(answers.life_long) tags.push("체력 안정");
  if(answers.life_break) tags.push("변화 구간");
  if(answers.head_long) tags.push("분석형");
  if(answers.head_curve) tags.push("감성형");
  if(answers.heart_clear) tags.push("관계 안정");
  if(answers.heart_chain) tags.push("감정 기복");
  if(answers.fate_line) tags.push("직업 의식");
  if(answers.sun_line) tags.push("성과/인지도");
  if(answers.money_lines) tags.push("수입 다변화");
  if(answers.cross_lines) tags.push("스트레스 관리");

  text += `<p>선택한 손은 <b>${currentHand === "left" ? "왼손(기질)" : "오른손(현재 흐름)"}</b>입니다.</p>`;

  if(keys.length === 0){
    text += `<p>뚜렷하게 체크된 선이 많지 않습니다. 전반적으로 큰 기복 없이 무난한 흐름입니다.</p>`;
  }else{
    text += `<p>현재 손금 흐름에서 강조되는 부분은 다음과 같습니다.</p>`;
  }

  document.getElementById("keywordBox").innerHTML =
    tags.map(t=>`<span class="pill">${t}</span>`).join("");

  document.getElementById("textBox").innerHTML = text;
}

/* =========================
   카메라 기능
========================= */

let stream = null;
let videoTrack = null;
let torchOn = false;

async function openCamera(){
  const modal = document.getElementById("camModal");
  modal.classList.add("show");

  try{
    stream = await navigator.mediaDevices.getUserMedia({
      video:{facingMode:{ideal:"environment"}},
      audio:false
    });
    const video = document.getElementById("camVideo");
    video.srcObject = stream;
    videoTrack = stream.getVideoTracks()[0];

    const caps = videoTrack.getCapabilities?.();
    if(!caps?.torch){
      document.getElementById("btnTorch").disabled = true;
    }

  }catch(e){
    alert("카메라 접근 실패. HTTPS 환경과 권한을 확인하세요.");
  }
}

function closeCamera(){
  document.getElementById("camModal").classList.remove("show");
  if(stream){
    stream.getTracks().forEach(t=>t.stop());
  }
  stream = null;
  videoTrack = null;
}

async function toggleTorch(){
  if(!videoTrack) return;
  torchOn = !torchOn;
  try{
    await videoTrack.applyConstraints({advanced:[{torch:torchOn}]});
  }catch(e){
    alert("토치 지원 불가");
  }
}

function capturePhoto(){
  const video = document.getElementById("camVideo");
  const canvas = document.getElementById("camCanvas");
  const ctx = canvas.getContext("2d");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video,0,0);

  const dataUrl = canvas.toDataURL("image/jpeg",0.9);

  showPreview(dataUrl);
  closeCamera();
}

function showPreview(src){
  const img = document.getElementById("previewImg");
  const ph = document.getElementById("previewPlaceholder");

  img.onload = ()=>{
    img.style.display="block";
    ph.style.display="none";
  };
  img.onerror = ()=>{
    ph.innerHTML="이미지를 미리볼 수 없습니다. (HEIC 등 미지원 형식)";
  };
  img.src = src;
}

/* =========================
   초기화
========================= */

document.addEventListener("DOMContentLoaded", async ()=>{
  renderLoginCheck();
  renderBasicInfo();
  renderQuestions();
  await loadGuide();

  document.getElementById("btnLeft").addEventListener("click", async ()=>{
    currentHand="left";
    document.getElementById("btnLeft").classList.add("active");
    document.getElementById("btnRight").classList.remove("active");
    await loadGuide();
  });

  document.getElementById("btnRight").addEventListener("click", async ()=>{
    currentHand="right";
    document.getElementById("btnRight").classList.add("active");
    document.getElementById("btnLeft").classList.remove("active");
    await loadGuide();
  });

  document.getElementById("analyzeBtn").addEventListener("click", ()=>{
    document.getElementById("result").style.display="block";
    generateReading();
    window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"});
  });

  document.getElementById("btnOpenCamera").addEventListener("click",openCamera);
  document.getElementById("btnCloseCamera").addEventListener("click",closeCamera);
  document.getElementById("btnCapture").addEventListener("click",capturePhoto);
  document.getElementById("btnTorch").addEventListener("click",toggleTorch);

  document.getElementById("btnHeicHelp").addEventListener("click",()=>{
    const box=document.getElementById("heicHelp");
    box.classList.toggle("show");
  });

  document.getElementById("palmFile").addEventListener("change",(e)=>{
    const file=e.target.files[0];
    if(!file) return;
    const url=URL.createObjectURL(file);
    showPreview(url);
  });
});

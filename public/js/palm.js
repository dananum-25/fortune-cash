console.log("[palm.js] loaded ✅");

let currentHand = "left";
let guideSvgRoot = null;
const answers = {}; // id: true/false

/* =========================
   10개 질문 (전문화 버전)
   - SVG 내부에 반드시 id="hl_<id>" path가 있어야 함
========================= */

const QUESTIONS = [
  { id:"life_long", title:"생명선이 길고 깊게 이어져 있다",
    desc:"엄지 아래를 크게 감싸며 끊기지 않고 선명하게 이어진다.",
    tip:"기초 체력·회복력·생활 리듬 안정성 지표",
    effects:{health:"strong", base:"stable"} },

  { id:"life_break", title:"생명선 중간에 끊김/약한 구간이 있다",
    desc:"중간에 흐릿하거나 끊겨 보이는 구간이 있다.",
    tip:"과로·생활 변화 구간 신호",
    effects:{health:"caution", base:"change"} },

  { id:"head_long", title:"두뇌선이 길고 또렷하다",
    desc:"손바닥 중앙을 가로질러 길게 이어진다.",
    tip:"분석력·집중력·기획 성향",
    effects:{career:"logic", wealth:"plan"} },

  { id:"head_curve", title:"두뇌선이 아래로 휘어 있다",
    desc:"손바닥 아래쪽으로 곡선형으로 내려간다.",
    tip:"감성·상상력·콘텐츠 성향",
    effects:{career:"creative", love:"empathy"} },

  { id:"heart_clear", title:"감정선이 선명하고 균형 있다",
    desc:"손가락 아래 가로선이 또렷하다.",
    tip:"관계 안정·표현력",
    effects:{love:"stable"} },

  { id:"heart_chain", title:"감정선이 사슬처럼 보인다",
    desc:"끊긴 느낌·잔선이 많다.",
    tip:"예민·감정 기복",
    effects:{love:"caution"} },

  { id:"fate_line", title:"운명선(세로선)이 뚜렷하다",
    desc:"손바닥 중앙에서 위로 향하는 세로선이 보인다.",
    tip:"직업 의식·책임감",
    effects:{career:"drive"} },

  { id:"sun_line", title:"태양선(약지 아래 세로선)이 있다",
    desc:"약지 아래에서 위로 올라가는 세로선이 보인다.",
    tip:"성과·인지도·브랜딩",
    effects:{career:"spotlight"} },

  { id:"money_lines", title:"잔선/재물선이 많다",
    desc:"손바닥에 가는 세로/사선이 여러 개 보인다.",
    tip:"수입 루트 다변화",
    effects:{wealth:"multi"} },

  { id:"cross_lines", title:"주요 선 위에 교차선이 많다",
    desc:"생명선/두뇌선 위에 가로 잔선이 많다.",
    tip:"스트레스·방해 요인",
    effects:{base:"stress"} }
];

/* =========================
   공통 UI
========================= */

function renderLoginCheck(){
  const box = document.getElementById("loginCheck");
  if(!box) return;

  const phone = localStorage.getItem("phone");
  box.innerHTML = phone
    ? `<h2 style="margin:0 0 8px;">✅ 로그인 상태</h2><p class="small">하루 1회 손금 해석 시 포인트 +1</p>`
    : `<h2 style="margin:0 0 8px;">🙂 비로그인 이용 가능</h2><p class="small">로그인하면 포인트 적립 가능</p>`;
}

function renderBasicInfo(){
  const box = document.getElementById("basicInfo");
  if(!box) return;
  const name = localStorage.getItem("name") || "회원";
  const birth = localStorage.getItem("birth") || "";
  const phone = localStorage.getItem("phone") || "";
  box.innerHTML =
    `<p><b>${name}</b>${phone ? "님" : ""}</p>` +
    (birth ? `<p class="small">생년월일: ${birth}</p>` : ``);
}

/* =========================
   SVG 가이드 (정확한 선만 하이라이트)
========================= */

async function loadGuide(){
  const guideBox = document.getElementById("guideBox");
  guideBox.innerHTML = `<div class="ph">가이드 로딩 중…</div>`;

  const url = currentHand === "left"
    ? "/assets/palm_guide_left.svg"
    : "/assets/palm_guide_right.svg";

  try{
    const txt = await fetch(url).then(r=>r.text());
    guideBox.innerHTML = txt;
    guideSvgRoot = guideBox.querySelector("svg");

    if(!guideSvgRoot){
      guideBox.innerHTML = `<div class="ph">가이드 SVG 로드 실패</div>`;
      return;
    }

    injectHighlightStyle();
    syncHighlights();
  }catch(e){
    guideBox.innerHTML = `<div class="ph">가이드 로드 실패</div>`;
  }
}

function injectHighlightStyle(){
  if(!guideSvgRoot) return;
  if(guideSvgRoot.querySelector("style[data-hl='1']")) return;

  const style = document.createElementNS("http://www.w3.org/2000/svg","style");
  style.setAttribute("data-hl","1");
  style.textContent = `
    /* highlight path 기본: 숨김 */
    [id^="hl_"]{
      stroke:#2f80ff;
      stroke-width:10;
      fill:none;
      opacity:0;
      transition:opacity .18s ease;
      stroke-linecap:round;
      stroke-linejoin:round;
    }
    .on{ opacity:1 !important; }
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
    setHighlight(q.id, !!answers[q.id]);
  });
  renderGuideTip();
}

function renderGuideTip(){
  const box = document.getElementById("guideTip");
  if(!box) return;

  const active = QUESTIONS.filter(q=>answers[q.id]);
  if(active.length === 0){
    box.classList.remove("show");
    box.innerHTML = "";
    return;
  }

  box.innerHTML =
    `<div class="t">선 설명</div>` +
    active.slice(0,4).map(q=>`<div>• <b>${q.title}</b> — ${q.tip}</div>`).join("") +
    (active.length>4 ? `<div class="small" style="margin-top:8px;opacity:.75;">+ ${active.length-4}개 더 선택됨</div>` : "");
  box.classList.add("show");
}

/* =========================
   10문항 Y/N 렌더
========================= */

function renderQuestions(){
  const grid = document.getElementById("checkGrid");
  if(!grid) return;

  grid.innerHTML = QUESTIONS.map(q=>`
    <div class="q">
      <div class="qTitle">${q.title}</div>
      <div class="qDesc">${q.desc}</div>
      <div class="yn">
        <button data-id="${q.id}" data-val="yes" type="button">예</button>
        <button data-id="${q.id}" data-val="no" class="no" type="button">아니오</button>
      </div>
    </div>
  `).join("");

  grid.querySelectorAll(".yn button").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.dataset.id;
      const val = btn.dataset.val === "yes";
      answers[id] = val;

      const parent = btn.closest(".yn");
      parent.querySelectorAll("button").forEach(b=>b.classList.remove("activeYes","activeNo"));
      if(val) btn.classList.add("activeYes");
      else btn.classList.add("activeNo");

      setHighlight(id, val);
      renderGuideTip();
    });
  });
}

/* =========================
   리딩 엔진 (점수 X / 조합 기반)
========================= */

function buildReading(){
  const handLabel = currentHand === "left" ? "왼손(기질/기본 성향)" : "오른손(현재 흐름/변화)";
  const yes = (id)=> !!answers[id];

  // 키워드
  const tags = [];
  if(yes("life_long")) tags.push("체력 안정");
  if(yes("life_break")) tags.push("변화 구간");
  if(yes("head_long")) tags.push("분석형");
  if(yes("head_curve")) tags.push("감성형");
  if(yes("heart_clear")) tags.push("관계 안정");
  if(yes("heart_chain")) tags.push("감정 기복");
  if(yes("fate_line")) tags.push("직업 의식");
  if(yes("sun_line")) tags.push("성과/인지도");
  if(yes("money_lines")) tags.push("수입 다변화");
  if(yes("cross_lines")) tags.push("스트레스 관리");

  document.getElementById("keywordBox").innerHTML =
    tags.length ? tags.map(t=>`<span class="pill">${t}</span>`).join("") : `<span class="pill">무난</span>`;

  // 총평(핵심 조합)
  let overall = [];
  if(yes("life_long") && !yes("life_break")) overall.push("기본 체력과 회복력이 안정적이라, 꾸준함이 성과로 연결되기 쉬운 흐름입니다.");
  if(yes("life_break")) overall.push("생활 변화·과로 구간 신호가 있어, 무리한 일정과 수면 붕괴를 특히 조심하는 편이 좋습니다.");
  if(yes("head_long") && !yes("head_curve")) overall.push("이성/분석 중심의 판단이 강해 ‘계획-실행’에 강점이 있습니다.");
  if(yes("head_curve")) overall.push("감성/직관이 살아 있어 창의·콘텐츠·아이디어형 과제에서 결과가 좋아질 수 있습니다.");
  if(yes("cross_lines")) overall.push("교차선이 많다면 잡생각/스트레스가 성과를 깎을 수 있어, 단순 루틴으로 컨디션을 고정하는 게 유리합니다.");
  if(overall.length===0) overall.push("현재 체크된 특징이 극단적으로 치우치지 않아, 무난한 흐름에서 ‘관리’에 따라 결과가 달라지는 타입입니다.");

  // 분야별(재물/연애/커리어/건강) - 조합형 문장
  const wealth = [];
  if(yes("money_lines")) wealth.push("수입 루트를 한 가지로 고정하기보다, 작은 부수입을 여러 개로 쌓는 방식이 잘 맞습니다.");
  if(yes("head_long")) wealth.push("지출/투자를 ‘기록 기반’으로 관리하면 돈이 모이는 속도가 빨라집니다.");
  if(!yes("money_lines") && yes("cross_lines")) wealth.push("돈 흐름이 ‘새는 구멍’(충동/스트레스 소비)에서 흔들릴 수 있어 통제 장치가 필요합니다.");
  if(wealth.length===0) wealth.push("큰 한 방보다 꾸준한 현금흐름과 지출 관리가 핵심입니다.");

  const love = [];
  if(yes("heart_clear") && !yes("heart_chain")) love.push("관계가 안정적으로 흘러가기 쉬워, 작은 표현이 오히려 큰 신뢰를 만듭니다.");
  if(yes("heart_chain")) love.push("예민/오해 포인트가 생기기 쉬우니, 감정이 올라올 때는 ‘확인 질문’으로 오해를 줄이세요.");
  if(yes("head_curve")) love.push("공감/배려로 관계가 좋아지지만, 혼자 끌어안지 않게 선을 정하는 게 중요합니다.");
  if(love.length===0) love.push("소통량을 일정하게 유지하면 무난하게 좋아집니다.");

  const career = [];
  if(yes("fate_line")) career.push("일 운이 강하고 책임이 붙는 흐름이라, 맡은 역할이 커질수록 평가도 함께 오릅니다.");
  if(yes("sun_line")) career.push("성과가 ‘보이기’ 쉬운 흐름입니다. 포트폴리오/발표/공유 같은 노출 전략이 도움 됩니다.");
  if(yes("head_long")) career.push("기획/분석/운영처럼 구조를 만드는 역할에서 강점이 큽니다.");
  if(yes("head_curve")) career.push("콘텐츠/기획/디자인/마케팅처럼 감성+아이디어가 필요한 업무에 운이 붙습니다.");
  if(yes("cross_lines")) career.push("업무 방해 요인이 많아질 수 있으니, 일정·우선순위를 단순하게 고정하면 성과가 올라갑니다.");
  if(career.length===0) career.push("작은 성과를 반복적으로 쌓는 방식이 유리합니다.");

  const health = [];
  if(yes("life_long") && !yes("life_break")) health.push("기초 체력이 안정적인 편이라, 루틴만 잡히면 컨디션이 꾸준합니다.");
  if(yes("life_break")) health.push("컨디션이 ‘한 번 꺾이는’ 구간이 생길 수 있어 수면/식사 리듬을 먼저 고정하세요.");
  if(yes("cross_lines")) health.push("스트레스성 피로가 누적될 수 있어, 걷기/스트레칭 같은 가벼운 운동이 효과적입니다.");
  if(health.length===0) health.push("큰 문제보다는 생활 리듬 관리가 핵심입니다.");

  // 액션 플랜(현실 팁)
  const actions = [];
  if(yes("life_break") || yes("cross_lines")) actions.push("수면 시간을 먼저 고정(최소 6.5~7시간) → 컨디션이 해석의 정확도를 올립니다.");
  if(yes("head_long")) actions.push("메모/기록(지출·업무·운동)을 7일만 해도 체감이 바뀝니다.");
  if(yes("money_lines")) actions.push("부수입 ‘작은 실험’ 1개만(콘텐츠/제휴/리셀/작업)을 2주 테스트해보세요.");
  if(yes("sun_line")) actions.push("성과 노출: 작업물을 주 1회 공유(포트폴리오/블로그/노션 정리)하면 운이 붙습니다.");
  if(actions.length===0) actions.push("오늘은 한 가지 루틴(정리/걷기/메모)만 잡아도 흐름이 좋아집니다.");

  const html = `
    <p>선택한 손: <b>${handLabel}</b></p>

    <div class="hr"></div>

    <h3 style="margin:0 0 8px;">총평</h3>
    ${overall.map(t=>`<p>• ${t}</p>`).join("")}

    <div class="hr"></div>

    <h3 style="margin:0 0 8px;">재물</h3>
    ${wealth.map(t=>`<p>• ${t}</p>`).join("")}

    <h3 style="margin:14px 0 8px;">연애/관계</h3>
    ${love.map(t=>`<p>• ${t}</p>`).join("")}

    <h3 style="margin:14px 0 8px;">직장/사업</h3>
    ${career.map(t=>`<p>• ${t}</p>`).join("")}

    <h3 style="margin:14px 0 8px;">건강</h3>
    ${health.map(t=>`<p>• ${t}</p>`).join("")}

    <div class="hr"></div>

    <h3 style="margin:0 0 8px;">오늘의 액션</h3>
    ${actions.map(t=>`<p>• ${t}</p>`).join("")}

    <p class="small" style="opacity:.75;margin-top:12px;">
      ※ 손금은 참고용이며, 왼손/오른손을 비교하면 더 정교해집니다.
    </p>
  `;

  document.getElementById("textBox").innerHTML = html;
}

/* =========================
   HEIC 자동 처리 (0원)
   - heic2any 사용
========================= */

function isHeicFile(file){
  if(!file) return false;
  const name = (file.name || "").toLowerCase();
  const type = (file.type || "").toLowerCase();
  return type.includes("heic") || type.includes("heif") || name.endsWith(".heic") || name.endsWith(".heif");
}

async function fileToPreview(file){
  const previewMeta = document.getElementById("previewMeta");
  if(previewMeta){
    previewMeta.textContent = file ? `${(file.name||"")}` : "";
  }

  // HEIC면 변환 시도
  if(isHeicFile(file)){
    if(typeof heic2any === "undefined"){
      throw new Error("heic2any_not_loaded");
    }
    const blob = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.9
    });
    const outBlob = Array.isArray(blob) ? blob[0] : blob;
    return URL.createObjectURL(outBlob);
  }

  // 일반 이미지
  return URL.createObjectURL(file);
}

function showPreview(src){
  const img = document.getElementById("previewImg");
  const ph = document.getElementById("previewPlaceholder");
  if(!img || !ph) return;

  img.onload = ()=>{
    img.style.display = "block";
    ph.style.display = "none";
  };
  img.onerror = ()=>{
    img.style.display = "none";
    ph.style.display = "block";
    ph.innerHTML = "이미지를 미리볼 수 없습니다. (HEIC 미지원 환경일 수 있어요. ‘웹에서 바로 촬영하기’ 추천)";
  };

  img.src = src;
}

/* =========================
   카메라 + 토치
========================= */

let stream = null;
let videoTrack = null;
let torchOn = false;

async function openCamera(){
  const modal = document.getElementById("camModal");
  modal.classList.add("show");

  try{
    stream = await navigator.mediaDevices.getUserMedia({
      video:{ facingMode:{ ideal:"environment" } },
      audio:false
    });

    const video = document.getElementById("camVideo");
    video.srcObject = stream;

    videoTrack = stream.getVideoTracks()[0];

    const btnTorch = document.getElementById("btnTorch");
    const caps = videoTrack.getCapabilities?.();
    if(!caps?.torch){
      btnTorch.disabled = true;
      btnTorch.textContent = "🔦 플래시(토치) 미지원";
    }else{
      btnTorch.disabled = false;
      btnTorch.textContent = "🔦 플래시(토치) ON/OFF";
    }

  }catch(e){
    alert("카메라 접근 실패. HTTPS + 권한 허용이 필요합니다.");
    closeCamera();
  }
}

function closeCamera(){
  document.getElementById("camModal").classList.remove("show");
  if(stream){
    stream.getTracks().forEach(t=>t.stop());
  }
  stream = null;
  videoTrack = null;
  torchOn = false;
}

async function toggleTorch(){
  if(!videoTrack) return;
  torchOn = !torchOn;
  try{
    await videoTrack.applyConstraints({ advanced:[{ torch: torchOn }] });
  }catch(e){
    alert("토치 지원 불가");
  }
}

function capturePhoto(){
  const video = document.getElementById("camVideo");
  const canvas = document.getElementById("camCanvas");
  const ctx = canvas.getContext("2d");

  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 720;
  ctx.drawImage(video,0,0);

  const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
  showPreview(dataUrl);
  closeCamera();
}

/* =========================
   초기화
========================= */

document.addEventListener("DOMContentLoaded", async ()=>{
  renderLoginCheck();
  renderBasicInfo();
  renderQuestions();
  await loadGuide();

  // 손 토글
  document.getElementById("btnLeft").addEventListener("click", async ()=>{
    currentHand = "left";
    document.getElementById("btnLeft").classList.add("active");
    document.getElementById("btnRight").classList.remove("active");
    await loadGuide();
  });

  document.getElementById("btnRight").addEventListener("click", async ()=>{
    currentHand = "right";
    document.getElementById("btnRight").classList.add("active");
    document.getElementById("btnLeft").classList.remove("active");
    await loadGuide();
  });

  // 결과
  document.getElementById("analyzeBtn").addEventListener("click", ()=>{
    document.getElementById("result").style.display = "block";
    buildReading();
    window.scrollTo({top:document.body.scrollHeight, behavior:"smooth"});
  });

  // HEIC 안내 토글
  document.getElementById("btnHeicHelp").addEventListener("click", ()=>{
    document.getElementById("heicHelp").classList.toggle("show");
  });

  // 파일 선택
  document.getElementById("palmFile").addEventListener("change", async (e)=>{
    const file = e.target.files?.[0];
    if(!file) return;

    try{
      const url = await fileToPreview(file);
      showPreview(url);
    }catch(err){
      console.warn("[heic] failed", err);
      const ph = document.getElementById("previewPlaceholder");
      const img = document.getElementById("previewImg");
      if(img) img.style.display="none";
      if(ph){
        ph.style.display="block";
        ph.innerHTML = "HEIC 변환에 실패했습니다. ‘웹에서 바로 촬영하기’를 사용해보세요.";
      }
    }
  });

  // 카메라
  document.getElementById("btnOpenCamera").addEventListener("click", openCamera);
  document.getElementById("btnCloseCamera").addEventListener("click", closeCamera);
  document.getElementById("btnTorch").addEventListener("click", toggleTorch);
  document.getElementById("btnCapture").addEventListener("click", capturePhoto);
});

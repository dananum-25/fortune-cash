console.log("[palm.js] loaded ✅");

let currentHand = "left"; // left | right
let guideSvgRoot = null;  // inline SVG root
const selected = new Set(); // 체크된 id들

// ====== CAMERA STATE ======
let camStream = null;
let camTrack = null;
let torchOn = false;

// ---- 체크포인트 8개 (유지, 나중에 10개로 늘릴 수 있음)
const CHECKS = [
  { id:"life_strong",  title:"생명선이 굵고 길다",     desc:"체력/회복력/지구력", weights:{health:+18, career:+6} , tip:"생명선이 굵고 길면 기본 체력과 회복력이 좋은 편이에요." },
  { id:"life_weak",    title:"생명선이 끊기거나 약하다", desc:"과로/리듬 관리 필요", weights:{health:-12} , tip:"생명선이 약하면 무리한 일정에서 쉽게 컨디션이 흔들릴 수 있어요." },

  { id:"head_long",    title:"두뇌선이 길고 또렷하다",  desc:"집중/분석/기획",       weights:{career:+16, wealth:+8} , tip:"두뇌선이 길고 선명하면 분석/기획형 강점이 커요." },
  { id:"head_curve",   title:"두뇌선이 아래로 휜다(감성/상상)", desc:"콘텐츠/창의",     weights:{career:+10, love:+6} , tip:"두뇌선이 아래로 흐르면 감성/상상력이 강한 타입으로 봐요." },

  { id:"heart_clear",  title:"감정선이 또렷하고 균형",  desc:"관계 안정/표현",       weights:{love:+16} , tip:"감정선이 균형 있으면 관계가 안정적으로 흘러가요." },
  { id:"heart_chain",  title:"감정선이 사슬처럼 끊겨 보인다", desc:"예민/오해 주의",   weights:{love:-10} , tip:"감정선이 끊겨 보이면 예민해지기 쉬워 오해 관리가 중요해요." },

  { id:"fate_clear",   title:"운명선(세로선)이 또렷하다", desc:"일/책임/커리어",      weights:{career:+14, wealth:+6} , tip:"운명선이 또렷하면 일/책임운이 강하게 들어오는 편이에요." },
  { id:"money_many",   title:"재물선/잔선이 많다(손바닥 잔선 많음)", desc:"수입 루트 다변화", weights:{wealth:+14} , tip:"잔선이 많으면 다양한 수입 루트를 만들 가능성이 있어요." }
];

// ====== UTIL: DAILY REWARD ======
function todayStamp(){
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const da = String(d.getDate()).padStart(2,"0");
  return `${y}${m}${da}`;
}
async function rewardOncePerDay(key){
  const stamp = todayStamp();
  const k = `${key}_${stamp}`;
  if(localStorage.getItem(k) === "1") return;
  localStorage.setItem(k, "1");
  if(localStorage.getItem("phone")){
    await window.rewardContent?.(key);
  }
}

// ====== BASIC INFO ======
function renderBasicInfo(){
  const name = localStorage.getItem("name") || "회원";
  const phone = localStorage.getItem("phone");
  const birth = localStorage.getItem("birth");
  const box = document.getElementById("basicInfo");
  if(!box) return;

  if(phone){
    box.innerHTML = `<p><b>${name}</b>님</p>` + (birth ? `<p class="small">생년월일: ${birth}</p>` : ``);
  }else{
    box.innerHTML = `<p><b>${name}</b></p><p class="small">비로그인도 이용 가능 (로그인 시 포인트 적립)</p>`;
  }
}

function renderLoginCheck(){
  const box = document.getElementById("loginCheck");
  if(!box) return;

  const phone = localStorage.getItem("phone");
  if(phone){
    box.innerHTML = `<h2 style="margin:0 0 8px;">✅ 로그인 상태</h2><p class="small">로그인 상태에서는 하루 1회 포인트 +1이 적립됩니다.</p>`;
  }else{
    box.innerHTML = `<h2 style="margin:0 0 8px;">🙂 비로그인도 이용 가능</h2><p class="small">로그인하면 포인트 적립 + 더 안정적인 결과(고정 seed)가 가능합니다.</p>`;
  }
}

// ====== PREVIEW (FILE) ======
function showPreview(src){
  const previewBox = document.getElementById("previewBox");
  const previewImg = document.getElementById("previewImg");
  const ph = document.getElementById("previewPlaceholder");
  if(!previewBox || !previewImg) return;

  previewImg.onload = ()=>{
    previewBox.style.display = "block";
    if(ph) ph.style.display = "none";
  };

  // 일부 브라우저(특히 HEIC)에서 onerror 발생 가능
  previewImg.onerror = ()=>{
    previewBox.style.display = "none";
    if(ph){
      ph.style.display = "block";
      ph.innerHTML =
        "이미지를 미리볼 수 없어요. (HEIC 등 미지원 형식일 수 있습니다)<br>" +
        "<span style='opacity:.8'>가능하면 JPG/PNG로 다시 선택하거나, 카메라 촬영 기능을 사용해 주세요.</span>";
    }
  };

  previewImg.src = src;
}

function setupFilePreview(){
  const file = document.getElementById("palmFile");
  file?.addEventListener("change", ()=>{
    const f = file.files?.[0];
    if(!f) return;

    // objectURL이 가장 간단/빠름
    const url = URL.createObjectURL(f);
    showPreview(url);
  });
}

// ====== CAMERA (CAPTURE + TORCH) ======
function setCamButtons({ started }){
  const btnStart = document.getElementById("btnCamStart");
  const btnShot  = document.getElementById("btnCamShot");
  const btnStop  = document.getElementById("btnCamStop");
  const btnTorch = document.getElementById("btnTorch");

  if(btnStart) btnStart.disabled = !!started;
  if(btnShot)  btnShot.disabled  = !started;
  if(btnStop)  btnStop.disabled  = !started;

  // torch는 started + 지원일 때만 enabled (지원 체크는 startCamera에서 함)
  if(btnTorch && !started){
    btnTorch.disabled = true;
    btnTorch.textContent = "💡 플래시(토치)";
  }
}

function showCameraUI(on){
  const camBox = document.getElementById("camBox");
  if(camBox) camBox.style.display = on ? "block" : "none";
}

async function startCamera(){
  const video = document.getElementById("camVideo");
  const btnTorch = document.getElementById("btnTorch");
  if(!video) return;

  // 이미 켜져 있으면 무시
  if(camStream) return;

  try{
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false
    });

    camStream = stream;
    video.srcObject = stream;

    // track 저장
    camTrack = stream.getVideoTracks?.()[0] || null;

    setCamButtons({ started: true });
    showCameraUI(true);

    // torch 지원 여부
    torchOn = false;
    if(btnTorch){
      let canTorch = false;
      try{
        const caps = camTrack?.getCapabilities?.();
        canTorch = !!caps?.torch;
      }catch(e){}
      btnTorch.disabled = !canTorch;
      btnTorch.textContent = "💡 플래시(토치)";
    }

  }catch(e){
    console.warn("[camera] start failed:", e);
    alert("카메라를 켤 수 없어요.\n브라우저 권한(카메라 허용)과 HTTPS 환경을 확인해주세요.");
    stopCamera();
  }
}

function stopCamera(){
  const video = document.getElementById("camVideo");
  if(video) video.srcObject = null;

  try{
    if(camStream){
      camStream.getTracks().forEach(t=> t.stop());
    }
  }catch(e){}

  camStream = null;
  camTrack = null;
  torchOn = false;

  setCamButtons({ started: false });
  showCameraUI(false);
}

async function toggleTorch(){
  const btnTorch = document.getElementById("btnTorch");
  if(!camTrack || !btnTorch) return;

  // 지원 확인
  let canTorch = false;
  try{
    const caps = camTrack.getCapabilities?.();
    canTorch = !!caps?.torch;
  }catch(e){}
  if(!canTorch){
    alert("이 기기/브라우저는 플래시(토치)를 지원하지 않아요.");
    btnTorch.disabled = true;
    return;
  }

  torchOn = !torchOn;

  try{
    // 일부 브라우저는 advanced 형태를 요구
    await camTrack.applyConstraints({ advanced: [{ torch: torchOn }] });
    btnTorch.textContent = torchOn ? "💡 토치 OFF" : "💡 토치 ON";
  }catch(e){
    console.warn("[torch] applyConstraints failed", e);
    torchOn = false;
    btnTorch.textContent = "💡 플래시(토치)";
    alert("토치 제어에 실패했어요. (기기/브라우저 제한)");
  }
}

function captureFromCamera(){
  const video = document.getElementById("camVideo");
  const canvas = document.getElementById("camCanvas");
  if(!video || !canvas) return;

  const w = video.videoWidth || 1080;
  const h = video.videoHeight || 1440;

  // 캔버스 크기 맞춤
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, w, h);

  // JPEG로 내보내기(용량/호환성)
  const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
  showPreview(dataUrl);
}

// ====== GUIDE SVG LOAD + HIGHLIGHT (정확한 선 파란색) ======
async function loadGuideSvg(hand){
  const guideBox = document.getElementById("guideBox");
  if(!guideBox) return;

  guideBox.innerHTML = `<div class="ph">가이드 로딩 중…</div>`;

  const url = (hand === "right")
    ? "/assets/palm_guide_right.svg"
    : "/assets/palm_guide_left.svg";

  try{
    const txt = await fetch(url).then(r=>r.text());
    guideBox.innerHTML = txt;

    guideSvgRoot = guideBox.querySelector("svg");
    if(!guideSvgRoot){
      guideBox.innerHTML = `<div class="ph">SVG 로드 실패</div>`;
      return;
    }

    // ✅ SVG 내부에 하이라이트 스타일 주입
    injectGuideStyles(guideSvgRoot);

    // 선택 상태 동기화
    syncHighlights();

  }catch(e){
    console.warn("[palm] guide load failed", e);
    guideBox.innerHTML = `<div class="ph">가이드 로드 실패</div>`;
  }
}

function injectGuideStyles(svg){
  // 이미 들어있으면 생략
  if(svg.querySelector("style[data-palm-style='1']")) return;

  const st = document.createElementNS("http://www.w3.org/2000/svg", "style");
  st.setAttribute("data-palm-style", "1");

  // hl_* 요소는 기본적으로 숨김(opacity 0),
  // on 되면 파란색 stroke + opacity 1
  st.textContent = `
    [id^="hl_"]{
      opacity:0;
      transition: opacity .18s ease;
      stroke: #2f80ff !important;
      stroke-width: 10 !important;
      fill: none !important;
      stroke-linecap: round !important;
      stroke-linejoin: round !important;
    }
    .on{ opacity:1 !important; }
  `;
  svg.appendChild(st);
}

function setHighlight(id, on){
  if(!guideSvgRoot) return;
  const el = guideSvgRoot.querySelector(`#hl_${id}`);
  if(!el) return;
  el.classList.toggle("on", !!on);
}

function syncHighlights(){
  if(!guideSvgRoot) return;
  CHECKS.forEach(c => setHighlight(c.id, selected.has(c.id)));
  renderGuideTip();
}

function renderGuideTip(){
  const tipBox = document.getElementById("guideTip");
  if(!tipBox) return;

  const arr = CHECKS.filter(c=> selected.has(c.id));
  if(arr.length === 0){
    tipBox.classList.remove("show");
    tipBox.innerHTML = "";
    return;
  }

  const top = arr.slice(0,3).map(c=>`<div>• <b>${c.title}</b> — ${c.tip}</div>`).join("");
  const more = (arr.length > 3)
    ? `<div class="small" style="margin-top:8px;opacity:.75;">+ ${arr.length-3}개 더 선택됨</div>`
    : "";

  tipBox.innerHTML = `<div style="font-weight:900;margin-bottom:6px;">가이드 해설</div>${top}${more}`;
  tipBox.classList.add("show");
}

// ====== CHECK LIST UI ======
function renderChecks(){
  const grid = document.getElementById("checkGrid");
  if(!grid) return;

  grid.innerHTML = CHECKS.map(c => `
    <div class="q ${selected.has(c.id) ? "active" : ""}" data-id="${c.id}">
      <div class="qTop">
        <input type="checkbox" ${selected.has(c.id) ? "checked" : ""} />
        <div>
          <div class="qTitle">${c.title}</div>
          <div class="qDesc">${c.desc}</div>
        </div>
      </div>
    </div>
  `).join("");

  grid.querySelectorAll(".q").forEach(card=>{
    const id = card.getAttribute("data-id");
    const cb = card.querySelector("input");

    card.addEventListener("click", (e)=>{
      e.preventDefault();

      const isOn = selected.has(id);
      if(isOn) selected.delete(id);
      else selected.add(id);

      cb.checked = !isOn;
      card.classList.toggle("active", !isOn);

      setHighlight(id, !isOn);
      renderGuideTip();
    });
  });
}

// ====== HAND TOGGLE ======
function setupHandToggle(){
  const btnLeft = document.getElementById("btnLeft");
  const btnRight = document.getElementById("btnRight");

  btnLeft?.addEventListener("click", async ()=>{
    currentHand = "left";
    btnLeft.classList.add("active");
    btnRight.classList.remove("active");
    btnRight.classList.add("secondary");
    await loadGuideSvg("left");
  });

  btnRight?.addEventListener("click", async ()=>{
    currentHand = "right";
    btnRight.classList.add("active");
    btnLeft.classList.remove("active");
    btnLeft.classList.add("secondary");
    await loadGuideSvg("right");
  });
}

// ====== SIMPLE SCORE (유지: 다음 단계에서 "점수 대신 해석 중심"으로 바꿀 수 있음) ======
function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }
function calcScores(){
  let wealth = 60, love = 60, career = 60, health = 60;

  CHECKS.forEach(c=>{
    if(!selected.has(c.id)) return;
    const w = c.weights || {};
    wealth += (w.wealth||0);
    love   += (w.love||0);
    career += (w.career||0);
    health += (w.health||0);
  });

  wealth = clamp(wealth, 0, 100);
  love   = clamp(love, 0, 100);
  career = clamp(career, 0, 100);
  health = clamp(health, 0, 100);

  return { wealth, love, career, health };
}

function setBar(id, score){
  const fill = document.getElementById(`fill-${id}`);
  const num = document.getElementById(`score-${id}`);
  if(fill) fill.style.width = `${score}%`;
  if(num) num.textContent = String(score);
}

function renderResult(){
  const result = document.getElementById("result");
  if(result) result.style.display = "block";

  const s = calcScores();
  setBar("wealth", s.wealth);
  setBar("love", s.love);
  setBar("career", s.career);
  setBar("health", s.health);

  const keywordBox = document.getElementById("keywordBox");
  const textBox = document.getElementById("textBox");

  const tags = [];
  if(s.wealth >= 75) tags.push("수입 확장");
  if(s.career >= 75) tags.push("성과 상승");
  if(s.love >= 75) tags.push("관계 안정");
  if(s.health >= 75) tags.push("체력 호조");
  if(s.health <= 50) tags.push("리듬 관리");
  if(s.love <= 50) tags.push("오해 주의");
  if(s.wealth <= 50) tags.push("지출 통제");
  if(s.career <= 50) tags.push("정리/준비");

  if(keywordBox){
    keywordBox.innerHTML = tags.map(t=>`<span class="pill">${t}</span>`).join("") || `<span class="pill">무난</span>`;
  }

  if(textBox){
    textBox.innerHTML = `
      <p>선택한 체크포인트를 기준으로 보면, <b>${currentHand === "left" ? "왼손(기질/기본 흐름)" : "오른손(현재/노력 흐름)"}</b>에서 아래 흐름이 강조됩니다.</p>
      <p>• 재물운: <b>${s.wealth}</b>점 / 연애운: <b>${s.love}</b>점 / 커리어: <b>${s.career}</b>점 / 건강: <b>${s.health}</b>점</p>
      <p class="small">※ 다음 단계에서 “점수”보다 “선택된 항목 조합 기반 해석” 중심으로 업그레이드하면 더 자연스럽습니다.</p>
    `;
  }
}

// ====== INIT ======
document.addEventListener("DOMContentLoaded", async ()=>{
  renderLoginCheck();
  renderBasicInfo();

  // 파일 업로드 미리보기
  setupFilePreview();

  // 손 토글
  setupHandToggle();

  // 체크 리스트
  renderChecks();

  // 가이드 기본 로드(왼손)
  await loadGuideSvg("left");

  // 결과 보기
  document.getElementById("analyzeBtn")?.addEventListener("click", async ()=>{
    renderResult();
    await rewardOncePerDay("palm");
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  });

  // ===== camera buttons =====
  document.getElementById("btnCamStart")?.addEventListener("click", startCamera);
  document.getElementById("btnCamStop")?.addEventListener("click", stopCamera);
  document.getElementById("btnCamShot")?.addEventListener("click", ()=>{
    captureFromCamera();
    // 촬영 후에도 계속 카메라를 켜둘지/자동 종료할지는 취향인데,
    // 일단은 "계속 켜둠"이 편해서 유지 (원하면 stopCamera()로 바꿀 수 있음)
  });
  document.getElementById("btnTorch")?.addEventListener("click", toggleTorch);

  // 초기 버튼 상태
  setCamButtons({ started: false });
  showCameraUI(false);
});

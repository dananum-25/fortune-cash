console.log("[palm.js] loaded ✅");

/**
 * 요구사항 반영:
 * - 10문항(Y/N) 체크
 * - 체크 → 가이드 SVG에서 정확한 선(hl_*)을 파랗게 표시
 * - 결과는 점수보다 "조합 리딩" 중심
 * - 왼손/오른손 전환
 * - 카메라 촬영 + 토치(플래시) ON/OFF
 * - 로그인 시 하루 1회 +1 포인트
 */

let currentHand = "left";        // left | right
let guideSvgRoot = null;         // loaded SVG root
let answers = {};                // {id: true|false|null}
let camStream = null;            // MediaStream
let camTrack = null;             // video track
let torchOn = false;             // torch state

// ===== 10문항 정의 (8개 유지 + 2개 추가) =====
// id는 SVG highlight id와 1:1 대응: #hl_<id> 를 켜야 함
const QUESTIONS = [
  {
    id: "life_line",
    title: "생명선이 끊김 없이 이어져 있다",
    desc: "체력/회복/생활 리듬",
    guide: "엄지 아래를 감싸며 내려가는 큰 곡선(손바닥 바깥쪽)"
  },
  {
    id: "head_line",
    title: "두뇌선이 길고 또렷하다",
    desc: "집중/분석/기획",
    guide: "손바닥 중앙을 가로지르는 선(감정선 아래쪽)"
  },
  {
    id: "head_curve",
    title: "두뇌선이 아래로 휘어 감성형이다",
    desc: "상상력/콘텐츠/감성",
    guide: "두뇌선이 손바닥 아래 방향으로 완만하게 내려감"
  },
  {
    id: "heart_line",
    title: "감정선이 또렷하고 균형이 좋다",
    desc: "관계 안정/표현",
    guide: "손가락 아래쪽을 가로지르는 선(위쪽 가로선)"
  },
  {
    id: "heart_chain",
    title: "감정선이 사슬/끊김처럼 보여 예민하다",
    desc: "오해/기복 주의",
    guide: "감정선이 점선/체인처럼 울퉁불퉁하거나 끊겨보임"
  },
  {
    id: "fate_line",
    title: "운명선(세로선)이 중앙에서 또렷하다",
    desc: "일/책임/커리어",
    guide: "손바닥 중앙 아래에서 위로 올라가는 세로선"
  },
  {
    id: "money_lines",
    title: "재물선/잔선이 많아 수입 루트가 다양해 보인다",
    desc: "부수입/다변화",
    guide: "새끼손가락 아래/손바닥 곳곳의 잔선이 많은 편"
  },
  {
    id: "health_line",
    title: "건강선(수은선)이 선명하게 보인다",
    desc: "컨디션/소화/리듬 신호",
    guide: "새끼손가락 아래에서 아래로 내려오는 비스듬한 선"
  },
  {
    id: "sun_line",
    title: "태양선(명예선)이 또렷하게 보인다",
    desc: "평판/성과/인정",
    guide: "약지(네번째 손가락) 아래로 올라가는 세로선"
  },
  {
    id: "breaks_many",
    title: "주요 선에 잔끊김/교차가 많다",
    desc: "스트레스/변동/예민",
    guide: "큰 선들이 교차·가지치기·잔끊김이 많은 편"
  }
];

// ===== 유틸 =====
function $(id){ return document.getElementById(id); }

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

// ===== 로그인 표시 =====
function renderLoginCheck(){
  const box = $("loginCheck");
  if(!box) return;

  const phone = localStorage.getItem("phone");
  if(phone){
    box.innerHTML =
      `<h2 style="margin:0 0 8px;">✅ 로그인 상태</h2>
       <p class="small">로그인 상태에서는 손금 리딩 결과 확인 시 하루 1회 포인트 +1이 적립됩니다.</p>`;
  }else{
    box.innerHTML =
      `<h2 style="margin:0 0 8px;">🙂 비로그인도 이용 가능</h2>
       <p class="small">로그인하면 포인트 적립과 “더 고정된 사용자 기준(전화번호 seed)”을 적용하기가 쉬워집니다.</p>`;
  }
}

function renderBasicInfo(){
  const name = localStorage.getItem("name") || "회원";
  const phone = localStorage.getItem("phone");
  const birth = localStorage.getItem("birth");
  const box = $("basicInfo");
  if(!box) return;

  if(phone){
    box.innerHTML = `<p><b>${name}</b>님</p>` + (birth ? `<p class="small">생년월일: ${birth}</p>` : ``);
  }else{
    box.innerHTML = `<p><b>${name}</b></p><p class="small">비로그인도 이용 가능 (로그인 시 포인트 적립)</p>`;
  }
}

// ===== 손 탭 =====
function setHand(hand){
  currentHand = hand;
  $("btnLeft")?.classList.toggle("active", hand==="left");
  $("btnRight")?.classList.toggle("active", hand==="right");
  const pill = $("handPill");
  if(pill) pill.textContent = `현재: ${hand === "left" ? "왼손" : "오른손"}`;

  // 가이드 reload
  loadGuideSvg(hand);
}

// ===== 가이드 SVG 로드/하이라이트 =====
async function loadGuideSvg(hand){
  const guideBox = $("guideBox");
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

    // 현재 답변 상태를 반영
    syncHighlights();
  }catch(e){
    console.warn("[palm] guide load failed", e);
    guideBox.innerHTML = `<div class="ph">가이드 로드 실패</div>`;
  }
}

function setHighlight(id, on){
  if(!guideSvgRoot) return;
  const el = guideSvgRoot.querySelector(`#hl_${id}`);
  if(!el) return;
  el.classList.toggle("on", !!on);
}

function syncHighlights(){
  QUESTIONS.forEach(q=>{
    // Y(yes)인 것만 하이라이트
    const v = answers[q.id];
    setHighlight(q.id, v === true);
  });
  renderGuideTip();
}

// 선택된 항목 설명(최대 3개)
function renderGuideTip(){
  const tipBox = $("guideTip");
  if(!tipBox) return;

  const yesList = QUESTIONS.filter(q => answers[q.id] === true);
  if(yesList.length === 0){
    tipBox.classList.remove("show");
    tipBox.innerHTML = "";
    return;
  }

  const top = yesList.slice(0,3).map(q =>
    `<div>• <b>${q.title}</b><div class="small" style="opacity:.8;margin-top:4px;">${q.guide}</div></div>`
  ).join("");

  const more = yesList.length > 3
    ? `<div class="small" style="margin-top:10px;opacity:.75;">+ ${yesList.length-3}개 더 체크됨</div>`
    : "";

  tipBox.innerHTML = `<div style="font-weight:900;margin-bottom:8px;">가이드 체크 포인트</div>${top}${more}`;
  tipBox.classList.add("show");
}

// ===== 체크(Y/N) UI 렌더 =====
function initAnswers(){
  // null = 미선택, true/false = 선택
  answers = {};
  QUESTIONS.forEach(q => answers[q.id] = null);
}

function renderQuestions(){
  const grid = $("checkGrid");
  if(!grid) return;

  grid.innerHTML = QUESTIONS.map(q => {
    const yesOn = answers[q.id] === true ? "on" : "";
    const noOn  = answers[q.id] === false ? "on" : "";
    return `
      <div class="q" data-id="${q.id}">
        <div class="qTop">
          <div style="flex:1;">
            <div class="qTitle">${q.title}</div>
            <div class="qDesc">${q.desc}</div>
            <div class="small muted" style="margin-top:8px;opacity:.75;">가이드: ${q.guide}</div>
          </div>
        </div>
        <div class="yn">
          <button type="button" class="yes ${yesOn}" data-yn="yes">YES</button>
          <button type="button" class="no ${noOn}" data-yn="no">NO</button>
        </div>
      </div>
    `;
  }).join("");

  grid.querySelectorAll(".q").forEach(card=>{
    const id = card.getAttribute("data-id");
    const yesBtn = card.querySelector('button[data-yn="yes"]');
    const noBtn  = card.querySelector('button[data-yn="no"]');

    yesBtn?.addEventListener("click", ()=>{
      answers[id] = true;
      yesBtn.classList.add("on");
      noBtn?.classList.remove("on");
      // 하이라이트 ON
      setHighlight(id, true);
      renderGuideTip();
    });

    noBtn?.addEventListener("click", ()=>{
      answers[id] = false;
      noBtn.classList.add("on");
      yesBtn?.classList.remove("on");
      // 하이라이트 OFF
      setHighlight(id, false);
      renderGuideTip();
    });
  });
}

function countAnswered(){
  let c = 0;
  for(const k in answers){
    if(answers[k] !== null) c++;
  }
  return c;
}

// ===== 사진 업로드 미리보기 =====
function setupUploadPreview(){
  const file = $("palmFile");
  const img = $("previewImg");
  const ph = $("previewPlaceholder");

  file?.addEventListener("change", ()=>{
    const f = file.files?.[0];
    if(!f) return;

    const reader = new FileReader();
    reader.onload = (e)=>{
      if(img){
        img.src = e.target.result;
        img.style.display = "block";
      }
      if(ph) ph.style.display = "none";
    };
    reader.readAsDataURL(f);
  });
}

// ===== 카메라 =====
function showCameraModal(show){
  const modal = $("cameraModal");
  if(!modal) return;
  modal.classList.toggle("show", !!show);
}

async function openCamera(){
  showCameraModal(true);

  const video = $("camVideo");
  const ph = $("camPh");
  if(ph) ph.style.display = "flex";

  try{
    // 후면 카메라 우선
    camStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false
    });

    if(!video) return;
    video.srcObject = camStream;

    // track 확보
    camTrack = camStream.getVideoTracks?.()[0] || null;

    if(ph) ph.style.display = "none";

    // 토치 초기화: OFF
    torchOn = false;
    updateTorchButton();
  }catch(e){
    console.warn("[camera] open failed", e);
    if(ph){
      ph.style.display = "flex";
      ph.innerHTML = "카메라를 열 수 없어요.<br>브라우저 권한/HTTPS/기기 지원을 확인해주세요.";
    }
  }
}

function stopCamera(){
  if(camStream){
    camStream.getTracks().forEach(t => t.stop());
  }
  camStream = null;
  camTrack = null;
  torchOn = false;
  updateTorchButton();
}

function updateTorchButton(){
  const btn = $("torchBtn");
  if(!btn) return;
  btn.textContent = torchOn ? "🔦 플래시 ON" : "🔦 플래시 OFF";
}

async function toggleTorch(){
  // 토치는 지원 기기/브라우저에서만 적용 가능
  if(!camTrack){
    alert("카메라가 켜져있지 않아요.");
    return;
  }

  const caps = camTrack.getCapabilities ? camTrack.getCapabilities() : null;
  if(!caps || !("torch" in caps)){
    alert("이 기기/브라우저에서는 플래시(토치)를 지원하지 않아요 🙂\n(대신 밝은 곳에서 촬영을 추천!)");
    return;
  }

  torchOn = !torchOn;

  try{
    await camTrack.applyConstraints({ advanced: [{ torch: torchOn }] });
  }catch(e){
    console.warn("[torch] apply failed", e);
    torchOn = false;
    alert("플래시 적용에 실패했어요. 기기 지원을 확인해주세요.");
  }

  updateTorchButton();
}

function takeShot(){
  const video = $("camVideo");
  const canvas = $("camCanvas");
  if(!video || !canvas) return;

  const w = video.videoWidth || 0;
  const h = video.videoHeight || 0;
  if(!w || !h){
    alert("카메라 준비 중입니다. 잠시 후 다시 시도해주세요.");
    return;
  }

  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, w, h);

  // 결과를 previewImg에 반영
  const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
  const img = $("previewImg");
  const ph = $("previewPlaceholder");
  if(img){
    img.src = dataUrl;
    img.style.display = "block";
  }
  if(ph) ph.style.display = "none";

  // 카메라 닫기
  showCameraModal(false);
  stopCamera();
}

// ===== 리딩(조합 해석) =====
function yn(id){ return answers[id] === true; }
function nn(id){ return answers[id] === false; }

function buildReadingText(){
  const handLabel = currentHand === "left"
    ? "왼손(기질/기본 흐름)"
    : "오른손(현재/노력/변화)";

  // 핵심 해석 로직(전문가식: 조합 우선)
  const parts = [];

  // 1) 기본 프레임
  parts.push(`<p><b>${handLabel}</b> 기준으로, 체크한 항목을 조합해 해석했습니다.</p>`);

  // 2) 생명선
  if(yn("life_line")){
    parts.push(`<p>• <b>기본 체력/회복</b>은 비교적 안정적입니다. 장기전(꾸준함)이 강점으로 작동하기 쉬워요.</p>`);
  }else if(nn("life_line")){
    parts.push(`<p>• <b>컨디션/리듬</b>은 관리가 성패를 좌우합니다. 무리한 일정이 누적되면 성과가 흔들릴 수 있어요.</p>`);
  }

  // 3) 두뇌선(분석 vs 감성)
  if(yn("head_line") && !yn("head_curve")){
    parts.push(`<p>• <b>두뇌선이 또렷/길다</b> 쪽이라, 분석/기획/정리에서 강점이 큽니다. 결정을 내릴 때 ‘근거/데이터’가 도움이 됩니다.</p>`);
  }
  if(yn("head_curve")){
    parts.push(`<p>• <b>감성·상상형</b> 성향이 강하게 들어옵니다. 콘텐츠/디자인/기획 감각이 살아나지만, 기분에 따라 집중력 변동이 있을 수 있어요.</p>`);
  }
  if(nn("head_line") && nn("head_curve")){
    parts.push(`<p>• 두뇌선 특징이 뚜렷하지 않다면, 지금은 “집중력보다 루틴”이 더 중요한 시기일 수 있어요.</p>`);
  }

  // 4) 감정선(관계)
  if(yn("heart_line") && !yn("heart_chain")){
    parts.push(`<p>• <b>관계/연애</b>는 안정적으로 굴러갈 확률이 높습니다. 표현을 조금만 더 하면 관계 만족도가 올라가요.</p>`);
  }
  if(yn("heart_chain")){
    parts.push(`<p>• <b>예민/오해 포인트</b>가 있어요. 말투/타이밍에서 작은 삐끗이 커질 수 있으니 ‘확인→해석’ 순서가 좋습니다.</p>`);
  }

  // 5) 운명선(커리어)
  if(yn("fate_line")){
    parts.push(`<p>• <b>일/커리어</b>는 책임이 늘수록 평가가 올라가는 흐름입니다. “내 역할 고정 + 반복 성과”가 운을 키웁니다.</p>`);
  }else if(nn("fate_line")){
    parts.push(`<p>• 커리어는 하나로 고정되기보다, 방향을 탐색/조정하는 흐름일 수 있어요. ‘조건 정리 후 선택’이 유리합니다.</p>`);
  }

  // 6) 재물선/잔선(수입)
  if(yn("money_lines")){
    parts.push(`<p>• <b>수입 루트 다변화</b>가 가능한 손입니다. 한 방보다 “작게 여러 번”이 더 잘 맞습니다.</p>`);
  }else if(nn("money_lines")){
    parts.push(`<p>• 재물은 “확장”보다 “관리/누수 차단”이 먼저 먹히는 흐름일 수 있어요.</p>`);
  }

  // 7) 건강선(신호)
  if(yn("health_line")){
    parts.push(`<p>• <b>컨디션 신호가 잘 올라오는 타입</b>일 수 있어요. 피로/소화/수면에 작은 신호가 오면 바로 조정하면 손해를 줄입니다.</p>`);
  }

  // 8) 태양선(평판/인정)
  if(yn("sun_line")){
    parts.push(`<p>• <b>태양선</b>이 보이면, 성과가 “평판/인정”으로 연결되기 쉬워요. 포트폴리오/기록/노출이 특히 효과적입니다.</p>`);
  }

  // 9) 잔끊김/교차(스트레스)
  if(yn("breaks_many")){
    parts.push(`<p>• 선의 <b>잔끊김/교차</b>가 많으면, 스트레스/변동 이슈가 자주 들어옵니다. 이럴수록 ‘결정은 천천히, 실행은 단순하게’가 좋아요.</p>`);
  }

  // 10) 조합 보너스(전문가식)
  if(yn("fate_line") && yn("sun_line")){
    parts.push(`<p><b>조합 포인트</b>: 운명선 + 태양선이 함께면 “일의 성과 → 인정 → 기회”가 연결되기 쉬운 손입니다.</p>`);
  }
  if(yn("head_curve") && yn("money_lines")){
    parts.push(`<p><b>조합 포인트</b>: 감성/상상형 + 잔선 많음이면, 콘텐츠/아이디어를 수익 구조로 연결하기 좋습니다(작게 테스트 추천).</p>`);
  }
  if(yn("heart_chain") && yn("breaks_many")){
    parts.push(`<p><b>주의 조합</b>: 예민 + 교차 많음이면, 사람/일 둘 다 “오해→피로”가 쌓일 수 있어요. 휴식 루틴을 먼저 고정하세요.</p>`);
  }

  // 11) 마무리
  const answered = countAnswered();
  if(answered < 6){
    parts.push(`<p class="small">※ 현재 ${answered}/10개만 선택됐어요. 6개 이상 선택하면 리딩 정확도가 더 좋아집니다.</p>`);
  }else{
    parts.push(`<p class="small">※ 이 리딩은 체크 기반 “간편 해석”입니다. 왼손/오른손 모두 체크 후 비교하면 가장 정교합니다.</p>`);
  }

  return parts.join("\n");
}

function renderResult(){
  const result = $("result");
  if(result) result.style.display = "block";

  renderBasicInfo();

  const box = $("textBox");
  if(box){
    box.innerHTML = buildReadingText();
  }

  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", async ()=>{
  renderLoginCheck();
  initAnswers();
  renderQuestions();
  setupUploadPreview();

  // 손 탭
  $("btnLeft")?.addEventListener("click", ()=> setHand("left"));
  $("btnRight")?.addEventListener("click", ()=> setHand("right"));

  // 기본: 왼손
  await loadGuideSvg("left");

  // 결과 보기
  $("analyzeBtn")?.addEventListener("click", async ()=>{
    // 최소 몇개 선택 권장
    if(countAnswered() < 4){
      const hint = $("againHint");
      if(hint) hint.style.display = "block";
      // 그래도 결과는 보여줌(막지는 않음)
    }else{
      const hint = $("againHint");
      if(hint) hint.style.display = "none";
    }

    renderResult();

    // 포인트: 하루 1회 +1 (로그인 시)
    await rewardOncePerDay("palm");
  });

  // ===== 카메라 모달 이벤트 =====
  $("openCameraBtn")?.addEventListener("click", async ()=>{
    if(!navigator.mediaDevices?.getUserMedia){
      alert("이 브라우저에서는 카메라 기능을 지원하지 않아요.");
      return;
    }
    await openCamera();
  });

  $("closeCameraBtn")?.addEventListener("click", ()=>{
    showCameraModal(false);
    stopCamera();
  });

  // 바깥 클릭 닫기(원하면)
  $("cameraModal")?.addEventListener("click", (e)=>{
    if(e.target?.id === "cameraModal"){
      showCameraModal(false);
      stopCamera();
    }
  });

  $("torchBtn")?.addEventListener("click", async ()=>{
    await toggleTorch();
  });

  $("shotBtn")?.addEventListener("click", ()=>{
    takeShot();
  });
});

console.log("[palm.js] loaded ✅");

let currentHand = "left"; // left | right
let guideSvgRoot = null;  // 로드된 SVG DOM root
const selected = new Set(); // 체크된 id들

// ✅ 상호배타(라디오) 그룹: 같은 그룹에서는 1개만 선택 가능
const EXCLUSIVE_GROUPS = [
  // 생명선
  ["life_strong", "life_weak"],
  // 감정선
  ["heart_clear", "heart_chain"],
  // 두뇌선
  ["head_long", "head_curve"],
  // 운명선 vs 재물선(둘 중 하나만 선택하게 하고 싶으면 유지)
  // 둘 다 체크 가능하게 하고 싶으면 이 줄은 지우세요.
  ["fate_clear", "money_many"],
];

// ---- 체크포인트 8개 정의 (id는 SVG highlight id와 연결)
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

// ---- 상호배타 유틸
function getExclusiveGroup(id){
  for(const g of EXCLUSIVE_GROUPS){
    if(g.includes(id)) return g;
  }
  return null;
}

// ✅ 같은 그룹의 다른 항목을 강제로 OFF (id를 ON 할 때만)
function enforceExclusive(id, nextOn){
  if(!nextOn) return;

  const group = getExclusiveGroup(id);
  if(!group) return;

  for(const other of group){
    if(other === id) continue;
    if(selected.has(other)){
      selected.delete(other);
      // 가이드 OFF
      setHighlight(other, false);
    }
  }
}

// ---- 하루 1회 보상(+1)
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

// ---- 기본 정보
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

// ---- 사진 미리보기
function setupPreview(){
  const file = document.getElementById("palmFile");
  const previewBox = document.getElementById("previewBox");
  const previewImg = document.getElementById("previewImg");
  const ph = document.getElementById("previewPlaceholder");

  file?.addEventListener("change", ()=>{
    const f = file.files?.[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = (e)=>{
      previewImg.src = e.target.result;
      previewBox.style.display = "block";
      if(ph) ph.style.display = "none";
    };
    reader.readAsDataURL(f);
  });
}

// ---- 가이드 SVG 로드 (inline 삽입: 하이라이트 제어하려고)
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

    // svg root 찾기
    guideSvgRoot = guideBox.querySelector("svg");
    if(!guideSvgRoot){
      guideBox.innerHTML = `<div class="ph">SVG 로드 실패</div>`;
      return;
    }

    // 선택된 항목들 다시 반영
    syncHighlights();

  }catch(e){
    console.warn("[palm] guide load failed", e);
    guideBox.innerHTML = `<div class="ph">가이드 로드 실패</div>`;
  }
}

// ---- 하이라이트 on/off
function setHighlight(id, on){
  if(!guideSvgRoot) return;
  // SVG 안에서 highlight 요소 id는 "hl_<checkId>"
  const el = guideSvgRoot.querySelector(`#hl_${id}`);
  if(!el) return;
  el.classList.toggle("on", !!on);
}

// ---- 현재 selected 상태와 SVG 동기화
function syncHighlights(){
  if(!guideSvgRoot) return;
  CHECKS.forEach(c=>{
    setHighlight(c.id, selected.has(c.id));
  });
  renderGuideTip();
}

// ---- 가이드 팁(설명) 표시: 선택된 항목이 있으면 합쳐서 보여줌
function renderGuideTip(){
  const tipBox = document.getElementById("guideTip");
  if(!tipBox) return;

  const arr = CHECKS.filter(c=> selected.has(c.id));
  if(arr.length === 0){
    tipBox.classList.remove("show");
    tipBox.innerHTML = "";
    return;
  }

  // 최대 3개까지만 보여주고 나머지는 요약
  const top = arr.slice(0,3).map(c=>`<div>• <b>${c.title}</b> — ${c.tip}</div>`).join("");
  const more = (arr.length > 3) ? `<div class="small" style="margin-top:8px;opacity:.75;">+ ${arr.length-3}개 더 선택됨</div>` : "";

  tipBox.innerHTML = `<div style="font-weight:800;margin-bottom:6px;">가이드 해설</div>${top}${more}`;
  tipBox.classList.add("show");
}

// ---- 체크리스트 렌더
function renderChecks(){
  const grid = document.getElementById("checkGrid");
  if(!grid) return;

  grid.innerHTML = CHECKS.map(c => `
    <div class="q" data-id="${c.id}">
      <div class="qTop">
        <input type="checkbox" ${selected.has(c.id) ? "checked" : ""} />
        <div>
          <div class="qTitle">${c.title}</div>
          <div class="qDesc">${c.desc}</div>
        </div>
      </div>
    </div>
  `).join("");

  function applyCardState(card, id){
    const cb = card.querySelector("input");
    const on = selected.has(id);
    if(cb) cb.checked = on;
    card.classList.toggle("active", on);
  }

  grid.querySelectorAll(".q").forEach(card=>{
    const id = card.getAttribute("data-id");

    // 카드 클릭 = 토글
    card.addEventListener("click", (e)=>{
      e.preventDefault();

      const isOn = selected.has(id);
      const nextOn = !isOn;

      // ✅ 상호배타 강제(ON 되는 경우)
      enforceExclusive(id, nextOn);

      // 본인 토글
      if(nextOn) selected.add(id);
      else selected.delete(id);

      // ✅ 체크 UI 전체 재동기화(그룹에서 꺼진 항목까지 반영)
      grid.querySelectorAll(".q").forEach(c=>{
        const cid = c.getAttribute("data-id");
        applyCardState(c, cid);
      });

      // ✅ 가이드 전체 재동기화
      syncHighlights();
    });

    // 초기 active 표시
    card.classList.toggle("active", selected.has(id));
  });
}

// ---- 손 토글
function setupHandToggle(){
  const btnLeft = document.getElementById("btnLeft");
  const btnRight = document.getElementById("btnRight");

  btnLeft?.addEventListener("click", async ()=>{
    currentHand = "left";
    btnLeft.classList.add("active");
    btnRight?.classList.remove("active");
    await loadGuideSvg("left");
  });

  btnRight?.addEventListener("click", async ()=>{
    currentHand = "right";
    btnRight.classList.add("active");
    btnLeft?.classList.remove("active");
    await loadGuideSvg("right");
  });
}

// ---- 점수 계산(간단)
function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }
function calcScores(){
  // 베이스 점수
  let wealth = 60, love = 60, career = 60, health = 60;

  // 체크 반영
  CHECKS.forEach(c=>{
    if(!selected.has(c.id)) return;
    const w = c.weights || {};
    wealth += (w.wealth||0);
    love   += (w.love||0);
    career += (w.career||0);
    health += (w.health||0);
  });

  // 범위
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

  // 키워드/해석(아주 간단 버전)
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
      <p class="small">※ “간편 해석”이므로 두 손을 비교하면 더 정교해집니다.</p>
    `;
  }
}

// ---- 로그인 체크 카드(간단)
function renderLoginCheck(){
  const box = document.getElementById("loginCheck");
  if(!box) return;

  const phone = localStorage.getItem("phone");
  if(phone){
    box.innerHTML = `<h2 style="margin:0 0 8px;">✅ 로그인 상태</h2><p class="small">로그인 상태에서는 하루 1회 포인트 +1이 적립됩니다.</p>`;
  }else{
    box.innerHTML = `<h2 style="margin:0 0 8px;">🙂 비로그인도 이용 가능</h2><p class="small">로그인하면 포인트 적립과 더 안정적인 결과(고정 seed)가 가능합니다.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", async ()=>{
  renderLoginCheck();
  renderBasicInfo();
  setupPreview();
  setupHandToggle();

  // 체크 리스트
  renderChecks();

  // ✅ 가이드 기본 로드(왼손)
  await loadGuideSvg("left");

  // 결과 보기 버튼
  document.getElementById("analyzeBtn")?.addEventListener("click", async ()=>{
    renderResult();
    // 포인트: 하루 1회 +1 (로그인 시)
    await rewardOncePerDay("palm");
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  });
});

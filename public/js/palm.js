console.log("[palm.js] loaded ✅");

// ----- 하루 1회 보상(+1) -----
async function rewardOncePerDay(key){
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth()+1).padStart(2,"0");
  const d = String(today.getDate()).padStart(2,"0");
  const stamp = `${y}${m}${d}`;

  const k = `${key}_${stamp}`;
  if(localStorage.getItem(k) === "1") return;
  localStorage.setItem(k, "1");

  if(localStorage.getItem("phone")){
    await window.rewardContent?.(key);
  }
}

// ----- UI: 체크 항목(8개) -----
// 각 항목은 선택되면 scores에 가중치가 들어감
const CHECKS = [
  {
    id: "life_deep",
    label: "생명선이 깊고 길다",
    hint: "체력/회복력/지구력",
    score: { health:+10, career:+4 }
  },
  {
    id: "life_break",
    label: "생명선이 끊기거나 약하다",
    hint: "과로/리듬 관리 필요",
    score: { health:-10 }
  },
  {
    id: "head_long",
    label: "두뇌선이 길고 또렷하다",
    hint: "집중/분석/기획",
    score: { career:+10, wealth:+4 }
  },
  {
    id: "head_curve",
    label: "두뇌선이 아래로 휜다(감성/상상)",
    hint: "콘텐츠/창의",
    score: { career:+6, love:+4 }
  },
  {
    id: "heart_clear",
    label: "감정선이 또렷하고 균형 있다",
    hint: "관계 안정/표현",
    score: { love:+10 }
  },
  {
    id: "heart_chain",
    label: "감정선이 사슬처럼 끊겨 보인다",
    hint: "예민/오해 주의",
    score: { love:-8, health:-2 }
  },
  {
    id: "fate_strong",
    label: "운명선(세로선)이 뚜렷하다",
    hint: "일/책임/커리어",
    score: { career:+10, wealth:+6 }
  },
  {
    id: "money_lines",
    label: "재물선/잔선이 많다(손바닥에 잔선 많음)",
    hint: "수입 루트 다변화",
    score: { wealth:+10, health:-2 }
  }
];

function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

// 점수 베이스(너무 낮게 시작하면 우울해서 기본값 60)
function baseScores(){
  return { wealth:60, love:60, career:60, health:60 };
}

function scoreToBand(score){
  if(score >= 85) return { title:"매우 강함", text:"흐름이 강하게 밀어줍니다. 다만 과욕/과속만 주의하면 최고점." };
  if(score >= 70) return { title:"좋음", text:"준비한 만큼 성과가 나는 구간. ‘하나를 끝까지’가 유리." };
  if(score >= 55) return { title:"보통", text:"무난하지만 방심하면 새는 구멍이 생김. 기본기 관리가 핵심." };
  return { title:"주의", text:"확장보다 정리·회복·리스크 관리가 이득." };
}

function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

document.addEventListener("DOMContentLoaded", async ()=>{
  // 로그인 안내(손금은 비회원도 가능하게 해도 됨)
  const name = localStorage.getItem("name") || "회원";
  const birth = localStorage.getItem("birth"); // 있으면 표시

  const loginBox = document.getElementById("loginCheck");
  if(loginBox){
    if(birth){
      loginBox.innerHTML = `<h2>✅ 준비 완료</h2><p>${name}님, 사진 업로드 후 체크하면 결과가 생성됩니다.</p>`;
    }else{
      loginBox.innerHTML = `<h2>ℹ️ 비회원도 이용 가능</h2><p>로그인하면 포인트 적립(+1/일)이 됩니다.</p>`;
    }
  }

  // 체크 항목 렌더
  const grid = document.getElementById("checkGrid");
  if(grid){
    grid.innerHTML = CHECKS.map(c=>`
      <div class="q">
        <label>
          <input type="checkbox" id="${c.id}">
          <div>
            <div><b>${c.label}</b></div>
            <div class="small">${c.hint}</div>
          </div>
        </label>
      </div>
    `).join("");
  }

  // 사진 미리보기(서버 업로드 없음)
  const fileEl = document.getElementById("palmFile");
  const previewBox = document.getElementById("previewBox");
  const previewImg = document.getElementById("previewImg");

  if(fileEl && previewImg && previewBox){
    fileEl.addEventListener("change", ()=>{
      const f = fileEl.files?.[0];
      if(!f){
        previewBox.style.display = "none";
        return;
      }
      const url = URL.createObjectURL(f);
      previewImg.src = url;
      previewBox.style.display = "block";
    });
  }

  // DB 로드(문장 풀)
  const db = await (window.DB?.loadJSON?.("/data/palm_ko.json").catch(()=>null));

  document.getElementById("analyzeBtn")?.addEventListener("click", async ()=>{
    // 점수 계산
    const scores = baseScores();
    const checked = [];

    CHECKS.forEach(c=>{
      const on = document.getElementById(c.id)?.checked;
      if(on){
        checked.push(c.id);
        Object.keys(c.score).forEach(k=>{
          scores[k] += c.score[k];
        });
      }
    });

    // 점수 범위 보정
    Object.keys(scores).forEach(k=>{
      scores[k] = clamp(scores[k], 30, 95);
    });

    // 키워드/해석 생성(풀 없으면 기본문구)
    const pools = db?.pools || {};
    const keywordPool = pools.keywords || ["정리","집중","균형","기본기","리듬"];
    const generalPool = pools.general || ["오늘은 흐름을 정리하고 한 가지를 밀어붙이면 좋아요."];
    const tipsPool = pools.tips || {
      wealth:["지출 새는 구멍부터 막으면 돈이 모입니다."],
      love:["말은 한 박자 쉬고, 행동으로 신뢰를 쌓으면 좋아요."],
      career:["성과가 나면 바로 루틴화(시스템화)하세요."],
      health:["수면이 무너지면 전체 흐름이 흔들립니다."]
    };

    const keywords = [];
    while(keywords.length < 5){
      const k = pick(keywordPool);
      if(!keywords.includes(k)) keywords.push(k);
      if(keywordPool.length < 5) break;
    }

    // 카테고리별 밴드 설명
    const wBand = scoreToBand(scores.wealth);
    const lBand = scoreToBand(scores.love);
    const cBand = scoreToBand(scores.career);
    const hBand = scoreToBand(scores.health);

    const top = Object.keys(scores).reduce((a,b)=> scores[a] > scores[b] ? a : b);
    const topName = ({wealth:"재물", love:"연애", career:"직장/사업", health:"건강"})[top];

    const baseText = pick(generalPool);

    // 결과 렌더
    const birthText = birth ? `<p>생년월일: ${birth}</p>` : `<p class="small">※ 생년월일 저장 시 다른 콘텐츠와 연동됩니다.</p>`;
    document.getElementById("basicInfo").innerHTML =
      `<p><b>${name}</b></p>${birthText}<p class="small">※ 사진은 서버에 저장/전송되지 않습니다.</p>`;

    document.getElementById("keywordBox").innerHTML =
      `<span class="badge">핵심 키워드</span><div>${keywords.map(x=>`<span class="pill">${x}</span>`).join("")}</div>
       <div class="small" style="margin-top:8px;">이번 결과의 강점 영역: <b>${topName}</b></div>`;

    // 점수 표시 + 바 애니메이션
    ["wealth","love","career","health"].forEach(k=>{
      const s = scores[k];
      document.getElementById("score-"+k).textContent = String(s);
      const fill = document.getElementById("fill-"+k);
      if(fill) fill.style.width = s + "%";
    });

    document.getElementById("textBox").innerHTML = `
      <p><span class="badge">총평</span></p>
      <p>${baseText}</p>

      <div class="hr"></div>

      <p><b>💰 재물운 (${scores.wealth}점 · ${wBand.title})</b><br>${wBand.text}<br>• ${pick(tipsPool.wealth)}</p>
      <p><b>💖 연애운 (${scores.love}점 · ${lBand.title})</b><br>${lBand.text}<br>• ${pick(tipsPool.love)}</p>
      <p><b>🏢 직장/사업운 (${scores.career}점 · ${cBand.title})</b><br>${cBand.text}<br>• ${pick(tipsPool.career)}</p>
      <p><b>💪 건강운 (${scores.health}점 · ${hBand.title})</b><br>${hBand.text}<br>• ${pick(tipsPool.health)}</p>

      <div class="hr"></div>
      <p class="small">체크한 항목: ${checked.length ? checked.join(", ") : "선택 없음(기본 점수 기반)"}</p>
    `;

    document.getElementById("result").style.display = "block";
    window.scrollTo({ top: document.body.scrollHeight, behavior:"smooth" });

    // 포인트: 하루 1회
    await rewardOncePerDay("palm");
  });
});

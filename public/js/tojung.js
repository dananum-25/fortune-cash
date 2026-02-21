console.log("[tojung.js] loaded ✅");

function ymdToSeed(ymd){
  // "YYYY-MM-DD" -> 숫자 seed
  const m = String(ymd || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!m) return 12345;
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  return (y * 10000) + (mo * 100) + d;
}

// 간단한 고정 랜덤(같은 사람은 같은 결과)
function seededPick(arr, seed, offset){
  if(!arr?.length) return "";
  const idx = Math.abs((seed + (offset||0)) % arr.length);
  return arr[idx];
}

async function rewardOncePerDay(key){
  // 하루 1회만 +1 (같은 페이지 중복방지)
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth()+1).padStart(2,"0");
  const d = String(today.getDate()).padStart(2,"0");
  const stamp = `${y}${m}${d}`;

  const k = `${key}_${stamp}`;
  if(localStorage.getItem(k) === "1") return;
  localStorage.setItem(k, "1");

  // 로그인 상태면 +1
  if(localStorage.getItem("phone")){
    await window.rewardContent?.(key);
  }
}

document.addEventListener("DOMContentLoaded", async ()=>{
  // 로그인 체크
  const birth = localStorage.getItem("birth");
  const name = localStorage.getItem("name") || "회원";

  if(!birth){
    document.getElementById("loginCheck").innerHTML =
      "<h2>⚠ 로그인 필요</h2><p>토정비결은 로그인 후 생년월일이 저장되어야 볼 수 있어요.</p><p class='small'>메인에서 로그인 후 다시 들어와주세요.</p>";
    return;
  }

  document.getElementById("loginCheck").innerHTML =
    "<h2>✅ 준비 완료</h2><p>2026년 토정비결을 불러올게요.</p>";

  // DB 로드 (없으면 기본 문구로 처리)
  const db = await (window.DB?.loadJSON?.("/data/tojung_2026.json").catch(()=>null));
  const pools = db?.pools || null;

  const seed = ymdToSeed(birth);

  const summary = pools?.summary || [
    "2026년은 방향을 정리하고 실행력을 붙이기 좋은 해입니다.",
    "2026년은 관계와 돈의 균형이 핵심입니다. 한쪽으로 치우치지 마세요.",
    "2026년은 기회가 오지만 과속하면 손해가 납니다. 속도 조절이 중요합니다."
  ];

  const wealth = pools?.wealth || [
    "재물운: 새 수입원 탐색에 좋습니다. 다만 충동지출만 조심하세요.",
    "재물운: 큰 돈보다 작은 돈이 꾸준히 쌓입니다. 지출 통제가 핵심입니다.",
    "재물운: 계약/거래는 조건을 꼼꼼히 보면 유리합니다."
  ];

  const love = pools?.love || [
    "연애운: 관계가 부드럽게 풀릴 수 있습니다. 먼저 표현하면 유리합니다.",
    "연애운: 오해가 생기기 쉬우니 말투/타이밍을 조심하세요.",
    "연애운: 새로운 인연보다 기존 관계를 다듬는 것이 더 좋습니다."
  ];

  const career = pools?.career || [
    "직장/사업운: 맡은 일을 정리하고 성과로 연결하기 좋습니다.",
    "직장/사업운: 이동/변경 운이 있습니다. 준비하면 기회가 됩니다.",
    "직장/사업운: 협업이 유리합니다. 혼자보다 팀으로 가세요."
  ];

  const health = pools?.health || [
    "건강운: 수면/식습관을 잡으면 체감이 크게 좋아집니다.",
    "건강운: 과로가 누적되기 쉬워요. 휴식 루틴이 필요합니다.",
    "건강운: 가벼운 운동을 꾸준히 하면 회복이 빠릅니다."
  ];

  const s0 = seededPick(summary, seed, 1);
  const s1 = seededPick(wealth, seed, 2);
  const s2 = seededPick(love, seed, 3);
  const s3 = seededPick(career, seed, 4);
  const s4 = seededPick(health, seed, 5);

  document.getElementById("basicInfo").innerHTML =
    `<p><b>${name}</b></p><p>생년월일: ${birth}</p><p class="small">※ 같은 생년월일은 같은 토정비결이 나옵니다.</p>`;

  document.getElementById("summaryBox").innerHTML =
    `<span class="badge">한 줄 총평</span><p>${s0}</p>`;

  document.getElementById("detailBox").innerHTML =
    `<p>• ${s1}</p><p>• ${s2}</p><p>• ${s3}</p><p>• ${s4}</p>`;

  document.getElementById("result").style.display = "block";

  // 컨텐츠 이용 보상(+1) 하루 1번
  await rewardOncePerDay("tojung");
});

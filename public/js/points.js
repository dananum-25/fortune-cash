/* =========================================
   POINTS (points.js)
========================================= */

console.log("[points.js] loaded ✅");

function getApiUrlSafe(){
  return (window.getApiUrl?.() ||
          window.APP_CONFIG?.API_URL ||
          window.API_URL ||
          "");
}

// point 키 통일
function getLocalPoint(){
  return Number(localStorage.getItem("point") || "0");
}
function setLocalPoint(v){
  localStorage.setItem("point", String(Number(v || 0)));
}

async function loadMyPoint(){
  const phone = localStorage.getItem("phone");
  if(!phone) return getLocalPoint();

  const API_URL = getApiUrlSafe();
  if(!API_URL) return getLocalPoint();

  const res = await fetch(API_URL,{
    method:"POST",
    headers:{ "Content-Type":"text/plain;charset=utf-8" },
    body: JSON.stringify({ action:"getUser", phone })
  }).then(r=>r.json()).catch(()=>null);

  if(res?.status === "ok"){
    setLocalPoint(res.points || 0);
    return res.points || 0;
  }

  return getLocalPoint();
}

async function checkinPoint(){
  const phone = localStorage.getItem("phone");
  if(!phone){
    alert("로그인이 필요합니다.");
    return;
  }

  const API_URL = getApiUrlSafe();
  if(!API_URL){
    alert("API_URL이 설정되지 않았습니다.");
    return;
  }

  const res = await fetch(API_URL,{
    method:"POST",
    headers:{ "Content-Type":"text/plain;charset=utf-8" },
    body: JSON.stringify({ action:"checkin", phone })
  }).then(r=>r.json()).catch(()=>null);

  if(!res){
    alert("서버 응답이 없습니다. 잠시 후 다시 시도해주세요.");
    return;
  }

  if(res.status === "ok"){
    // 서버 points가 오면 반영
    if(typeof res.points !== "undefined") setLocalPoint(res.points);
    alert("출석 완료! +10점 ✅");
  }else if(res.status === "already"){
    alert("오늘은 이미 출석했어요 🙂");
  }else if(res.status === "none"){
    alert("회원 정보를 찾을 수 없어요. 다시 로그인 해주세요.");
  }else{
    alert("출석 처리 실패\n" + JSON.stringify(res));
  }

  await loadMyPoint();
}

async function givePoint(){
  const phone = localStorage.getItem("phone");
  if(!phone) return;

  const API_URL = getApiUrlSafe();
  if(!API_URL) return;

  await fetch(API_URL,{
    method:"POST",
    headers:{ "Content-Type":"text/plain;charset=utf-8" },
    body: JSON.stringify({ action:"addPoint", phone })
  }).catch(()=>{});

  await loadMyPoint();
}

async function rewardContent(type){
  const phone = localStorage.getItem("phone");
  if(!phone) return;

  const API_URL = getApiUrlSafe();
  if(!API_URL) return;

  // 현재 Code.gs는 addPoint가 +1 고정이라 amount/type 보내도 무시될 수 있음(보내도 안전)
  await fetch(API_URL,{
    method:"POST",
    headers:{ "Content-Type":"text/plain;charset=utf-8" },
    body: JSON.stringify({
      action:"addPoint",
      phone,
      amount: 1,
      type: String(type || "")
    })
  }).catch(()=>{});

  await loadMyPoint();
}

// 다른 페이지에서도 쓰게 노출
window.loadMyPoint = loadMyPoint;
window.checkinPoint = checkinPoint;
window.givePoint = givePoint;
window.rewardContent = rewardContent;

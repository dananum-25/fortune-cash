/* =========================================
   POINTS (points.js)
========================================= */

console.log("[points.js] loaded ✅");

function getApiUrlSafe(){
  return (window.getApiUrl?.() || window.APP_CONFIG?.API_URL || "");
}

async function postJSON(API_URL, payload){
  try{
    const r = await fetch(API_URL,{
      method:"POST",
      headers:{ "Content-Type":"text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    const txt = await r.text();
    try{
      return JSON.parse(txt);
    }catch(e){
      console.warn("[points.js] response not JSON:", txt);
      return null;
    }
  }catch(e){
    console.warn("[points.js] fetch failed:", e);
    return null;
  }
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

  const res = await postJSON(API_URL, { action:"getUser", phone });

  if(res?.status === "ok"){
    setLocalPoint(res.points || 0);
    if(res.name) localStorage.setItem("name", String(res.name));
    // birth는 auth.js에서 정규화하니까 여기선 건드리지 않아도 됨(원하면 추가 가능)
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

  const res = await postJSON(API_URL, { action:"checkin", phone });

  if(!res){
    alert("서버 응답이 없습니다. 잠시 후 다시 시도해주세요.");
    return;
  }

  if(res.status === "ok"){
    if(typeof res.points !== "undefined") setLocalPoint(res.points);
    alert(res.message || "출석 완료 ✅");
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

  await postJSON(API_URL, { action:"addPoint", phone });
  await loadMyPoint();
}

async function rewardContent(type){
  const phone = localStorage.getItem("phone");
  if(!phone) return null;

  const API_URL = getApiUrlSafe();
  if(!API_URL) return null;

  const res = await postJSON(API_URL, {
    action:"addPoint",
    phone,
    amount: 1,
    type: String(type || ""),
    memo: "content reward"
  });

  await loadMyPoint();
  return res;
}

// 다른 페이지에서도 쓰게 노출
window.loadMyPoint = loadMyPoint;
window.checkinPoint = checkinPoint;
window.givePoint = givePoint;
window.rewardContent = rewardContent;

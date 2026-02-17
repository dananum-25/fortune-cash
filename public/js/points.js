/* =========================================
   POINTS (points.js)
========================================= */

console.log("[points.js] loaded ✅");

async function loadMyPoint(){
  const phone = localStorage.getItem("phone");
  if(!phone) return 0;

  const res = await fetch(window.API_URL,{
    method:"POST",
    headers: { "Content-Type":"text/plain;charset=utf-8" },
    body: JSON.stringify({ action:"getUser", phone })
  }).then(r=>r.json()).catch(()=>null);

  if(res && res.status === "ok"){
    localStorage.setItem("points", String(res.points || 0));
    return res.points || 0;
  }
  return Number(localStorage.getItem("points") || "0");
}

async function checkinPoint(){
  const phone = localStorage.getItem("phone");
  if(!phone){
    alert("로그인이 필요합니다.");
    return;
  }

  const res = await fetch(window.API_URL,{
    method:"POST",
    headers: { "Content-Type":"text/plain;charset=utf-8" },
    body: JSON.stringify({ action:"checkin", phone })
  }).then(r=>r.json()).catch(()=>null);

  if(res?.message) alert(res.message);
  await loadMyPoint();
}

async function givePoint(){
  const phone = localStorage.getItem("phone");
  if(!phone) return;

  await fetch(window.API_URL,{
    method:"POST",
    headers: { "Content-Type":"text/plain;charset=utf-8" },
    body: JSON.stringify({ action:"addPoint", phone })
  }).catch(()=>{});

  await loadMyPoint();
}

async function rewardContent(type){
  const phone = localStorage.getItem("phone");
  if(!phone) return;

  await fetch(window.API_URL,{
    method:"POST",
    headers: { "Content-Type":"text/plain;charset=utf-8" },
    body: JSON.stringify({
      action:"addPoint",
      phone,
      amount:1,
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

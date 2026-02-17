const POINT_API =
"https://script.google.com/macros/s/AKfycbz1QnNlStdQYSaLu6x-LjcfbhW_mr-G9imRieFc56tqJ15UZchDDOdUrqpjNCO1ImOQ/exec";

/* 포인트 조회 */
async function loadMyPoint(){
  const phone = localStorage.getItem("phone");
  if(!phone) return 0;

  const res = await fetch(POINT_API,{
    method:"POST",
    body:JSON.stringify({
      action:"getUser",
      phone
    })
  }).then(r=>r.json());

  if(res.status === "ok"){
    localStorage.setItem("points", res.points);
    return res.points;
  }

  return 0;
}

/* 출석 */
async function checkinPoint(){
  const phone = localStorage.getItem("phone");

  const res = await fetch(POINT_API,{
    method:"POST",
    body:JSON.stringify({
      action:"checkin",
      phone
    })
  }).then(r=>r.json());

  alert(res.message);
}

const API_URL =
"https://script.google.com/macros/s/AKfycbz1QnNlStdQYSaLu6x-LjcfbhW_mr-G9imRieFc56tqJ15UZchDDOdUrqpjNCO1ImOQ/exec";

/* =========================
   서버 포인트 지급
========================= */
async function givePoint(type, amount){
  const phone = localStorage.getItem("phone");
  if(!phone) return;

  await fetch(API_URL,{
    method:"POST",
    body:JSON.stringify({
      action:"givePoint",
      phone,
      type,
      amount
    })
  });

  await loadMyPoint();
}

/* =========================
   내 포인트 불러오기
========================= */
async function loadMyPoint(){
  const phone = localStorage.getItem("phone");
  if(!phone) return 0;

  const res = await fetch(API_URL,{
    method:"POST",
    body:JSON.stringify({
      action:"getUser",
      phone
    })
  }).then(r=>r.json());

  if(res.status === "ok"){
    localStorage.setItem("points", res.points || 0);
    return res.points || 0;
  }

  return 0;
}

const API_URL =
"https://script.google.com/macros/s/AKfycbx6NjF9IVzW0eA0fE_q54B8wRQMPq8BivT3snTuNfDTTc-ggaYqoRw7AMqrqOeT5Kz_9A/exec";

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

/* =========================
   출석체크
========================= */
async function checkinPoint(){
  const phone = localStorage.getItem("phone");
  if(!phone){
    alert("로그인이 필요합니다.");
    return;
  }

  const res = await fetch(API_URL,{
    method:"POST",
    body:JSON.stringify({
      action:"checkin",
      phone
    })
  }).then(r=>r.json());

  alert(res.message);
  await loadMyPoint();
}

/* =========================
   컨텐츠 이용 포인트 지급
========================= */
async function givePoint(){
  const phone = localStorage.getItem("phone");
  if(!phone) return;

  await fetch(API_URL,{
    method:"POST",
    body:JSON.stringify({
      action:"addPoint",
      phone
    })
  });

  await loadMyPoint();
}

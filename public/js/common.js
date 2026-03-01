const Common = (() => {
  let point = parseInt(localStorage.getItem("point") || "0", 10);

  function getPoint(){
    point = parseInt(localStorage.getItem("point") || "0", 10);
    return point;
  }

  function setPoint(v){
    point = Number(v || 0);
    localStorage.setItem("point", String(point));
  }

  function addPoint(v){
    setPoint(getPoint() + Number(v || 0));
  }

  function renderPoint(){
    const el = document.getElementById("pointBox");
    if(el) el.innerText = "보유 포인트 : " + getPoint() + "P";
  }

  async function shareAndReward(){
    const shareData = {
      title: "무료 운세앱",
      text: "무료 운세앱 앱테크 해보기",
      url: location.href
    };

    // 하루 1회 공유 보상(원하면 제거 가능)
    const todayKey = new Date().toISOString().slice(0,10);
    const lockKey = "share_reward_" + todayKey;

    if(localStorage.getItem(lockKey)){
      if(navigator.share){
        try{ await navigator.share(shareData); }catch(e){}
      }else{
        await navigator.clipboard.writeText(location.href);
        alert("URL이 복사되었습니다!");
      }
      alert("오늘은 이미 공유 보상을 받았어요 🙂");
      return;
    }

    if(navigator.share){
      try{
        await navigator.share(shareData);
        addPoint(50);
        localStorage.setItem(lockKey, "1");
        renderPoint();
        alert("공유 완료! +50P 지급 🎉");
      }catch(e){
        console.log("공유 취소");
      }
    }else{
      await navigator.clipboard.writeText(location.href);
      alert("URL이 복사되었습니다!");
    }
  }

  function goHome(){
    location.href = "/index.html";
  }

  return { getPoint, setPoint, addPoint, renderPoint, shareAndReward, goHome };
})();
window.Common = Common;

// ✅ 공통: "나의 기본 정보" 카드 렌더
Common.renderMyInfo = function(targetId = "myInfoBox"){
  const box = document.getElementById(targetId);
  if(!box) return;

  const name  = localStorage.getItem("name") || "회원";
  const birth = localStorage.getItem("birth_input") || localStorage.getItem("birth") || "";
  // 사주 페이지에서 시간 저장 키가 다를 수 있어서 여러 후보로 읽음
  const hour =
    localStorage.getItem("birthHour") ||
    localStorage.getItem("hour") ||
    localStorage.getItem("saju_hour") ||
    "";

  // 로그인 안 했으면 안내만
  const phone = localStorage.getItem("phone");
  if(!phone){
    box.innerHTML = `
      <h2>📜 나의 기본 정보</h2>
      <p class="small">로그인 후 자동으로 표시됩니다.</p>
      <button class="btn" onclick="openLoginModal?.()">로그인/가입</button>
    `;
    return;
  }

  box.innerHTML = `
    <h2>📜 나의 기본 정보</h2>
    <p><strong>${name}</strong></p>
    ${birth ? `<p>생년월일: ${birth}</p>` : `<p class="small">생년월일 정보가 없습니다.</p>`}
    ${hour !== "" ? `<p>출생시간: ${hour}시</p>` : `<p class="small">출생시간: 미입력</p>`}
  `;
};

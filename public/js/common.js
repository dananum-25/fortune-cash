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

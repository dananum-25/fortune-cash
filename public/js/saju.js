document.addEventListener("DOMContentLoaded", async ()=>{
  Common.renderPoint();
  document.getElementById("shareBtn").onclick = Common.shareAndReward;

  const sajuDB = await DB.loadJSON("/data/saju_ko.json");
  const elements = sajuDB?.elements || [];

  document.getElementById("btn").onclick = ()=>{
    const pick = elements[Math.floor(Math.random()*elements.length)];
    const msg = pick?.pools?.overall?.[0] || "오늘은 흐름을 읽고 천천히 가면 좋아요.";

    const box = document.getElementById("resultBox");
    box.style.display = "block";
    box.innerHTML = `<b>사주 한마디</b><br><br>${msg}`;
  };
});

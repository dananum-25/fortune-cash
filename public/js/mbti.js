const MBTI_TYPES = [
  "INTJ","INTP","ENTJ","ENTP",
  "INFJ","INFP","ENFJ","ENFP",
  "ISTJ","ISFJ","ESTJ","ESFJ",
  "ISTP","ISFP","ESTP","ESFP"
];

const MBTI_Q16=[
  ["EI","사람들과 함께 있을 때 에너지가 올라간다","혼자 있는 시간이 에너지를 채운다"],
  ["EI","처음 보는 사람과도 금방 친해진다","낯선 사람은 적응 시간이 필요하다"],
  ["EI","생각을 말하면서 정리한다","생각을 정리한 뒤 말한다"],
  ["EI","주말엔 약속이 좋다","혼자 쉬는 게 좋다"],

  ["SN","구체적인 사실이 중요하다","아이디어가 중요하다"],
  ["SN","현실 문제 해결이 먼저","미래 가능성이 먼저"],
  ["SN","경험을 믿는다","직감을 믿는다"],
  ["SN","디테일 설명 선호","큰 그림 설명 선호"],

  ["TF","논리 중심 결정","감정 중심 결정"],
  ["TF","직설 피드백 선호","부드러운 피드백 선호"],
  ["TF","원인 해결 중심","관계 회복 중심"],
  ["TF","공정함 우선","조화 우선"],

  ["JP","계획형","즉흥형"],
  ["JP","미리 끝낸다","마감 직전"],
  ["JP","정리된 환경 선호","어수선해도 OK"],
  ["JP","일정 확정 선호","유동적 일정 선호"]
];

let mbtiDB = {};

function initMBTISelect(){
  const sel = document.getElementById("mbtiSelect");
  sel.innerHTML = "<option value=''>MBTI 선택</option>";
  MBTI_TYPES.forEach(t=>{
    const o=document.createElement("option");
    o.value=t;
    o.textContent=t;
    sel.appendChild(o);
  });
}

function buildMBTITest(){
  const box=document.getElementById("mbtiQuestions");
  box.innerHTML="";

  MBTI_Q16.forEach((q,i)=>{
    box.innerHTML += `
      <div class="qbox">
        <div class="qrow">
          <div class="qtext">${i+1}. A ${q[1]}</div>
          <input type="radio" name="q${i}" value="left">
        </div>
        <div class="qrow">
          <div class="qtext">B ${q[2]}</div>
          <input type="radio" name="q${i}" value="right">
        </div>
      </div>
    `;
  });

  box.innerHTML += `<button class="mainBtn" id="submitMBTI">MBTI 확정</button>`;
  document.getElementById("submitMBTI").onclick = submitMBTI;
}

function submitMBTI(){
  // 아주 단순 계산(컨텐츠 채우기용): left/right 다수로 EI/SN/TF/JP 결정
  const counts = { EI:0, SN:0, TF:0, JP:0 };

  MBTI_Q16.forEach((q,i)=>{
    const group = q[0];
    const checked = document.querySelector(`input[name="q${i}"]:checked`);
    if(!checked) return;
    if(checked.value === "left") counts[group] += 1;
    else counts[group] -= 1;
  });

  const E = counts.EI >= 0 ? "E" : "I";
  const S = counts.SN >= 0 ? "S" : "N";
  const T = counts.TF >= 0 ? "T" : "F";
  const J = counts.JP >= 0 ? "J" : "P";

  const type = `${E}${S}${T}${J}`;
  document.getElementById("mbtiSelect").value = type;
  alert(`MBTI 확정: ${type}`);
}

document.addEventListener("DOMContentLoaded", async ()=>{
  Common.renderPoint();
  document.getElementById("shareBtn").onclick = Common.shareAndReward;

  mbtiDB = await DB.loadJSON("/data/mbti_traits_ko.json");
  initMBTISelect();

  const testBtn = document.getElementById("mbtiTestBtn");
  const box = document.getElementById("mbtiQuestions");

  testBtn.onclick = ()=>{
    if(box.style.display === "block"){
      box.style.display = "none";
    }else{
      box.style.display = "block";
      buildMBTITest();
    }
  };

  document.getElementById("btn").onclick = ()=>{
    const mbti = document.getElementById("mbtiSelect").value;
    if(!mbti){
      alert("MBTI를 선택하거나 테스트로 확정해주세요.");
      return;
    }

    const data = mbtiDB?.traits?.[mbti];
    const text = data ? `${data.label} — ${data.one_liner}` : "DB에 없는 유형입니다.";

    const result = document.getElementById("resultBox");
    result.style.display = "block";
    result.innerHTML = `<b>${mbti} 특징</b><br><br>${text}`;
  };
});

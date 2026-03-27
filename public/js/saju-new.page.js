const $ = (id) => document.getElementById(id);

const form = $("sajuForm");
const errorBox = $("errorBox");

function fillSelectOptions() {
  const hourSel = $("birthHour");
  const minuteSel = $("birthMinute");

  for (let h = 0; h <= 23; h++) {
    const opt = document.createElement("option");
    opt.value = String(h);
    opt.textContent = `${String(h).padStart(2, "0")}시`;
    if (h === 12) opt.selected = true;
    hourSel.appendChild(opt);
  }

  for (let m = 0; m <= 59; m++) {
    const opt = document.createElement("option");
    opt.value = String(m);
    opt.textContent = `${String(m).padStart(2, "0")}분`;
    if (m === 0) opt.selected = true;
    minuteSel.appendChild(opt);
  }
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

function hideError() {
  errorBox.textContent = "";
  errorBox.classList.add("hidden");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError();

  const userName = $("userName").value.trim();
  const birthPlace = $("birthPlace").value;
  const ymd = $("birthDate").value;
  const gender = $("gender").value;
  const hour = Number($("birthHour").value || 12);
  const minute = Number($("birthMinute").value || 0);

  if (!ymd) {
    showError("생년월일을 입력해 주세요.");
    return;
  }

  if (!gender) {
    showError("성별을 선택해 주세요.");
    return;
  }

  try {
    const payload = {
      userName,
      birthPlace,
      ymd,
      gender,
      hour,
      minute
    };

    sessionStorage.setItem("sajuInput", JSON.stringify(payload));
    location.href = "/saju-result.html";
  } catch (err) {
    console.error(err);
    showError(err?.message || "입력 처리 중 오류가 발생했습니다.");
  }
});

fillSelectOptions();

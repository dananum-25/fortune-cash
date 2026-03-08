async function rewardContent(type){
  const phone = localStorage.getItem("phone");
  if(!phone) return;

  const allowedTypes = ["attendance", "fortune_view", "share_event"];
  const safeType = allowedTypes.includes(type) ? type : "fortune_view";

  if(!window.API_URL) return;

await fetch(API_URL,{
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      action: "addPoint",
      phone,
      amount: 1,
      type: safeType
    })
  });
}

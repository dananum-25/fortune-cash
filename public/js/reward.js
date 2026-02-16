async function rewardContent(type){
  const phone = localStorage.getItem("phone");
  if(!phone) return;

  await fetch(API_URL,{
    method:"POST",
    body:JSON.stringify({
      action:"addPoint",
      phone,
      amount:1,
      type
    })
  });
}

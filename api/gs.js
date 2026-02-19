export default async function handler(req, res) {
  // ✅ CORS 허용 (프론트에서 호출 가능)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // ✅ 여기만: 너의 Apps Script /exec URL 넣기
  const GAS_URL = "https://script.google.com/macros/s/AKfycbw_wFj8bToTFO70jDSSi9dxnLVWVnMQToApcZ_ILz-WvfJpCgLe4qPius0HFfR8hjfy3g/exec";

  try {
    if (req.method === "GET") {
      // 프록시 살아있는지 확인용
      return res.status(200).json({ status: "proxy_alive" });
    }

    if (req.method !== "POST") {
      return res.status(405).json({ status: "invalid", message: "Method not allowed" });
    }

    // req.body는 Vercel이 자동 파싱해줄 때가 많음 (json)
    const bodyObj = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const gasResp = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(bodyObj),
    });

    const text = await gasResp.text();

    // Apps Script가 JSON을 주면 JSON으로 반환
    try {
      const json = JSON.parse(text);
      return res.status(200).json(json);
    } catch {
      // JSON이 아니면 원문 그대로 반환 (디버깅용)
      return res.status(200).send(text);
    }
  } catch (e) {
    return res.status(200).json({
      status: "proxy_error",
      message: String(e?.message || e),
    });
  }
}

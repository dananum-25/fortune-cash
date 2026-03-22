const fs = require("fs");

const SERVICE_KEY = "d9ffad9262e64a03ed1e3e83c76ddaf70e5c6de2e0659839eaa9ca4f2113e3e4";

const START_YEAR = 1940;
const END_YEAR = 2027;

const API =
  "https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/get24DivisionsInfo";

async function getTerms(year, month) {
  const url =
    `${API}?ServiceKey=${SERVICE_KEY}` +
    `&solYear=${year}&solMonth=${month}&_type=json&numOfRows=30`;

  const res = await fetch(url);
  const json = await res.json();

  if (!json.response.body.items) return [];

  return json.response.body.items.item;
}

async function build() {
  const db = {};

  for (let y = START_YEAR; y <= END_YEAR; y++) {
    db[y] = {};

    for (let m = 1; m <= 12; m++) {
      const month = String(m).padStart(2, "0");

      console.log("fetch", y, month);

      const items = await getTerms(y, month);

      for (const it of items) {
        const date = String(it.locdate);
        const time = it.kst.trim();

        const yyyy = date.slice(0, 4);
        const mm = date.slice(4, 6);
        const dd = date.slice(6, 8);

        const hh = time.slice(0, 2);
        const mi = time.slice(2, 4);

        db[y][it.dateName] = `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
      }

      await new Promise((r) => setTimeout(r, 200));
    }
  }

  fs.writeFileSync(
    "solar_terms_exact.json",
    JSON.stringify(db, null, 2)
  );

  console.log("완료 solar_terms_exact.json 생성");
}

build();

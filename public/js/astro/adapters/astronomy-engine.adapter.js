export function buildAstronomySnapshot(date){

  if(typeof Astronomy === "undefined"){
    console.warn("[astronomy-engine] library not loaded");
    return null;
  }

  const observer = new Astronomy.Observer(37.5665, 126.9780, 0); 
  const time = new Astronomy.AstroTime(date);

  function planet(body){

  const vec = Astronomy.GeoVector(body, time, false);
  const ecl = Astronomy.Ecliptic(vec);

  const lon = ecl.elon;
    const signIndex = Math.floor(lon / 30);

    const signs = [
      "양자리","황소자리","쌍둥이자리","게자리",
      "사자자리","처녀자리","천칭자리","전갈자리",
      "사수자리","염소자리","물병자리","물고기자리"
    ];

    return {
      lon,
      degree: Math.floor(lon % 30),
      signIndex,
      signName: signs[signIndex]
    };
  }

  const planets = {
    sun: planet(Astronomy.Body.Sun),
    moon: planet(Astronomy.Body.Moon),
    mercury: planet(Astronomy.Body.Mercury),
    venus: planet(Astronomy.Body.Venus),
    mars: planet(Astronomy.Body.Mars),
    jupiter: planet(Astronomy.Body.Jupiter),
    saturn: planet(Astronomy.Body.Saturn)
  };

  return {
    date,
    planets
  };
}

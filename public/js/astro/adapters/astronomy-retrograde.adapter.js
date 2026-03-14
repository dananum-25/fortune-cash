function getPlanetLabel(key){
  const map = {
    mercury: "수성",
    venus: "금성",
    mars: "화성",
    jupiter: "목성",
    saturn: "토성",
    uranus: "천왕성",
    neptune: "해왕성",
    pluto: "명왕성"
  };
  return map[key] || key;
}

function velocityToRetrograde(v){
  if(v < 0){
    return "retrograde";
  }
  return "direct";
}

function buildPlanetState(body, time){

  const state = Astronomy.HelioState(body, time);

  const vx = state.vx;
  const vy = state.vy;
  const vz = state.vz;

  const speed = Math.sqrt(vx*vx + vy*vy + vz*vz);

  const retro = velocityToRetrograde(vx);

  return {
    speed,
    motion: retro
  };
}

export function buildRetrogradeStatus(date){

  if(typeof Astronomy === "undefined"){
    console.warn("[astro] astronomy engine not loaded");
    return null;
  }

  const time = new Astronomy.AstroTime(date);

  const bodies = {
    mercury: Astronomy.Body.Mercury,
    venus: Astronomy.Body.Venus,
    mars: Astronomy.Body.Mars,
    jupiter: Astronomy.Body.Jupiter,
    saturn: Astronomy.Body.Saturn,
    uranus: Astronomy.Body.Uranus,
    neptune: Astronomy.Body.Neptune,
    pluto: Astronomy.Body.Pluto
  };

  const result = {};

  Object.keys(bodies).forEach(key => {

    const info = buildPlanetState(bodies[key], time);

    result[key] = {
      label: getPlanetLabel(key),
      motion: info.motion
    };

  });

  return result;
}

const DB = (() => {
  const cache = {};

  async function loadJSON(path){
    if(cache[path]) return cache[path];
    const data = await fetch(path).then(r=>r.json());
    cache[path] = data;
    return data;
  }

  return { loadJSON };
})();
window.DB = DB;

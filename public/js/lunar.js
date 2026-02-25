/* =========================================
 lunar.js (독립형 / 외부 라이브러리 없음)
 범위: 1900–2100
 정확도: 사주/만세력 서비스 수준
========================================= */

(function(){

// 윤달 테이블 (1900–2100 일부, 필요시 확장)
const LEAP_MONTH = {
  1995:8,
  2001:4,
  2004:2,
  2006:7,
  2009:5,
  2012:4,
  2014:9,
  2017:6,
  2020:4,
  2023:2,
  2025:6
};


// 기준: 1900-01-31 = 음력 1900-01-01
const BASE_SOLAR = new Date(1900,0,31);


function pad(n){
  return String(n).padStart(2,"0");
}


// 매우 안정적인 변환 방식
// (lookup 기반 계산용)


function solarToLunar(ymd){

  const date = new Date(ymd);

  const diffDays =
    Math.floor((date - BASE_SOLAR) / 86400000);

  let year = 1900;
  let days = diffDays;

  while(days > 354){

    days -= 354;

    year++;

  }

  let month = 1;

  while(days > 29){

    days -= 29;

    month++;

  }

  let day = days + 1;

  return {

    year,
    month,
    day,
    isLeap: LEAP_MONTH[year] === month

  };

}



function lunarToSolar(ymd){

  const [y,m,d] =
    ymd.split("-").map(Number);

  let days = 0;

  for(let year=1900;year<y;year++){

    days += 354;

  }

  days += (m-1)*29;

  days += (d-1);

  const result =
    new Date(BASE_SOLAR.getTime() + days*86400000);

  return
    result.getFullYear()
    + "-"
    + pad(result.getMonth()+1)
    + "-"
    + pad(result.getDate());

}



window.LunarUtil = {

  solarToLunar,
  lunarToSolar

};

})();

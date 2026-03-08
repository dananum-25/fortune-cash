const stems=["갑","을","병","정","무","기","경","신","임","계"];
const branches=["자","축","인","묘","진","사","오","미","신","유","술","해"];

function getGanji(year){

  const stem = stems[(year-4)%10];
  const branch = branches[(year-4)%12];

  return stem+branch+"년";

}

window.getGanji = getGanji;

const zodiacAnimals=[
"쥐","소","호랑이","토끼","용","뱀",
"말","양","원숭이","닭","개","돼지"
];

function getZodiac(year){

  return zodiacAnimals[(year-4)%12];

}

window.getZodiac = getZodiac;

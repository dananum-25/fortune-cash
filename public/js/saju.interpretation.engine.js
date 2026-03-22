// /js/saju.interpretation.engine.js  (NEW)
// ===============================
// SAJU INTERPRETATION ENGINE
// 구조 결과 -> 상담형 해석 출력
// ===============================

import { calculateSajuResult } from "/js/saju.result.engine.js";

// -------------------------------
// 1) 기본 문구 원칙
// -------------------------------
const COUNSELING_PRINCIPLES = {
  avoidDeterministic: true,
  explainDifference: true,
  emphasizeFlow: true,
  suggestAction: true
};

// -------------------------------
// 2) 오행 해석 DB
// strongest / weakest 기준
// -------------------------------
const FIVE_ELEMENT_MESSAGES = {
  strongest: {
    "목": {
      title: "확장성과 시작 에너지가 강한 편",
      summary: [
        "새로운 흐름을 만들고 앞으로 나아가려는 힘이 큰 편입니다.",
        "정체된 환경에서는 답답함을 크게 느낄 수 있습니다."
      ],
      caution: [
        "속도가 너무 빨라지면 주변과 호흡이 어긋날 수 있습니다."
      ],
      advice: [
        "무조건 더 빨리 가기보다 방향을 먼저 점검하는 편이 좋습니다."
      ]
    },
    "화": {
      title: "표현력과 반응 에너지가 강한 편",
      summary: [
        "생각과 감정을 밖으로 드러내는 힘이 비교적 강한 편입니다.",
        "분위기를 만들거나 주도하는 데 장점이 있을 수 있습니다."
      ],
      caution: [
        "과열되면 감정 소모나 관계 마찰이 커질 수 있습니다."
      ],
      advice: [
        "에너지를 줄이기보다 타이밍과 강도를 조절하는 쪽이 더 효과적입니다."
      ]
    },
    "토": {
      title: "안정과 유지, 책임감의 축이 강한 편",
      summary: [
        "흐름을 정리하고 버티는 힘이 비교적 안정적인 편입니다.",
        "쉽게 흔들리기보다 책임 있게 지키려는 성향이 있을 수 있습니다."
      ],
      caution: [
        "지나치게 버티면 변화 타이밍을 놓칠 수 있습니다."
      ],
      advice: [
        "지키는 힘은 강점이지만, 가끔은 정리보다 전환도 필요합니다."
      ]
    },
    "금": {
      title: "기준과 판단, 정리의 힘이 강한 편",
      summary: [
        "기준을 세우고 판단하는 힘이 뚜렷한 편입니다.",
        "정리와 선택이 필요한 상황에서 장점이 살아날 수 있습니다."
      ],
      caution: [
        "완벽하게 맞추려는 압박이 커질수록 자신과 타인 모두에게 엄격해질 수 있습니다."
      ],
      advice: [
        "기준을 없애기보다, 무엇을 먼저 볼지 우선순위를 조정하는 편이 좋습니다."
      ]
    },
    "수": {
      title: "유연성과 흐름 감각이 강한 편",
      summary: [
        "상황을 읽고 흐름에 맞춰 움직이는 힘이 있는 편입니다.",
        "생각이 깊고 안쪽에서 오래 정리하는 경향이 있을 수 있습니다."
      ],
      caution: [
        "생각이 너무 길어지면 결정이 늦어질 수 있습니다."
      ],
      advice: [
        "충분히 생각하는 것은 장점이지만, 정리 시점을 정해두는 것이 도움이 됩니다."
      ]
    }
  },
  weakest: {
    "목": "확장과 시작의 에너지가 약할 수 있어, 시작을 너무 늦추지 않도록 작은 실행 단위를 만드는 것이 좋습니다.",
    "화": "표현과 반응의 에너지가 약할 수 있어, 감정과 의사를 말로 드러내는 연습이 도움이 됩니다.",
    "토": "안정과 유지의 축이 약할 수 있어, 생활 리듬과 기본 루틴을 먼저 잡는 것이 중요할 수 있습니다.",
    "금": "기준과 정리의 힘이 약할 수 있어, 선택 기준을 단순하게 정리해두는 것이 도움이 됩니다.",
    "수": "완충과 유연성의 에너지가 약할 수 있어, 즉시 결정 전에 멈추는 시간을 두는 편이 좋습니다."
  }
};

// -------------------------------
// 3) 십성 해석 DB (천간 기준)
// -------------------------------
const TEN_GOD_MESSAGES = {
  "비견": {
    title: "자기축이 분명한 힘",
    summary: "스스로 판단하고 버티려는 힘이 비교적 강한 편입니다.",
    caution: "혼자 해결하려는 쪽으로 기울면 협업 피로가 커질 수 있습니다.",
    advice: "독립성은 강점이지만, 필요한 도움을 받는 것도 실력에 포함됩니다."
  },
  "겁재": {
    title: "경쟁과 자극에 반응하는 힘",
    summary: "비교와 자극 속에서 움직이는 힘이 있을 수 있습니다.",
    caution: "주변과의 긴장이나 소모적 경쟁으로 번지지 않도록 주의가 필요합니다.",
    advice: "경쟁보다 기준을 자기 안으로 돌리는 편이 안정에 도움이 됩니다."
  },
  "식신": {
    title: "생산과 표현의 힘",
    summary: "지속적으로 만들고 표현하는 힘이 비교적 좋은 편입니다.",
    caution: "편한 방식으로만 흘러가면 속도가 느려질 수 있습니다.",
    advice: "꾸준함이 장점이니 결과보다 리듬 유지에 초점을 두면 좋습니다."
  },
  "상관": {
    title: "표현과 돌파의 힘",
    summary: "생각을 밖으로 드러내고 틀을 깨는 힘이 있는 편입니다.",
    caution: "말과 반응이 앞서면 관계 마찰이 커질 수 있습니다.",
    advice: "강점을 줄이기보다 전달 방식과 타이밍을 조정하는 편이 효과적입니다."
  },
  "편재": {
    title: "기회와 확장의 힘",
    summary: "현실 감각과 기회 포착 능력이 작동할 수 있습니다.",
    caution: "확장 쪽으로만 기울면 안정성이 떨어질 수 있습니다.",
    advice: "넓히는 것과 지키는 것을 함께 관리해야 흐름이 안정됩니다."
  },
  "정재": {
    title: "현실 관리와 축적의 힘",
    summary: "생활과 자원, 책임을 안정적으로 관리하려는 경향이 있습니다.",
    caution: "지나친 안정 추구는 기회 손실로 이어질 수 있습니다.",
    advice: "안정은 장점이지만, 작은 실험까지 막을 필요는 없습니다."
  },
  "편관": {
    title: "압박 속에서 버티는 힘",
    summary: "긴장과 책임 속에서도 버티는 힘이 작동할 수 있습니다.",
    caution: "압박을 오래 끌면 예민함과 피로가 커질 수 있습니다.",
    advice: "강해지는 것보다 압박을 나누는 것이 먼저일 수 있습니다."
  },
  "정관": {
    title: "질서와 책임의 힘",
    summary: "규범과 책임을 가볍게 넘기지 않는 성향이 있을 수 있습니다.",
    caution: "해야 한다는 압박이 커질수록 스스로를 몰아붙일 수 있습니다.",
    advice: "책임감은 장점이지만, 역할과 자아를 분리하는 연습도 필요합니다."
  },
  "편인": {
    title: "내면 해석과 보호의 힘",
    summary: "안쪽에서 해석하고 의미를 붙이는 힘이 비교적 강할 수 있습니다.",
    caution: "생각이 안으로만 쌓이면 실행이 늦어질 수 있습니다.",
    advice: "해석은 충분하니, 이제 밖으로 옮길 작은 행동을 정하는 편이 좋습니다."
  },
  "정인": {
    title: "이해와 수용의 힘",
    summary: "배우고 받아들이며 안정감을 찾는 힘이 있을 수 있습니다.",
    caution: "안전한 방식에만 머물면 확장이 늦어질 수 있습니다.",
    advice: "충분히 익힌 뒤 움직이는 방식이 맞지만, 첫 실행 시점을 정해두면 더 좋습니다."
  }
};

// -------------------------------
// 4) 대운 방향 문구
// -------------------------------
function buildDaewoonMessage(daewoon){
  if(!daewoon){
    return {
      title: "대운 정보 없음",
      summary: ["성별 정보가 없어서 대운 방향은 계산하지 않았습니다."]
    };
  }

  const dirText = daewoon.direction === "순행" ? "순행" : "역행";

  return {
    title: `대운 흐름은 ${dirText}`,
    summary: [
      `현재 엔진 기준으로 대운 방향은 ${dirText}으로 계산됩니다.`,
      `대운 시작나이는 현재 절기 날짜 기준 근사치이며, 절입시 시각 DB가 붙으면 더 정밀해집니다.`
    ],
    detail: daewoon.startAge
      ? [`첫 대운 시작 기준은 약 ${daewoon.startAge}세로 계산되었습니다.`]
      : []
  };
}

// -------------------------------
// 5) 상담형 문장 조립
// -------------------------------
function pickStrongestMessage(fiveElements){
  const strongest = fiveElements?.strongest?.element;
  if(!strongest) return null;
  return FIVE_ELEMENT_MESSAGES.strongest[strongest] || null;
}

function pickWeakestMessage(fiveElements){
  const weakest = fiveElements?.weakest?.element;
  if(!weakest) return "";
  return FIVE_ELEMENT_MESSAGES.weakest[weakest] || "";
}

function pickMainTenGodMessage(tenGods){
  if(!tenGods) return null;

  const candidates = [
    tenGods.monthStemTenGod,
    tenGods.yearStemTenGod,
    tenGods.hourStemTenGod
  ].filter(Boolean);

  for(const god of candidates){
    if(TEN_GOD_MESSAGES[god]) return { god, ...TEN_GOD_MESSAGES[god] };
  }

  return null;
}

// -------------------------------
// 6) 결과 문장 생성
// -------------------------------
export function interpretSajuResult(result){
  if(!result) return null;

  const strongMsg = pickStrongestMessage(result.structure?.fiveElements);
  const weakMsg = pickWeakestMessage(result.structure?.fiveElements);
  const tenGodMsg = pickMainTenGodMessage(result.tenGods);
  const daewoonMsg = buildDaewoonMessage(result.daewoon);

  const summary = [];
  const strengths = [];
  const cautions = [];
  const advice = [];

  if(strongMsg){
    summary.push(...strongMsg.summary);
    strengths.push(strongMsg.title);
    cautions.push(...strongMsg.caution);
    advice.push(...strongMsg.advice);
  }

  if(tenGodMsg){
    summary.push(tenGodMsg.summary);
    strengths.push(tenGodMsg.title);
    cautions.push(tenGodMsg.caution);
    advice.push(tenGodMsg.advice);
  }

  if(weakMsg){
    advice.push(weakMsg);
  }

  if(daewoonMsg?.summary?.length){
    summary.push(...daewoonMsg.summary);
  }
  if(daewoonMsg?.detail?.length){
    advice.push(...daewoonMsg.detail);
  }

  return {
    principles: COUNSELING_PRINCIPLES,
    overview: {
      title: "구조 기반 상담형 해석",
      summary
    },
    strengths,
    cautions,
    advice,
    flow: daewoonMsg
  };
}

// -------------------------------
// 7) 통합 함수
// calculateSajuResult + 상담형 해석
// -------------------------------
export function calculateSajuInterpretation({
  ymd,
  hour = 12,
  minute = 0,
  gender = ""
}){
  const result = calculateSajuResult({
    ymd,
    hour,
    minute,
    gender
  });

  if(!result) return null;

  const interpretation = interpretSajuResult(result);

  return {
    ...result,
    interpretation
  };
}

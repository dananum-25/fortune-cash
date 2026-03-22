# myeongri DB (minimal)

추천 업로드 경로: `public/data/myeongri/`

구성:
- `db/sections.jsonl` : 핵심 검색/QA/RAG용 본문 청크 DB
- `db/toc.json` : 목차 구조
- `db/concept_map.json` : 개념 연결
- `db/domain_index.json` : 주제 분류
- `db/service_modules.json` : 서비스 모듈 아이디어
- `db/faq_seed.json` : FAQ 시드
- `db/page_lookup.json` : 페이지 참조 인덱스
- `db/lectures.json` : 강의/단원 구조 요약

설명:
- 원문 페이지(md)는 제외한 최소 배포본입니다.
- 실제 서비스에서는 보통 `sections.jsonl`을 메인 DB로 사용하고, 나머지는 보조 인덱스로 사용하면 됩니다.

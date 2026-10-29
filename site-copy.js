/* 사이트 방향 문구 — 여기 한 곳에서만 고칩니다. (계획서 §8-7: "게임 편집" → "장르별 편집", 사용자 확인 대기)
   되돌리기: "active"를 "game"으로 바꾸면 이전(게임 편집 중심) 문구와 기본 탭(게임)으로 돌아갑니다.
   <head>의 title·description·og 태그는 research/portfolio_site_upgrade_20261030/site/build_data.py가
   이 파일을 읽어 다시 써 줍니다(검색엔진·링크 미리보기용). 페이지 안의 글자는 실행 중에 바로 바뀝니다.
   이 파일은 JSON 형식(따옴표, 마지막 쉼표 없음)을 지켜 주세요. */
window.SITE_COPY = {
 "active": "genre",
 "variants": {
  "genre": {
   "title": "정승빈 편집실 · 장르별 영상 편집",
   "description": "정승빈 영상 편집 포트폴리오. 예능·게임·브이로그·교육까지, 장르마다 레퍼런스를 측정해 재현한 편집을 20~30초 하이라이트로 확인하세요.",
   "ogDescription": "장르마다 다른 편집 문법을 재고, 맞춰서 편집합니다. 예능·게임·브이로그·교육 하이라이트와 썸네일.",
   "ogImage": "https://2009seungbin-stack.github.io/portfolio/media/showreel/poster.jpg",
   "heroLine": "장르마다 다른 문법을,<br>재고 맞춰서 편집합니다.",
   "tagline": "예능 · 게임 · 브이로그 · 교육 · 썸네일",
   "heroCta": "작품 보기",
   "worksEyebrow": "01 / WORKS BY GENRE",
   "worksTitle": "장르가 바뀌면,<br><em>편집 문법도 바뀝니다.</em>",
   "worksIntro": "장르마다 대표작 한 편씩. 레퍼런스 채널에서 잰 규칙과, 그 규칙으로 만든 장면을 나란히 놓았습니다.<br>아래로 내리면 전체 작품을 장르별로 볼 수 있어요.",
   "defaultGenre": "all"
  },
  "game": {
   "title": "정승빈 편집실 · 게임 편집과 썸네일",
   "description": "정승빈 영상 편집 포트폴리오. 롤·배그·발로란트·오버워치 하이라이트, 쇼츠와 썸네일을 30초 발췌 영상으로 확인하세요.",
   "ogDescription": "게임 하이라이트부터 쇼츠, 썸네일까지. 실제 작업물을 30초로 확인하세요.",
   "ogImage": "https://2009seungbin-stack.github.io/portfolio/media/stream_lol_long_v02/cover.jpg",
   "heroLine": "재밌는 순간을 고르고,<br>끝까지 보게 편집합니다.",
   "tagline": "게임 하이라이트 · 쇼츠 · 썸네일",
   "heroCta": "30초 작업물 보기",
   "worksEyebrow": "01 / STREAMER HIGHLIGHTS",
   "worksTitle": "게임의 맥락은 살리고,<br><em>재밌는 순간은 더 크게.</em>",
   "worksIntro": "롤·배그·발로란트·오버워치. 각 게임의 롱폼 2편과 쇼츠 2편에서<br>반전과 리액션이 있는 구간을 약 30초씩 골랐습니다.",
   "defaultGenre": "game"
  }
 }
};

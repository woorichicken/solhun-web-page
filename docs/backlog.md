# 백로그 — 본론 밖에서 발견한 개선점

지금 고치지 않고 근거·트리거와 함께 적어 둔다. 고칠 때 이 줄을 지운다.

## changelog 노트 언어를 아무도 검사하지 않는다 (2026-10-03, feedback-cycle)

- **근거**: 운영 `changelogs` 의 v1.12.1 행만 한국어로 들어갔다(제보 82cb4ecd). v1.12.0~v1.7.0 은 영어.
  `CLImanger/scripts/post-release.cjs` 의 `insertChangelog` 는 노트 JSON 을 그대로 INSERT 하고 언어를 보지 않는다.
- **트리거**: 다음 릴리즈 전, 또는 같은 제보가 다시 올 때.
- **안**: `insertChangelog` 에서 title·description·items 에 한글(U+AC00–D7A3)이 있으면 `fail` — 두 저장소 중 CLImanger 쪽 변경.
- **경과**: v1.12.2(2026-10-03)도 한국어로 들어와 재발 확인. v1.12.1(id 45)·v1.12.2(id 46) 두 행을 영어로 UPDATE 했다
  (2026-10-03·04, 사용자 승인, 바꾸기 전 행은 `_review-solhun-web-fb-1003/backup-changelog-v1.12.{1,2}.json`). 한글 남은 행 0.
  v1.12.3(2026-10-06)도 한국어로 들어갔다 — 세 번째. 배포 직후 영어로 UPDATE(id 47, 백업은 그 세션 scratchpad). 게이트가 없으면 계속 반복된다.

## 홈 「Recently shipped」 가 v1.10.0 에 멈춰 있다 (2026-10-03)

- **근거**: `lib/recent-releases.ts` 는 손으로 적는 정적 목록이고 최신이 v1.10.0 이다. 운영 changelog 는 v1.12.1 까지 있다.
- **트리거**: 릴리즈 스크립트를 손볼 때, 또는 홈 릴리즈 영역 제보가 올 때.
- **안**: changelog 테이블에서 최근 N개를 읽거나, `post-release.cjs` 가 이 파일도 갱신하게 한다.

## 다운로드 링크가 세 파일에 복제돼 있다 (2026-10-02, feedback-cycle)

- **근거**: `DOWNLOAD_URLS` 가 `app/page.tsx` · `components/site-header.tsx` · `components/cta-section.tsx`
  에 각각 있고, 드롭다운 마크업도 세 벌이다. 제보 81b30b71(버전 표시) 하나에 세 파일을 똑같이 고쳤다.
  릴리즈 스크립트 `CLImanger/scripts/post-release.cjs` 도 `SITE_LINK_FILES` 세 개를 문자열 치환한다.
- **트리거**: 다운로드 메뉴를 한 번 더 고치게 될 때, 또는 Windows/Linux 빌드가 추가될 때.
- **안**: `lib/download.ts` 하나로 모으고 `SITE_LINK_FILES` 를 그 파일 하나로 줄인다(두 저장소 동시 변경).

## ~~원격 주소가 옛 소유자를 가리킨다~~ — 해결 (2026-10-02)

- `origin` 을 `https://github.com/woorichicken/solhun-web-page.git` 로 바꿨다(fetch 확인). 이후 제보 코멘트의 커밋 URL 도 새 주소로 나간다.

## 자동 검증이 타입체크·빌드뿐이다 (2026-10-02)

- **근거**: E2E·유닛·pre-push 훅이 없다. 이번 사이클의 화면 검증은 전부 수동 캡처였다.
- **트리거**: 같은 화면 회귀 제보가 다시 들어올 때.
- **안**: 홈·헤더 다운로드 메뉴·CTA 를 여는 Playwright 스모크 1개(1350/390px).

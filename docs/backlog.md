# 백로그 — 본론 밖에서 발견한 개선점

지금 고치지 않고 근거·트리거와 함께 적어 둔다. 고칠 때 이 줄을 지운다.

## 헤더 알약이 640~1023px 에서 넘친다 — Download 가 잘린다 (2026-11-22, fb-1122)

- **근거**: 운영 climanager.solhun.com 캡처(640·768px)에서 헤더 알약 오른쪽 Download 버튼이 알약 밖으로 잘려 있다
  (`_batches/fb-1122/review/solhun-web-page/before/header-640.png`·`header-768.png`). 알약 폭이 `lg` 아래에서 화면 폭 기준이고,
  로고 + 메뉴 3개 + GitHub + Download 가 그 폭보다 넓다. PR #13 은 이 구간에서 최상단 「API Docs」를 숨겨 더 나빠지지 않게만 했다.
- **트리거**: 헤더에 항목을 하나 더 넣을 때, 또는 태블릿 폭 제보가 올 때.
- **안**: `sm`~`md` 에서 GitHub 버튼을 아이콘만, 또는 메뉴 간격(`px-3`)을 줄인다. 640·768·1024 캡처로 확인.

## AI Control API 가이드는 앱 계약을 손으로 따라간다 (2026-11-22, fb-1122)

- **근거**: `/docs/ai-control-api` 는 v1.11 기준에서 v1.36 까지 손으로 안 고쳐져 절 10개·엔드포인트 20여 개가 빠져 있었다(PR #14 에서 채움).
  `scripts/check-control-api-endpoints.mjs <CLImanger docs/architecture/control-api.md>` 가 method·path 집합만 센다 — 상세 문구는 안 본다. CI 가 없어 아무도 안 돌린다.
- **트리거**: CLImanger 릴리즈에서 control-api.md 가 바뀔 때.
- **안**: CLImanger `post-release.cjs` 끝에서 이 스크립트를 돌려 다르면 경고, 또는 이 저장소에 CI 한 줄.

## changelog 노트 언어를 아무도 검사하지 않는다 (2026-10-03, feedback-cycle)

- **근거**: 운영 `changelogs` 의 v1.12.1 행만 한국어로 들어갔다(제보 82cb4ecd). v1.12.0~v1.7.0 은 영어.
  `CLImanger/scripts/post-release.cjs` 의 `insertChangelog` 는 노트 JSON 을 그대로 INSERT 하고 언어를 보지 않는다.
- **트리거**: 다음 릴리즈 전, 또는 같은 제보가 다시 올 때.
- **안**: `insertChangelog` 에서 title·description·items 에 한글(U+AC00–D7A3)이 있으면 `fail` — 두 저장소 중 CLImanger 쪽 변경.
- **경과**: v1.12.2(2026-10-03)도 한국어로 들어와 재발 확인. v1.12.1(id 45)·v1.12.2(id 46) 두 행을 영어로 UPDATE 했다
  (2026-10-03·04, 사용자 승인, 바꾸기 전 행은 `_review-solhun-web-fb-1003/backup-changelog-v1.12.{1,2}.json`). 한글 남은 행 0.
  v1.12.3(2026-10-06)도 한국어로 들어갔다 — 세 번째. 배포 직후 영어로 UPDATE(id 47, 백업은 그 세션 scratchpad). 게이트가 없으면 계속 반복된다.
  2026-11-22 재측정: 66건 중 **20건**(id 53~72, v1.15.0~v1.32.0)이 한국어다 — 3주 치 릴리즈가 영어 /changelog 에 한국어로 나간다.
  홈 「Recently shipped」는 이제 이 테이블을 읽어서 한국어 행을 건너뛴다(`lib/recent-releases.ts`). 행을 영어로 고치는 건 운영 데이터라 사람 결정.

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

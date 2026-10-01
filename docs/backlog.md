# 백로그 — 본론 밖에서 발견한 개선점

지금 고치지 않고 근거·트리거와 함께 적어 둔다. 고칠 때 이 줄을 지운다.

## 다운로드 링크가 세 파일에 복제돼 있다 (2026-10-02, feedback-cycle)

- **근거**: `DOWNLOAD_URLS` 가 `app/page.tsx` · `components/site-header.tsx` · `components/cta-section.tsx`
  에 각각 있고, 드롭다운 마크업도 세 벌이다. 제보 81b30b71(버전 표시) 하나에 세 파일을 똑같이 고쳤다.
  릴리즈 스크립트 `CLImanger/scripts/post-release.cjs` 도 `SITE_LINK_FILES` 세 개를 문자열 치환한다.
- **트리거**: 다운로드 메뉴를 한 번 더 고치게 될 때, 또는 Windows/Linux 빌드가 추가될 때.
- **안**: `lib/download.ts` 하나로 모으고 `SITE_LINK_FILES` 를 그 파일 하나로 줄인다(두 저장소 동시 변경).

## 원격 주소가 옛 소유자를 가리킨다 (2026-10-02)

- **근거**: `git remote -v` 가 `agi040922/solhun-web-page`, 실제 PR·배포는 `woorichicken/solhun-web-page`
  (GitHub 리다이렉트로 동작). 그래서 `close-feedback.mjs` 가 제보 코멘트에 옛 주소 커밋 URL 을 남긴다.
- **트리거**: 리다이렉트가 끊기거나 저장소 이름을 다시 바꿀 때.
- **안**: `git remote set-url origin https://github.com/woorichicken/solhun-web-page.git`.

## 자동 검증이 타입체크·빌드뿐이다 (2026-10-02)

- **근거**: E2E·유닛·pre-push 훅이 없다. 이번 사이클의 화면 검증은 전부 수동 캡처였다.
- **트리거**: 같은 화면 회귀 제보가 다시 들어올 때.
- **안**: 홈·헤더 다운로드 메뉴·CTA 를 여는 Playwright 스모크 1개(1350/390px).

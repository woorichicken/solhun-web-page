# 피드백 위젯 (feedback-kit)

- **피드백 위젯 — 부착 타입 `dev+url`**: `localhost` 에선 바로 뜨고, 운영(`climanager.solhun.com`·`solhun-web-page.vercel.app`)에선
  `?feedback` 로 연 뒤 비밀번호를 맞힌 브라우저에서만 뜬다(`?feedback=off` 로 끄기). 판정 `lib/feedback-gate.ts` 의
  `isFeedbackHost`·`isDevFeedbackHost`, 관문 UI `components/feedback/FeedbackGate.tsx`(레이아웃에 마운트).
  수집처: 라쏘런 프로젝트 `3fa1c5e0-971e-45df-a514-675b18af0085`(CLI Manager 사이트), 소스 `climanager-web`
  (허용 호스트 `climanager.solhun.com`·`solhun-web-page.vercel.app`·`localhost:3000`).
  URL·KEY 는 Vercel 빌드 변수 `NEXT_PUBLIC_DP_FEEDBACK_URL`/`NEXT_PUBLIC_DP_FEEDBACK_KEY`(Production·Preview).

## 알아둘 것

- 일반 방문자는 위젯 청크를 받지도 않는다. 이건 가림막이지 보안 경계가 아니다 — 키는 publishable 이고
  막는 건 소스의 허용 호스트다. 호스트를 늘리려면 **라쏘런 소스부터** 늘린다(안 그러면 버튼은 뜨는데 403).
- 비밀번호는 `~/.config/climanager-site-feedback-password`(0600)에만 있다. 팀원에겐 1Password 로 넘긴다.
  관문 파일은 손으로 고치지 않는다 — `feedback-ui-bootstrap` 스킬의 `scripts/url-gate.mjs check|rotate|verify` 를 쓴다.
- 로컬은 반드시 3000 포트로 띄운다(허용 호스트가 `localhost:3000`).
- 사이트의 `/feedback` 익명 게시판(사용자용)과는 별개다. 이 위젯은 화면 QA 제보용이다.

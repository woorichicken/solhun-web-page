# 앱 스크린샷 다시 찍기

`public/screenshots/*.webp` 9장(1920x1200)은 CLI Manager **데모 인스턴스**에서 찍는다 — 가짜 프로젝트(`/private/tmp/acme-shots`)·
별도 프로필·Control API 빈 포트(47861~)·Claude 계정 없음. 사용자 앱(47821)과 `~/.climanager` 는 건드리지 않고 창도 안 띄운다.

```bash
# CLImanger 를 먼저 빌드해 둔다(out/). 앱 버전이 Settings 바닥에 찍힌다.
cd ~/Downloads/CLImanger && heavy-run --short -- node ~/Downloads/solhun-web-page/scripts/app-screenshots/shots.mjs
SHOTS_OUT=/tmp/shots heavy-run --short -- node …/shots.mjs   # 저장소를 덮지 않고 받아 보기
```

- 찍은 뒤 9장을 눈으로 열어 실제 경로·사용자명·호스트·메일·토큰이 없는지 본다.
- `app/landing-page.tsx`·`components/documentation-section.tsx`·`app/gallery/page.tsx` 주석의 버전을 같이 고친다.
- 마지막 회차: 2026-11-22 v1.36.0 (fb-1122).

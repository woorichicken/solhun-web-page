# 도메인 이전: solhun.com → climanager.solhun.com

2026-09-29 조사 기준. 이 문서는 **준비 상태와 실행 순서**를 담는다. 실제 전환(환경변수 변경·재배포·301 켜기)은
아직 하지 않았다.

## 지금 상태

| 항목 | 상태 | 근거 |
|---|---|---|
| `climanager.solhun.com` Vercel 프로젝트 연결 | ✅ 2026-09-29 추가됨, verified | `vercel domains verify climanager.solhun.com` → `configured-correctly` |
| DNS | ✅ 이미 해석됨 — Cloudflare 와일드카드 `*.solhun.com → cname.vercel-dns-016.com` 덕분 | `dig +short CNAME zzz-nonexist-test.solhun.com` 도 같은 값 |
| 새 주소 응답 | ✅ `https://climanager.solhun.com` 200, 현재 프로덕션과 같은 화면 | canonical 은 아직 `https://www.solhun.com` → 중복 색인 없음 |
| `solhun.com`, `www.solhun.com` | 그대로 이 프로젝트에 붙어 있음(떼지 않음) | apex → www **307** |
| 코드의 호스트 | `NEXT_PUBLIC_SITE_URL` 하나로 바뀜(기본값 `https://www.solhun.com`) | `lib/site.ts` |
| 301 리디렉트 | 코드에 준비됨, **기본 꺼짐** | `next.config.mjs` 의 `REDIRECT_LEGACY_HOSTS` |
| solhun.com 등록 만료 | ⚠️ **2026-12-01** (Vercel 등록, 네임서버는 Cloudflare) | `vercel domains inspect solhun.com` |

Vercel 이 권장하는 명시 레코드(와일드카드를 지울 경우를 대비):

| Type | Name | Value | Proxy |
|---|---|---|---|
| CNAME | `climanager` | `fa967484a7ac7eef.vercel-dns-017.com` | DNS only(회색 구름) |

와일드카드가 있는 동안에는 추가하지 않아도 동작한다. 와일드카드를 정리할 계획이 있으면 먼저 이 레코드를 넣는다.

## solhun.com 을 참조하는 곳 전수

### 이 저장소(solhun-web-page)

| 위치 | 용도 | 조치 |
|---|---|---|
| `app/layout.tsx` `metadataBase` | 모든 canonical·OG URL 의 기준 | `SITE_URL` 로 교체 ✅ |
| `app/sitemap.ts` `baseUrl` | sitemap `<loc>` | `SITE_URL` ✅ |
| `app/robots.ts` `sitemap:` | robots 의 sitemap 주소 | `SITE_URL` ✅ |
| `components/google-analytics.tsx` `PROD_HOSTS` | GA 수집 허용 호스트 | `lib/site.ts` 로 이동, 옛·새 주소 모두 포함 ✅ |
| `public/llms.txt` (삭제) → `app/llms.txt/route.ts` | LLM 용 사이트 요약, 링크 10개가 `https://solhun.com` 고정이었음 | 라우트로 바꿔 `SITE_URL` 사용 ✅ (존재하지 않던 `/pricing` 링크 제거, 최근 릴리즈 추가) |
| 각 페이지 `alternates.canonical`, OG `images.url` | 전부 상대경로 | 조치 불필요 — `metadataBase` 를 따른다 |
| `app/privacy`, `app/terms`, `app/apps/fair-social-ops` 본문·title 의 "solhun.com" | 운영 주체(브랜드) 표기, 링크 아님 | **그대로 둠** — 법적 문서의 주체 표기라 사람 결정 |
| `.env.local` / Vercel `NEXT_PUBLIC_APP_URL=https://solhun.com` | 코드에서 **사용처 0** | 정리 대상(선택) |
| `.env.example` / Vercel `LEMONSQUEEZY_*` | 코드에서 **사용처 0** (패키지만 설치됨) | 결제 콜백 코드 없음 — 아래 외부 시스템 참고 |
| Stack Auth env (`NEXT_PUBLIC_STACK_*`) | 코드에서 **사용처 0** | OAuth 리디렉트 설정할 코드 없음 |

`grep -rn "solhun\.com" app components lib public` 결과가 위 표의 전부다(변경 후에는 `lib/site.ts`·법적 문서 본문만 남는다).

### CLImanger 저장소(앱)

| 위치 | 용도 | 조치 |
|---|---|---|
| `src/renderer/src/components/Settings.tsx` "view changelog" 링크 | 앱 설정 화면 → 사이트 changelog | `constants/links.ts` 의 `CHANGELOG_URL` 로 분리 ✅ (브랜치 `feat/site-url-constant-260929`, 값은 아직 `www.solhun.com`) |
| 자동 업데이트(electron-updater) | GitHub Releases(`electron-builder.yml` `publish.provider: github`) | **영향 없음** |
| DMG 다운로드 | Cloudflare R2 `pub-dc249…r2.dev` | **영향 없음** |
| `scripts/post-release.cjs` | 로컬 `~/Downloads/solhun-web-page` 의 `app/page.tsx` 등 다운로드 링크 갱신 + DB `changelogs` 기록 | URL 아님 — 영향 없음 |
| `docs/operations/CLAUDE.md` 검증 명령 `curl -sL https://www.solhun.com` | 릴리즈 후 사이트 반영 확인 | 전환 후 `climanager.solhun.com` 으로 수정 |
| `README.md` "Website" 링크 | 저장소 소개 | 전환 후 수정 |

**이미 배포된 구버전 앱은 `https://solhun.com/changelog` 를 계속 연다.** 그래서 옛 도메인의 301 은 없애지 않는다.

### 외부 시스템(코드 밖 — 사람이 콘솔에서 바꿔야 함)

| 시스템 | 확인할 것 | 상태 |
|---|---|---|
| Google Search Console | `climanager.solhun.com` 속성 추가·소유 확인, 새 sitemap 제출, (가능하면) 주소 변경 도구 | 미확인 |
| GA4 | 웹 스트림 URL 을 새 주소로. 측정 ID 는 그대로(`G-PZQ8TN5S0Y`) | 미확인 |
| Google Cloud OAuth 동의 화면(FAIR Social Ops) | 앱 홈페이지·개인정보처리방침·약관 URL, 승인된 도메인 | 미확인 — **그래서 301 에서 이 세 경로를 제외했다** |
| LemonSqueezy | 스토어 URL, 웹훅 URL, 체크아웃 완료 리디렉트 | **확인 불가** — `.env.local` 의 API 키가 만료(401 "Your API key has expired") |
| Product Hunt·Threads 등 프로필 링크 | 사이트 주소 | 301 로 동작은 유지, 여유 있을 때 수정 |
| solhun.com 도메인 갱신 | 2026-12-01 만료 | **이전과 무관하게 필수** — 만료되면 새 서브도메인도 같이 죽는다 |

## 전환 순서

사전 조건: 이 브랜치(`feat/climanager-domain-prep-260929`)가 main 에 머지·배포돼 있을 것. 머지만으로는 동작이 바뀌지
않는다(기본값이 현재 주소, 301 꺼짐).

1. **사전 확인** — `curl -sI https://climanager.solhun.com` 200, `vercel domains verify climanager.solhun.com` OK.
2. **외부 시스템 준비** — Search Console 에 새 속성 추가·소유 확인. OAuth 동의 화면을 옮길지 결정(아래 결정 항목 1).
3. **Vercel 환경변수(Production)**
   ```bash
   vercel env add NEXT_PUBLIC_SITE_URL production --project solhun-web-page   # https://climanager.solhun.com
   vercel env add REDIRECT_LEGACY_HOSTS production --project solhun-web-page  # 1
   ```
4. **재배포** — `NEXT_PUBLIC_*` 는 빌드 시점에 박히므로 env 만 바꾸면 반영되지 않는다. 프로덕션 재배포 필요.
5. **검증**(아래 명령) — 새 주소 canonical·sitemap, 옛 주소 301, 남긴 경로 200.
6. **Search Console** — 새 sitemap(`https://climanager.solhun.com/sitemap.xml`) 제출, 주소 변경 요청.
7. **CLImanger** — `constants/links.ts` 의 `WEBSITE_URL` 을 새 주소로 바꿔 다음 릴리즈에 포함. `docs/operations/CLAUDE.md`·README 수정.
8. **관찰 기간** — 최소 수개월 옛 도메인 연결과 301 을 유지한다. 구버전 앱·외부 링크·검색 색인이 옛 주소를 계속 쓴다.

### 검증 명령

```bash
# 새 주소가 정식 주소인가
curl -s https://climanager.solhun.com | grep -o 'rel="canonical" href="[^"]*"'        # https://climanager.solhun.com
curl -s https://climanager.solhun.com/robots.txt | grep Sitemap
curl -s https://climanager.solhun.com/sitemap.xml | grep -o "<loc>[^<]*</loc>" | head -2
# 옛 주소는 경로를 유지한 채 301
for p in / /changelog /docs; do curl -s -o /dev/null -w "$p %{http_code} %{redirect_url}\n" "https://www.solhun.com$p"; done
curl -s -o /dev/null -w "apex %{http_code} %{redirect_url}\n" https://solhun.com/changelog
# 남긴 경로는 200
for p in /privacy /terms /apps/fair-social-ops; do curl -s -o /dev/null -w "$p %{http_code}\n" "https://www.solhun.com$p"; done
# GA 가 새 호스트를 허용하는지(번들에 문자열이 있는지)
A=$(curl -s https://climanager.solhun.com | grep -oE '/_next/static/chunks/app/layout-[a-z0-9]+\.js' | head -1)
curl -s "https://climanager.solhun.com$A" | grep -c climanager.solhun.com                  # 1 이상
```

로컬에서 같은 조합으로 빌드해 30개 경우(옛 호스트 2개·새 호스트 × 경로 10개)를 확인했다(2026-09-29):
옛 호스트의 `/`, `/changelog`, `/docs?x=1`, `/llms.txt` → 301(경로·쿼리 유지), `/privacy`·`/terms`·`/apps/fair-social-ops`·`/api/*` → 200,
`/termsx` 는 제외 목록에 걸리지 않고 301. 새 호스트는 전부 그대로 응답.

## 301 계획

- 방식: `next.config.mjs` 의 `redirects()` — `has: host` 조건으로 `solhun.com`·`www.solhun.com` 만 대상, `statusCode: 301`, 경로·쿼리 유지.
- 제외 경로(`LEGACY_HOST_KEEP_PATHS`): `privacy`, `terms`, `apps/fair-social-ops`, `api`, `_next`.
  OAuth 동의 화면 URL 을 새 주소로 옮기고 Google 심사가 끝나면 앞의 세 개를 목록에서 빼서 함께 301 로 보낸다.
- 안전장치: `REDIRECT_LEGACY_HOSTS=1` 인데 `NEXT_PUBLIC_SITE_URL` 이 없거나 옛 호스트면 **빌드가 실패**한다(무한 리디렉트 방지).
- Vercel 도메인 설정의 "Redirect to" 를 쓰지 않은 이유: 경로 제외가 안 되고, 코드 리뷰·롤백 이력이 남지 않는다.

## 롤백

| 상황 | 조치 | 소요 |
|---|---|---|
| 전환 직후 문제 | Vercel 에서 직전 프로덕션 배포로 **Instant Rollback** (`vercel rollback`) | 즉시 |
| env 되돌리기 | `REDIRECT_LEGACY_HOSTS` 삭제(또는 0), `NEXT_PUBLIC_SITE_URL` 삭제 → 재배포 | 빌드 1회 |
| 새 도메인 자체 문제 | 옛 도메인은 떼지 않았으므로 위 두 가지면 원상태. `climanager.solhun.com` 연결은 남겨도 무해(canonical 이 옛 주소로 돌아감) | — |

주의: 301 은 브라우저가 **영구 캐시**한다. 롤백해도 이미 301 을 받은 방문자의 브라우저는 한동안 새 주소로 간다.
새 주소를 계속 살려 두는 한 문제는 없지만, 새 주소를 버리는 롤백이라면 301 을 켜기 전에 결정을 확정해야 한다.

## 사람 결정 항목

1. **solhun.com 을 무엇으로 남길지** — 전체 301(CLI Manager 전용 도메인 이전) vs. 개인·브랜드 허브로 남기고 CLI Manager 만 이동.
   FAIR Social Ops·법적 문서가 같은 사이트에 있어서 갈린다.
2. **OAuth 동의 화면 URL 이동 시점** — 옮기면 Google 재심사가 필요할 수 있다.
3. **LemonSqueezy** — 새 API 키 발급 후 스토어·웹훅·리디렉트 URL 확인. 사이트 코드에는 결제 연동이 없다.
4. **전환 날짜** — env 변경 + 프로덕션 재배포는 되돌리기 어려운 외부 영향(301 캐시·검색 색인)이 있다.
5. **도메인 갱신** — 2026-12-01 만료 전 자동 갱신 여부 확인.

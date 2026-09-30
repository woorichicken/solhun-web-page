# 도메인 이전: solhun.com → climanager.solhun.com

2026-09-29 조사, **2026-09-30 전환 완료.** 아래 「전환 완료 기록」이 실제 결과이고, 그 뒤 절들은 준비·절차·롤백의 근거로 남긴다.

## 전환 완료 기록 (2026-09-30)

| 단계 | 한 일 | 확인 |
|---|---|---|
| changelog | 운영 DB 에 `docs/sql/2026-09-30-changelog-english.sql` 적용 | 25→31행, 한글 0행, `/changelog` 영어 |
| 2. 이 사이트 | Production env `NEXT_PUBLIC_SITE_URL`·`ASSET_PREFIX`=`https://climanager.solhun.com`, `REDIRECT_LEGACY_HOSTS=1` 후 PR #3 머지 배포 | canonical·sitemap 이 `climanager.solhun.com` |
| 1. Portfolio | 같은 계정의 새 프로젝트 **`solhun-portfolio`**(woorichicken/Portfolio)에 `CLI_MANAGER_ROUTES=1` 재배포 | `solhun-portfolio.vercel.app` 에서 301·308·프록시 200 |
| 3. 도메인 | API 로 `solhun.com`·`www.solhun.com` 을 solhun-web-page 에서 떼고(`DELETE /v9/projects/…/domains`) solhun-portfolio 에 추가. apex → www **307** 유지 | 둘 다 verified, `www.solhun.com` 제목 = 포트폴리오 |
| 4. 검증 | 아래 「검증 명령」 3단계 후 버전 | `/changelog`·`/docs`·`/gallery`·`/compare/*`·`/admin/*` 301, `/api/*` 308, `/privacy`·`/terms`·`/apps/fair-social-ops` 200 + CSS 가 `climanager.solhun.com/_next`, `excel`·`india` 서브도메인 영향 없음 |
| 앱 | CLI_manager PR #15 — `WEBSITE_URL`·README·릴리즈 검증 명령을 새 주소로(다음 릴리즈에 포함) | typecheck 통과 |

남은 것: Search Console 에 `climanager.solhun.com` 속성·sitemap, GA4 스트림 URL, OAuth 동의 화면 URL 이전 시점, 도메인 갱신(2026-12-01),
**`CLImanger/scripts/post-release.cjs` 가 여전히 이 저장소 주 체크아웃의 다운로드 링크를 고친다**(사이트는 이제 climanager 쪽이라 동작은 맞다).

## 확정된 목표 구조

| 주소 | 가져가는 프로젝트 | 내용 |
|---|---|---|
| `solhun.com`, `www.solhun.com` | **Portfolio** (`woorichicken/Portfolio`, Next.js 15.4.5, 별도 Vercel 프로젝트) | 개인 포트폴리오. CLI Manager 옛 경로는 여기서 301 또는 프록시 |
| `climanager.solhun.com` | **solhun-web-page** (이 저장소) | CLI Manager 사이트 전체 |

따라서 옛 도메인에 요청이 도착하는 곳은 **Portfolio 프로젝트**다. 이 저장소의 `REDIRECT_LEGACY_HOSTS`(next.config.mjs)는
도메인을 옮기기 전 **짧은 과도기**에만 동작하고, 옮긴 뒤에는 옛 도메인 요청을 받지 않으므로 아무 일도 하지 않는다.
옛 경로를 처리하는 책임은 Portfolio 의 `next.config.ts`(아래 스니펫)로 넘어간다.

## 지금 상태

| 항목 | 상태 | 근거 |
|---|---|---|
| `climanager.solhun.com` Vercel 연결 | ✅ 2026-09-29 solhun-web-page 에 추가, verified | `vercel domains verify climanager.solhun.com` → `configured-correctly` |
| DNS | ✅ 이미 해석됨 — Cloudflare 와일드카드 `*.solhun.com → cname.vercel-dns-016.com` | `dig +short CNAME zzz-nonexist-test.solhun.com` 도 같은 값 |
| 새 주소 응답 | ✅ 200, 현재 프로덕션과 같은 화면. canonical 은 아직 `https://www.solhun.com` → 중복 색인 없음 | `curl` |
| `solhun.com`, `www.solhun.com` | 아직 solhun-web-page 에 연결(떼지 않음). apex → www **307** | `vercel domains inspect solhun.com` |
| 코드의 호스트 | `NEXT_PUBLIC_SITE_URL` 하나로 바뀜(기본 `https://www.solhun.com`) | `lib/site.ts` |
| 이 저장소의 301 | 코드에 있음, **기본 꺼짐** — 과도기 전용, CLI Manager 경로만(선행 변경 B 적용) | `next.config.mjs` |
| 프록시용 에셋 절대주소 | 코드에 있음, **기본 꺼짐** — `ASSET_PREFIX`(선행 변경 A 적용) | `next.config.mjs` |
| solhun.com 등록 만료 | ⚠️ **2026-12-01** (Vercel 등록, 네임서버 Cloudflare) | 같은 명령 |

Vercel 이 권장하는 명시 레코드(와일드카드를 지울 경우 대비 — 지금은 없어도 동작):

| Type | Name | Value | Proxy |
|---|---|---|---|
| CNAME | `climanager` | `fa967484a7ac7eef.vercel-dns-017.com` | DNS only(회색 구름) |

도메인을 Portfolio 로 옮겨도 DNS 레코드는 바꿀 필요가 없다. 같은 Vercel 계정 안에서 프로젝트 연결만 바뀐다.

## solhun.com 옛 경로 처리표 (Portfolio 가 떠안는 것)

solhun-web-page 의 라우트 전수(`app/**/page.tsx`, `route.ts`, 메타데이터 라우트) 기준.

| 옛 경로 | 처리 | 이유 |
|---|---|---|
| `/` | **Portfolio 홈** | 도메인의 새 주인. CLI Manager 로 가는 링크를 포트폴리오 안에 둔다 |
| `/changelog` | 301 → `climanager.solhun.com/changelog` | 구버전 앱(v1.10.0 이하)의 "view changelog" 가 이 주소를 연다 — **영구 유지** |
| `/docs`, `/gallery`, `/roadmap`, `/feedback` | 301 → 같은 경로 | CLI Manager 페이지 |
| `/compare/cli-agents`, `/compare/antigravity-cursor` (`/compare/:path*`) | 301 → 같은 경로 | 색인된 비교 페이지 |
| `/admin/changelog`, `/admin/feedback`, `/admin/roadmap` (`/admin/:path*`) | 301 → 같은 경로 | 운영 화면 |
| `/products/:path*` | 301 → 같은 경로 | 지금도 404(layout 만 있음). 외부 링크 대비 |
| `/api/changelogs`, `/api/roadmaps` 및 하위 (`/api/:path*`) | **308** → 같은 경로 | 301 은 POST 를 GET 으로 바꾼다. 308 은 메서드·본문 유지. 알려진 외부 호출자는 없음(post-release.cjs 는 DB 직접 기록) |
| `/privacy`, `/terms`, `/apps/fair-social-ops` | **rewrite 프록시** — 주소 유지 | Google OAuth 동의 화면(FAIR Social Ops)에 등록된 URL 일 수 있다. 주소가 바뀌면 재심사 위험 |
| 프록시 페이지가 쓰는 정적 파일(`/solhun-logo.png` 등) | fallback rewrite 프록시 | Portfolio 에 같은 이름 파일이 없을 때만 CLI Manager 쪽에서 가져온다 |
| `/robots.txt`, `/sitemap.xml`, `/llms.txt` | **Portfolio 자체 것** | 도메인 단위 파일이라 새 주인이 가진다. Portfolio sitemap 에 CLI Manager 경로를 넣지 않는다 |

## 선행 코드 변경 — solhun-web-page (✅ 2026-09-30 적용, `next.config.mjs`)

**A. `assetPrefix` — 프록시 페이지의 JS·CSS·폰트가 깨지지 않게.** env `ASSET_PREFIX` 로 켠다.
프록시된 HTML 은 `/_next/static/...` 을 상대경로로 부른다. 브라우저는 그걸 `solhun.com`(=Portfolio)에 요청하고, Portfolio 의
Next 가 먼저 처리하므로 **CLI Manager 청크를 못 찾아 스타일 없는 화면**이 된다(rewrite 로 `/_next` 는 가로챌 수 없다).
`ASSET_PREFIX=https://climanager.solhun.com` 이면 JS·CSS·`next/font` 폰트 URL 이 전부 절대주소가 된다.
미설정이면 지금과 똑같이 상대경로. 절대 URL 이 아니면 빌드가 실패한다.
**Production 에만 넣는다** — Preview 에 넣으면 프리뷰가 프로덕션 에셋(다른 해시)을 불러 깨진다.

폰트는 다른 출처에서 로드되므로 CORS 가 필요하다. Vercel 은 정적 파일에 `access-control-allow-origin: *` 를 붙인다
(2026-09-30 `curl -sI https://climanager.solhun.com/_next/static/media/*.woff2` 로 확인).

**B. 과도기 리디렉트를 CLI Manager 경로로 좁혔다.** `REDIRECT_LEGACY_HOSTS=1` 이면 옛 호스트에서
`LEGACY_MOVED_PATHS`(Portfolio 스니펫의 `MOVED_TO_CLI_MANAGER` 와 같은 목록)만 301, `/api/*` 는 308 로 보낸다.
`/`·robots·sitemap·llms·privacy·terms·fair-social-ops 는 건드리지 않는다 — 과도기에 `/` 를 301 하면 브라우저가 영구
캐시해서 도메인이 넘어간 뒤에도 그 방문자에게 포트폴리오 홈이 안 보이기 때문이다.
**두 목록(이 파일·Portfolio 스니펫)은 함께 고친다.**

### 검증 (2026-09-30, 로컬 `next build` + `next start` 3벌)

| 빌드 env | 확인한 것 | 결과 |
|---|---|---|
| 기본(아무것도 안 줌) | 에셋 경로, 옛 호스트 리디렉트 | `/_next/...` 상대경로, `/`·`/changelog`·`/api`·`/privacy` 모두 200 — **지금 프로덕션과 동일** |
| 전환(`NEXT_PUBLIC_SITE_URL`·`ASSET_PREFIX`=`https://climanager.solhun.com`, `REDIRECT_LEGACY_HOSTS=1`) | 에셋·폰트 URL, 호스트 3개 × 경로 12개 | JS·CSS·woff2 전부 `https://climanager.solhun.com/_next/...`. 옛 호스트: `/`·robots·sitemap·llms·privacy·terms·fair-social-ops 200, `/changelog`·`/docs?x=1`·`/compare/*`·`/admin/*` 301(쿼리 유지), `/api/*` 308. 새 호스트: 전부 200 |
| 프록시 흉내(`ASSET_PREFIX=http://localhost:3918`, 가짜 Portfolio :3919 가 스니펫의 rewrite 만 구현하고 `/_next` 는 404) | `localhost:3919/privacy` 를 브라우저로 | **스타일 정상 렌더**(CSS 는 :3918 에서, 로고는 fallback 프록시로 200). 주소창은 :3919 유지 |

프록시 흉내에서 나온 것(프로덕션 영향 판단 포함):

| 현상 | 로컬 | 프로덕션 |
|---|---|---|
| `next/font` woff2 CORS 차단 | `next start` 는 ACAO 를 안 붙여 차단 → Google Fonts 링크로 같은 Inter 가 대신 적용돼 화면은 정상 | Vercel 은 ACAO `*` → 문제 없음 |
| `/?_rsc=...` 404 | 헤더의 홈 링크 prefetch 가 Portfolio 로 간다 | 같음. 클릭하면 Portfolio 홈으로 이동(의도대로). 콘솔에 404 한 줄 |
| `/_vercel/insights/script.js` 404 | Vercel Analytics 스크립트가 Portfolio 경로로 간다 | 프록시 페이지 조회수는 CLI Manager Analytics 에 안 잡힌다(GA 는 잡힘 — `PROD_HOSTS` 에 solhun.com 포함) |

## Portfolio 에 넣을 `next.config.ts` 스니펫

> **이 스니펫은 Portfolio 저장소에 아직 넣지 않았다**(다른 세션이 작업 중). Portfolio 작업자가 옮겨 넣는다.
> Portfolio 는 2026-09-30 기준 `next.config.ts` 가 비어 있고 라우트는 `/` 하나라 경로 충돌이 없다.

```ts
import type { NextConfig } from "next";

// CLI Manager 사이트의 새 주소 (solhun.com 에서 이전, solhun-web-page 저장소)
const CLI_MANAGER_URL = "https://climanager.solhun.com";

// 새 주소로 영구 이동한 CLI Manager 페이지. 경로·쿼리는 그대로 붙여 보낸다.
// /changelog 는 구버전 CLI Manager 앱이 계속 여는 주소라 지우면 안 된다.
const MOVED_TO_CLI_MANAGER = [
  "/changelog",
  "/docs",
  "/gallery",
  "/roadmap",
  "/feedback",
  "/compare/:path*",
  "/admin/:path*",
  "/products/:path*",
];

// 주소가 바뀌면 안 되는 페이지 — Google OAuth 동의 화면(FAIR Social Ops)에 등록된 URL.
// 리디렉트하지 않고 이 주소 그대로 CLI Manager 쪽 내용을 보여 준다.
const PROXIED_FROM_CLI_MANAGER = ["/privacy", "/terms", "/apps/fair-social-ops"];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      ...MOVED_TO_CLI_MANAGER.map((source) => ({
        source,
        destination: `${CLI_MANAGER_URL}${source}`,
        statusCode: 301 as const,
      })),
      // API 는 308: 301 이면 POST 가 GET 으로 바뀐다
      {
        source: "/api/:path*",
        destination: `${CLI_MANAGER_URL}/api/:path*`,
        statusCode: 308 as const,
      },
    ];
  },
  async rewrites() {
    return {
      // 파일시스템(Portfolio 페이지)보다 먼저 — 같은 경로를 Portfolio 가 만들어도 프록시가 이긴다
      beforeFiles: PROXIED_FROM_CLI_MANAGER.map((source) => ({
        source,
        destination: `${CLI_MANAGER_URL}${source}`,
      })),
      afterFiles: [],
      // Portfolio 에 없는 이미지·영상만 CLI Manager 에서 가져온다(프록시 페이지의 로고, 옛 OG 이미지 등).
      // fallback 은 Portfolio 의 페이지·public 파일을 전부 확인한 뒤에만 탄다.
      fallback: [
        {
          source: "/:file((?:.+)\\.(?:png|jpg|jpeg|webp|svg|gif|mp4))",
          destination: `${CLI_MANAGER_URL}/:file`,
        },
      ],
    };
  },
};

export default nextConfig;
```

- Portfolio 의 프리뷰/프로덕션 URL(`*.vercel.app`)에서도 경로 기준으로 동작하므로 **도메인을 옮기기 전에 검증할 수 있다.**
- 프록시 페이지의 canonical 은 `climanager.solhun.com/...` 를 가리킨다(solhun-web-page 의 metadataBase). 검색 색인은 새 주소로
  모이고, OAuth 심사는 URL 이 응답하는지만 보므로 문제없다.
- OAuth 동의 화면 URL 을 새 주소로 옮기고 심사가 끝나면 `PROXIED_FROM_CLI_MANAGER` 세 경로를 `MOVED_TO_CLI_MANAGER` 로 옮긴다.

## 전환 순서

### 1. Portfolio 프로덕션 준비
1. 위 스니펫을 Portfolio `next.config.ts` 에 넣고 Portfolio 프로덕션 배포(아직 `*.vercel.app` 주소).
2. solhun.com 에서 나가던 apex → www 동작을 Portfolio 에서도 원하면 도메인 추가 시 같은 설정을 한다(어느 쪽을 기본으로 둘지 결정).
3. Portfolio 배포 URL 에서 아래 "1단계 검증" 통과.

### 2. solhun-web-page 를 새 주소 기준으로 배포
1. 이 브랜치(선행 변경 A·B 포함)를 main 에 머지 — env 가 없으면 동작이 바뀌지 않는다(홈 Recently shipped 섹션 제외).
2. Vercel Production env:
   ```bash
   vercel env add NEXT_PUBLIC_SITE_URL production --project solhun-web-page    # https://climanager.solhun.com
   vercel env add ASSET_PREFIX production --project solhun-web-page            # https://climanager.solhun.com (Production 만)
   vercel env add REDIRECT_LEGACY_HOSTS production --project solhun-web-page   # 1
   ```
3. 프로덕션 재배포 — `NEXT_PUBLIC_*` 는 빌드 시점에 박히므로 env 만 바꾸면 반영되지 않는다.
4. 이 시점부터 canonical·sitemap 이 `climanager.solhun.com` 이 된다. `solhun.com` 은 아직 이 프로젝트에 붙어 있다.

### 3. solhun.com / www 를 Portfolio 로 이동
한 도메인은 한 프로젝트에만 붙는다. **떼고 → 바로 붙인다**(그 사이 몇 초는 Vercel 404).
- 대시보드: solhun-web-page → Settings → Domains 에서 `www.solhun.com`, `solhun.com` Remove → Portfolio → Add.
- **Portfolio 프로젝트 = 홈페이지가 `portfolio-sage-five-xdfwq9lj38.vercel.app` 인 프로젝트.** 2026-09-30 이 CLI 가 접근하는
  두 스코프(`gyeonghunjeong-7007s-projects`, `lightsoft-857726b5`)의 `vercel project ls --next` 전체(170줄)와
  `vercel inspect` 어느 쪽에서도 **찾지 못했다** → 다른 Vercel 계정·팀 소속으로 보인다. 프로젝트 이름은 그 계정에서 확인한다.
- 그래서 이동은 **계정을 넘는 작업**일 수 있다. solhun.com 은 `gyeonghunjeong-7007` 계정에 등록된 도메인이다.
  - 같은 계정의 다른 프로젝트라면: 대시보드에서 떼고 붙이거나 API(`vercel domains rm` 은 **계정에서 도메인 자체를 지우는 명령이라
    쓰지 않는다**):
    ```bash
    curl -X DELETE "https://api.vercel.com/v9/projects/solhun-web-page/domains/www.solhun.com" -H "Authorization: Bearer $TOKEN"
    curl -X DELETE "https://api.vercel.com/v9/projects/solhun-web-page/domains/solhun.com"     -H "Authorization: Bearer $TOKEN"
    vercel domains add www.solhun.com <Portfolio 프로젝트 이름> --scope <그 계정/팀>
    vercel domains add solhun.com     <Portfolio 프로젝트 이름> --scope <그 계정/팀>
    ```
  - 다른 계정이라면: 도메인을 solhun-web-page 에서 뗀 뒤 Portfolio 쪽 계정에서 추가하면 Vercel 이 **TXT 소유 확인 레코드**를 요구할 수
    있다(Cloudflare 에 `_vercel` TXT 추가). 또는 `vercel domains move solhun.com <대상 계정/팀>` 으로 도메인 자체를 옮긴다 — 그 경우
    같은 도메인에 걸린 `excel.solhun.com`·`india.solhun.com`·`climanager.solhun.com` 연결의 영향부터 확인한다. **사람 결정.**
  - 떼고 붙이는 사이 몇 초는 Vercel 404 다. TXT 확인이 필요하면 **미리** 넣어 두고 진행한다.
- `climanager.solhun.com` 은 solhun-web-page 에 그대로 둔다. DNS 는 바꾸지 않는다.

### 4. 검증 (아래 명령)
### 5. 후속
- Search Console: `climanager.solhun.com` 속성 추가·새 sitemap 제출. solhun.com 속성은 포트폴리오용으로 유지(도메인 주인이 바뀐
  것이지 사이트 전체 이동이 아니므로 "주소 변경" 도구는 쓰지 않는다).
- GA4: CLI Manager 웹 스트림 URL 을 새 주소로.
- CLImanger: `constants/links.ts` 의 `WEBSITE_URL` 을 새 주소로 바꿔 다음 릴리즈에. `docs/operations/CLAUDE.md` 검증 명령·README 수정.
- 관찰 기간 동안 Portfolio 의 301 은 **지우지 않는다** — 구버전 앱과 외부 링크가 계속 쓴다.

## 검증 명령

```bash
P=https://<portfolio>.vercel.app      # 1단계: 도메인 이동 전. 3단계 후에는 P=https://www.solhun.com
for p in /changelog "/docs?x=1" /gallery /roadmap /feedback /compare/cli-agents /admin/changelog /products; do
  curl -s -o /dev/null -w "$p %{http_code} %{redirect_url}\n" "$P$p"; done                 # 301 → climanager.solhun.com 같은 경로
curl -s -o /dev/null -w "api %{http_code} %{redirect_url}\n" "$P/api/changelogs"         # 308
for p in /privacy /terms /apps/fair-social-ops; do
  curl -s -o /dev/null -w "$p %{http_code} %{url_effective}\n" "$P$p"; done                # 200, 주소 유지
curl -s "$P/privacy" | grep -oE 'https://climanager\.solhun\.com/_next/static/[^"]+\.css' | head -1   # 선행 변경 A 확인
curl -s -o /dev/null -w "logo %{http_code}\n" "$P/solhun-logo.png"                        # 200 (fallback 프록시)
curl -s -o /dev/null -w "root %{http_code}\n" "$P/"                                        # 200, 포트폴리오 홈

# 2단계 후: 새 주소가 정식 주소인가
curl -s https://climanager.solhun.com | grep -o 'rel="canonical" href="[^"]*"'            # https://climanager.solhun.com
curl -s https://climanager.solhun.com/sitemap.xml | grep -o "<loc>[^<]*</loc>" | head -2
A=$(curl -s https://climanager.solhun.com | grep -oE 'climanager\.solhun\.com/_next/static/chunks/app/layout-[a-z0-9]+\.js' | head -1)
curl -s "https://$A" | grep -c climanager.solhun.com                                       # 1 이상 (GA 허용 호스트)

# 3단계 후: 옛 도메인이 Portfolio 로 갔나
curl -sI https://www.solhun.com | grep -i x-vercel-id
curl -s https://www.solhun.com | grep -o "<title>[^<]*</title>"                           # 포트폴리오 제목
```

이 저장소 쪽 규칙은 위 「선행 코드 변경 › 검증」 표에서 로컬 빌드 3벌로 확인했다(2026-09-30).

## 롤백

| 시점 | 조치 |
|---|---|
| 1단계 중 | Portfolio 배포만 되돌린다. solhun.com 영향 없음 |
| 2단계 후 문제 | solhun-web-page 를 직전 배포로 `vercel rollback`(또는 대시보드 Instant Rollback), `NEXT_PUBLIC_SITE_URL`·`REDIRECT_LEGACY_HOSTS` 삭제 |
| 3단계 후 문제 | `solhun.com`·`www.solhun.com` 을 Portfolio 에서 떼고 solhun-web-page 에 다시 붙인다(3단계 명령의 반대). 이어서 위 2단계 롤백으로 **이전 전 배포**까지 되돌리면 완전한 원상태(canonical www.solhun.com) |

- 301 은 브라우저가 영구 캐시한다. Portfolio 의 301 대상(CLI Manager 경로)은 롤백해도 새 주소가 살아 있는 한 무해하다.
  위험한 건 `/` 같은 **Portfolio 가 가질 경로**에 301 이 찍히는 경우인데, 선행 변경 B 로 과도기 규칙에서 뺐다.
- `climanager.solhun.com` 연결은 어느 롤백에서도 남겨 둬도 된다.

## solhun.com 을 참조하는 곳 전수

### 이 저장소(solhun-web-page)

| 위치 | 용도 | 조치 |
|---|---|---|
| `app/layout.tsx` `metadataBase` | 모든 canonical·OG URL 의 기준 | `SITE_URL` ✅ |
| `app/sitemap.ts`, `app/robots.ts` | sitemap `<loc>`, robots sitemap 주소 | `SITE_URL` ✅ |
| `components/google-analytics.tsx` `PROD_HOSTS` | GA 수집 허용 호스트 | `lib/site.ts` 로 이동, 옛·새 주소 모두 ✅ |
| `public/llms.txt`(삭제) → `app/llms.txt/route.ts` | 링크 10개가 `https://solhun.com` 고정이었음 | `SITE_URL` ✅ |
| 각 페이지 `alternates.canonical`, OG 이미지 | 전부 상대경로 | 조치 불필요 |
| `app/privacy`·`app/terms`·`app/apps/fair-social-ops` 본문·title 의 "solhun.com" | 운영 주체 표기(링크 아님) | 그대로 둠 — 법적 문서 문구라 사람이 정한다 |
| `NEXT_PUBLIC_APP_URL`, `LEMONSQUEEZY_*`, Stack Auth env | 코드 사용처 **0** | 정리 대상(선택). 결제·OAuth 콜백 코드 없음 |

### CLImanger 저장소(앱)

| 위치 | 용도 | 조치 |
|---|---|---|
| `Settings.tsx` "view changelog" | 앱 → 사이트 changelog | `constants/links.ts` `CHANGELOG_URL` 로 분리 ✅ (브랜치 `feat/site-url-constant-260929`, 값은 아직 `www.solhun.com`) |
| electron-updater / DMG | GitHub Releases / R2 | 영향 없음 |
| `docs/operations/CLAUDE.md` 검증 `curl https://www.solhun.com` | 릴리즈 후 다운로드 링크 확인 | 3단계 후 **반드시** 수정 — 그대로 두면 포트폴리오를 grep 해서 "배포 실패"처럼 보인다 |
| `README.md` Website 링크 | 저장소 소개 | 수정 |

### 외부 시스템

| 시스템 | 확인할 것 | 상태 |
|---|---|---|
| Google Cloud OAuth 동의 화면(FAIR Social Ops) | 홈페이지·개인정보처리방침·약관 URL, 승인된 도메인 | 미확인 — 그래서 세 경로를 프록시로 유지 |
| Search Console / GA4 | 새 속성·새 sitemap / 스트림 URL | 미확인 |
| LemonSqueezy | 스토어·웹훅·체크아웃 리디렉트 URL | **확인 불가** — `.env.local` API 키 만료(401) |
| solhun.com 도메인 갱신 | 2026-12-01 만료 | Portfolio·CLI Manager 둘 다 이 도메인에 걸려 있다 |

## 남은 사람 결정

1. ~~solhun.com 을 무엇으로 남길지~~ → **Portfolio 가 가져간다(2026-09-30 확정).**
2. OAuth 동의 화면 URL 을 새 주소로 옮길 시점(옮기면 프록시 세 경로를 301 로 전환).
3. 2·3단계 실행 날짜, 그리고 Portfolio 프로젝트가 다른 Vercel 계정이면 도메인 연결 방식(TXT 확인 vs `domains move`).
4. solhun.com 기본 호스트를 apex 와 www 중 어디로 둘지(현재 apex → www 307).
5. LemonSqueezy 새 API 키 발급 후 설정 확인, 도메인 자동 갱신 확인.

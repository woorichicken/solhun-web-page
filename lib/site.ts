// 사이트의 정식(canonical) 주소를 한 곳에서 정한다.
// solhun.com → climanager.solhun.com 이전 때 코드를 고치지 않고 Vercel 환경변수
// NEXT_PUBLIC_SITE_URL 만 바꾸면 metadataBase·canonical·sitemap·robots·llms.txt 가 함께 바뀐다.
// (이전 절차: docs/domain-migration-climanager.md)

// 기본값은 지금 서비스 중인 주소. apex(solhun.com)는 www 로 리디렉트되므로 www 를 쓴다.
const DEFAULT_SITE_URL = "https://www.solhun.com"

// NEXT_PUBLIC_* 는 빌드 시점에 문자열로 박힌다 → 값을 바꾸면 반드시 재배포해야 반영된다.
// 끝 슬래시를 떼서 `${SITE_URL}/path` 조합이 `//path` 가 되지 않게 한다.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "")

export const SITE_HOST = new URL(SITE_URL).hostname

// GA 는 "실제 프로덕션 도메인"에서만 추적한다(localhost·vercel.app 프리뷰 제외).
// 이전 기간에는 두 도메인이 동시에 살아 있으므로 옛 주소와 새 주소를 모두 넣어 둔다.
export const PROD_HOSTS = Array.from(
  new Set([SITE_HOST, "www.solhun.com", "solhun.com", "climanager.solhun.com"]),
)

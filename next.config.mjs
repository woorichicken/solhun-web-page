// 도메인 이전(solhun.com → climanager.solhun.com) 과도기용 리디렉트.
// solhun.com·www 는 최종적으로 Portfolio 프로젝트로 넘어가고, 그 뒤 옛 경로 처리는 Portfolio 가 맡는다.
// 여기 규칙은 "이 프로젝트에 새 주소 env 로 배포 ~ 도메인을 Portfolio 로 옮기기" 사이에만 동작한다.
// 기본은 꺼져 있다. REDIRECT_LEGACY_HOSTS=1 + NEXT_PUBLIC_SITE_URL=https://climanager.solhun.com 으로 켠다.
// (절차·롤백: docs/domain-migration-climanager.md)
const LEGACY_HOSTS = ["solhun.com", "www.solhun.com"]

// CLI Manager 전용 경로만 보낸다. Portfolio 스니펫(문서)의 MOVED_TO_CLI_MANAGER 와 같은 목록이어야 한다.
// "/"·robots·sitemap·llms 는 곧 Portfolio 것이 되므로 절대 넣지 않는다 — 301 은 브라우저가 영구 캐시해서,
// 과도기에 "/" 를 보내 버리면 도메인이 넘어간 뒤에도 그 방문자에게는 포트폴리오 홈이 안 보인다.
// privacy·terms·apps/fair-social-ops 는 OAuth 동의 화면 URL 이라 옮기지 않는다(Portfolio 가 프록시로 유지).
const LEGACY_MOVED_PATHS = [
  "/changelog",
  "/docs",
  "/gallery",
  "/roadmap",
  "/feedback",
  "/compare/:path*",
  "/admin/:path*",
  "/products/:path*",
]

function buildLegacyHostRedirects() {
  if (process.env.REDIRECT_LEGACY_HOSTS !== "1") return []

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "")
  if (!siteUrl) {
    throw new Error("REDIRECT_LEGACY_HOSTS=1 requires NEXT_PUBLIC_SITE_URL (e.g. https://climanager.solhun.com)")
  }
  // 새 주소가 옛 도메인 중 하나면 자기 자신으로 리디렉트하는 무한 루프가 된다 → 빌드에서 막는다.
  if (LEGACY_HOSTS.includes(new URL(siteUrl).hostname)) {
    throw new Error(`NEXT_PUBLIC_SITE_URL (${siteUrl}) must not be a legacy host while REDIRECT_LEGACY_HOSTS=1`)
  }

  return LEGACY_HOSTS.flatMap((host) => {
    const has = [{ type: "host", value: host }]
    return [
      ...LEGACY_MOVED_PATHS.map((source) => ({ source, has, destination: `${siteUrl}${source}`, statusCode: 301 })),
      // API 는 308: 301 이면 POST 가 GET 으로 바뀐다
      { source: "/api/:path*", has, destination: `${siteUrl}/api/:path*`, statusCode: 308 },
    ]
  })
}

// Portfolio 가 /privacy 같은 페이지를 rewrite 프록시로 보여 줄 때, 그 HTML 이 부르는 /_next/static 은
// 브라우저가 solhun.com(=Portfolio)에 요청해서 못 찾는다 → 스타일 없는 화면.
// ASSET_PREFIX 에 이 사이트의 절대주소를 주면 JS·CSS·폰트를 그 주소에서 직접 받는다.
// 기본(미설정)은 지금과 같은 상대경로. Production 에만 설정한다 — Preview 에 넣으면 프리뷰가 프로덕션 에셋을 부른다.
function resolveAssetPrefix() {
  const assetPrefix = (process.env.ASSET_PREFIX || "").replace(/\/+$/, "")
  if (!assetPrefix) return undefined
  if (!/^https?:\/\//.test(assetPrefix)) {
    throw new Error(`ASSET_PREFIX must be an absolute URL (got ${assetPrefix})`)
  }
  return assetPrefix
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  assetPrefix: resolveAssetPrefix(),
  async redirects() {
    return buildLegacyHostRedirects()
  },
}

export default nextConfig

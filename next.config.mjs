// 도메인 이전(solhun.com → climanager.solhun.com)용 301 리디렉트.
// 기본은 꺼져 있다. 이전 당일 Vercel 환경변수 REDIRECT_LEGACY_HOSTS=1 과
// NEXT_PUBLIC_SITE_URL=https://climanager.solhun.com 을 넣고 재배포하면 켜진다.
// (절차·롤백: docs/domain-migration-climanager.md)
const LEGACY_HOSTS = ["solhun.com", "www.solhun.com"]

// 옛 도메인에 그대로 남길 경로.
// - privacy / terms / apps/fair-social-ops: Google OAuth 동의 화면에 등록된 URL 일 수 있어
//   Google Cloud 콘솔을 바꾸기 전까지는 옮기지 않는다(사람 결정 항목).
// - api / _next: POST 는 301 을 받으면 GET 으로 바뀌어 깨지고, 남긴 페이지가 자기 JS/CSS 를 읽어야 한다.
const LEGACY_HOST_KEEP_PATHS = ["privacy", "terms", "apps/fair-social-ops", "api", "_next"]

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

  // 남길 경로와 그 하위만 제외하고 나머지 경로는 그대로 붙여서 보낸다.
  const keepPattern = LEGACY_HOST_KEEP_PATHS.map((path) => `${path}(?:/|$)`).join("|")
  return LEGACY_HOSTS.map((host) => ({
    source: `/:path((?!${keepPattern}).*)`,
    has: [{ type: "host", value: host }],
    destination: `${siteUrl}/:path`,
    statusCode: 301,
  }))
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
  async redirects() {
    return buildLegacyHostRedirects()
  },
}

export default nextConfig

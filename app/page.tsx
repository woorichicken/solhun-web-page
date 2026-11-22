import LandingPage from "./landing-page"
import { getRecentReleases } from "../lib/recent-releases"

// 다운로드 URL — 릴리즈 스크립트(CLImanger/scripts/post-release.cjs 의 SITE_LINK_FILES)가 **이 파일**의
// `cli-manager-<버전>-` 문자열을 바꿔 쓴다. 화면 코드(landing-page.tsx)로 옮기면 그 스크립트가 깨진다.
const DOWNLOAD_URLS = {
  arm64: "https://pub-dc249db286af4c1991fedf690157891d.r2.dev/cli-manager-1.36.0-arm64.dmg",
  x64: "https://pub-dc249db286af4c1991fedf690157891d.r2.dev/cli-manager-1.36.0-x64.dmg",
}

// 홈은 정적으로 두고 한 시간마다 다시 만든다 — 새 릴리즈가 changelog DB 에 들어가면 늦어도 한 시간 뒤
// 「Recently shipped」에 보인다. 화면 자체는 클라이언트 컴포넌트라 DB 는 여기(서버)에서 읽어 넘긴다.
export const revalidate = 3600

export default async function HomePage() {
  const recentReleases = await getRecentReleases()
  return <LandingPage downloadUrls={DOWNLOAD_URLS} recentReleases={recentReleases} />
}

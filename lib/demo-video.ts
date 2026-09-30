// 홈 히어로의 제품 데모 영상 — 영상을 바꿀 때는 이 파일만 고친다.
//
// 지금 값: brand 저장소의 「AI Control API·오케스트레이터」 데모 r1
//   (brand-kit/videos/climanager-ai-orchestrator/exports/web/ — 사이트용 1280 본편·포스터·루프 3개)
// 새 판이 나오면 그 폴더 README 의 「사이트에서 쓸 파일」 표를 보고 public/videos/ 에 복사한 뒤 아래 값을 바꾼다.
// poster 는 영상의 한 프레임을 webp 로 뽑은 것(ffmpeg -ss <초> -frames:v 1) — 영상과 같이 바꾼다.

export interface DemoVideo {
  src: string
  poster: string
  width: number
  height: number
  /** 스크린리더·검색엔진용 설명 */
  alt: string
  /** 영상 아래 한 줄 설명 */
  caption: string
}

export const HERO_DEMO_VIDEO: DemoVideo = {
  src: "/videos/climanager-ai-orchestrator-1280.mp4",
  poster: "/videos/climanager-ai-orchestrator-poster.webp",
  width: 1280,
  height: 720,
  alt: "CLI Manager v1.10 demo: a Claude Code orchestrator uses the AI Control API and the climanager-session skill to open one Claude session per repository, the new sessions appear in green in the sidebar, work in parallel and report back in a table, then one is taken back with Disconnect AI",
  caption: "CLI Manager v1.10 — let an AI open and drive sessions you can watch, through the new AI Control API.",
}

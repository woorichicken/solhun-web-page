// 홈 히어로의 제품 데모 영상 — 영상을 바꿀 때는 이 파일만 고친다.
//
// 지금 값은 임시다: brand 저장소의 v1.10.0 데모 r2
//   (brand-kit/videos/climanager-demo/exports/climanager-demo-16x9-r2.mp4)
// 「AI Control API·오케스트레이터」 데모가 완성되면 그 폴더 README(brand-kit/videos/README.md)에
// 적힌 새 파일을 public/videos/ 에 복사하고 아래 src·poster·caption 을 바꾼다.
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
  src: "/videos/climanager-demo-16x9-r2.mp4",
  poster: "/videos/climanager-demo-16x9-r2-poster.webp",
  width: 1920,
  height: 1080,
  alt: "CLI Manager v1.10 demo: switching between agent sessions with shortcuts, reviewing uncommitted changes, reordering sidebar folders and opening a Claude Code session from a template",
  caption: "CLI Manager v1.10 — sessions, shortcuts, diff review and folder ordering in one window.",
}

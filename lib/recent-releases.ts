// 홈의 "Recently shipped" 섹션과 /llms.txt 가 같이 쓰는 최근 릴리즈 요약.
// 전체 기록은 /changelog(DB changelogs 테이블)가 정본이고, 여기는 사이트 방문자에게 보여줄
// 굵직한 변화만 영어로 추린 것이다. 새 마이너 버전이 나오면 맨 앞에 한 줄 추가한다.

export interface ReleaseHighlight {
  version: string
  date: string
  title: string
  summary: string
}

// 기준: CLImanger 저장소 태그 v1.6.0 ~ v1.10.0 + changelogs 테이블(id 25~30), 2026-09-29 확인
export const RECENT_RELEASES: ReleaseHighlight[] = [
  {
    version: "v1.10.0",
    date: "Sep 29, 2026",
    title: "Sidebar folder ordering & steadier AI sessions",
    summary:
      "Drag sidebar folders into any order (kept across restarts). The AI Control API can now read session memos, and prompts no longer get lost under heavy load or right after Esc.",
  },
  {
    version: "v1.9.1",
    date: "Sep 25, 2026",
    title: "Session resume & focus fixes",
    summary:
      "Sessions launched from shell aliases or templates resume the same conversation after a restart, and the AI no longer steals your keyboard focus when it shows a session.",
  },
  {
    version: "v1.9.0",
    date: "Sep 23, 2026",
    title: "AI Control API",
    summary:
      "Let an AI open terminal sessions inside CLI Manager, run templates, send prompts and read results — in ordinary terminals you can watch and take over. Off by default, localhost-only, token required.",
  },
  {
    version: "v1.8.0",
    date: "Sep 12, 2026",
    title: "Worktree toggle & link fixes",
    summary:
      "Hide worktrees entirely from Settings, turn terminal file links off, and open file paths only on ⌘-click. Reloading worktrees no longer wipes terminal scrollback.",
  },
  {
    version: "v1.7.0",
    date: "Aug 17, 2026",
    title: "Official agent hooks",
    summary:
      "Session status comes from Claude Code and Codex hook events instead of guessing from terminal output — plus usage-limit meters and an in-app diff review that sends line comments back to the agent.",
  },
  {
    version: "v1.6.0",
    date: "Jun 23, 2026",
    title: "Loop Dashboard",
    summary:
      "A dedicated window to watch Claude Code /loop sessions per project: iteration count, status and timing at a glance.",
  },
]

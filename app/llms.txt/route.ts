import { SITE_URL } from "@/lib/site"
import { RECENT_RELEASES } from "@/lib/recent-releases"

// 예전엔 public/llms.txt 정적 파일이었는데 링크가 https://solhun.com 으로 박혀 있었다.
// 도메인 이전 시 같이 바뀌도록 SITE_URL 로 만들어 내보낸다(빌드 시 정적 생성).
export const dynamic = "force-static"

export function GET() {
  const recent = RECENT_RELEASES.map(
    (release) => `- ${release.version} — ${release.title}: ${release.summary}`,
  ).join("\n")

  const body = `# CLI Manager (Solhun)

> Manage Claude Code, Codex CLI, and Gemini CLI from a single macOS desktop dashboard.

A desktop application for macOS that centralizes management of multiple CLI agents. Switch between Claude Code, Codex CLI, and Gemini CLI, organize projects in one workspace, rename agents to define their roles, and instantly switch between VS Code, Cursor, and other editors. All data is processed locally with Apple notarization for security.

## Core Features

- [Agent Management](${SITE_URL}): Manage Claude Code, Codex CLI, and Gemini CLI in a unified dashboard
- [Project Organization](${SITE_URL}): Organize all projects in one centralized workspace
- [Agent Customization](${SITE_URL}): Rename CLI agents to define their specific roles and purposes
- [Editor Switching](${SITE_URL}): Switch instantly between VS Code, Cursor, and other code editors
- [AI Control API](${SITE_URL}/docs/ai-control-api): Let an AI open and drive terminal sessions you can watch and take over (MCP and REST, local-only, token-protected)
- [Agent Hooks & Usage Limits](${SITE_URL}/changelog): Session status from official Claude Code / Codex hooks, with usage-limit meters
- [Diff Review](${SITE_URL}/gallery): Review agent changes in-app and send line comments back to the agent
- [Git Worktrees](${SITE_URL}/gallery): Each worktree becomes its own workspace with its own sessions
- [Session Memo](${SITE_URL}/gallery): A memo pad per session (Cmd+J)

## Recent Releases

${recent}

## Documentation

- [Getting Started](${SITE_URL}/docs): Installation guide and initial setup instructions
- [AI Control API guide](${SITE_URL}/docs/ai-control-api): Setup, MCP tools, REST endpoints, session states and safety rules

## Resources

- [Gallery](${SITE_URL}/gallery): Screenshots and visual demonstrations of the application
- [Changelog](${SITE_URL}/changelog): Version history and feature updates
- [Roadmap](${SITE_URL}/roadmap): What is planned next
- [FAQ](${SITE_URL}/#faq): Frequently asked questions about CLI agent management

## Technical Details

- Platform: macOS Desktop Application
- Supported CLI Tools: Claude Code, Gemini CLI, Codex CLI, and custom CLI tools
- Data Privacy: All data processed locally, no external data transmission
- Security: Apple notarized application
- Price: Free and open source (MIT license)

## Optional

- Windows Support: Coming soon
- Linux Support: Not yet on roadmap
`

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}

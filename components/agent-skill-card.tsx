"use client"

import { useState } from "react"

// 공유용 에이전트 스킬 — 설치 명령은 저장소 README 의 것을 그대로 쓴다(README 가 바뀌면 같이 바꾼다).
const SKILL_REPO_URL = "https://github.com/woorichicken/climanager-session"
const SKILL_INSTALL_COMMAND = "npx skills add woorichicken/climanager-session@climanager-session"
// 「복사됨」 표시를 되돌리기까지의 시간
const COPIED_RESET_MS = 1500

/**
 * 홈 히어로 영상 바로 아래에 두는 스킬 카드.
 * 영상이 보여 주는 「AI 가 세션을 여는」 장면을 직접 해 보려면 이 스킬이 필요해서, 영상 다음 자리에 둔다.
 */
export function AgentSkillCard() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SKILL_INSTALL_COMMAND)
      setCopied(true)
      setTimeout(() => setCopied(false), COPIED_RESET_MS)
    } catch {
      // 클립보드 권한이 없으면(비보안 컨텍스트 등) 명령이 화면에 그대로 있으니 직접 선택해 복사하면 된다
    }
  }

  return (
    <section
      aria-labelledby="agent-skill-heading"
      className="relative z-10 w-full max-w-3xl mx-auto px-4 mb-12 sm:mb-16"
    >
      <div className="bg-white rounded-2xl border border-[rgba(55,50,47,0.12)] shadow-[0px_2px_4px_rgba(50,45,43,0.06)] p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs font-medium font-sans text-[#605A57]">
            <span className="shrink-0 whitespace-nowrap px-2 py-0.5 rounded-full bg-[#F5F5F4] text-[#37322F]">Agent skill</span>
            <span>Works with Claude Code, Codex and other agents</span>
          </div>
          <h2 id="agent-skill-heading" className="text-[#37322F] text-xl sm:text-2xl font-semibold font-sans tracking-tight">
            Try the demo yourself: climanager-session
          </h2>
          <p className="text-[#605A57] text-sm sm:text-base leading-6 font-sans">
            Install the skill and your coding agent can open visible sessions in CLI Manager, run another agent
            there, wait for it and read the screen — while you watch and take over at any time.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#37322F] rounded-xl pl-4 pr-2 py-2">
          {/* w-0: 한 줄 명령의 길이가 부모 폭 계산에 끼지 않게 한다 — 안 그러면 히어로 열 전체가 명령 길이만큼 넓어져 모바일에서 잘린다 */}
          <code className="flex-1 w-0 min-w-0 overflow-x-auto whitespace-nowrap text-[13px] text-[#F7F5F3] font-mono">
            <span className="select-none text-[rgba(247,245,243,0.5)]">$ </span>
            {SKILL_INSTALL_COMMAND}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium font-sans text-[#37322F] bg-[#F7F5F3] hover:bg-white transition-colors"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm font-sans text-[#605A57]">
          <span>Needs CLI Manager v1.10+ with Settings › Agents › AI Control API on.</span>
          <a
            href={SKILL_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#37322F] font-medium underline hover:text-[#605A57] transition-colors"
          >
            Setup guide on GitHub →
          </a>
        </div>
      </div>
    </section>
  )
}

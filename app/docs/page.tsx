"use client"

import Link from "next/link"
import { PageWrapper } from "../../components/page-wrapper"
import DocumentationSection from "../../components/documentation-section"

// 개별 가이드 페이지 목록. 새 가이드를 만들면 여기와 app/sitemap.ts 에 같이 추가한다.
const GUIDES = [
  {
    href: "/docs/ai-control-api",
    title: "AI Control API",
    description:
      "Let Claude Code, Codex or a script open sessions, send prompts and read the screen — in terminals you can watch. Setup, MCP, REST and safety rules.",
    badge: "New in v1.9",
  },
]

export default function DocsPage() {
  return (
    <PageWrapper>
      {/* Documentation Section */}
      <DocumentationSection />

      {/* Guides */}
      <section
        aria-labelledby="guides-heading"
        className="w-full border-b border-[rgba(55,50,47,0.12)] px-4 sm:px-6 md:px-12 py-12 flex flex-col items-center gap-6"
      >
        <h2 id="guides-heading" className="text-[#49423D] text-2xl sm:text-3xl font-semibold font-sans tracking-tight">
          Guides
        </h2>
        <ul className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
          {GUIDES.map((guide) => (
            <li key={guide.href}>
              <Link
                href={guide.href}
                className="h-full bg-white rounded-lg border border-[rgba(55,50,47,0.12)] p-5 flex flex-col gap-2 hover:border-[rgba(55,50,47,0.3)] transition-colors"
              >
                <span className="w-fit px-2 py-0.5 rounded-full bg-[#F5F5F4] text-[#37322F] text-xs font-medium font-sans">
                  {guide.badge}
                </span>
                <span className="text-[#37322F] text-lg font-semibold font-sans">{guide.title} →</span>
                <span className="text-[#605A57] text-sm leading-6 font-sans">{guide.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </PageWrapper>
  )
}

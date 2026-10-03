"use client"

import { useState } from "react"
// import { EarlyAccessSticker } from "../components/early-access-sticker"
import { ContainerScroll } from "../components/ui/container-scroll-animation"
import CTASection from "../components/cta-section"
import { PageWrapper } from "../components/page-wrapper"
import { DemoVideoPlayer } from "../components/demo-video"
import { AgentSkillCard } from "../components/agent-skill-card"
import Link from "next/link"
import Image from "next/image"
import Script from "next/script"
import { ProductHuntSticker } from "../components/product-hunt-sticker"
import FAQSection, { faqData } from "../components/faq-section"
import TestimonialsSection from "../components/testimonials-section"
import { RECENT_RELEASES } from "../lib/recent-releases"
import { HERO_DEMO_VIDEO } from "../lib/demo-video"
import { ImageGallery } from "../components/image-gallery"
import { Maximize2 } from "lucide-react"

// 다운로드 URL
const DOWNLOAD_URLS = {
  arm64: "https://pub-dc249db286af4c1991fedf690157891d.r2.dev/cli-manager-1.12.1-arm64.dmg",
  x64: "https://pub-dc249db286af4c1991fedf690157891d.r2.dev/cli-manager-1.12.1-x64.dmg",
}

// 드롭다운에 보여 줄 버전 — URL 에서 뽑는다. 릴리즈 스크립트(CLImanger/scripts/post-release.cjs)는
// URL 의 `cli-manager-<버전>-` 문자열만 바꾸므로, 버전을 따로 적어 두면 그 갱신에서 빠진다.
const DOWNLOAD_VERSION = /cli-manager-(\d+\.\d+\.\d+)-/.exec(DOWNLOAD_URLS.arm64)?.[1] ?? ""

// 홈 기능 섹션. 스크린샷은 데모 인스턴스(가짜 프로젝트·별도 프로필)에서 v1.10.0 으로 찍었다 — 개인 경로·계정이 없다.
// 새로 찍을 때도 같은 방식으로(사용자 앱에서 찍지 않는다).
interface HomeFeature {
  title: string
  description: string
  image: string
  alt: string
  link?: { href: string; label: string }
  /** 제목 위 작은 배지 — 아직 다듬는 중인 기능 표시(예: "Beta") */
  badge?: string
}

const FEATURES: HomeFeature[] = [
  {
    title: "All CLI Agents, One Dashboard",
    description:
      "Claude Code, Codex CLI, Gemini CLI and plain shells live side by side in one sidebar. Group projects into folders, name each session by its role, and switch with a shortcut — every session keeps running while you look elsewhere.",
    image: "/screenshots/app-dashboard.webp",
    alt: "CLI Manager sidebar with folders, workspaces and sessions, and a running dev server",
    link: { href: "/docs", label: "Learn more →" },
  },
  {
    title: "Let an AI Drive a Terminal You Can Watch",
    description:
      "With the AI Control API, Claude Code, Codex or a script can open sessions in CLI Manager, send prompts and read the screen. They are ordinary terminals — green in the sidebar, marked “AI connected” — and you can type into them or take them back at any time.",
    image: "/screenshots/ai-control-session.webp",
    alt: "A session opened through the AI Control API, shown in green with an AI connected badge",
    link: { href: "/docs/ai-control-api", label: "Read the AI Control API guide →" },
  },
  {
    title: "Review Agent Changes In-App",
    description:
      "Open the diff for any workspace, select lines, and send a comment — with file and line numbers — straight back to the agent's terminal. Worktrees compare against the branch they forked from, including new files.",
    image: "/screenshots/diff-review.webp",
    alt: "Diff review window with added and removed lines and a comment box that sends to a terminal",
  },
  {
    title: "Know When an Agent Needs You",
    description:
      "Session status comes from official Claude Code and Codex hooks, so a permission prompt is never mistaken for a finished task. Usage alerts warn you before the 5-hour or weekly limit cuts your agent off.",
    image: "/screenshots/settings-agents-lower.webp",
    alt: "Agents settings with official hook integration and usage alert thresholds for Claude Code and Codex",
    link: { href: "/changelog", label: "See what's new →" },
    badge: "Beta",
  },
  {
    title: "Worktrees and Git, Built In",
    description:
      "Create a Git worktree and it becomes its own workspace with its own sessions. Stage, commit, push and browse history from the Source Control panel — no commands to remember.",
    image: "/screenshots/git-panel.webp",
    alt: "Source Control panel next to a git log, with a worktree branch in the sidebar",
    link: { href: "/gallery", label: "See the gallery →" },
  },
  {
    title: "A Memo Pad for Every Session",
    description:
      "Press ⌘J to write down what a session is for. Memos save as you type, stay with the session across restarts, and an AI working through the Control API can read them.",
    image: "/screenshots/session-memo.webp",
    alt: "Session memo pad open over a terminal",
  },
]

// JSON-LD structured data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "CLI Manager",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "macOS",
  description: "The ultimate macOS desktop CLI agent management tool. Organize Claude Code, Codex CLI, and Gemini CLI from a single dashboard.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  featureList: [
    "Manage Claude Code, Codex CLI, Gemini CLI in one dashboard",
    "Rename CLI agents to define their roles",
    "Switch between VS Code, Cursor, and other editors instantly",
    "Organize all projects in one workspace",
    "AI Control API: let an AI drive terminal sessions you can watch and take over",
    "Session status from official Claude Code and Codex hooks, with usage-limit meters",
    "Loop Dashboard for Claude Code /loop sessions",
    "In-app diff review that sends line comments back to the agent",
    "Git worktrees as independent workspaces",
    "Per-session memo pad",
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "150",
  },
}

// FAQPage JSON-LD structured data for AI optimization
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqData.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
}

// Reusable Badge Component
function Badge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="px-[14px] py-[6px] bg-white shadow-[0px_0px_0px_4px_rgba(55,50,47,0.05)] overflow-hidden rounded-[90px] flex justify-start items-center gap-[8px] border border-[rgba(2,6,23,0.08)] shadow-xs">
      <div className="w-[14px] h-[14px] relative overflow-hidden flex items-center justify-center">{icon}</div>
      <div className="text-center flex justify-center flex-col text-[#37322F] text-xs font-medium leading-3 font-sans">
        {text}
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [isDownloadOpen, setIsDownloadOpen] = useState(false)
  // 기능 스크린샷 확대 보기 — 썸네일은 화면 60% 폭이라 앱 글씨가 안 읽힌다
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)

  return (
    <PageWrapper>
      {/* JSON-LD Structured Data */}
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* FAQPage JSON-LD for AI/LLM Discovery */}
      <Script
        id="faq-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero Section */}
      <div className="pt-0 sm:pt-0 md:pt-0 lg:pt-[96px] pb-8 sm:pb-12 md:pb-16 flex flex-col justify-start items-center px-2 sm:px-4 md:px-8 lg:px-0 w-full sm:pl-0 sm:pr-0 pl-0 pr-0">
        <div className="w-full max-w-[937px] lg:w-[937px] flex flex-col justify-center items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          <div className="self-stretch rounded-[3px] flex flex-col justify-center items-center gap-4 sm:gap-5 md:gap-6 lg:gap-8">
            <div className="flex items-center gap-2">
              <Badge
                icon={
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.0573 9.47167C11.0667 8.01948 12.2882 7.14917 12.3551 7.10854C11.6669 6.10323 10.5973 5.9526 10.2223 5.93885C9.30949 5.8451 8.42386 6.47417 7.95761 6.47417C7.49136 6.47417 6.78605 5.95292 6.03355 5.96823C5.06699 5.98323 4.15542 6.52917 3.66605 7.37948C2.66261 9.12135 3.40792 11.7101 4.38261 13.1367C4.85699 13.8295 5.43167 14.5932 6.1823 14.5685C6.90386 14.5445 7.1798 14.1035 8.05199 14.1035C8.9223 14.1035 9.17605 14.5685 9.92761 14.5445C10.7029 14.52 11.2335 13.8545 11.701 13.1617C12.2348 12.381 12.457 11.621 12.4795 11.6095C12.4589 11.5995 11.036 11.056 11.0573 9.47167ZM8.83417 4.16292C9.25605 3.6523 9.54011 2.94167 9.46261 2.2351C8.76667 2.26417 7.92542 2.69885 7.42636 3.28448C6.9748 3.80573 6.66605 4.53854 6.7573 5.2323C7.51949 5.29135 8.35855 4.84667 8.83417 4.16292Z" fill="#37322F"/>
                  </svg>
                }
                text="macOS Desktop App"
              />
              <a
                href="https://github.com/woorichicken/CLI_manager"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(55,50,47,0.06)] border border-[rgba(55,50,47,0.1)] hover:bg-[rgba(55,50,47,0.1)] hover:border-[rgba(55,50,47,0.2)] transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-[#37322F] opacity-60">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span className="text-xs font-medium text-[rgba(55,50,47,0.65)] font-sans">Open Source</span>
              </a>
            </div>
            <h1 className="w-full max-w-[748.71px] lg:w-[748.71px] text-center flex justify-center flex-col text-[#37322F] text-[24px] xs:text-[28px] sm:text-[36px] md:text-[52px] lg:text-[80px] font-normal leading-[1.1] sm:leading-[1.15] md:leading-[1.2] lg:leading-24 font-serif px-2 sm:px-4 md:px-0 relative">
              Your CLI Agents,
              <br />
              All in One Place

              {/* Product Hunt Sticker */}
              <div className="absolute -right-10 -top-8 scale-[0.55] sm:scale-75 sm:-right-8 sm:-top-4 md:-right-16 md:top-4 md:scale-100 lg:-right-28 lg:top-8 z-50">
                <ProductHuntSticker />
              </div>
            </h1>

            <div className="w-full max-w-[506.08px] lg:w-[506.08px] text-center flex justify-center flex-col text-[rgba(55,50,47,0.80)] sm:text-lg md:text-xl leading-[1.4] sm:leading-[1.45] md:leading-[1.5] lg:leading-7 font-sans px-2 sm:px-4 md:px-0 lg:text-lg font-medium text-sm">
              Claude Code, Codex CLI, Gemini CLI — manage them all.
              <br className="hidden sm:block" />
              Organize projects, switch editors, and stay in control of your desktop agents.
            </div>
          </div>
        </div>



        <div className="w-full max-w-[497px] lg:w-[497px] flex flex-col justify-center items-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 relative z-10 mt-6 sm:mt-8 md:mt-10 lg:mt-12 mb-10 sm:mb-12 md:mb-16">
          <div className="backdrop-blur-[8.25px] flex justify-start items-center gap-4 relative">
            <button
              onClick={() => setIsDownloadOpen(!isDownloadOpen)}
              className="h-10 sm:h-11 md:h-12 px-6 sm:px-8 md:px-10 lg:px-12 py-2 sm:py-[6px] relative bg-[#37322F] shadow-[0px_0px_0px_2.5px_rgba(255,255,255,0.08)_inset] overflow-hidden rounded-full flex justify-center items-center gap-2 cursor-pointer hover:bg-[#4a4440] transition-colors"
            >
              <div className="w-20 sm:w-24 md:w-28 lg:w-44 h-[41px] absolute left-0 top-[-0.5px] bg-gradient-to-b from-[rgba(255,255,255,0)] to-[rgba(0,0,0,0.10)] mix-blend-multiply"></div>
              <span className="text-white text-sm sm:text-base md:text-[15px] font-medium leading-5 font-sans relative z-10">
                Download
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`text-white relative z-10 transition-transform duration-200 ${isDownloadOpen ? 'rotate-180' : ''}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {/* Download Dropdown Menu */}
            {isDownloadOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDownloadOpen(false)}
                />
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-[rgba(55,50,47,0.12)] overflow-hidden z-50 py-1">
                  {DOWNLOAD_VERSION && (
                    <div className="px-4 pt-2 pb-1 text-[11px] font-medium text-[rgba(55,50,47,0.55)] font-sans">
                      Latest · v{DOWNLOAD_VERSION}
                    </div>
                  )}
                  <a
                    href={DOWNLOAD_URLS.arm64}
                    download
                    onClick={(e) => {
                      e.stopPropagation()
                      setTimeout(() => setIsDownloadOpen(false), 100)
                    }}
                    className="block w-full text-left px-4 py-2.5 text-sm text-[#2F3037] hover:bg-[rgba(55,50,47,0.05)] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span>macOS (Apple Silicon)</span>
                      <span className="text-[10px] text-gray-400">ARM64</span>
                    </div>
                  </a>
                  <div className="h-[1px] bg-[rgba(55,50,47,0.08)] mx-2"></div>
                  <a
                    href={DOWNLOAD_URLS.x64}
                    download
                    onClick={(e) => {
                      e.stopPropagation()
                      setTimeout(() => setIsDownloadOpen(false), 100)
                    }}
                    className="block w-full text-left px-4 py-2.5 text-sm text-[#2F3037] hover:bg-[rgba(55,50,47,0.05)] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span>macOS (Intel)</span>
                      <span className="text-[10px] text-gray-400">x64</span>
                    </div>
                  </a>
                </div>
              </>
            )}

            {/* GitHub Button */}
            <a
              href="https://github.com/woorichicken/CLI_manager"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 sm:h-11 md:h-12 px-6 sm:px-8 md:px-10 lg:px-12 flex justify-center items-center gap-2 rounded-full border border-[rgba(55,50,47,0.2)] bg-white/70 text-[#37322F] hover:bg-[rgba(55,50,47,0.05)] transition-all duration-200"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span className="text-sm sm:text-base md:text-[15px] font-medium leading-5 font-sans">GitHub</span>
            </a>
          </div>
        </div>

        <div className="absolute top-[232px] sm:top-[248px] md:top-[264px] lg:top-[320px] left-1/2 transform -translate-x-1/2 z-0 pointer-events-none">
          <img
            src="/mask-group-pattern.svg"
            alt="Background pattern decoration"
            className="w-[936px] sm:w-[1404px] md:w-[2106px] lg:w-[2808px] h-auto opacity-30 sm:opacity-40 md:opacity-50 mix-blend-multiply"
            style={{
              filter: "hue-rotate(15deg) saturate(0.7) brightness(1.2)",
            }}
          />
        </div>

        {/* Container Scroll Section */}
        <div className="flex flex-col">
          <ContainerScroll
            titleComponent={
              <>
              </>
            }
          >
            <DemoVideoPlayer
              video={HERO_DEMO_VIDEO}
              className="mx-auto rounded-2xl object-contain h-auto w-full md:h-full bg-gradient-to-b from-[#1c2241] to-[#382851]"
            />
          </ContainerScroll>
          <p className="relative z-10 mt-2 md:mt-16 mb-8 px-4 text-center text-[#605A57] text-xs sm:text-sm font-sans">
            {HERO_DEMO_VIDEO.caption}
          </p>
          <AgentSkillCard />
        </div>

        {/* Social Proof Section */}
        <div className="w-full border-b border-[rgba(55,50,47,0.12)] flex flex-col justify-center items-center">
          <div className="self-stretch px-4 sm:px-6 md:px-24 py-8 sm:py-12 md:py-16 border-b border-[rgba(55,50,47,0.12)] flex justify-center items-center gap-6">
            <div className="w-full max-w-[586px] px-4 sm:px-6 py-4 sm:py-5 shadow-[0px_2px_4px_rgba(50,45,43,0.06)] overflow-hidden rounded-lg flex flex-col justify-start items-center gap-3 sm:gap-4 shadow-none">
              <Badge
                icon={
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="3" width="4" height="6" stroke="#37322F" strokeWidth="1" fill="none" />
                    <rect x="7" y="1" width="4" height="8" stroke="#37322F" strokeWidth="1" fill="none" />
                    <rect x="2" y="4" width="1" height="1" fill="#37322F" />
                    <rect x="3.5" y="4" width="1" height="1" fill="#37322F" />
                    <rect x="2" y="5.5" width="1" height="1" fill="#37322F" />
                    <rect x="3.5" y="5.5" width="1" height="1" fill="#37322F" />
                    <rect x="8" y="2" width="1" height="1" fill="#37322F" />
                    <rect x="9.5" y="2" width="1" height="1" fill="#37322F" />
                    <rect x="8" y="3.5" width="1" height="1" fill="#37322F" />
                    <rect x="9.5" y="3.5" width="1" height="1" fill="#37322F" />
                    <rect x="8" y="5" width="1" height="1" fill="#37322F" />
                    <rect x="9.5" y="5" width="1" height="1" fill="#37322F" />
                  </svg>
                }
                text="Key Features"
              />
              <h2 className="w-full max-w-[472.55px] text-center flex justify-center flex-col text-[#49423D] text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold leading-tight md:leading-[60px] font-sans tracking-tight">
                Built for developers who juggle multiple AI agents
              </h2>
              <div className="self-stretch text-center text-[#605A57] text-sm sm:text-base font-normal leading-6 sm:leading-7 font-sans">
                Stop switching between terminals and losing context.
                <br className="hidden sm:block" />
                CLI Manager keeps everything organized in one powerful workspace.
              </div>
            </div>
          </div>

          {/* Logo Grid */}
          {/* Feature Section - Dynamic Asymmetric Layout */}
          <div className="self-stretch flex flex-col justify-start items-center overflow-hidden">
            
            {FEATURES.map((feature, index) => (
              <div
                key={feature.title}
                className={`w-full px-4 sm:px-6 md:px-12 py-6 sm:py-8 md:py-10 flex flex-col ${
                  index % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"
                } justify-between items-center gap-4 md:gap-10`}
              >
                <div className="w-full md:w-[40%] flex flex-col justify-center items-start gap-2 md:gap-3 z-10">
                  {feature.badge && (
                    <span className="px-2.5 py-0.5 rounded-full border border-[rgba(55,50,47,0.15)] bg-[rgba(55,50,47,0.06)] text-[#37322F] text-xs font-medium font-sans uppercase tracking-wider">
                      {feature.badge}
                    </span>
                  )}
                  <div className="text-[#37322F] text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight font-serif tracking-tight">
                    {feature.title}
                  </div>
                  <div className="text-[#605A57] text-base sm:text-lg font-normal leading-7 font-sans">
                    {feature.description}
                  </div>
                  {feature.link && (
                    <Link
                      href={feature.link.href}
                      className="text-[#37322F] hover:text-[#605A57] transition-colors text-sm font-medium mt-2 underline"
                    >
                      {feature.link.label}
                    </Link>
                  )}
                </div>
                <div className="w-full md:w-[60%] relative">
                  <button
                    type="button"
                    onClick={() => setZoomedImage(feature.image)}
                    aria-label={`Enlarge screenshot: ${feature.title}`}
                    className="group block w-full aspect-[16/10] bg-[#141418] rounded-2xl overflow-hidden shadow-xl border border-[rgba(55,50,47,0.08)] relative cursor-zoom-in"
                  >
                    <Image
                      src={feature.image}
                      alt={feature.alt}
                      fill
                      sizes="(min-width: 768px) 60vw, 100vw"
                      className="object-cover object-left-top"
                    />
                    <span className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white font-sans backdrop-blur-sm opacity-80 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Enlarge
                    </span>
                  </button>
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* Recently Shipped — 최근 릴리즈 요약 (데이터: lib/recent-releases.ts) */}
        <section
          aria-labelledby="recently-shipped-heading"
          className="w-full border-b border-[rgba(55,50,47,0.12)] px-4 sm:px-6 md:px-12 py-12 sm:py-16 flex flex-col items-center gap-8"
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <h2
              id="recently-shipped-heading"
              className="text-[#49423D] text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight font-sans tracking-tight"
            >
              Recently shipped
            </h2>
            <p className="text-[#605A57] text-sm sm:text-base font-normal leading-6 font-sans">
              What changed in the last few releases. Every detail lives in the changelog.
            </p>
          </div>
          <ol className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
            {RECENT_RELEASES.map((release) => (
              <li
                key={release.version}
                className="bg-white rounded-lg border border-[rgba(55,50,47,0.12)] p-5 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2 text-xs font-medium font-sans text-[#605A57]">
                  <span className="px-2 py-0.5 rounded-full bg-[#F5F5F4] text-[#37322F]">{release.version}</span>
                  <span>{release.date}</span>
                </div>
                <h3 className="text-[#37322F] text-lg font-semibold font-sans leading-snug">{release.title}</h3>
                <p className="text-[#605A57] text-sm leading-6 font-sans">{release.summary}</p>
              </li>
            ))}
          </ol>
          <Link
            href="/changelog"
            className="text-[#37322F] hover:text-[#605A57] transition-colors text-sm font-medium underline"
          >
            Full changelog →
          </Link>
        </section>

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* FAQ Section */}
        <div id="faq">
          <FAQSection />
        </div>

        {/* CTA Section */}
        <CTASection />

        <ImageGallery
          images={zoomedImage ? [zoomedImage] : []}
          isOpen={zoomedImage !== null}
          onClose={() => setZoomedImage(null)}
        />

      </div>
    </PageWrapper>
  )
}

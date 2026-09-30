"use client"

import { useState } from "react"
import { PageWrapper } from "../../components/page-wrapper"
import { ProductList, Product } from "../../components/product-list"
import { ImageGallery } from "../../components/image-gallery"
import { Bot, FlaskConical, GitBranch, GitCompare, Github, Network, StickyNote, Terminal } from "lucide-react"

// 스틸 이미지는 데모 인스턴스(가짜 프로젝트)에서 찍은 v1.10.0 화면(public/screenshots)으로 바꿨다.
// 옛 전체 화면 캡처(worktree-*.png·main-*.png 등)는 개인 경로·실제 프로젝트명이 보여 뺐다.
// 영상(.mp4)은 아직 옛 녹화다 — 다시 찍을 때까지 첫 번째 자리에 둔다.
const products = [
  {
    id: "ai-control-api",
    title: "AI Control API",
    description: "Let Claude Code, Codex or a script open sessions, send prompts and read the screen — in terminals you can watch and take over.",
    image: "/screenshots/ai-control-session.webp",
    logo: <Bot className="h-5 w-5 text-emerald-600" />,
    badge: "New",
    galleryImages: [
      "/screenshots/ai-control-session.webp",
      "/screenshots/settings-ai-control-api.webp",
    ]
  },
  {
    id: "diff-review",
    title: "Diff Review & Agent Hooks",
    description: "Review agent changes in-app and send line comments back to its terminal. Official hooks tell you when an agent needs you.",
    image: "/screenshots/diff-review.webp",
    logo: <GitCompare className="h-5 w-5 text-rose-600" />,
    badge: "New",
    galleryImages: [
      "/screenshots/diff-review.webp",
      "/screenshots/settings-agents-lower.webp",
    ]
  },
  {
    id: "1",
    title: "Worktree Manager",
    description: "Effortlessly manage Git worktrees for parallel AI agent workflows. Each worktree becomes its own workspace with its own sessions.",
    image: "/screenshots/worktree-sidebar.webp",
    logo: <GitBranch className="h-5 w-5 text-purple-600" />,
    badge: "Popular",
    galleryImages: [
      "/videos/makeworktree.mp4", // 비디오가 첫 번째
      "/screenshots/worktree-sidebar.webp",
      "/screenshots/git-panel.webp",
    ]
  },
  {
    id: "2",
    title: "Git & GitHub Integration",
    description: "Stage, commit, push and browse history from the Source Control panel. Spot agent mistakes and roll back with confidence.",
    image: "/screenshots/git-panel.webp",
    logo: <Github className="h-5 w-5 text-gray-800" />,
    badge: "Essential",
    galleryImages: [
      "/videos/commit-push.mp4", // 비디오가 첫 번째
      "/screenshots/git-panel.webp",
      "/screenshots/diff-review.webp",
    ]
  },
  {
    id: "3",
    title: "Port Manager",
    description: "See which dev servers are listening in the port bar, filter the range you care about, and kill a stuck process in one click.",
    image: "/screenshots/app-dashboard.webp",
    logo: <Network className="h-5 w-5 text-blue-500" />,
    galleryImages: [
      "/videos/port-manager.mp4", // 비디오가 첫 번째
      "/videos/port-kill.mp4",
      "/screenshots/app-dashboard.webp",
      "/port-1.png",
      "/port-2.png",
    ]
  },
  {
    id: "4",
    title: "Terminal Templates",
    description: "Save and reuse your favorite commands and agent configurations. Launch complex workflows with customizable templates.",
    image: "/template-1.png",
    logo: <Terminal className="h-5 w-5 text-green-600" />,
    galleryImages: [
      "/videos/templates.mp4", // 비디오가 첫 번째
      "/template-1.png",
      "/template-2.png",
      "/template-3.png",
    ]
  },
  {
    id: "5",
    title: "Playground",
    description: "Spin up a temporary workspace with one click and experiment with AI agents without touching your real projects.",
    image: "/screenshots/playground.webp",
    logo: <FlaskConical className="h-5 w-5 text-orange-500" />,
    galleryImages: [
      "/videos/playground.mp4", // 비디오가 첫 번째
      "/screenshots/playground.webp",
    ]
  },
  {
    id: "session-memo",
    title: "Session Memo",
    description: "Every session gets its own memo pad (⌘J). Notes save as you type and stay with the session across restarts.",
    image: "/screenshots/session-memo.webp",
    logo: <StickyNote className="h-5 w-5 text-amber-500" />,
    galleryImages: [
      "/screenshots/session-memo.webp",
    ]
  },
]

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

export default function GalleryPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  return (
    <PageWrapper>
      {/* Bento Grid Section */}
      <div className="w-full border-b border-[rgba(55,50,47,0.12)] flex flex-col justify-center items-center">
        {/* Header Section */}
        <div className="self-stretch px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] py-8 sm:py-12 md:py-16 border-b border-[rgba(55,50,47,0.12)] flex justify-center items-center gap-6">
          <div className="w-full max-w-[616px] lg:w-[616px] px-4 sm:px-6 py-4 sm:py-5 shadow-[0px_2px_4px_rgba(50,45,43,0.06)] overflow-hidden rounded-lg flex flex-col justify-start items-center gap-3 sm:gap-4 shadow-none">
            <Badge
              icon={
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="1" width="4" height="4" stroke="#37322F" strokeWidth="1" fill="none" />
                  <rect x="7" y="1" width="4" height="4" stroke="#37322F" strokeWidth="1" fill="none" />
                  <rect x="1" y="7" width="4" height="4" stroke="#37322F" strokeWidth="1" fill="none" />
                  <rect x="7" y="7" width="4" height="4" stroke="#37322F" strokeWidth="1" fill="none" />
                </svg>
              }
              text="Gallery"
            />
            <div className="w-full max-w-[598.06px] lg:w-[598.06px] text-center flex justify-center flex-col text-[#49423D] text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold leading-tight md:leading-[60px] font-sans tracking-tight">
              Visualizing the Future of Development
            </div>
            <div className="self-stretch text-center text-[#605A57] text-sm sm:text-base font-normal leading-6 sm:leading-7 font-sans">
              Explore our innovative tools and interfaces designed
              <br />
              to enhance your AI-powered workflows.
            </div>
          </div>
        </div>

        {/* Product Grid Section */}
        <div className="self-stretch px-4 sm:px-6 md:px-8 lg:px-0 lg:max-w-[1060px] lg:w-[1060px] py-8 sm:py-12 md:py-16 flex flex-col justify-start items-center gap-12">
           <ProductList
             products={products}
             onProductClick={(product) => setSelectedProduct(product)}
           />
        </div>
      </div>

      <ImageGallery
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        images={selectedProduct?.galleryImages || []}
      />
    </PageWrapper>
  )
}

"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"

// AI Control API 가이드의 목차 — 넓은 화면은 왼쪽 사이드바, 좁은 화면은 접히는 「On this page」(제보 b2bbf880 · fa37d162).
// 큰 기능 묶음(group) 아래에 세부 절(item)이 오는 2단 구조다.

export type DocsNavItem = { id: string; label: string }
export type DocsNavGroup = { label: string; items: DocsNavItem[] }

// 사이드바가 붙는 위치(화면 위에서 px). 절 제목의 scroll-mt-24(96px)와 맞춘다
const STICKY_TOP_PX = 96
// 지금 읽는 절로 보는 기준선 — 화면 위에서 이만큼 내려온 선을 지난 마지막 절
const ACTIVE_LINE_PX = 140

type StickyMode = { mode: "static" } | { mode: "fixed"; left: number; width: number } | { mode: "bottom" }

function sameMode(a: StickyMode, b: StickyMode) {
  if (a.mode !== b.mode) return false
  if (a.mode === "fixed" && b.mode === "fixed") return a.left === b.left && a.width === b.width
  return true
}

function NavList({ groups, activeId, onPick }: { groups: DocsNavGroup[]; activeId: string; onPick?: () => void }) {
  return (
    <ol className="flex flex-col gap-5">
      {groups.map((group) => (
        <li key={group.label} className="flex flex-col gap-1.5">
          <span className="text-[rgba(73,66,61,0.55)] text-[11px] font-semibold uppercase tracking-wider font-sans">
            {group.label}
          </span>
          <ol className="flex flex-col border-l border-[rgba(55,50,47,0.12)]">
            {group.items.map((item) => {
              const isActive = item.id === activeId
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={onPick}
                    aria-current={isActive ? "location" : undefined}
                    className={`-ml-px block border-l pl-3 py-1 text-[13px] leading-5 font-sans transition-colors ${
                      isActive
                        ? "border-[#37322F] text-[#37322F] font-medium"
                        : "border-transparent text-[#605A57] hover:text-[#37322F] hover:border-[rgba(55,50,47,0.35)]"
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              )
            })}
          </ol>
        </li>
      ))}
    </ol>
  )
}

// 지금 화면에 걸린 절 id — 스크롤마다 기준선을 지난 마지막 절을 고른다
function useActiveSection(ids: string[]) {
  const [activeId, setActiveId] = useState(ids[0] ?? "")
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      let current = ids[0] ?? ""
      for (const id of ids) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= ACTIVE_LINE_PX) current = id
      }
      setActiveId(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [ids])
  return activeId
}

export function DocsSidebar({ groups }: { groups: DocsNavGroup[] }) {
  const ids = groups.flatMap((group) => group.items.map((item) => item.id))
  const activeId = useActiveSection(ids)
  const asideRef = useRef<HTMLElement>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const [sticky, setSticky] = useState<StickyMode>({ mode: "static" })

  // CSS sticky 를 쓰지 않는 이유: 공용 PageWrapper 가 overflow-hidden / overflow-x-hidden 이라
  // 그 안의 position: sticky 는 붙지 않는다. 공용 레이아웃을 건드리지 않으려고 이 칸 안에서 직접 붙인다.
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const aside = asideRef.current
      const nav = navRef.current
      if (!aside || !nav) return
      const rect = aside.getBoundingClientRect()
      let next: StickyMode
      if (rect.top >= STICKY_TOP_PX) next = { mode: "static" }
      else if (rect.bottom - nav.offsetHeight < STICKY_TOP_PX) next = { mode: "bottom" }
      else next = { mode: "fixed", left: Math.round(rect.left), width: Math.round(rect.width) }
      setSticky((prev) => (sameMode(prev, next) ? prev : next))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  const navStyle: CSSProperties =
    sticky.mode === "fixed"
      ? { position: "fixed", top: STICKY_TOP_PX, left: sticky.left, width: sticky.width }
      : sticky.mode === "bottom"
        ? { position: "absolute", bottom: 0, left: 0, right: 0 }
        : {}

  return (
    <aside ref={asideRef} aria-label="AI Control API sections" className="hidden lg:block relative" data-testid="docs-sidebar">
      <div
        ref={navRef}
        style={navStyle}
        className="pt-8 pb-6 max-h-[calc(100vh-112px)] overflow-y-auto pr-2"
        data-sticky={sticky.mode}
      >
        <NavList groups={groups} activeId={activeId} />
      </div>
    </aside>
  )
}

export function DocsMobileToc({ groups }: { groups: DocsNavGroup[] }) {
  const ids = groups.flatMap((group) => group.items.map((item) => item.id))
  const activeId = useActiveSection(ids)
  const detailsRef = useRef<HTMLDetailsElement>(null)
  // 항목을 누르면 목차를 접는다 — 펼친 채로 두면 이동한 절을 목록이 가린다
  const close = () => {
    if (detailsRef.current) detailsRef.current.open = false
  }
  return (
    <details
      ref={detailsRef}
      className="lg:hidden rounded-lg border border-[rgba(55,50,47,0.12)] bg-white"
      data-testid="docs-toc-mobile"
    >
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-[#37322F] font-sans">On this page</summary>
      <div className="px-4 pb-4">
        <NavList groups={groups} activeId={activeId} onPick={close} />
      </div>
    </details>
  )
}

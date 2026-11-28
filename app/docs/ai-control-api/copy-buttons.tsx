"use client"

import { useEffect, useRef, useState, type MouseEvent } from "react"
import { Check, Copy } from "lucide-react"

// AI Control API 가이드의 복사 버튼(제보 59eb7d2c) — 절마다 「Copy」 한 번으로 그 절을 마크다운 글로 가져가
// 에이전트에게 붙여 넣게 한다. 절 글은 화면 DOM 을 그대로 마크다운으로 바꿔 만든다: 본문을 두 벌(JSX + 문자열)로
// 두면 한쪽만 고쳐져 어긋나기 때문이다. 이 페이지에서만 쓰므로 공용 모듈로 빼지 않았다.

// 「Copied」 표시를 남겨 두는 시간
const COPIED_RESET_MS = 1500
// 이미지 경로를 절대 주소로 바꿀 때 쓰는 운영 주소 — 붙여 넣는 곳(에이전트)은 localhost 를 못 연다
const SITE_ORIGIN = "https://climanager.solhun.com"

/** 복사 대상에서 빼는 요소(복사 버튼 자신 등)에 붙이는 표시 */
export const COPY_IGNORE_ATTR = "data-copy-ignore"
/** 절 하나의 범위 — 이 요소 안의 내용이 한 번에 복사된다 */
export const COPY_ROOT_ATTR = "data-copy-root"
/** 그림(figure)의 원본 이미지 경로 — next/image 가 바꾼 주소 대신 이걸 쓴다 */
export const COPY_IMAGE_ATTR = "data-copy-image"

const collapse = (text: string) => text.replace(/\s+/g, " ")

function inlineCode(text: string) {
  // 글 안에 ` 가 있으면 더 긴 울타리로 감싼다(마크다운 규칙)
  const fence = text.includes("`") ? "``" : "`"
  const pad = fence === "``" ? " " : ""
  return `${fence}${pad}${text}${pad}${fence}`
}

function absoluteUrl(href: string) {
  if (href.startsWith("#")) return `${SITE_ORIGIN}${window.location.pathname}${href}`
  try {
    const url = new URL(href, window.location.href)
    // 개발 서버(localhost)에서 눌러도 운영 주소로 남긴다
    if (url.origin === window.location.origin) return `${SITE_ORIGIN}${url.pathname}${url.search}${url.hash}`
    return url.href
  } catch {
    return href
  }
}

/** 문단·목록 항목·표 칸 안의 글 — 코드·굵게·링크만 마크다운으로 남긴다 */
function inlineMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return collapse(node.textContent ?? "")
  if (!(node instanceof HTMLElement)) return ""
  if (node.hasAttribute(COPY_IGNORE_ATTR)) return ""
  const inner = () => Array.from(node.childNodes).map(inlineMarkdown).join("")
  switch (node.tagName) {
    case "CODE":
      return inlineCode(collapse(node.textContent ?? "").trim())
    case "STRONG":
    case "B":
      return `**${inner().trim()}**`
    case "EM":
    case "I":
      return `*${inner().trim()}*`
    case "A": {
      const href = node.getAttribute("href")
      return href ? `[${inner().trim()}](${absoluteUrl(href)})` : inner()
    }
    case "BR":
      return " "
    case "UL":
    case "OL":
      return "" // 항목 안의 하위 목록은 blockMarkdown 이 따로 처리한다
    default:
      return inner()
  }
}

function tableMarkdown(table: HTMLTableElement): string {
  const cell = (el: Element) => inlineMarkdown(el).trim().replace(/\|/g, "\\|")
  const rows = Array.from(table.rows).map((row) => Array.from(row.cells).map(cell))
  if (rows.length === 0) return ""
  const [head, ...body] = rows
  const line = (cells: string[]) => `| ${cells.join(" | ")} |`
  return [line(head), line(head.map(() => "---")), ...body.map(line)].join("\n")
}

function listMarkdown(list: HTMLElement, depth: number): string {
  const ordered = list.tagName === "OL"
  const indent = "   ".repeat(depth)
  const items = Array.from(list.children).filter((child) => child.tagName === "LI")
  return items
    .map((item, index) => {
      const marker = ordered ? `${index + 1}.` : "-"
      const nested = Array.from(item.children)
        .filter((child): child is HTMLElement => child.tagName === "UL" || child.tagName === "OL")
        .map((child) => listMarkdown(child, depth + 1))
      return [`${indent}${marker} ${inlineMarkdown(item).trim()}`, ...nested].join("\n")
    })
    .join("\n")
}

/** 블록 요소를 마크다운 덩어리들로 — 덩어리 사이는 빈 줄 하나 */
function blockMarkdown(node: Node, out: string[]) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = collapse(node.textContent ?? "").trim()
    if (text) out.push(text)
    return
  }
  if (!(node instanceof HTMLElement) || node.hasAttribute(COPY_IGNORE_ATTR)) return
  switch (node.tagName) {
    case "H1":
    case "H2":
    case "H3":
    case "H4": {
      const level = Number(node.tagName[1])
      out.push(`${"#".repeat(level)} ${inlineMarkdown(node).trim()}`)
      return
    }
    case "P":
      out.push(inlineMarkdown(node).trim())
      return
    case "PRE":
      out.push("```\n" + (node.textContent ?? "").replace(/\s+$/, "") + "\n```")
      return
    case "UL":
    case "OL":
      out.push(listMarkdown(node, 0))
      return
    case "TABLE":
      out.push(tableMarkdown(node as HTMLTableElement))
      return
    case "FIGURE": {
      const src = node.getAttribute(COPY_IMAGE_ATTR)
      const alt = node.querySelector("img")?.getAttribute("alt") ?? ""
      const caption = node.querySelector("figcaption")
      if (src) out.push(`![${alt}](${absoluteUrl(src)})`)
      if (caption) out.push(`*${inlineMarkdown(caption).trim()}*`)
      return
    }
    case "IMG":
    case "BUTTON":
    case "SCRIPT":
    case "STYLE":
      return
    default:
      node.childNodes.forEach((child) => blockMarkdown(child, out))
  }
}

/** 절 하나(복사 범위 요소)를 마크다운 글로 — 끝에 그 절의 주소를 붙여 출처를 남긴다 */
export function sectionToMarkdown(root: HTMLElement): string {
  const blocks: string[] = []
  root.childNodes.forEach((child) => blockMarkdown(child, blocks))
  const id = root.id
  if (id) blocks.push(`Source: ${SITE_ORIGIN}${window.location.pathname}#${id}`)
  return blocks.filter(Boolean).join("\n\n") + "\n"
}

async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // 클립보드 권한이 없는 환경(일부 내장 브라우저 등) — 예전 방식으로 한 번 더
    const area = document.createElement("textarea")
    area.value = text
    area.setAttribute("readonly", "")
    area.style.position = "fixed"
    area.style.opacity = "0"
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand("copy")
    area.remove()
    return ok
  }
}

type CopyState = "idle" | "copied" | "failed"

function useCopyState() {
  const [state, setState] = useState<CopyState>("idle")
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])
  const show = (next: CopyState) => {
    setState(next)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setState("idle"), COPIED_RESET_MS)
  }
  return { state, show }
}

function StateLabel({ state, idle }: { state: CopyState; idle: string }) {
  if (state === "copied") {
    return (
      <>
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
        Copied
      </>
    )
  }
  return (
    <>
      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
      {state === "failed" ? "Copy failed" : idle}
    </>
  )
}

/** 절 제목 옆 버튼 — 가장 가까운 복사 범위(절)를 마크다운으로 복사한다 */
export function SectionCopyButton({ title }: { title: string }) {
  const { state, show } = useCopyState()
  const [copiedText, setCopiedText] = useState<string>()

  const onClick = async (event: MouseEvent<HTMLButtonElement>) => {
    const root = event.currentTarget.closest<HTMLElement>(`[${COPY_ROOT_ATTR}]`)
    if (!root) return
    const text = sectionToMarkdown(root)
    // 버튼이 쓴 글을 속성으로도 남긴다 — 클립보드를 읽을 수 없는 자동 확인에서 내용을 보려고
    setCopiedText(text)
    show((await writeClipboard(text)) ? "copied" : "failed")
  }

  return (
    <button
      type="button"
      onClick={onClick}
      {...{ [COPY_IGNORE_ATTR]: "" }}
      data-copy-section=""
      data-copied={copiedText}
      aria-label={`Copy the “${title}” section as Markdown`}
      title="Copy this section as Markdown"
      className="shrink-0 mt-1 sm:mt-1.5 inline-flex items-center gap-1.5 rounded-md border border-[rgba(55,50,47,0.15)] bg-white px-2 py-1 text-xs font-medium font-sans text-[#605A57] hover:text-[#37322F] hover:border-[rgba(55,50,47,0.3)] transition-colors"
    >
      <StateLabel state={state} idle="Copy" />
      <span className="sr-only" aria-live="polite">
        {state === "copied" ? "Section copied" : ""}
      </span>
    </button>
  )
}

/** 코드 블록 오른쪽 위 버튼 — 코드만 그대로 복사한다 */
export function CodeCopyButton({ text }: { text: string }) {
  const { state, show } = useCopyState()
  return (
    <button
      type="button"
      onClick={async () => show((await writeClipboard(text)) ? "copied" : "failed")}
      {...{ [COPY_IGNORE_ATTR]: "" }}
      data-copy-code=""
      aria-label="Copy code"
      title="Copy code"
      className="absolute top-2 right-2 inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-[#1C1B1F] px-2 py-1 text-xs font-medium font-sans text-[#A8A29E] hover:text-white hover:border-white/30 transition-colors"
    >
      <StateLabel state={state} idle="Copy" />
    </button>
  )
}

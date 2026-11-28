"use client"

import { useState } from "react"
import Image from "next/image"
import { Maximize2 } from "lucide-react"
import { ImageGallery } from "../../../components/image-gallery"

// 가이드 본문 사이의 앱 캡처(제보 6f6e2f28). 누르면 홈 기능 절과 같은 라이트박스(ImageGallery)로 크게 본다.
// 캡처는 데모 인스턴스에서 찍는다 — scripts/app-screenshots (실제 세션·계정이 없다).

// 캡처 원본 비율 — 데모 창을 1280x800 으로 찍는다
const DEFAULT_WIDTH = 1600
const DEFAULT_HEIGHT = 1000

export function DocsScreenshot({
  src,
  alt,
  caption,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
}: {
  src: string
  alt: string
  caption: string
  width?: number
  height?: number
}) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <figure data-copy-image={src} className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`Enlarge screenshot: ${alt}`}
        className="group relative block w-full rounded-xl overflow-hidden border border-[rgba(55,50,47,0.12)] bg-[#141418] cursor-zoom-in"
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <Image src={src} alt={alt} fill sizes="(min-width: 896px) 896px, 100vw" className="object-cover object-left-top" />
        <span className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white font-sans backdrop-blur-sm opacity-80 group-hover:opacity-100 transition-opacity">
          <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
          Enlarge
        </span>
      </button>
      <figcaption className="text-[#605A57] text-xs font-sans">{caption}</figcaption>
      <ImageGallery images={isOpen ? [src] : []} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </figure>
  )
}

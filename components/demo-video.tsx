"use client"

import { useEffect, useRef, useState } from "react"
import type { DemoVideo } from "@/lib/demo-video"

interface DemoVideoPlayerProps {
  video: DemoVideo
  className?: string
}

// 화면에 들어오기 전에 붙일 여유 — 스크롤이 닿기 직전에 받기 시작해 poster 에서 영상으로 자연스럽게 넘어간다
const PRELOAD_MARGIN = "200px"

/**
 * poster 를 먼저 보여 주고, 화면 근처에 왔을 때만 영상 src 를 붙이는 플레이어.
 * - ScrollVideo 는 src 를 처음부터 붙여서(preload=metadata) 첫 화면에서도 요청이 나간다.
 *   히어로 영상은 수 MB 라서, 방문자가 보지 않으면 한 바이트도 받지 않게 lazy 로 둔다.
 * - 화면을 벗어나면 멈추고, 돌아오면 이어서 재생한다(음소거 자동재생).
 */
export function DemoVideoPlayer({ video, className = "" }: DemoVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const element = videoRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShouldLoad(true)
            element.play().catch(() => {
              // 자동재생이 막힌 브라우저(저전력 모드 등)에서는 poster + controls 로 남는다
            })
          } else {
            element.pause()
          }
        }
      },
      { rootMargin: PRELOAD_MARGIN },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <video
      ref={videoRef}
      src={shouldLoad ? video.src : undefined}
      poster={video.poster}
      width={video.width}
      height={video.height}
      className={className}
      aria-label={video.alt}
      autoPlay
      muted
      loop
      playsInline
      controls
      preload="none"
    />
  )
}

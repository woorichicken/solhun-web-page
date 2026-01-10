"use client"

import { useState } from "react"

// 다운로드 URL
const DOWNLOAD_URLS = {
  arm64: "https://pub-dc249db286af4c1991fedf690157891d.r2.dev/cli-manager-1.3.0-arm64.dmg",
  x64: "https://pub-dc249db286af4c1991fedf690157891d.r2.dev/cli-manager-1.3.0-x64.dmg",
}

export default function CTASection() {
  const [isDownloadOpen, setIsDownloadOpen] = useState(false)

  return (
    <div className="w-full relative overflow-hidden flex flex-col justify-center items-center gap-2">
      {/* Content */}
      <div className="self-stretch px-6 md:px-24 py-12 md:py-12 border-t border-b border-[rgba(55,50,47,0.12)] flex justify-center items-center gap-6 relative z-10">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div className="w-full h-full relative">
            {Array.from({ length: 300 }).map((_, i) => (
              <div
                key={i}
                className="absolute h-4 w-full rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
                style={{
                  top: `${i * 16 - 120}px`,
                  left: "-100%",
                  width: "300%",
                }}
              ></div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-[586px] px-6 py-5 md:py-8 overflow-hidden rounded-lg flex flex-col justify-start items-center gap-6 relative z-20">
          <div className="self-stretch flex flex-col justify-start items-start gap-3">
            <div className="self-stretch text-center flex justify-center flex-col text-[#49423D] text-3xl md:text-5xl font-semibold leading-tight md:leading-[56px] font-sans tracking-tight">
              Ready to revolutionize with AI Agents?
            </div>
            <div className="self-stretch text-center text-[#605A57] text-base leading-7 font-sans font-medium">
              Manage Git worktrees effortlessly, track ports across projects,
              <br />
              and launch complex workflows with terminal templates.
            </div>
          </div>
          <div className="w-full max-w-[497px] flex flex-col justify-center items-center gap-12">
            <div className="flex justify-start items-center gap-4 relative">
              <button
                onClick={() => setIsDownloadOpen(!isDownloadOpen)}
                className="h-10 px-12 py-[6px] relative bg-[#37322F] shadow-[0px_0px_0px_2.5px_rgba(255,255,255,0.08)_inset] overflow-hidden rounded-full flex justify-center items-center gap-2 cursor-pointer hover:bg-[#2A2520] transition-colors"
              >
                <div className="w-44 h-[41px] absolute left-0 top-0 bg-gradient-to-b from-[rgba(255,255,255,0)] to-[rgba(0,0,0,0.10)] mix-blend-multiply"></div>
                <span className="text-white text-[13px] font-medium leading-5 font-sans relative z-10">
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

              {/* Download Dropdown Menu - 위쪽으로 열림 */}
              {isDownloadOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDownloadOpen(false)}
                  />
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 bg-white rounded-xl shadow-lg border border-[rgba(55,50,47,0.12)] overflow-hidden z-50 py-1">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

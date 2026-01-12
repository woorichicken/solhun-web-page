"use client"

import { useState } from "react"

// R2 다운로드 URL
const DOWNLOAD_URLS = {
  arm64: "https://pub-dc249db286af4c1991fedf690157891d.r2.dev/cli-manager-1.3.3-arm64.dmg",
  x64: "https://pub-dc249db286af4c1991fedf690157891d.r2.dev/cli-manager-1.3.3-x64.dmg",
}

// 프로덕션 Variant IDs
const PLANS = {
  monthly: { id: "1145300", price: 4.99, period: "month" },
  annual: { id: "1148468", price: 29, period: "year" },
  lifetime: { id: "1148470", price: 29, originalPrice: 49 },
} as const

type PlanKey = keyof typeof PLANS

export default function PricingSection() {
  // 로딩 상태 관리 (각 플랜별)
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null)
  // Free Tier 다운로드 드롭다운 상태
  const [isDownloadOpen, setIsDownloadOpen] = useState(false)

  /**
   * 체크아웃 버튼 클릭 핸들러
   *
   * API를 호출해서 Lemon Squeezy 체크아웃 URL을 받아온 후
   * 해당 URL로 사용자를 리다이렉트합니다.
   */
  const handleCheckout = async (planKey: PlanKey) => {
    try {
      setLoadingPlan(planKey)

      const variantId = PLANS[planKey].id

      // 체크아웃 URL 요청
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ variantId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "체크아웃 생성에 실패했습니다.")
      }

      // Lemon Squeezy 체크아웃 페이지로 이동
      window.location.href = data.url
    } catch (error) {
      console.error("Checkout error:", error)
      alert(error instanceof Error ? error.message : "결제 페이지로 이동 중 오류가 발생했습니다.")
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="w-full flex flex-col justify-center items-center gap-2">
      {/* Pricing Cards Section */}
      <div className="self-stretch border-b border-t border-[rgba(55,50,47,0.12)] flex justify-center items-center">
        <div className="flex justify-center items-start w-full">
          {/* Left Decorative Pattern */}
          <div className="w-12 self-stretch relative overflow-hidden hidden md:block">
            <div className="w-[162px] left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
              {Array.from({ length: 200 }).map((_, i) => (
                <div
                  key={i}
                  className="self-stretch h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
                ></div>
              ))}
            </div>
          </div>

          {/* Pricing Cards Container */}
          <div className="flex-1 flex flex-row justify-center items-stretch gap-2 sm:gap-4 py-6 sm:py-12 md:py-0 px-3 sm:px-6 md:px-0">

            {/* Monthly Plan */}
            <div className="flex-1 px-3 sm:px-5 py-4 sm:py-5 bg-white border border-[#E0DEDB] overflow-hidden flex flex-col justify-start items-start gap-6 sm:gap-10">
              <div className="self-stretch flex flex-col justify-start items-center gap-4 sm:gap-7">
                <div className="self-stretch flex flex-col justify-start items-start gap-1 sm:gap-2">
                  <div className="text-[rgba(55,50,47,0.90)] text-sm sm:text-lg font-medium leading-5 sm:leading-7 font-sans">Monthly</div>
                  <div className="w-full text-[rgba(41,37,35,0.70)] text-xs sm:text-sm font-normal leading-4 sm:leading-5 font-sans hidden sm:block">
                    Flexible month-to-month billing
                  </div>
                </div>

                <div className="self-stretch flex flex-col justify-start items-start gap-1 sm:gap-2">
                  <div className="flex flex-col justify-start items-start gap-0.5 sm:gap-1">
                    <div className="relative h-[36px] sm:h-[60px] flex items-baseline gap-1 text-[#37322F] text-2xl sm:text-5xl font-medium leading-[36px] sm:leading-[60px] font-serif">
                      <span>$4.99</span>
                      <span className="text-[#847971] text-sm sm:text-lg font-normal">/mo</span>
                    </div>
                    <div className="text-[#847971] text-[10px] sm:text-sm font-medium font-sans">
                      Cancel anytime
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleCheckout("monthly")}
                  disabled={loadingPlan === "monthly"}
                  className="self-stretch px-3 sm:px-4 py-2 sm:py-[10px] relative bg-[#37322F] shadow-[0px_2px_4px_rgba(55,50,47,0.12)] overflow-hidden rounded-[99px] flex justify-center items-center cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-full h-[41px] absolute left-0 top-[-0.5px] bg-gradient-to-b from-[rgba(255,255,255,0.20)] to-[rgba(0,0,0,0.10)] mix-blend-multiply"></div>
                  <div className="flex justify-center flex-col text-[#FBFAF9] text-[11px] sm:text-[13px] font-medium leading-4 sm:leading-5 font-sans">
                    {loadingPlan === "monthly" ? "Loading..." : "Subscribe"}
                  </div>
                </button>
              </div>

              <div className="self-stretch flex flex-col justify-start items-start gap-1.5 sm:gap-2">
                {[
                  "All features included",
                  "Monthly updates",
                ].map((feature, index) => (
                  <div key={index} className="self-stretch flex justify-start items-center gap-2 sm:gap-[13px]">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 relative flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 sm:w-3 sm:h-3">
                        <path d="M10 3L4.5 8.5L2 6" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex-1 text-[rgba(55,50,47,0.80)] text-[10px] sm:text-[12.5px] font-normal leading-4 sm:leading-5 font-sans">{feature}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lifetime Plan (Featured) */}
            <div className="flex-1 px-3 sm:px-5 py-4 sm:py-5 bg-[#37322F] border border-[rgba(50,45,43,0.12)] overflow-hidden flex flex-col justify-start items-start gap-6 sm:gap-10">
              <div className="self-stretch flex flex-col justify-start items-center gap-4 sm:gap-7">
                <div className="self-stretch flex flex-col justify-start items-start gap-1 sm:gap-2">
                  <div className="text-[#FBFAF9] text-sm sm:text-lg font-medium leading-5 sm:leading-7 font-sans">Lifetime</div>
                  <div className="w-full text-[#B2AEA9] text-xs sm:text-sm font-normal leading-4 sm:leading-5 font-sans hidden sm:block">
                    Pay once, own forever
                  </div>
                </div>

                <div className="self-stretch flex flex-col justify-start items-start gap-1 sm:gap-2">
                  <div className="flex flex-col justify-start items-start gap-0.5 sm:gap-1">
                    <div className="px-2 py-0.5 rounded-full bg-[#FF8000]/10 text-[#FF8000] text-[10px] sm:text-xs font-medium border border-[#FF8000]/20 mb-1 self-start">
                      Best Value
                    </div>
                    <div className="relative h-[36px] sm:h-[60px] flex items-center gap-2 sm:gap-3 text-[#F0EFEE] text-2xl sm:text-5xl font-medium leading-[36px] sm:leading-[60px] font-serif">
                      <span className="text-[#D2C6BF]/60 text-lg sm:text-3xl line-through decoration-[#D2C6BF]/60 decoration-1">$49</span>
                      <span>$29</span>
                    </div>
                    <div className="text-[#D2C6BF] text-[10px] sm:text-sm font-medium font-sans">
                      one-time payment
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleCheckout("lifetime")}
                  disabled={loadingPlan === "lifetime"}
                  className="self-stretch px-3 sm:px-4 py-2 sm:py-[10px] relative bg-[#FBFAF9] shadow-[0px_2px_4px_rgba(55,50,47,0.12)] overflow-hidden rounded-[99px] flex justify-center items-center cursor-pointer hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-full h-[41px] absolute left-0 top-[-0.5px] bg-gradient-to-b from-[rgba(255,255,255,0)] to-[rgba(0,0,0,0.10)] mix-blend-multiply"></div>
                  <div className="flex justify-center flex-col text-[#37322F] text-[11px] sm:text-[13px] font-medium leading-4 sm:leading-5 font-sans">
                    {loadingPlan === "lifetime" ? "Loading..." : "Get Lifetime Access"}
                  </div>
                </button>
              </div>

              <div className="self-stretch flex flex-col justify-start items-start gap-1.5 sm:gap-2">
                {[
                  "Unlimited updates",
                  "Unlimited license",
                ].map((feature, index) => (
                  <div key={index} className="self-stretch flex justify-start items-center gap-2 sm:gap-[13px]">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 relative flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 sm:w-3 sm:h-3">
                        <path d="M10 3L4.5 8.5L2 6" stroke="#FF8000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex-1 text-[#F0EFEE] text-[10px] sm:text-[12.5px] font-normal leading-4 sm:leading-5 font-sans">{feature}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Annual Plan */}
            <div className="flex-1 px-3 sm:px-5 py-4 sm:py-5 bg-white border border-[#E0DEDB] overflow-hidden flex flex-col justify-start items-start gap-6 sm:gap-10">
              <div className="self-stretch flex flex-col justify-start items-center gap-4 sm:gap-7">
                <div className="self-stretch flex flex-col justify-start items-start gap-1 sm:gap-2">
                  <div className="text-[rgba(55,50,47,0.90)] text-sm sm:text-lg font-medium leading-5 sm:leading-7 font-sans">Annual</div>
                  <div className="w-full text-[rgba(41,37,35,0.70)] text-xs sm:text-sm font-normal leading-4 sm:leading-5 font-sans hidden sm:block">
                    Save 51% vs monthly
                  </div>
                </div>

                <div className="self-stretch flex flex-col justify-start items-start gap-1 sm:gap-2">
                  <div className="flex flex-col justify-start items-start gap-0.5 sm:gap-1">
                    <div className="relative h-[36px] sm:h-[60px] flex items-baseline gap-1 text-[#37322F] text-2xl sm:text-5xl font-medium leading-[36px] sm:leading-[60px] font-serif">
                      <span>$29</span>
                      <span className="text-[#847971] text-sm sm:text-lg font-normal">/yr</span>
                    </div>
                    <div className="text-[#847971] text-[10px] sm:text-sm font-medium font-sans">
                      ~$2.42/month
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleCheckout("annual")}
                  disabled={loadingPlan === "annual"}
                  className="self-stretch px-3 sm:px-4 py-2 sm:py-[10px] relative bg-[#37322F] shadow-[0px_2px_4px_rgba(55,50,47,0.12)] overflow-hidden rounded-[99px] flex justify-center items-center cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-full h-[41px] absolute left-0 top-[-0.5px] bg-gradient-to-b from-[rgba(255,255,255,0.20)] to-[rgba(0,0,0,0.10)] mix-blend-multiply"></div>
                  <div className="flex justify-center flex-col text-[#FBFAF9] text-[11px] sm:text-[13px] font-medium leading-4 sm:leading-5 font-sans">
                    {loadingPlan === "annual" ? "Loading..." : "Subscribe Yearly"}
                  </div>
                </button>
              </div>

              <div className="self-stretch flex flex-col justify-start items-start gap-1.5 sm:gap-2">
                {[
                  "All features included",
                  "Priority support",
                ].map((feature, index) => (
                  <div key={index} className="self-stretch flex justify-start items-center gap-2 sm:gap-[13px]">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 relative flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 sm:w-3 sm:h-3">
                        <path d="M10 3L4.5 8.5L2 6" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex-1 text-[rgba(55,50,47,0.80)] text-[10px] sm:text-[12.5px] font-normal leading-4 sm:leading-5 font-sans">{feature}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Decorative Pattern */}
          <div className="w-12 self-stretch relative overflow-hidden hidden md:block">
            <div className="w-[162px] left-[-58px] top-[-120px] absolute flex flex-col justify-start items-start">
              {Array.from({ length: 200 }).map((_, i) => (
                <div
                  key={i}
                  className="self-stretch h-4 rotate-[-45deg] origin-top-left outline outline-[0.5px] outline-[rgba(3,7,18,0.08)] outline-offset-[-0.25px]"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      
      {/* Free Tier Notice */}
      <div className="w-full py-6 flex flex-col justify-center items-center gap-2">
        <div className="text-[rgba(55,50,47,0.60)] text-sm font-normal font-sans">
          Looking for a free option?
        </div>
        <div className="relative">
          <button
            onClick={() => setIsDownloadOpen(!isDownloadOpen)}
            className="flex items-center gap-1.5 text-[#37322F] text-base font-medium font-sans border-b border-[rgba(55,50,47,0.2)] pb-0.5 cursor-pointer hover:border-[rgba(55,50,47,0.6)] transition-colors"
          >
            <span>Get started with our Free Tier</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-200 ${isDownloadOpen ? 'rotate-180' : ''}`}
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
                <a
                  href={DOWNLOAD_URLS.arm64}
                  download
                  onClick={() => setTimeout(() => setIsDownloadOpen(false), 100)}
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
                  onClick={() => setTimeout(() => setIsDownloadOpen(false), 100)}
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
  )
}

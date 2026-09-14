import type React from "react"

/**
 * 약관·개인정보처리방침·앱 소개처럼 글이 긴 페이지의 공통 틀.
 * 사이트의 색(#37322F·#49423D)과 제목 서체를 그대로 따른다.
 */
export function LegalContent({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <article className="w-full max-w-[760px] px-4 sm:px-6 md:px-8 pb-16 text-[#49423D]">
      <h1 className="text-[#37322F] text-3xl sm:text-4xl md:text-5xl font-normal font-serif leading-tight">{title}</h1>
      <p className="mt-3 text-sm text-[rgba(73,66,61,0.6)]">Last updated: {updated}</p>
      <div className="mt-10 flex flex-col gap-8 text-[15px] leading-7 [&_h2]:text-[#37322F] [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1 [&_a]:underline [&_a]:underline-offset-2 [&_code]:text-[13px] [&_code]:bg-[rgba(55,50,47,0.06)] [&_code]:px-1 [&_code]:rounded">
        {children}
      </div>
    </article>
  )
}

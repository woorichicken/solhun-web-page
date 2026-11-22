// 홈의 "Recently shipped" 섹션과 /llms.txt 가 같이 쓰는 최근 릴리즈 요약.
// 예전엔 손으로 적는 정적 목록이었고 v1.10.0 에서 멈춰 있었다(운영은 v1.36.0) — 지금은 /changelog 와 같은
// DB changelogs 테이블에서 읽는다. 릴리즈 스크립트가 changelog 행을 넣으면 따로 손댈 곳이 없다.
import { desc } from "drizzle-orm"
import { db, changelogs, type Changelog } from "@/lib/db"

export interface ReleaseHighlight {
  version: string
  date: string
  title: string
  summary: string
}

// 홈 카드 최대 6장 = 2열 3줄(예전 정적 목록과 같은 높이).
export const RECENT_RELEASE_COUNT = 6
// 최근 릴리즈 몇 개 안에서만 고른다. 건너뛴 행이 많을 때 몇 주 전 버전이 「최근」 카드로 끌려 올라오지 않게 —
// 그럴 땐 카드가 6장보다 적게 나온다.
const FETCH_WINDOW = 12

// 영어 사이트다. 릴리즈 노트가 한국어로 들어간 행이 있다(2026-11-22 기준 66건 중 20건, v1.15.0~v1.32.0 —
// docs/backlog.md 「changelog 노트 언어」). 홈에는 영어 행만 싣는다.
const HANGUL = /[\uAC00-\uD7A3]/

// 일부 행은 제목 앞에 버전을 다시 적었다("v1.34.0 — Autocron, …"). 카드에 버전 알약이 따로 있어 중복이다.
const LEADING_VERSION = /^v?\d+\.\d+\.\d+\s*[—–:-]\s*/

export function toReleaseHighlight(row: Pick<Changelog, "version" | "date" | "title" | "description">): ReleaseHighlight {
  return {
    version: row.version.startsWith("v") ? row.version : `v${row.version}`,
    date: row.date,
    title: row.title.replace(LEADING_VERSION, ""),
    summary: row.description,
  }
}

// 새 기능이 있는 영어 릴리즈만 최신순으로 count 개. rows 는 createdAt 내림차순이어야 한다.
// 고치기만 한 패치(예: v1.35.1)는 홈에 쓸 이야기가 없어 건너뛴다.
export function pickRecentReleases(
  rows: Pick<Changelog, "version" | "date" | "title" | "description" | "improvements">[],
  count = RECENT_RELEASE_COUNT,
): ReleaseHighlight[] {
  return rows
    .filter((row) => (row.improvements?.length ?? 0) > 0)
    .filter((row) => !HANGUL.test(`${row.title} ${row.description}`))
    .slice(0, count)
    .map(toReleaseHighlight)
}

// DB 가 안 되면: 빌드 중에는 빈 목록(카드 없이 「Full changelog」 링크만 — 빌드를 막지 않는다),
// 배포 뒤 1시간마다 다시 만들 때는 던진다 — Next 가 직전에 잘 만든 페이지를 그대로 둔다(빈 목록을 1시간 캐시하지 않게).
const IS_BUILD = process.env.NEXT_PHASE === "phase-production-build"

export async function getRecentReleases(count = RECENT_RELEASE_COUNT): Promise<ReleaseHighlight[]> {
  try {
    const rows = await db
      .select({
        version: changelogs.version,
        date: changelogs.date,
        title: changelogs.title,
        description: changelogs.description,
        improvements: changelogs.improvements,
      })
      .from(changelogs)
      .orderBy(desc(changelogs.createdAt))
      .limit(FETCH_WINDOW)
    return pickRecentReleases(rows, count)
  } catch (error) {
    console.error("Failed to fetch recent releases:", error)
    if (IS_BUILD) return []
    throw error
  }
}

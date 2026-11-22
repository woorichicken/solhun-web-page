#!/usr/bin/env node
// AI Control API 가이드(app/docs/ai-control-api/endpoints.ts)의 엔드포인트가 앱 계약 문서와 같은지 센다.
// 정본: CLImanger 저장소 docs/architecture/control-api.md (REST 표 · Autocron 표 · Agent conversations 표)
//
// 쓰기: node scripts/check-control-api-endpoints.mjs <control-api.md 경로>
// 종료코드: 0 같음 · 1 다름(빠진 것/남는 것 출력) · 2 사용법·읽기 오류
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const contractPath = process.argv[2]
if (!contractPath) {
  console.error("usage: node scripts/check-control-api-endpoints.mjs <path to CLImanger docs/architecture/control-api.md>")
  process.exit(2)
}

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..")
const contract = readFileSync(contractPath, "utf8")
const pageData = readFileSync(join(repoRoot, "app/docs/ai-control-api/endpoints.ts"), "utf8")

const contractSet = new Set()
for (const line of contract.split("\n")) {
  // REST·Autocron 표: | GET | `/v1/health` | ...  — 「`/v1/crons/:cron/pause` · `/resume`」 처럼 한 줄에 둘을 적은 칸도 있다
  const row = /^\|\s*(GET|POST|DELETE)\s*\|\s*(`[^|]+)\|/.exec(line)
  if (row) {
    const method = row[1]
    const paths = [...row[2].matchAll(/`([^`]+)`/g)].map((m) => m[1])
    let base = ""
    for (const path of paths) {
      if (path.startsWith("/v1/")) {
        base = path
        contractSet.add(`${method} ${path}`)
      } else if (path.startsWith("/") && base) {
        // `/resume` → 앞 경로의 마지막 조각을 바꾼다
        contractSet.add(`${method} ${base.replace(/\/[^/]+$/, path)}`)
      }
    }
    continue
  }
  // Agent conversations 표: | `GET /v1/sessions/:id/conversations` | ...
  const convo = /^\|\s*`(GET|POST|DELETE) (\/v1\/[^`]+)`\s*\|/.exec(line)
  if (convo) contractSet.add(`${convo[1]} ${convo[2]}`)
}

const pageSet = new Set()
for (const m of pageData.matchAll(/method:\s*"(GET|POST|DELETE)",\s*path:\s*"([^"]+)"/g)) pageSet.add(`${m[1]} ${m[2]}`)
// 여러 줄로 쓴 항목(method 다음 줄에 path)도 센다
for (const m of pageData.matchAll(/method:\s*"(GET|POST|DELETE)",\s*\n\s*path:\s*"([^"]+)"/g)) pageSet.add(`${m[1]} ${m[2]}`)

const missing = [...contractSet].filter((e) => !pageSet.has(e)).sort()
const extra = [...pageSet].filter((e) => !contractSet.has(e)).sort()
console.log(`contract ${contractSet.size} · page ${pageSet.size}`)
if (missing.length) console.log("missing on page:\n  " + missing.join("\n  "))
if (extra.length) console.log("on page but not in contract:\n  " + extra.join("\n  "))
process.exit(missing.length || extra.length ? 1 : 0)

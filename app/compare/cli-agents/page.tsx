"use client"

import { Check, X, AlertTriangle, Terminal, Layers, MousePointer2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { PageWrapper } from "../../../components/page-wrapper"
import { UnifiedEcosystemAnimation } from "../../../components/unified-ecosystem-animation"

const comparisonData = [
  { feature: "Execution", comp: "Fragmented Terminals", solhun: "Unified Dashboard", compStatus: "partial" },
  { feature: "Multiple Agents", comp: "Multiple Windows", solhun: "Clean Tab Management", compStatus: "warning" },
  { feature: "Context Switching", comp: "Confusing & Messy", solhun: "Organized Structure", compStatus: "no" },
  { feature: "Notifications", comp: "Easy to Miss", solhun: "Dedicated Alerts", compStatus: "no" },
  { feature: "Git Worktree", comp: "Manual Commands", solhun: "One-Click Management", compStatus: "warning" },
  { feature: "File Access", comp: "Copy/Paste Paths", solhun: "Cmd+Click to Open", compStatus: "partial" },
  { feature: "Reviewing Changes", comp: "git diff in Another Window", solhun: "In-App Diff with Line Comments", compStatus: "warning" },
  { feature: "Agent Status", comp: "Guess from the Terminal", solhun: "Official Hook Events", compStatus: "partial" },
  { feature: "Agents Driving Agents", comp: "Headless claude -p", solhun: "AI Control API, Visible Sessions", compStatus: "no" },
]

export default function CliAgentsComparison() {
  return (
    <PageWrapper>
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 font-sans text-[#49423D]">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 tracking-tight"
          >
            Why Solhun over just <span className="text-[#37322F]">CLI Agents</span>?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-lg text-[#49423D]/80 max-w-2xl mx-auto"
          >
            CLI agents are powerful, but managing multiple terminals gets chaotic.
            Solhun brings order with a unified interface.
          </motion.p>
        </div>

        {/* Comparison Table - Desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="hidden md:block bg-white rounded-2xl shadow-sm border border-[#E6E4E2] overflow-hidden mb-12"
        >
          <table className="w-full">
            <thead>
              <tr className="bg-[#FAFAF9] border-b border-[#E6E4E2]">
                <th className="p-4 text-left text-sm font-semibold text-[#49423D]/60">Feature</th>
                <th className="p-4 text-center text-sm font-semibold">CLI Agents <span className="text-[#49423D]/60 font-normal">(Claude Code, etc)</span></th>
                <th className="p-4 text-center text-sm font-bold text-[#37322F]">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 rounded-md overflow-hidden border border-[rgba(55,50,47,0.08)]">
                      <img src="/solhun-logo.png" alt="Solhun" className="w-full h-full object-cover" />
                    </div>
                    Solhun
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, i) => (
                <tr key={i} className={i !== comparisonData.length - 1 ? "border-b border-[#E6E4E2]" : ""}>
                  <td className="p-4 text-sm font-medium text-[#49423D] bg-[#FAFAF9]">{row.feature}</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-[#49423D]/70">
                      {row.compStatus === "no" && <X className="w-4 h-4 text-red-500" />}
                      {row.compStatus === "warning" && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                      {row.compStatus === "partial" && <Terminal className="w-4 h-4 text-gray-400" />}
                      <span>{row.comp}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center bg-green-50/30">
                    <div className="flex items-center justify-center gap-2 text-sm font-medium text-[#37322F]">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>{row.solhun}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Comparison Cards - Mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:hidden space-y-3 mb-8"
        >
          {comparisonData.map((row, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E6E4E2] overflow-hidden">
              <div className="bg-[#FAFAF9] px-4 py-2 border-b border-[#E6E4E2]">
                <span className="text-xs font-semibold text-[#49423D]">{row.feature}</span>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#49423D]/50">CLI Agents (Claude Code, etc)</span>
                  <div className="flex items-center gap-1.5 text-xs text-[#49423D]/70">
                    {row.compStatus === "no" && <X className="w-3.5 h-3.5 text-red-500" />}
                    {row.compStatus === "warning" && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                    {row.compStatus === "partial" && <Terminal className="w-3.5 h-3.5 text-gray-400" />}
                    <span>{row.comp}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-green-50/50 -mx-3 px-3 py-1.5 rounded">
                  <span className="text-xs text-[#49423D]/50">Solhun</span>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#37322F]">
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    <span>{row.solhun}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Animation */}
        <UnifiedEcosystemAnimation />

        {/* OpenCode Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-10"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-6">What about OpenCode?</h2>
          <div className="bg-white rounded-xl border border-[#E6E4E2] overflow-hidden">
            <div className="grid sm:grid-cols-2 p-4 sm:p-6 gap-6 sm:gap-8">
              <div>
                <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-sm">OpenCode</span>
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <span className="text-[#49423D]/80">Great CLI Agent alternative</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <span className="text-[#49423D]/80">Good model selection via API</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <span className="text-[#49423D]/80">Only manages itself</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md overflow-hidden border border-[rgba(55,50,47,0.08)]">
                    <img src="/solhun-logo.png" alt="Solhun" className="w-full h-full object-cover" />
                  </div>
                  Solhun
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <span className="text-[#49423D]/80">Manages <span className="font-medium text-[#37322F]">all CLI Agents</span></span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <span className="text-[#49423D]/80">Also manages Desktop Apps</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <span className="text-[#49423D]/80">One interface for ALL AI tools</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-bold mb-3">Stop juggling terminals. Start managing agents.</h2>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white bg-[#37322F] hover:bg-black rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Get Solhun Now
          </Link>
        </div>
      </div>
    </PageWrapper>
  )
}

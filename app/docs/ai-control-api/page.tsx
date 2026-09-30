import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import type React from "react"
import { PageWrapper } from "../../../components/page-wrapper"

// 이 페이지의 정본은 CLImanger 저장소 docs/architecture/control-api.md(엔드포인트·상태 계약)와
// climanager-session 스킬(SKILL.md, 에이전트용 사용법)이다. 앱이 바뀌면 거기부터 보고 맞춘다.
// 기준: CLI Manager v1.10.0 (2026-09-30 확인)

export const metadata: Metadata = {
  title: "AI Control API",
  description:
    "Let Claude Code, Codex or a script open terminal sessions in CLI Manager, send prompts, wait for them and read the screen — in terminals you can watch and take over. Setup, MCP, REST and safety rules.",
  openGraph: {
    title: "CLI Manager AI Control API — let an AI drive terminals you can watch",
    description:
      "Open sessions, run templates, send prompts and read results over a local, token-protected API. MCP and REST.",
    images: [{ url: "/screenshots/ai-control-session.webp", width: 1920, height: 1200, alt: "AI-controlled session in CLI Manager" }],
  },
  alternates: { canonical: "/docs/ai-control-api" },
}

const DEFAULT_PORT = 47821

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="flex flex-col gap-4 scroll-mt-24">
      <h2 id={`${id}-heading`} className="text-[#37322F] text-2xl sm:text-3xl font-semibold font-sans tracking-tight">
        {title}
      </h2>
      {children}
    </section>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[#605A57] text-base leading-7 font-sans">{children}</p>
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="px-1.5 py-0.5 rounded bg-[#F0EEEC] text-[#37322F] text-[0.9em] font-mono">{children}</code>
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="w-full overflow-x-auto rounded-lg bg-[#1C1B1F] text-[#E7E5E4] text-[13px] leading-6 p-4 font-mono">
      <code>{children}</code>
    </pre>
  )
}

function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-[rgba(55,50,47,0.12)]">
      <table className="w-full text-sm font-sans">
        <thead className="bg-[#F5F5F4] text-left text-[#37322F]">
          <tr>
            {head.map((cell) => (
              <th key={cell} className="px-4 py-2.5 font-semibold whitespace-nowrap">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[#605A57]">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-[rgba(55,50,47,0.08)] align-top">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-2.5 leading-6">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Screenshot({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <figure className="flex flex-col gap-2">
      <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-[rgba(55,50,47,0.12)] bg-[#141418]">
        <Image src={src} alt={alt} fill sizes="(min-width: 896px) 896px, 100vw" className="object-cover object-left-top" />
      </div>
      <figcaption className="text-[#605A57] text-xs font-sans">{caption}</figcaption>
    </figure>
  )
}

const TOC = [
  { id: "overview", label: "What it does" },
  { id: "enable", label: "Turn it on" },
  { id: "mcp", label: "Connect Claude Code (MCP)" },
  { id: "rest", label: "Use it without MCP (REST)" },
  { id: "skill", label: "Agent skill: climanager-session" },
  { id: "states", label: "Session states" },
  { id: "safety", label: "Access and safety rules" },
  { id: "reference", label: "Endpoint reference" },
  { id: "troubleshooting", label: "Troubleshooting" },
]

const CURL_EXAMPLE = `# Address and token come from the discovery file the app writes while the API is on
URL=$(python3 -c "import json,os;print(json.load(open(os.path.expanduser('~/.climanager/control-api.json')))['url'])")
TOKEN=$(python3 -c "import json,os;print(json.load(open(os.path.expanduser('~/.climanager/control-api.json')))['token'])")
H=(-H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json')

curl -s "\${H[@]}" "$URL/v1/templates"                                   # what can I run?
curl -s "\${H[@]}" -d "{\\"path\\":\\"$PWD\\",\\"template\\":\\"claude-code\\",\\"prompt\\":\\"fix the failing test\\"}" \\
     "$URL/v1/sessions"                                                 # open (returns session.id)
curl -s "\${H[@]}" -d '{"timeoutMs":300000}' "$URL/v1/sessions/$ID/wait"  # wait until it is idle
curl -s "\${H[@]}" -d '{"keys":["down","enter"]}' "$URL/v1/sessions/$ID/input"   # answer a question
curl -s "\${H[@]}" -X DELETE "$URL/v1/sessions/$ID"                      # close`

const CLIM_EXAMPLE = `node clim.mjs doctor                  # is the API on? (run this first)
node clim.mjs templates               # what can I run?

node clim.mjs open ~/code/my-project --template claude-code \\
     --name "AI: fix failing test" --prompt "fix the failing test"
node clim.mjs wait last --timeout 300          # wait, then print the screen
node clim.mjs send last "now commit it" --wait 300
node clim.mjs read last --tail --lines 120     # include scrollback
node clim.mjs send last --keys down,enter      # answer a menu with keys
node clim.mjs release last                     # hand it to the user (keeps running)
node clim.mjs close last                       # kill it when you are done`

export default function AiControlApiPage() {
  return (
    <PageWrapper>
      <article className="w-full max-w-4xl mx-auto px-4 md:px-0 pb-20 flex flex-col gap-12">
        <header className="pt-8 pb-8 border-b border-[rgba(55,50,47,0.12)] flex flex-col gap-4">
          <Link href="/docs" className="text-[#605A57] hover:text-[#37322F] text-sm font-sans w-fit">
            ← Docs
          </Link>
          <h1 className="text-4xl md:text-5xl font-serif font-medium text-[#37322F]">AI Control API</h1>
          <p className="text-lg text-[#605A57] font-sans leading-8 max-w-2xl">
            Let an AI open terminal sessions inside CLI Manager, run your templates, send prompts, wait for them and read
            the result — in ordinary terminals you can watch and step into. Available since v1.9.0; off by default.
          </p>
          <nav aria-label="On this page" className="flex flex-wrap gap-2 pt-2">
            {TOC.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="px-3 py-1 rounded-full border border-[rgba(55,50,47,0.12)] text-xs text-[#37322F] font-sans hover:bg-[rgba(55,50,47,0.05)]"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </header>

        <Section id="overview" title="What it does">
          <P>
            Running an agent headless (<Code>claude -p</Code>) means nobody sees what it does until it is done. The AI
            Control API takes the other route: the agent works in a session that appears in your sidebar, in green, with
            an <strong>AI connected</strong> badge in the header. You can read along, type into it, or disconnect the AI
            and keep the session for yourself.
          </P>
          <Screenshot
            src="/screenshots/ai-control-session.webp"
            alt="A session opened through the AI Control API, highlighted in green in the sidebar"
            caption="A session opened through the API. It is a normal terminal — the input went through the same path as your typing."
          />
          <P>
            Everything stays on your machine: the server binds to <Code>127.0.0.1</Code>, requires a bearer token, and
            checks the Host and Origin headers so a web page cannot call it behind your back.
          </P>
        </Section>

        <Section id="enable" title="Turn it on">
          <ol className="list-decimal pl-6 flex flex-col gap-2 text-[#605A57] text-base leading-7 font-sans">
            <li>
              Open <strong>Settings → Agents → AI Control API</strong> and switch on <strong>Enable AI Control API</strong>.
            </li>
            <li>
              The panel shows the real state of the server (for example “Listening on http://127.0.0.1:{DEFAULT_PORT}”),
              the token, and a ready-to-copy connect command. The default port is <Code>{DEFAULT_PORT}</Code>.
            </li>
            <li>
              While it runs, the app writes <Code>~/.climanager/control-api.json</Code> (<Code>url</Code>,{" "}
              <Code>mcpUrl</Code>, <Code>token</Code>, <Code>pid</Code>; file mode 600) so scripts can find it without
              copy-paste. The file is deleted when the app quits.
            </li>
          </ol>
          <Screenshot
            src="/screenshots/settings-ai-control-api.webp"
            alt="Settings, Agents tab, AI Control API section with the enable switch, port, token and MCP command"
            caption="Settings → Agents. Changing the port means re-running the connect command. (This demo instance uses a non-default port.)"
          />
        </Section>

        <Section id="mcp" title="Connect Claude Code (MCP)">
          <P>Run the command from the settings panel once. It registers CLI Manager as an MCP server for your user:</P>
          <CodeBlock>{`claude mcp add --scope user --transport http cli-manager http://127.0.0.1:${DEFAULT_PORT}/mcp \\
  --header "Authorization: Bearer <token>"`}</CodeBlock>
          <P>
            Claude Code then gets these tools: <Code>list_workspaces</Code>, <Code>list_templates</Code>,{" "}
            <Code>list_sessions</Code>, <Code>open_session</Code>, <Code>send_input</Code> (with optional{" "}
            <Code>wait_seconds</Code>), <Code>wait_for_idle</Code>, <Code>read_output</Code>, <Code>focus_session</Code>,{" "}
            <Code>release_session</Code> and <Code>close_session</Code>. Errors come back as tool results the model can
            read, and screen output is plain text.
          </P>
        </Section>

        <Section id="rest" title="Use it without MCP (REST)">
          <P>
            Any script or agent that can make HTTP requests can use the same API. Branch on the HTTP status code, not on
            the message text:
          </P>
          <CodeBlock>{CURL_EXAMPLE}</CodeBlock>
          <Table
            head={["Status", "Meaning", "What to do"]}
            rows={[
              [<Code key="c">409 awaiting_input</Code>, "A question is on screen (permission prompt, folder trust, menu).", "Read the screen, answer with keys — not text."],
              [<Code key="c">403 not_controlled</Code>, "Not a session the API opened, or the user clicked Disconnect AI.", "Stop using that session."],
              [<Code key="c">timedOut: true</Code>, "The wait ended but the session is still busy.", "Not a failure — wait again or report progress."],
            ]}
          />
        </Section>

        <Section id="skill" title="Agent skill: climanager-session">
          <P>
            <Code>climanager-session</Code> is an agent skill built on the REST API. It wraps every call in a small,
            dependency-free Node script (<Code>clim.mjs</Code>) so an agent can drive CLI Manager without any MCP setup,
            and it teaches the agent the safety rules below. A typical run:
          </P>
          <CodeBlock>{CLIM_EXAMPLE}</CodeBlock>
          <P>
            A session can be named by <Code>last</Code>, the first few characters of its id, or part of its name. The
            script reads the discovery file (or <Code>CLIM_URL</Code> and <Code>CLIM_TOKEN</Code>) and reports the result
            as an exit code, so the agent never has to parse prose:
          </P>
          <Table
            head={["Exit code", "Meaning", "Next step"]}
            rows={[
              ["0", "Success", "Continue"],
              ["3", "The screen is waiting on a question or menu", "Read the screen and answer with --keys"],
              ["4", "Session not found, or the user took it back", "Stop using it; open a new one if needed"],
              ["5", "API off or app not running", "Ask the user to enable it in Settings → Agents"],
              ["7", "Wait timed out — still running", "Not a failure; wait again or report"],
              ["2", "Usage error", "Fix the arguments"],
            ]}
          />
          <p className="text-[#605A57] text-sm leading-6 font-sans rounded-lg bg-[#F5F5F4] border border-[rgba(55,50,47,0.08)] px-4 py-3">
            The skill is not in the public repository yet. Everything it does is available through the REST calls above
            and the MCP tools.
          </p>
        </Section>

        <Section id="states" title="Session states">
          <Table
            head={["state", "Meaning"]}
            rows={[
              [<Code key="c">starting</Code>, "The session exists but its terminal has not started yet."],
              [<Code key="c">busy</Code>, "Output in the last 1.5 s, “esc to interrupt” on screen, or a hook reports a running turn."],
              [<Code key="c">idle</Code>, "None of the above."],
              [<Code key="c">exited</Code>, "The terminal process is gone."],
            ]}
          />
          <ul className="list-disc pl-6 flex flex-col gap-2 text-[#605A57] text-base leading-7 font-sans">
            <li>
              <Code>awaitingInput: true</Code> — the bottom of the screen shows a question (permission prompt, folder trust,
              “Enter to confirm · Esc to cancel”), or a hook reported one.
            </li>
            <li>
              <Code>suggestion</Code> — dim text in an otherwise empty input box, such as Claude Code&apos;s next-prompt
              suggestion. Nobody typed it; don&apos;t read it as the user&apos;s instruction.
            </li>
            <li>
              <Code>memo</Code> — the session&apos;s memo pad (⌘J), read-only. Added in v1.10.0.
            </li>
          </ul>
        </Section>

        <Section id="safety" title="Access and safety rules">
          <Table
            head={["The API can", "The API cannot"]}
            rows={[
              ["List workspaces and templates", "Read or type into sessions you opened yourself"],
              ["Open sessions (and register a new folder as a workspace)", "Act on a session after you click Disconnect AI"],
              ["Drive, read, focus, release and close the sessions it opened", "Type text while a question is on screen (unless it passes force)"],
            ]}
          />
          <ul className="list-disc pl-6 flex flex-col gap-2 text-[#605A57] text-base leading-7 font-sans">
            <li>
              <strong>Answer questions with keys.</strong> Enter picks the highlighted option — on a folder-trust dialog
              that can be “No, exit”. The API refuses text while a question is showing.
            </li>
            <li>
              <strong>Trust and permission prompts are your decision.</strong> An agent should only accept them when your
              request was to work in that folder.
            </li>
            <li>
              <strong>Focus only when asked.</strong> Showing a session switches what the app displays and costs you the
              caret in whatever you were typing in, so <Code>focus</Code> is off by default and the window is never raised.
            </li>
            <li>
              <strong>Release instead of close</strong> when the result should stay on screen. Close kills the process.
            </li>
          </ul>
        </Section>

        <Section id="reference" title="Endpoint reference">
          <P>
            All requests need <Code>Authorization: Bearer &lt;token&gt;</Code>. An optional <Code>X-Client-Name</Code>{" "}
            labels who owns the session. Errors look like <Code>{`{ "error": { "code", "message" } }`}</Code>.
          </P>
          <Table
            head={["Method", "Path", "Body / query"]}
            rows={[
              ["GET", <Code key="c">/v1/health</Code>, "—"],
              ["GET", <Code key="c">/v1/workspaces</Code>, <Code key="q">?query=</Code>],
              ["GET", <Code key="c">/v1/templates</Code>, "—"],
              ["GET", <Code key="c">/v1/sessions</Code>, "Sessions under AI control"],
              ["POST", <Code key="c">/v1/sessions</Code>, "path or workspaceId; template or command; name, prompt, focus"],
              ["GET", <Code key="c">/v1/sessions/:id</Code>, "—"],
              ["GET", <Code key="c">/v1/sessions/:id/output</Code>, <Code key="q">?mode=screen|tail&amp;lines=</Code>],
              ["POST", <Code key="c">/v1/sessions/:id/input</Code>, "text, submit (default true), keys[], force"],
              ["POST", <Code key="c">/v1/sessions/:id/wait</Code>, "timeoutMs (≤ 600000), quietMs, lines"],
              ["POST", <Code key="c">/v1/sessions/:id/focus</Code>, "—"],
              ["POST", <Code key="c">/v1/sessions/:id/release</Code>, "Hands the session to you; the API loses access"],
              ["DELETE", <Code key="c">/v1/sessions/:id</Code>, "Kills the terminal and removes the session"],
            ]}
          />
          <P>
            Keys accepted by <Code>input</Code>: a single character, or <Code>enter</Code> <Code>escape</Code>{" "}
            <Code>tab</Code> <Code>shift-tab</Code> <Code>backspace</Code> <Code>space</Code> <Code>up</Code>{" "}
            <Code>down</Code> <Code>left</Code> <Code>right</Code> <Code>ctrl-c</Code> <Code>ctrl-d</Code>{" "}
            <Code>ctrl-l</Code> <Code>ctrl-u</Code>. Long text is typed before Enter with a delay that grows with its
            length, because agent TUIs read a fast Enter as part of a paste; if a prompt is left in the input box, the API
            presses Enter again (up to twice).
          </P>
          <P>
            MCP lives at <Code>POST /mcp</Code> (JSON-RPC 2.0, stateless, protocol versions 2024-11-05 to 2025-11-25).
          </P>
        </Section>

        <Section id="troubleshooting" title="Troubleshooting">
          <Table
            head={["Symptom", "Cause", "Fix"]}
            rows={[
              ["Can't connect", "The app is closed or the switch is off", "Settings → Agents → AI Control API"],
              [<Code key="c">terminalStarted: false</Code>, "The app window is closed (running in the background)", "Open the window — sessions are created by it"],
              [<Code key="c">promptSent: false</Code>, "The program is asking something (often folder trust)", "Read the screen, answer with keys, then send"],
              ["Port already in use", "Another process holds the port", "Pick another port in Settings, then re-run the MCP command"],
              ["Setting is missing", "App older than v1.9.0", "Update CLI Manager"],
            ]}
          />
          <P>
            The design notes, costs and full contract live in the{" "}
            <a
              href="https://github.com/woorichicken/CLI_manager/blob/main/docs/architecture/control-api.md"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-[#37322F]"
            >
              control-api.md
            </a>{" "}
            architecture doc on GitHub.
          </P>
        </Section>
      </article>
    </PageWrapper>
  )
}

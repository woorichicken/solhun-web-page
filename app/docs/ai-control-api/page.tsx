import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import type React from "react"
import { PageWrapper } from "../../../components/page-wrapper"
import { DocsMobileToc, DocsSidebar, type DocsNavGroup } from "./docs-sidebar"
import { ENDPOINT_GROUPS } from "./endpoints"

// 이 페이지의 정본은 CLImanger 저장소 docs/architecture/control-api.md(엔드포인트·상태 계약)와
// climanager-session 스킬(SKILL.md, 에이전트용 사용법)이다. 앱이 바뀌면 거기부터 보고 맞춘다.
// 기준: CLI Manager v1.36.0 · control-api.md origin/main 735a5f8 (2026-11-22 확인)
// 엔드포인트 표(endpoints.ts)가 계약 문서와 같은지는 저장소 scripts/check-control-api-endpoints.mjs 로 센다.

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

// 큰 기능 묶음 → 세부 절. 사이드바(넓은 화면)와 「On this page」(좁은 화면)가 같은 목록을 쓴다.
// id 는 바깥에서 걸린 링크(#mcp 등)가 깨지지 않게 예전 값을 그대로 둔다.
const NAV_GROUPS: DocsNavGroup[] = [
  {
    label: "Get started",
    items: [
      { id: "overview", label: "What it does" },
      { id: "enable", label: "Turn it on" },
      { id: "mcp", label: "Connect Claude Code (MCP)" },
      { id: "rest", label: "Use it without MCP (REST)" },
      { id: "skill", label: "Agent skill" },
    ],
  },
  {
    label: "Drive sessions",
    items: [
      { id: "states", label: "Session states" },
      { id: "input", label: "Sending input" },
      { id: "workspaces", label: "Workspaces" },
      { id: "session-folders", label: "Session folders" },
      { id: "conversations", label: "Agent conversations" },
      { id: "fork", label: "Forking a conversation" },
    ],
  },
  {
    label: "Coordinate agents",
    items: [
      { id: "orchestrators", label: "Master sessions" },
      { id: "related", label: "Related sessions" },
      { id: "inbox", label: "Inbox" },
      { id: "checklists", label: "Checklists" },
      { id: "autocron", label: "Autocron" },
    ],
  },
  {
    label: "Safety & reference",
    items: [
      { id: "safety", label: "Access and safety rules" },
      { id: "reference", label: "Endpoint reference" },
      { id: "troubleshooting", label: "Troubleshooting" },
    ],
  },
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

const CALLER_HEADER_EXAMPLE = `# Inside a CLI Manager terminal every process has its own session id
curl -s "\${H[@]}" -H "X-Caller-Session: $CLIMANAGER_SESSION_ID" ...

# Claude Code .mcp.json — send it with every MCP call
"headers": { "X-Caller-Session": "\${CLIMANAGER_SESSION_ID}" }`

const INBOX_EXAMPLE = `curl -s "\${H[@]}" -H "X-Caller-Session: $CLIMANAGER_SESSION_ID" \\
     -d '{"kind":"login","text":"Sign in to the dashboard, then tell me","url":"https://example.com/login"}' \\
     "$URL/v1/inbox"`

const CHECKLIST_EXAMPLE = `curl -s "\${H[@]}" -H "X-Caller-Session: $CLIMANAGER_SESSION_ID" \\
     -d '{"title":"v1.24 release","project":"my-app","due":"2026-11-03","items":["Build","Publish"]}' \\
     "$URL/v1/checklists"                                          # plan in the header
curl -s "\${H[@]}" -d '{"done":true}' "$URL/v1/checklists/v1.24%20release/items/1"   # check item 1`

const CRON_EXAMPLE = `curl -s "\${H[@]}" -d '{"name":"nightly triage","schedule":"0 2 * * *","mode":"new",
     "agent":"claude","cwd":"/Users/me/code/api","prompt":"triage new issues"}' "$URL/v1/crons"`

function MethodBadge({ method }: { method: string }) {
  return <span className="font-mono text-xs font-semibold text-[#37322F]">{method}</span>
}

export default function AiControlApiPage() {
  return (
    <PageWrapper>
      <div className="w-full max-w-[1060px] mx-auto px-4 md:px-8 pb-20 grid grid-cols-1 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10">
        <DocsSidebar groups={NAV_GROUPS} />

        <article className="min-w-0 flex flex-col gap-12">
          <header className="pt-8 pb-8 border-b border-[rgba(55,50,47,0.12)] flex flex-col gap-4">
            <Link href="/docs" className="text-[#605A57] hover:text-[#37322F] text-sm font-sans w-fit">
              ← Docs
            </Link>
            <h1 className="text-4xl md:text-5xl font-serif font-medium text-[#37322F]">AI Control API</h1>
            <p className="text-lg text-[#605A57] font-sans leading-8 max-w-2xl">
              Let an AI open terminal sessions inside CLI Manager, run your templates, send prompts, wait for them and read
              the result — in ordinary terminals you can watch and step into. Available since v1.9.0; off by default.
            </p>
            <DocsMobileToc groups={NAV_GROUPS} />
          </header>

          {/* ───────── Get started ───────── */}

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
            <P>Claude Code then gets these tools, grouped the same way as this page:</P>
            <Table
              head={["Area", "MCP tools"]}
              rows={[
                [
                  "Sessions",
                  <span key="t">
                    <Code>list_workspaces</Code> <Code>list_templates</Code> <Code>list_sessions</Code>{" "}
                    <Code>open_session</Code> <Code>send_input</Code> <Code>wait_for_idle</Code> <Code>read_output</Code>{" "}
                    <Code>focus_session</Code> <Code>rename_session</Code> <Code>release_session</Code>{" "}
                    <Code>close_session</Code> <Code>unregister_workspace</Code>
                  </span>,
                ],
                [
                  "Folders and relations",
                  <span key="t">
                    <Code>list_session_folders</Code> <Code>create_session_folder</Code> <Code>rename_session_folder</Code>{" "}
                    <Code>delete_session_folder</Code> <Code>move_session_to_folder</Code> <Code>list_session_relations</Code>
                  </span>,
                ],
                [
                  "Conversations",
                  <span key="t">
                    <Code>list_agent_conversations</Code> <Code>connect_agent_conversation</Code> <Code>fork_session</Code>
                  </span>,
                ],
                [
                  "Inbox",
                  <span key="t">
                    <Code>inbox_notify</Code> <Code>inbox_list</Code>
                  </span>,
                ],
                [
                  "Checklists",
                  <span key="t">
                    <Code>checklist_list</Code> <Code>checklist_create</Code> <Code>checklist_update</Code>{" "}
                    <Code>checklist_add_items</Code> <Code>checklist_check</Code> <Code>checklist_remove_item</Code>{" "}
                    <Code>checklist_remove</Code>
                  </span>,
                ],
              ]}
            />
            <P>
              Errors come back as tool results the model can read (<Code>isError: true</Code>), and screen output is plain
              text. Autocron has no MCP tools yet — use REST.
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
                [<Code key="c">409 disconnected</Code>, "You clicked Disconnect AI while the agent was waiting on that session.", "Stop working in that session unless the user asks to continue."],
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
            <P>
              Install it into Claude Code, Codex or any agent that reads skills — the source is on GitHub at{" "}
              <a href="https://github.com/woorichicken/climanager-session" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                woorichicken/climanager-session
              </a>{" "}
              (MIT). Then ask your agent in plain words, for example “open <Code>~/code/api</Code> in CLI Manager with Claude
              Code and have it fix the failing test”.
            </P>
            <CodeBlock>{`npx skills add woorichicken/climanager-session@climanager-session`}</CodeBlock>
          </Section>

          {/* ───────── Drive sessions ───────── */}

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
                <Code>memo</Code> and <Code>memoPages</Code> — the session&apos;s memo pad (⌘J), read-only.{" "}
                <Code>memoPages[0]</Code> is the same text as <Code>memo</Code>.
              </li>
              <li>
                <Code>aiControlled</Code> — the session is marked as AI-driven (green in the sidebar). Set when the API
                opens a session, and the first time it reads, types into, waits on or focuses one.
              </li>
              <li>
                <Code>sessionFolder</Code> — the folder the session sits in (<Code>{`{ id, name }`}</Code>) or{" "}
                <Code>null</Code>. See <a href="#session-folders" className="underline underline-offset-2">Session folders</a>.
              </li>
              <li>
                <Code>orchestrator</Code> and <Code>openedBy</Code> — see{" "}
                <a href="#orchestrators" className="underline underline-offset-2">Master sessions</a>.
              </li>
              <li>
                <Code>sleptMs</Code> (on wait results) — time the machine spent asleep during the wait. It does not count
                against the timeout.
              </li>
            </ul>
          </Section>

          <Section id="input" title="Sending input">
            <P>
              <Code>POST /v1/sessions/:id/input</Code> (MCP <Code>send_input</Code>) types into a session through the same
              path as your keyboard, so a typed <Code>claude</Code> still gets its session id.
            </P>
            <ul className="list-disc pl-6 flex flex-col gap-2 text-[#605A57] text-base leading-7 font-sans">
              <li>
                <Code>text</Code> is typed, then Enter after a delay that grows with its length — agent TUIs read a fast Enter
                as part of a paste. <Code>submit: false</Code> types without Enter.
              </li>
              <li>
                When the program draws an input box (Claude Code does), the API checks that Enter emptied it and presses Enter
                again, up to twice, 3 s apart.
              </li>
              <li>
                Multi-line text goes in as one bracketed paste when the program enabled it (Claude Code does); otherwise each
                newline is sent as Enter.
              </li>
              <li>
                Anything sent within 600 ms of an <Code>escape</Code> key waits out the rest — a terminal reads ESC plus a
                quick character as Alt+character.
              </li>
              <li>
                <Code>keys</Code> run after <Code>text</Code>: a single character, or <Code>enter</Code> <Code>escape</Code>{" "}
                <Code>tab</Code> <Code>shift-tab</Code> <Code>backspace</Code> <Code>space</Code> <Code>up</Code>{" "}
                <Code>down</Code> <Code>left</Code> <Code>right</Code> <Code>ctrl-c</Code> <Code>ctrl-d</Code>{" "}
                <Code>ctrl-l</Code> <Code>ctrl-u</Code>.
              </li>
              <li>
                While a question is on screen, text is refused with <Code>409 awaiting_input</Code> — answer with keys, or
                pass <Code>force: true</Code>.
              </li>
            </ul>
            <P>
              A <Code>prompt</Code> given when you open a session is sent only once the start command is running, the screen
              has been quiet for 2 s and no question is showing. Otherwise the result says <Code>promptSent: false</Code>{" "}
              with a <Code>note</Code> — usually Claude Code asking whether to trust a new folder.
            </P>
          </Section>

          <Section id="workspaces" title="Workspaces">
            <P>
              Opening a session in a folder that is not a workspace yet registers it, filed under a sidebar folder:{" "}
              <Code>folder</Code> on open (an id or a name; a new name creates it; <Code>&quot;&quot;</Code> is the top
              level). Without it, the setting <strong>Sidebar folder for AI workspaces</strong> in Settings → Agents → AI
              Control API decides (default <Code>AI Work</Code>).
            </P>
            <ul className="list-disc pl-6 flex flex-col gap-2 text-[#605A57] text-base leading-7 font-sans">
              <li>
                <Code>ephemeral: true</Code> is for throwaway folders such as <Code>/tmp</Code> or a worktree: the workspace
                is unregistered when its last session closes.
              </li>
              <li>
                <Code>folder</Code> and <Code>ephemeral</Code> apply only when the call registers the folder. On an existing
                workspace they are ignored and <Code>note</Code> says so — the API never moves what you arranged.
              </li>
              <li>
                <Code>DELETE /v1/workspaces/:id</Code> (MCP <Code>unregister_workspace</Code>) removes a workspace the API
                registered from the sidebar. Files on disk are never touched. It is refused for workspaces you added (
                <Code>403 not_ai_registered</Code>) and while the workspace has sessions (<Code>409 has_sessions</Code>) or
                worktrees under it (<Code>409 has_worktrees</Code>).
              </li>
            </ul>
          </Section>

          <Section id="session-folders" title="Session folders">
            <P>
              Sessions can be grouped into folders in the All sessions view. The API reads and arranges the same folders:
              list, create, rename and delete them, and move a session in or out (MCP <Code>list_session_folders</Code>,{" "}
              <Code>create_session_folder</Code>, <Code>rename_session_folder</Code>, <Code>delete_session_folder</Code>,{" "}
              <Code>move_session_to_folder</Code>).
            </P>
            <ul className="list-disc pl-6 flex flex-col gap-2 text-[#605A57] text-base leading-7 font-sans">
              <li>
                A folder is named by id first, then by name (case ignored). A name two folders share is{" "}
                <Code>409 ambiguous_folder</Code>.
              </li>
              <li>
                <Code>POST /v1/sessions</Code> takes <Code>sessionFolder</Code>; a name no folder has creates it.
              </li>
              <li>Deleting a folder keeps its sessions open — only their membership goes.</li>
              <li>Moving a session is a label change: it does not set the AI mark or relate any sessions.</li>
            </ul>
          </Section>

          <Section id="conversations" title="Agent conversations">
            <P>
              The same list as the session menu in the app: the Claude Code and Codex conversations that belong to a
              session&apos;s folder, and a way to connect one of them to the session.
            </P>
            <ul className="list-disc pl-6 flex flex-col gap-2 text-[#605A57] text-base leading-7 font-sans">
              <li>
                <Code>GET /v1/sessions/:id/conversations</Code> (MCP <Code>list_agent_conversations</Code>) — up to 30,
                most recently changed first, each with its first message masked and folded to one line, and{" "}
                <Code>linkedTo</Code> when another session already holds it.
              </li>
              <li>
                <Code>POST /v1/sessions/:id/conversation</Code> (MCP <Code>connect_agent_conversation</Code>) with{" "}
                <Code>agent</Code>, <Code>id</Code> and optional <Code>resume</Code> and <Code>force</Code>.
              </li>
              <li>
                <Code>resume: true</Code> types the resume command but never presses Enter. Read the screen first, then send{" "}
                <Code>{`keys: ["enter"]`}</Code> yourself.
              </li>
              <li>
                It refuses rather than overwrite anything: a different folder (<Code>409 cwd_mismatch</Code>), a
                conversation held by another session (<Code>409 linked_elsewhere</Code>), an agent already running (
                <Code>409 agent_running</Code>), or a question or text already on the line (<Code>409 awaiting_input</Code>,{" "}
                <Code>409 input_busy</Code>).
              </li>
            </ul>
          </Section>

          <Section id="fork" title="Forking a conversation">
            <P>
              <Code>POST /v1/sessions/:id/fork</Code> (MCP <Code>fork_session</Code>) is the Chat view&apos;s{" "}
              <strong>Fork</strong> button for an AI: a new session that continues the conversation, opened in the background
              in the same workspace and session folder and named <Code>&lt;name&gt; · fork</Code>. An agent should only fork
              when you explicitly ask to split a conversation.
            </P>
            <ul className="list-disc pl-6 flex flex-col gap-2 text-[#605A57] text-base leading-7 font-sans">
              <li>
                <Code>scope: &quot;whole&quot;</Code> (default) uses the agent&apos;s own fork — Claude Code{" "}
                <Code>--resume &lt;id&gt; --fork-session</Code>, Codex <Code>fork &lt;id&gt;</Code>.
              </li>
              <li>
                <Code>scope: &quot;excerpt&quot;</Code> starts fresh and sends the last turns up to the chosen reply (at most
                six, secrets masked), followed by <Code>message</Code>.
              </li>
              <li>
                <Code>message</Code> is typed once the agent is up; <Code>messageSent: false</Code> with a <Code>note</Code>{" "}
                when it could not go in. <Code>turnIndex</Code> picks the reply (default: the latest).
              </li>
              <li>
                Errors: <Code>409 no_conversation</Code>, <Code>409 turn_changed</Code>, <Code>413 too_large</Code>.
              </li>
            </ul>
          </Section>

          {/* ───────── Coordinate agents ───────── */}

          <Section id="orchestrators" title="Master sessions">
            <P>
              An agent that runs inside a CLI Manager terminal and opens other sessions through the API is an orchestrator.
              Every terminal starts with its own id in <Code>CLIMANAGER_SESSION_ID</Code>; the agent copies it into the{" "}
              <Code>X-Caller-Session</Code> header (REST and MCP alike). When a request carrying that header opens a session,
              the caller becomes a master session — drawn in rose with a crown in the sidebar.
            </P>
            <CodeBlock>{CALLER_HEADER_EXAMPLE}</CodeBlock>
            <ul className="list-disc pl-6 flex flex-col gap-2 text-[#605A57] text-base leading-7 font-sans">
              <li>The header is self-reported, so it is a display hint, never a permission.</li>
              <li>
                The mark ends when the master&apos;s shell exits, the session is closed, 30 minutes pass without a request
                carrying its id, or the API is switched off. It is kept in memory only — an app restart clears it.
              </li>
              <li>
                Every session carries <Code>orchestrator</Code> (<Code>since</Code>, <Code>lastSeen</Code>,{" "}
                <Code>client</Code>, <Code>openedCount</Code>) and <Code>openedBy</Code>.
              </li>
            </ul>
          </Section>

          <Section id="related" title="Related sessions">
            <P>
              The session header&apos;s <strong>Related</strong> dialog lists the sessions that belong together. The API
              fills it from the same header: <Code>opened</Code> when the caller opens a session, <Code>connected</Code> the
              first time it types into one it did not open (input, connecting a conversation, a fork). Reading, waiting and
              focusing relate nothing.
            </P>
            <ul className="list-disc pl-6 flex flex-col gap-2 text-[#605A57] text-base leading-7 font-sans">
              <li>
                Relations survive restarts; closing either session deletes the pair. You can add pairs by hand and remove any
                of them — a removed pair stays removed.
              </li>
              <li>
                <Code>GET /v1/sessions/:id/relations</Code> (MCP <Code>list_session_relations</Code>) lists them with their
                kind (<Code>opened</Code>, <Code>connected</Code>, <Code>manual</Code>) and direction.
              </li>
              <li>
                <Code>DELETE /v1/sessions/:id?handTo=&lt;id&gt;</Code> copies the closing session&apos;s Related pairs to
                another session first — for handing work to a successor.
              </li>
            </ul>
          </Section>

          <Section id="inbox" title="Inbox">
            <P>
              A session that needs your hands — a browser sign-in an agent cannot do, a result to look at, a question —
              sends a request. It waits in the app&apos;s inbox (the bell in the sidebar header, with the unread count also on
              the Dock icon) until you check it off.
            </P>
            <CodeBlock>{INBOX_EXAMPLE}</CodeBlock>
            <ul className="list-disc pl-6 flex flex-col gap-2 text-[#605A57] text-base leading-7 font-sans">
              <li>
                <Code>kind</Code> is <Code>login</Code>, <Code>review</Code>, <Code>question</Code> or <Code>other</Code>{" "}
                (the default). <Code>text</Code> is required and cut at 200 characters; <Code>url</Code> is optional.
              </li>
              <li>
                The session is <Code>sessionId</Code> in the body or the <Code>X-Caller-Session</Code> header (MCP{" "}
                <Code>inbox_notify</Code>). Sending does not mark the session as AI-driven.
              </li>
              <li>The same unread request sent again moves to the top instead of repeating.</li>
              <li>
                Showing the session or opening the link does not mark it read. You check it off, or the sender calls{" "}
                <Code>POST /v1/inbox/:id/read</Code> once it solved the problem itself.
              </li>
              <li>There is no sound or system notification — twenty sessions asking at once would be noise.</li>
            </ul>
          </Section>

          <Section id="checklists" title="Checklists">
            <P>
              Titled lists with an optional deadline, usually for one project, shown as a chip in the main header (⌘⇧J). A
              lead agent keeps its plan there instead of in a reply that scrolls away, and whoever finishes an item checks
              it. A checklist belongs to no session.
            </P>
            <CodeBlock>{CHECKLIST_EXAMPLE}</CodeBlock>
            <ul className="list-disc pl-6 flex flex-col gap-2 text-[#605A57] text-base leading-7 font-sans">
              <li>A checklist is named by id or title; an item by its number from 1 or its id.</li>
              <li>Creating one with the title of an open checklist reuses it and adds the items it lacks.</li>
              <li>
                <Code>due</Code> is a local date (<Code>YYYY-MM-DD</Code>) and <Code>overdue</Code> is computed on your Mac.{" "}
                <Code>project</Code> is a workspace id, name or path.
              </li>
              <li>
                At most 100 checklists with 100 items each — more is refused (<Code>409 too_many</Code>), never trimmed.
              </li>
              <li>
                MCP: <Code>checklist_list</Code>, <Code>checklist_create</Code>, <Code>checklist_update</Code>,{" "}
                <Code>checklist_add_items</Code>, <Code>checklist_check</Code>, <Code>checklist_remove_item</Code>,{" "}
                <Code>checklist_remove</Code>.
              </li>
            </ul>
          </Section>

          <Section id="autocron" title="Autocron">
            <P>
              Jobs CLI Manager starts on a schedule, shown in the Loop window&apos;s <strong>Autocron</strong> tab. REST
              only for now — there are no MCP tools for it yet.
            </P>
            <CodeBlock>{CRON_EXAMPLE}</CodeBlock>
            <ul className="list-disc pl-6 flex flex-col gap-2 text-[#605A57] text-base leading-7 font-sans">
              <li>
                <Code>mode: &quot;new&quot;</Code> opens a session in <Code>cwd</Code> with an <Code>agent</Code> command or a
                saved <Code>template</Code> and types <Code>prompt</Code>. <Code>mode: &quot;attach&quot;</Code> types{" "}
                <Code>prompt</Code> into a running Loop Dashboard project (<Code>loopProjectId</Code>).
              </li>
              <li>
                <Code>schedule</Code> is a five-field cron in your Mac&apos;s local time, or <Code>@hourly</Code>{" "}
                <Code>@daily</Code> <Code>@weekly</Code> <Code>@monthly</Code>.
              </li>
              <li>
                Runs missed while the Mac was off, asleep or the app was closed fold into one decision per job:{" "}
                <Code>once</Code> (the default — run once if within <Code>withinMinutes</Code>, 360 unless set),{" "}
                <Code>skip</Code> or <Code>notify</Code>.
              </li>
              <li>A job made over the API runs only while the Control API is switched on.</li>
              <li>
                Sessions a job opens are marked AI-driven with the client <Code>autocron</Code>.
              </li>
            </ul>
          </Section>

          {/* ───────── Safety & reference ───────── */}

          <Section id="safety" title="Access and safety rules">
            <Table
              head={["The API can", "The API cannot"]}
              rows={[
                ["List workspaces, templates and sessions", "Do anything while the API is switched off (the default)"],
                ["Open sessions (and register a new folder as a workspace)", "Type text while a question is on screen (unless it passes force)"],
                ["Read, type into, rename, focus, release and close any session — including ones you opened", "Keep waiting on a session after you click Disconnect AI"],
                ["Unregister a workspace it registered, once it has no sessions", "Unregister, move or re-flag a workspace you added"],
              ]}
            />
            <P>
              Since v1.11.0 the API reaches every session in the app while it is switched on, not only the ones it
              opened. A session turns green the first time an agent works in it, so you can see where it is. Disconnect
              AI stops an agent that is waiting on that session; to end access altogether, switch the API off in
              Settings → Agents.
            </P>
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
              labels who owns the session, and <Code>X-Caller-Session</Code> says which session is calling. Errors look like{" "}
              <Code>{`{ "error": { "code", "message" } }`}</Code>. MCP lives at <Code>POST /mcp</Code> (JSON-RPC 2.0,
              stateless, protocol versions 2024-11-05 to 2025-11-25).
            </P>
            {ENDPOINT_GROUPS.map((group) => (
              <div key={group.id} id={group.id} className="flex flex-col gap-3 scroll-mt-24">
                <h3 className="text-[#37322F] text-lg font-semibold font-sans">{group.title}</h3>
                <Table
                  head={["Method", "Path", "Body / query / result"]}
                  rows={group.endpoints.map((endpoint) => [
                    <MethodBadge key="m" method={endpoint.method} />,
                    <Code key="p">{endpoint.path}</Code>,
                    endpoint.detail,
                  ])}
                />
              </div>
            ))}
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
      </div>
    </PageWrapper>
  )
}

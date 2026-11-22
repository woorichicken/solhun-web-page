// AI Control API 엔드포인트 표 — 기능 묶음별. 정본은 CLImanger docs/architecture/control-api.md 의 REST·Autocron·
// Agent conversations 표다. method·path 집합이 그 문서와 같은지는 scripts/check-control-api-endpoints.mjs 로 확인한다.

export type Endpoint = { method: "GET" | "POST" | "DELETE"; path: string; detail: string }
export type EndpointGroup = { id: string; title: string; endpoints: Endpoint[] }

export const ENDPOINT_GROUPS: EndpointGroup[] = [
  {
    id: "ref-basics",
    title: "Basics",
    endpoints: [
      { method: "GET", path: "/v1/health", detail: "{ ok, app, version }" },
      { method: "GET", path: "/v1/templates", detail: "Saved templates: { id, name, command, description }[]" },
    ],
  },
  {
    id: "ref-workspaces",
    title: "Workspaces",
    endpoints: [
      { method: "GET", path: "/v1/workspaces", detail: "?query= — with registeredBy (ai | user), session counts and sidebar folder" },
      { method: "DELETE", path: "/v1/workspaces/:id", detail: "Unregisters a workspace the API registered (files untouched)" },
    ],
  },
  {
    id: "ref-sessions",
    title: "Sessions",
    endpoints: [
      { method: "GET", path: "/v1/sessions", detail: "?scope=ai|all (default ai) &query=" },
      {
        method: "POST",
        path: "/v1/sessions",
        detail: "path or workspaceId; template or command; name, prompt, focus; folder, ephemeral, sessionFolder",
      },
      { method: "GET", path: "/v1/sessions/:id", detail: "The session" },
      { method: "GET", path: "/v1/sessions/:id/output", detail: "?mode=screen|tail&lines=" },
      { method: "POST", path: "/v1/sessions/:id/input", detail: "text, submit (default true), keys[], force" },
      { method: "POST", path: "/v1/sessions/:id/wait", detail: "timeoutMs (≤ 600000), quietMs, lines → output + timedOut, waitedMs, sleptMs" },
      { method: "POST", path: "/v1/sessions/:id/focus", detail: "Shows it in the app; the window is never raised" },
      { method: "POST", path: "/v1/sessions/:id/rename", detail: "name (up to 80 characters)" },
      { method: "POST", path: "/v1/sessions/:id/release", detail: "Hands the session to you and clears the AI mark" },
      { method: "DELETE", path: "/v1/sessions/:id", detail: "Kills the terminal — any session. ?handTo=<id> copies its Related pairs first" },
    ],
  },
  {
    id: "ref-folders",
    title: "Session folders and relations",
    endpoints: [
      { method: "GET", path: "/v1/session-folders", detail: "{ folders: [{ id, name, createdAt, sessions }] }" },
      { method: "POST", path: "/v1/session-folders", detail: "name — an existing name returns that folder (created: false)" },
      { method: "POST", path: "/v1/session-folders/:folder/rename", detail: "name" },
      { method: "DELETE", path: "/v1/session-folders/:folder", detail: "Sessions stay open; only membership goes" },
      { method: "POST", path: "/v1/sessions/:id/session-folder", detail: "folder: id or name, or null to take it out" },
      { method: "GET", path: "/v1/sessions/:id/relations", detail: "Related sessions with kind (opened | connected | manual) and direction" },
    ],
  },
  {
    id: "ref-conversations",
    title: "Conversations",
    endpoints: [
      { method: "GET", path: "/v1/sessions/:id/conversations", detail: "Claude Code and Codex conversations for the session's folder (up to 30)" },
      { method: "POST", path: "/v1/sessions/:id/conversation", detail: "agent, id, resume?, force? — connects one to the session" },
      { method: "POST", path: "/v1/sessions/:id/fork", detail: "scope (whole | excerpt), message, quote, turnIndex → 201 { session, messageSent }" },
    ],
  },
  {
    id: "ref-inbox",
    title: "Inbox",
    endpoints: [
      { method: "POST", path: "/v1/inbox", detail: "kind, text, url; sessionId or the X-Caller-Session header" },
      { method: "GET", path: "/v1/inbox", detail: "?unread=1 → { unreadCount, requests[] }, newest first" },
      { method: "POST", path: "/v1/inbox/:id/read", detail: "Marks one request read" },
    ],
  },
  {
    id: "ref-checklists",
    title: "Checklists",
    endpoints: [
      { method: "GET", path: "/v1/checklists", detail: "?status=open|done|all (default open) &project=" },
      { method: "POST", path: "/v1/checklists", detail: "title, items?, due?, project? — an open checklist of that title is reused" },
      { method: "GET", path: "/v1/checklists/:checklist", detail: "By id or title" },
      { method: "POST", path: "/v1/checklists/:checklist", detail: "title, due, project (null clears)" },
      { method: "DELETE", path: "/v1/checklists/:checklist", detail: "Removes the checklist" },
      { method: "POST", path: "/v1/checklists/:checklist/items", detail: "items (string or list) or text — known text is skipped" },
      { method: "POST", path: "/v1/checklists/:checklist/items/:item", detail: "done and/or text; item by number from 1 or id" },
      { method: "DELETE", path: "/v1/checklists/:checklist/items/:item", detail: "Removes the item" },
    ],
  },
  {
    id: "ref-autocron",
    title: "Autocron",
    endpoints: [
      { method: "GET", path: "/v1/crons", detail: "{ crons, runs } — each job with nextRunAt, lastRun, problem" },
      {
        method: "POST",
        path: "/v1/crons",
        detail: "name, schedule, mode?, agent? | template?, cwd?, loopProjectId?, prompt, missed?, enabled?, runNow?",
      },
      { method: "GET", path: "/v1/crons/:cron", detail: "By id or name" },
      { method: "POST", path: "/v1/crons/:cron", detail: "Only the fields that change" },
      { method: "DELETE", path: "/v1/crons/:cron", detail: "Deletes the job and its runs" },
      { method: "GET", path: "/v1/crons/:cron/runs", detail: "Runs, newest first" },
      { method: "POST", path: "/v1/crons/:cron/run", detail: "Run now" },
      { method: "POST", path: "/v1/crons/:cron/pause", detail: "enabled → false" },
      { method: "POST", path: "/v1/crons/:cron/resume", detail: "enabled → true" },
    ],
  },
]

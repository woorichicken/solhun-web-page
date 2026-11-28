// 데모 인스턴스 라이브러리 — 격리된 프로필로 CLI Manager 를 띄운다(창은 숨김, 포커스 안 뺏음).
// brand/climanager-demo + climanager-ai-orchestrator 의 demo-app.mjs 를 합쳐 이 작업에 맞게 줄인 것.
// 격리: CLIMANGER_TEST_USERDATA(설정) · HOME/ZDOTDIR(셸·~/.claude) · CLIMANAGER_HOME(Control API 발견 파일).
// 사용자 앱(47821)은 건드리지 않는다 — 47861~47899 의 빈 포트를 쓴다. Claude 계정은 쓰지 않는다.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import crypto from 'node:crypto';
import net from 'node:net';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

export const CLIM_ROOT = process.env.CLIM_ROOT ?? path.join(os.homedir(), 'Downloads/CLImanger');
export const DEMO_ROOT = '/private/tmp/acme-shots';
const require = createRequire(path.join(CLIM_ROOT, 'package.json'));
const { _electron: electron } = require('@playwright/test');

const P = (n) => path.join(DEMO_ROOT, 'projects', n);
const HOME = path.join(DEMO_ROOT, 'home');
const DEMO_BIN = path.join(DEMO_ROOT, 'bin');
const T0 = 1700000000000;

export const FOLDERS = [
  { id: 'f-client', name: 'Client · Acme', isExpanded: true, createdAt: T0 },
  { id: 'f-side', name: 'Side projects', isExpanded: true, createdAt: T0 + 1 },
];

const WT_PATH = path.join(DEMO_ROOT, 'projects', 'payments-api-worktrees', 'feat-webhook-retry');
// Chat view 용 세션 — 가짜 Claude Code 대화(아래 TRANSCRIPT)를 REST 로 이어 붙인다(linkChat). 실제 claude 는 안 띄운다.
export const CHAT_SESSION_ID = 's-wt-claude';
const CHAT_CONVERSATION_ID = '7f3c2a10-5b4e-4c1d-9a8e-2d6f0b1c3e42';
// 탭 줄에 여러 탭이 열려 있게 — 없으면 미리보기 탭 하나만 보인다(v1.38 「session-tab-bar」)
const SESSION_TABS = { ids: ['s-web-dev', 's-web-shell', 's-pay-log', CHAT_SESSION_ID], activeId: 's-web-dev', previewIds: [] };

export const WORKSPACES = [
  { id: 'ws-home', name: 'demo@macbook', path: HOME, isHome: true, sessions: [{ id: 's-home', name: 'Main' }] },
  { id: 'ws-web', name: 'acme-web', path: P('acme-web'), folderId: 'f-client',
    sessions: [
      { id: 's-web-dev', name: 'dev server', initialCommand: 'node server.js' },
      { id: 's-web-shell', name: 'shell', memo: 'Ship checkout redesign\n- fix mobile nav\n- run e2e before merge',
        initialCommand: 'git log --oneline -3' },
    ] },
  { id: 'ws-pay', name: 'payments-api', path: P('payments-api'), folderId: 'f-client',
    sessions: [{ id: 's-pay-log', name: 'git log', initialCommand: 'git log --oneline --graph' }] },
  { id: 'ws-pay-wt', name: 'feat/webhook-retry', path: WT_PATH, folderId: 'f-client', parentWorkspaceId: 'ws-pay',
    branchName: 'feat/webhook-retry', sessions: [{ id: 's-wt', name: 'Main' }, { id: CHAT_SESSION_ID, name: 'Claude · webhook retry' }] },
  { id: 'ws-mobile', name: 'mobile-app', path: P('mobile-app'), folderId: 'f-side', sessions: [{ id: 's-mobile', name: 'shell' }] },
  { id: 'ws-docs', name: 'docs-site', path: P('docs-site'), folderId: 'f-side', sessions: [{ id: 's-docs', name: 'shell' }] },
];

// 가짜 Claude Code 대화 — ~/.claude/projects/<cwd 의 영숫자 아닌 글자를 - 로>/<id>.jsonl 형식(앱 TranscriptReader 가 읽는다)
function transcriptLines() {
  let n = 0;
  let parent = null;
  const at = (i) => new Date(Date.UTC(2026, 10, 27, 9, 12, i * 4)).toISOString();
  const rec = (type, message) => {
    const uuid = `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}`;
    const line = { parentUuid: parent, isSidechain: false, userType: 'external', cwd: WT_PATH, sessionId: CHAT_CONVERSATION_ID,
      version: '2.1.317', gitBranch: 'feat/webhook-retry', uuid, timestamp: at(n), type, message,
      ...(type === 'user' && typeof message.content === 'string' ? { promptSource: 'user', origin: { kind: 'human' } } : {}) };
    parent = uuid;
    return JSON.stringify(line);
  };
  const assistant = (content, stop = 'tool_use') => rec('assistant', { role: 'assistant', model: 'claude-model', content, stop_reason: stop });
  const result = (id, content) => rec('user', { role: 'user', content: [{ type: 'tool_result', tool_use_id: id, content, is_error: false }] });
  return [
    rec('user', { role: 'user', content: 'The ledger sometimes rejects webhook events under load. Add retries with backoff to src/webhooks.ts and run the tests.' }),
    assistant([{ type: 'thinking', thinking: 'Read the handler first, then wrap the post in a bounded retry loop.' }]),
    assistant([{ type: 'tool_use', id: 'toolu_01', name: 'Bash', input: { command: 'cat src/webhooks.ts', description: 'Read the webhook handler' } }]),
    result('toolu_01', WEBHOOK_V1),
    assistant([{ type: 'tool_use', id: 'toolu_02', name: 'Edit', input: { file_path: path.join(WT_PATH, 'src/webhooks.ts'), old_string: WEBHOOK_V1, new_string: WEBHOOK_V2 } }]),
    result('toolu_02', 'The file has been updated.'),
    assistant([{ type: 'tool_use', id: 'toolu_03', name: 'Bash', input: { command: 'pnpm test webhooks', description: 'Run the webhook tests' } }]),
    result('toolu_03', ' ✓ src/webhooks.test.ts (6 tests) 412ms\n\n Test Files  1 passed (1)\n      Tests  6 passed (6)'),
    assistant([{ type: 'text', text: 'Retries are in. The handler now tries the ledger up to `MAX_RETRIES` times with exponential backoff before it gives up.\n\n| file | change |\n| --- | --- |\n| `src/webhooks.ts` | retry loop with `backoff(i)` |\n| `src/webhooks.test.ts` | 2 new cases: recovers, gives up |\n\nAll 6 webhook tests pass. Want me to open a PR?' }], 'end_turn'),
  ].join('\n') + '\n';
}

const GIT = ['-c', 'user.name=demo', '-c', 'user.email=demo@example.com'];
const write = (f, t) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, t); };
const git = (cwd, ...a) => execFileSync('git', [...GIT, ...a], { cwd, stdio: 'ignore' });

const WEBHOOK_V1 = `export async function handleWebhook(event) {
  const res = await post(LEDGER_URL, event);
  if (!res.ok) throw new Error('ledger rejected');
}
`;
const WEBHOOK_V2 = `export async function handleWebhook(event) {
  for (let i = 1; i <= MAX_RETRIES; i++) {
    const res = await post(LEDGER_URL, event);
    if (res.ok) return;
    await sleep(backoff(i));
  }
  throw new Error('ledger rejected');
}
`;
const HISTORY = ['ledger: send payment events', 'refunds: partial refund endpoint', 'auth: rotate signing keys',
  'webhooks: verify stripe signature', 'db: add idempotency keys', 'ci: run contract tests',
  'docs: payment flow diagram', 'fix: currency rounding on invoices'];

function seedFiles() {
  if (DEMO_ROOT !== '/private/tmp/acme-shots') throw new Error('not the demo root');
  fs.rmSync(DEMO_ROOT, { recursive: true, force: true });
  for (const name of ['acme-web', 'payments-api', 'mobile-app', 'docs-site']) {
    const dir = P(name);
    write(path.join(dir, 'README.md'), `# ${name}\n`);
    write(path.join(dir, 'package.json'), JSON.stringify({ name, version: '0.1.0' }) + '\n');
    write(path.join(dir, 'src/index.ts'), "export const hello = () => 'hi'\n");
    if (name === 'acme-web') write(path.join(dir, 'server.js'), `const http = require('http')
const port = 4317
http.createServer((_, res) => res.end('ok')).listen(port, () => {
  console.log(\`\\n  ▲ acme-web dev\\n  - Local:   http://localhost:\${port}\\n  ✓ Ready in 412ms\\n\`)
})
`);
    if (name === 'payments-api') write(path.join(dir, 'src/webhooks.ts'), WEBHOOK_V1);
    execFileSync('git', ['init', '-q', '-b', 'main'], { cwd: dir });
    git(dir, 'add', '-A'); git(dir, 'commit', '-qm', 'init');
    if (name === 'payments-api') {
      for (const m of HISTORY) git(dir, 'commit', '-q', '--allow-empty', '-m', m);
      git(dir, 'worktree', 'add', '-q', '-b', 'feat/webhook-retry', WT_PATH);
      write(path.join(dir, 'src/webhooks.ts'), WEBHOOK_V2); // 미커밋 변경 — Diff 화면용
    }
  }
  write(path.join(HOME, '.zshrc'), "PROMPT='%F{cyan}%1~%f %F{magenta}❯%f '\nRPROMPT=''\n");
  write(path.join(HOME, '.zshenv'), '');
  write(path.join(HOME, '.gitconfig'), '[user]\n\tname = demo\n\temail = demo@example.com\n');
  write(path.join(HOME, '.claude', 'projects', WT_PATH.replace(/[^A-Za-z0-9]/g, '-'), `${CHAT_CONVERSATION_ID}.jsonl`), transcriptLines());
  // 안전장치: 데모 안에서 무엇이 claude·codex 를 부르더라도 실제 에이전트가 아니라 이 가짜가 돈다(PATH 맨 앞)
  for (const name of ['claude', 'codex']) {
    write(path.join(DEMO_BIN, name), `#!/bin/sh\necho "${name} (demo stub) — not started in screenshots"\n`);
    fs.chmodSync(path.join(DEMO_BIN, name), 0o755);
  }
}

async function freePort() {
  for (let p = 47861; p <= 47899; p++) {
    const ok = await new Promise((r) => { const s = net.createServer().once('error', () => r(false)).once('listening', () => s.close(() => r(true))).listen(p, '127.0.0.1'); });
    if (ok) return p;
  }
  throw new Error('no free port');
}

export async function launchDemo() {
  seedFiles();
  const userDataDir = path.join(DEMO_ROOT, 'userdata');
  const climHome = path.join(DEMO_ROOT, 'climanager-home');
  const token = crypto.randomBytes(24).toString('base64url');
  const port = await freePort();
  const config = {
    workspaces: WORKSPACES.map((w, i) => ({
      id: w.id, name: w.name, path: w.path, createdAt: T0 + i,
      ...(w.folderId ? { folderId: w.folderId } : {}), ...(w.isHome ? { isHome: true } : {}),
      ...(w.parentWorkspaceId ? { parentWorkspaceId: w.parentWorkspaceId, branchName: w.branchName } : {}),
      sessions: w.sessions.map((s) => ({ type: 'regular', cwd: w.path, ...s })),
    })),
    folders: FOLDERS,
    sessionTabs: SESSION_TABS,
    playgroundPath: path.join(DEMO_ROOT, 'playground'),
    customTemplates: [
      { id: 't-claude', name: 'Claude Code', icon: 'terminal', description: 'Start Claude Code here', command: 'claude' },
      { id: 't-codex', name: 'Codex', icon: 'code', description: 'Start Codex here', command: 'codex' },
    ],
    controlApiToken: token,
    settings: {
      theme: 'dark', fontSize: 14, defaultShell: 'zsh', defaultEditor: 'vscode', hasCompletedOnboarding: true,
      controlApi: { enabled: true, port },
      portFilter: { enabled: true, minPort: 4317, maxPort: 4317 },
      ignoredPorts: [], ignoredProcesses: [], portActionLogs: [],
    },
  };
  fs.mkdirSync(userDataDir, { recursive: true });
  fs.mkdirSync(climHome, { recursive: true });
  fs.mkdirSync(config.playgroundPath, { recursive: true });
  fs.writeFileSync(path.join(userDataDir, 'config.json'), JSON.stringify(config, null, 2));

  const apiUrl = `http://127.0.0.1:${port}`;
  const app = await electron.launch({
    args: [CLIM_ROOT], // app dir (package.json) so app.getVersion() is the real 1.36.0, not Electron's version
    cwd: DEMO_ROOT,
    env: {
      PATH: `${DEMO_BIN}:${process.env.PATH}`, LANG: 'en_US.UTF-8', TERM: 'xterm-256color', SHELL: '/bin/zsh',
      HOME, ZDOTDIR: HOME, USER: 'demo',
      DISABLE_AUTOUPDATER: '1', CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1',
      CODEX_HOME: path.join(HOME, '.codex'),
      CLIMANGER_TEST_USERDATA: userDataDir, CLIMANGER_TEST_HEADLESS: '1',
      CLIMANAGER_HOME: climHome, CLIMANGER_TERM_DEBUG: '1', VITE_NO_SESSION_RESTORE: 'true',
    },
  });
  const page = await app.firstWindow();
  await page.getByText('acme-web').first().waitFor({ timeout: 30_000 });
  // headers: X-Caller-Session 처럼 부른 쪽을 밝혀야 하는 호출(Related·Master 장면)
  const api = async (method, p, body, headers = {}) => {
    const r = await fetch(apiUrl + p, { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...headers },
      body: body ? JSON.stringify(body) : undefined });
    return r.json();
  };
  for (let i = 0; i < 40; i++) { try { if ((await api('GET', '/v1/health')).ok) break; } catch {} await new Promise((r) => setTimeout(r, 250)); }
  if (!fs.existsSync(path.join(climHome, 'control-api.json'))) { await app.close(); throw new Error('demo API did not start'); }
  return { app, page, pid: app.process().pid, api, port, token };
}

/**
 * 가짜 대화를 Chat 세션에 잇는다 — resume:false 라 아무것도 입력하지 않고 링크만 저장한다.
 * 세션이 셸 프롬프트에 있어야 받아 준다(앞에서 그 세션을 한 번 골라 터미널을 띄워 둔다).
 */
export async function linkChat(api) {
  return api('POST', `/v1/sessions/${CHAT_SESSION_ID}/conversation`, { agent: 'claude', id: CHAT_CONVERSATION_ID, resume: false });
}

// 창 고르기 — Loop 창이 생기면 getAllWindows()[0] 이 메인 창이 아닐 수 있어 주소로 고른다(loop 창은 ?mode=loop)
const pickWindow = ({ BrowserWindow }, mode) =>
  BrowserWindow.getAllWindows().find((w) => (mode === 'loop') === w.webContents.getURL().includes('mode=loop'));

/** 창을 숨긴 채 크기만 맞춘다. 캡처는 webContents.capturePage() — 화면·포커스와 무관. */
export async function sizeWindow(app, width = 1280, height = 800, mode = 'main') {
  await app.evaluate((electron, o) => {
    const pick = new Function('return ' + o.pick)();
    pick(electron, o.mode).setContentSize(o.width, o.height);
  }, { width, height, mode, pick: pickWindow.toString() });
}

export async function capture(app, file, mode = 'main') {
  const b64 = await app.evaluate(async (electron, o) => {
    const pick = new Function('return ' + o.pick)();
    const w = pick(electron, o.mode);
    const img = await w.webContents.capturePage();
    return img.toPNG().toString('base64');
  }, { mode, pick: pickWindow.toString() });
  fs.writeFileSync(file, Buffer.from(b64, 'base64'));
}

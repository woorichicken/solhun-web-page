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
const T0 = 1700000000000;

export const FOLDERS = [
  { id: 'f-client', name: 'Client · Acme', isExpanded: true, createdAt: T0 },
  { id: 'f-side', name: 'Side projects', isExpanded: true, createdAt: T0 + 1 },
];

const WT_PATH = path.join(DEMO_ROOT, 'projects', 'payments-api-worktrees', 'feat-webhook-retry');

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
    branchName: 'feat/webhook-retry', sessions: [{ id: 's-wt', name: 'Main' }] },
  { id: 'ws-mobile', name: 'mobile-app', path: P('mobile-app'), folderId: 'f-side', sessions: [{ id: 's-mobile', name: 'shell' }] },
  { id: 'ws-docs', name: 'docs-site', path: P('docs-site'), folderId: 'f-side', sessions: [{ id: 's-docs', name: 'shell' }] },
];

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
      PATH: process.env.PATH, LANG: 'en_US.UTF-8', TERM: 'xterm-256color', SHELL: '/bin/zsh',
      HOME, ZDOTDIR: HOME, USER: 'demo',
      DISABLE_AUTOUPDATER: '1', CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1',
      CODEX_HOME: path.join(HOME, '.codex'),
      CLIMANGER_TEST_USERDATA: userDataDir, CLIMANGER_TEST_HEADLESS: '1',
      CLIMANAGER_HOME: climHome, CLIMANGER_TERM_DEBUG: '1', VITE_NO_SESSION_RESTORE: 'true',
    },
  });
  const page = await app.firstWindow();
  await page.getByText('acme-web').first().waitFor({ timeout: 30_000 });
  const api = async (method, p, body) => {
    const r = await fetch(apiUrl + p, { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined });
    return r.json();
  };
  for (let i = 0; i < 40; i++) { try { if ((await api('GET', '/v1/health')).ok) break; } catch {} await new Promise((r) => setTimeout(r, 250)); }
  if (!fs.existsSync(path.join(climHome, 'control-api.json'))) { await app.close(); throw new Error('demo API did not start'); }
  return { app, page, pid: app.process().pid, api, port, token };
}

/** 창을 숨긴 채 크기만 맞춘다. 캡처는 webContents.capturePage() — 화면·포커스와 무관. */
export async function sizeWindow(app, width = 1280, height = 800) {
  await app.evaluate(({ BrowserWindow }, o) => {
    const w = BrowserWindow.getAllWindows()[0];
    w.setContentSize(o.width, o.height);
  }, { width, height });
}

export async function capture(app, file) {
  const b64 = await app.evaluate(async ({ BrowserWindow }) => {
    const w = BrowserWindow.getAllWindows()[0];
    const img = await w.webContents.capturePage();
    return img.toPNG().toString('base64');
  });
  fs.writeFileSync(file, Buffer.from(b64, 'base64'));
}

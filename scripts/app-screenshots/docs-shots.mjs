// Capture the in-text screenshots of /docs/ai-control-api (fb-1128 6f6e2f28) from a demo instance.
// Run: CLIM_ROOT=<built CLImanger checkout> heavy-run -- node <site repo>/scripts/app-screenshots/docs-shots.mjs
// Output: <site repo>/public/screenshots/docs/*.webp (1600x1000). SHOTS_OUT=<dir> writes elsewhere.
// Same isolation as shots.mjs: fake projects, separate profile, free API port, no Claude account, windows hidden.
// Nothing runs an agent: the chat is a fake transcript linked with resume:false, crons are scheduled for later.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { launchDemo, sizeWindow, capture, linkChat, CHAT_SESSION_ID, DEMO_ROOT } from './lib.mjs';

const OUT = process.env.SHOTS_OUT ?? path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'public', 'screenshots', 'docs');
const TMP = path.join(DEMO_ROOT, 'png');
// 가이드 본문 폭(최대 896px)의 2배 언저리 — 1600 을 넘기지 않는다
const OUT_SIZE = '1600x1000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });

const { app, page, pid, api } = await launchDemo();
console.log('demo pid', pid);
fs.mkdirSync(TMP, { recursive: true });

async function shot(name, mode = 'main') {
  await sleep(700);
  const png = path.join(TMP, name + '.png');
  await capture(app, png, mode);
  execFileSync('magick', [png, '-resize', `${OUT_SIZE}!`, '-filter', 'Lanczos', path.join(TMP, name + '-r.png')]);
  execFileSync('cwebp', ['-q', '82', '-m', '6', '-quiet', path.join(TMP, name + '-r.png'), '-o', path.join(OUT, name + '.webp')]);
  console.log('shot', name);
}
const select = async (text) => { await page.getByText(text, { exact: true }).first().click(); await sleep(2000); };
const ok = (label, res) => console.log(label, res?.error ? `ERROR ${res.error.code}: ${res.error.message}` : 'ok');
// 바깥을 눌러 팝오버·패널을 닫는다(둘 다 바깥 mousedown 에 닫힌다)
const dismiss = async () => { await page.mouse.click(900, 500); await sleep(500); };

try {
  await sizeWindow(app, 1280, 800);
  await sleep(2500);

  // 1 chat-view — 가짜 Claude Code 대화를 Chat view 로
  await select('Claude · webhook retry');
  ok('chat link', await linkChat(api));
  await sleep(1500);
  await page.getByTestId('view-toggle-chat').first().click();
  await page.getByTestId('chat-turn').first().waitFor({ timeout: 15_000 });
  await sleep(1500);
  await shot('chat-view');

  // 2 inbox — 세 세션이 사람 손이 필요한 일을 보낸 상태
  ok('inbox login', await api('POST', '/v1/inbox', { sessionId: 's-web-dev', kind: 'login',
    text: 'Sign in to the staging dashboard, then tell me', url: 'https://staging.example.com/login' }));
  ok('inbox question', await api('POST', '/v1/inbox', { sessionId: 's-mobile', kind: 'question',
    text: 'Ship the iOS build to TestFlight now, or wait for QA?' }));
  ok('inbox review', await api('POST', '/v1/inbox', { sessionId: CHAT_SESSION_ID, kind: 'review',
    text: 'Webhook retries are in and tests pass — please review the diff' }));
  await sleep(1000);
  await page.locator('[data-testid="inbox-button"][data-inbox-placement="sidebar"]').first().click();
  await page.getByTestId('inbox-popover').waitFor({ timeout: 10_000 });
  await shot('inbox');
  await dismiss();

  // 3 checklists — payments-api 릴리즈 계획, 앞의 둘은 끝남
  const due = new Date(Date.now() + 3 * 86400_000).toISOString().slice(0, 10);
  ok('checklist', await api('POST', '/v1/checklists', { title: 'v2.4 release', project: 'payments-api', due,
    items: ['Merge webhook retries', 'Run contract tests', 'Update the payment flow docs', 'Tag v2.4.0', 'Announce in #payments'] }));
  ok('check 1', await api('POST', '/v1/checklists/v2.4%20release/items/1', { done: true }));
  ok('check 2', await api('POST', '/v1/checklists/v2.4%20release/items/2', { done: true }));
  await select('git log');
  await page.getByTestId('checklist-chip').first().click();
  await page.getByTestId('checklist-panel').waitFor({ timeout: 10_000 });
  await shot('checklists');
  await dismiss();

  // 4 related — Claude 세션이 X-Caller-Session 으로 두 세션을 연다 → master(왕관) + Related 쌍
  const caller = { 'X-Caller-Session': CHAT_SESSION_ID, 'X-Client-Name': 'claude-code' };
  ok('open tests', await api('POST', '/v1/sessions', { workspaceId: 'ws-pay', name: 'AI: contract tests' }, caller));
  ok('open docs', await api('POST', '/v1/sessions', { workspaceId: 'ws-docs', name: 'AI: payment flow docs' }, caller));
  await sleep(2000);
  await select('Claude · webhook retry');
  await page.locator(`[data-related-button="${CHAT_SESSION_ID}"]`).first().click();
  await page.locator(`[data-related-modal="${CHAT_SESSION_ID}"]`).waitFor({ timeout: 10_000 });
  await shot('related');
  await page.keyboard.press('Escape'); await sleep(600);

  // 5 session-folders — All sessions 보기에서 세션을 폴더로 묶은 상태
  const listed = await api('GET', '/v1/sessions?scope=all');
  const sessions = Array.isArray(listed) ? listed : listed.sessions ?? [];
  const idOf = (name) => sessions.find((s) => s.name === name)?.id;
  ok('folder agents', await api('POST', '/v1/session-folders', { name: 'Agents' }));
  ok('folder servers', await api('POST', '/v1/session-folders', { name: 'Servers' }));
  for (const [name, folder] of [['Claude · webhook retry', 'Agents'], ['AI: contract tests', 'Agents'], ['AI: payment flow docs', 'Agents'], ['dev server', 'Servers']]) {
    const id = idOf(name);
    if (id) ok(`move ${name}`, await api('POST', `/v1/sessions/${id}/session-folder`, { folder }));
    else console.log('no session', name);
  }
  await page.getByTestId('sidebar-view-menu').first().click(); await sleep(500);
  await page.locator('[data-testid="sidebar-view-menu-list"] [data-view-option="list"]').first().click();
  await sleep(1500);
  await shot('session-folders');

  // 6 autocron — Loop 창 Autocron 탭. 예약 시각이 캡처 중에 오지 않으므로 아무것도 실행되지 않는다(runNow 없음)
  ok('cron triage', await api('POST', '/v1/crons', { name: 'nightly triage', schedule: '0 2 * * *', mode: 'new', agent: 'claude',
    cwd: path.join(DEMO_ROOT, 'projects', 'payments-api'), prompt: 'Triage new issues and label them' }));
  ok('cron deps', await api('POST', '/v1/crons', { name: 'weekly dependency check', schedule: '0 9 * * 1', mode: 'new', template: 'Codex',
    cwd: path.join(DEMO_ROOT, 'projects', 'acme-web'), prompt: 'Check outdated dependencies and open a PR for safe updates',
    missed: { policy: 'skip', withinMinutes: 360 } }));
  ok('cron report', await api('POST', '/v1/crons', { name: 'morning summary', schedule: '30 8 * * 1-5', mode: 'new', agent: 'claude',
    cwd: path.join(DEMO_ROOT, 'projects', 'docs-site'), prompt: 'Summarize yesterday\'s merged PRs', missed: { policy: 'notify', withinMinutes: 360 } }));
  const loopOpened = app.waitForEvent('window');
  await page.evaluate(() => window.api.openLoopWindow());
  const loop = await loopOpened;
  await loop.waitForLoadState('domcontentloaded');
  await sizeWindow(app, 1280, 800, 'loop');
  await sleep(1500);
  await loop.getByTestId('loop-tab-autocron').click();
  await loop.getByTestId('autocron-item').first().waitFor({ timeout: 10_000 });
  await sleep(1200);
  await shot('autocron', 'loop');
} finally {
  await app.close();
  fs.rmSync(DEMO_ROOT, { recursive: true, force: true });
  console.log('done');
}

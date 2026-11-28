// Recapture the 10 climanager.solhun.com screenshots from the current CLI Manager build.
// Run (from any dir; needs a built ~/Downloads/CLImanger/out/ — CLIM_ROOT overrides):
//   cd ~/Downloads/CLImanger && heavy-run --short -- node <site repo>/scripts/app-screenshots/shots.mjs
// Output: <site repo>/public/screenshots/*.webp (1920x1200). v1.38: tab bar, View ▾ menu, Chat view (fake transcript). Windows stay hidden, nothing takes focus. Demo root /private/tmp/acme-shots is deleted at the end.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { launchDemo, sizeWindow, capture, linkChat, CHAT_SESSION_ID, DEMO_ROOT } from './lib.mjs';

// 기본은 이 저장소의 public/screenshots 를 덮는다. 먼저 다른 곳에 받아 보려면 SHOTS_OUT=<폴더>.
const OUT = process.env.SHOTS_OUT ?? path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'public', 'screenshots');
const TMP = path.join(DEMO_ROOT, 'png');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
fs.mkdirSync(OUT, { recursive: true });

const { app, page, pid, api } = await launchDemo();
console.log('demo pid', pid);
fs.mkdirSync(TMP, { recursive: true });
await sizeWindow(app, 1280, 800);

async function shot(name) {
  await page.mouse.move(900, 780); // 호버 흔적 제거 (호버가 요점인 컷은 호출 전에 다시 움직인다)
  await sleep(700);
  const png = path.join(TMP, name + '.png');
  await capture(app, png);
  execFileSync('magick', [png, '-resize', '1920x1200!', '-filter', 'Lanczos', path.join(TMP, name + '-r.png')]);
  execFileSync('cwebp', ['-q', '82', '-m', '6', '-quiet', path.join(TMP, name + '-r.png'), '-o', path.join(OUT, name + '.webp')]);
  console.log('shot', name);
}
// v1.38 부터 버튼 title 끝에 단축키가 붙는다(「Session Memo (⌘J)」) — 앞부분으로 찾는다
const btn = (title) => page.locator(`button[title^="${title}"]`).first();
const select = async (text, nth = 0) => { await page.getByText(text, { exact: true }).nth(nth).click(); await sleep(2500); };

await sleep(2500);
// 1 dev-server: 열린 탭 줄 + 돌고 있는 dev 서버와 아래 포트 막대(갤러리 Port Manager)
await select('dev server');
await shot('dev-server');
// 1b worktree-sidebar: 워크트리(feat/webhook-retry)의 세션 — 사이드바에서 워크트리가 제 작업공간으로 보인다
await page.getByText('Main', { exact: true }).nth(1).click(); await sleep(2500);
await shot('worktree-sidebar');
// 2 app-dashboard: 탭 줄 + Claude Code 세션의 Chat view(가짜 대화 — 실제 claude 는 안 띄운다)
await select('Claude · webhook retry');
const linked = await linkChat(api);
console.log('chat link', linked.error?.code ?? 'ok');
await sleep(1500);
await page.getByTestId('view-toggle-chat').first().click();
await page.getByTestId('chat-turn').first().waitFor({ timeout: 15_000 });
await sleep(1500);
await shot('app-dashboard');
// 3 session-memo (acme-web 의 shell = 첫 'shell')
await select('shell', 0);
await btn('Session Memo').click(); await sleep(1200);
await shot('session-memo');
await page.keyboard.press('Escape'); await sleep(300);
// 4 git-panel
await select('git log');
await btn('Source Control').click(); await sleep(2500);
await shot('git-panel');
await page.mouse.click(500, 400); await sleep(800); // 패널 뒤 backdrop 클릭 = 닫기
// 5 diff-review
await btn('Review Diff').click(); await sleep(2500);
await shot('diff-review');
await page.keyboard.press('Escape'); await sleep(600);

// 6 AI 가 Control API 로 연 세션 — 무해한 셸 명령만 입력한다(Claude 계정 미사용)
const opened = await api('POST', '/v1/sessions', { workspaceId: 'ws-pay', name: 'AI: review webhook retry' });
const sid = opened.session?.id ?? opened.id;
console.log('ai session', sid, opened.error ?? '');
await sleep(2500);
for (const t of ['git status --short', 'git diff --stat && git log --oneline -3']) {
  await api('POST', `/v1/sessions/${sid}/input`, { text: t }); await sleep(1200);
}
await page.getByText('AI: review webhook retry').first().click(); await sleep(2500);
await shot('ai-control-session');
// 7 playground: New Playground 호버
await page.getByText('New Playground', { exact: true }).first().hover(); await sleep(700); // shot() 은 마우스를 치우므로 호버 컷은 직접 캡처
{
  const png = path.join(TMP, 'playground.png'); await capture(app, png);
  execFileSync('magick', [png, '-resize', '1920x1200!', '-filter', 'Lanczos', path.join(TMP, 'pg-r.png')]);
  execFileSync('cwebp', ['-q', '82', '-m', '6', '-quiet', path.join(TMP, 'pg-r.png'), '-o', path.join(OUT, 'playground.webp')]);
  console.log('shot playground');
}
// 8·9 Settings > Agents
await btn('Settings').click(); await sleep(1200);
await page.getByText('Agents', { exact: true }).first().click(); await sleep(1500);
await shot('settings-ai-control-api');
await page.evaluate(() => {
  const els = [...document.querySelectorAll('*')].filter((e) => e.scrollHeight > e.clientHeight + 50 && /auto|scroll/.test(getComputedStyle(e).overflowY));
  const el = els.sort((a, b) => b.scrollHeight - a.scrollHeight).find((e) => e.textContent.includes('AI Control API')) ?? els[0];
  el.scrollTop = el.scrollHeight;
});
await sleep(800);
await shot('settings-agents-lower');

await app.close();
fs.rmSync(DEMO_ROOT, { recursive: true, force: true });
console.log('done');

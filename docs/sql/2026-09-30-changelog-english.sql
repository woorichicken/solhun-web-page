-- changelogs 테이블 영어화 + 빠진 버전 보충 — **적용 전 사람 승인 필요** (운영 DB)
--
-- 왜: 사이트는 영어인데 v1.7.0 이후 항목(id 26~30)이 한국어로 들어가 /changelog 에서 섞여 보인다.
--     또 git 태그는 있는데 DB 에 없는 버전(v1.0.34·v1.0.35·v1.0.36·v1.3.2·v1.4.3·v1.5.0)이 있다.
-- 근거: 2026-09-30 운영 DB 읽기 전용 SELECT 로 확인한 행 + CLImanger 저장소 태그·커밋·GitHub 릴리즈.
-- 성격: 멱등. UPDATE 는 id+version 이 둘 다 맞을 때만, INSERT 는 같은 version 이 없을 때만 들어간다.
--       /changelog 는 created_at 내림차순이라 보충 행은 태그 시각(앞뒤 버전 사이)으로 넣는다.
-- 적용: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f docs/sql/2026-09-30-changelog-english.sql
-- 되돌리기: 번역 전 원문은 이 파일 맨 아래 주석(롤백용 한국어 원문)에 있다.

BEGIN;

-- ── 1. 한국어 → 영어 (id 26~30) ─────────────────────────────────────────

UPDATE changelogs SET
  title = 'Sidebar Folder Ordering & Steadier AI Sessions',
  description = 'Drag sidebar folders into any order, and the AI Control API can now read session memos. Several cases where input from an AI-driven session got lost are fixed.',
  improvements = '[
    {"text": "Drag sidebar folders into any order (kept across restarts)"},
    {"text": "The AI Control API can read a session''s memo (read-only)"},
    {"text": "Screen reads now report Claude Code''s dimmed next-prompt suggestion separately, so it is not mistaken for typed input"}
  ]'::jsonb,
  fixes = '[
    {"text": "The first prompt disappeared when Codex opened a folder for the first time"},
    {"text": "Under heavy load a prompt stayed in the input box without being sent"},
    {"text": "Text sent right after Esc disappeared"},
    {"text": "Quitting a development build made the running app''s API look switched off"}
  ]'::jsonb,
  updated_at = now()
WHERE id = 30 AND version = 'v1.10.0';

UPDATE changelogs SET
  title = 'Session Resume & Focus Fixes',
  description = 'Agent sessions opened from a template or shell alias continue the same conversation after a restart, and the AI no longer takes your keyboard when it shows a session.',
  improvements = '[
    {"text": "Sessions started from a shell alias (e.g. cldy) are tracked too, and resume with the original command after a restart"},
    {"text": "Templates with a setup command in front (e.g. glm-on && cldy) are recognized"}
  ]'::jsonb,
  fixes = '[
    {"text": "A session opened from a template silently started a new conversation after the app restarted"},
    {"text": "When the AI Control API showed a session, the caret you were typing with moved into the agent''s terminal"}
  ]'::jsonb,
  updated_at = now()
WHERE id = 29 AND version = 'v1.9.1';

UPDATE changelogs SET
  title = 'AI Control API',
  description = 'An AI can now open terminal sessions inside CLI Manager, run templates, send prompts and read the results. It does not run somewhere hidden — these are ordinary terminals in the app, so you can watch and step in at any time.',
  improvements = '[
    {"text": "Turn on the AI Control API in Settings > Agents and run the copied Claude Code (MCP) command once to connect. It also works over plain REST, without MCP"},
    {"text": "Sessions opened by an AI are shown in green in the sidebar with an \"AI connected\" badge in the header"},
    {"text": "Right-click a session > Disconnect AI to take it back at any time. The session keeps running; only the AI loses access"},
    {"text": "The AI can only read and type into sessions it opened. Terminals you opened yourself are off-limits"},
    {"text": "Off by default · 127.0.0.1 only · token required · Host/Origin checks"}
  ]'::jsonb,
  fixes = '[
    {"text": "Text input from the AI is refused while a question (folder trust, permission prompt) is on screen — Enter would pick the default option and could exit the agent"},
    {"text": "On a slow-starting shell, the first prompt went to the shell instead of the program"}
  ]'::jsonb,
  updated_at = now()
WHERE id = 28 AND version = 'v1.9.0';

UPDATE changelogs SET
  title = 'Worktree Toggle & Link Fixes',
  description = 'Fixes Reload Worktrees wiping terminal history and Codex links that would not open. Worktrees and terminal file links can now be turned off in Settings.',
  improvements = '[
    {"text": "Hide worktrees — turn them off in Settings > Git and the sidebar worktrees and related menus disappear; the startup worktree scan is skipped too"},
    {"text": "Terminal file links can be switched off entirely in Settings > Editor"},
    {"text": "File paths now open in the editor only on ⌘-click, so clicking in the terminal no longer hands focus to the editor"}
  ]'::jsonb,
  fixes = '[
    {"text": "Reload Worktrees erased all terminal scrollback — deleting a workspace had the same problem"},
    {"text": "Clicking a link printed by Codex did not open the browser"},
    {"text": "Part of an address like https://github.com/... was mistaken for a file path"}
  ]'::jsonb,
  updated_at = now()
WHERE id = 27 AND version = 'v1.8.0';

UPDATE changelogs SET
  title = 'Official Agent Hooks',
  description = 'Session status now comes from events Claude Code and Codex report themselves, instead of guessing from terminal output. Usage-limit meters and in-app diff review ship alongside.',
  improvements = '[
    {"text": "Hook-based status detection — waiting for approval is told apart from \"done\", with an amber marker and a desktop notification"},
    {"text": "Works for the tab you are looking at too (the old method only detected inactive tabs)"},
    {"text": "Existing statusLine and notify settings are chained, not deleted, and restored when you turn the integration off"},
    {"text": "Usage meters — Claude Code 5-hour and weekly limits and the Codex weekly limit, exactly as the provider reports them"},
    {"text": "Per-tool threshold alerts (80% by default) warn you before you hit a limit"},
    {"text": "Diff review — review an agent''s changes from the header button, select lines and send comments with file and line numbers to the terminal"},
    {"text": "Worktrees are compared against their fork point, so uncommitted changes and new files show up"}
  ]'::jsonb,
  fixes = '[
    {"text": "Updates were only checked once at startup, so a long-running app never learned about new versions — now every 6 hours and when the window regains focus"},
    {"text": "The port monitor re-ran lsof for every listening port every 5 seconds — now cached, and the monitor can be turned off in Settings"}
  ]'::jsonb,
  updated_at = now()
WHERE id = 26 AND version = 'v1.7.0';

-- ── 2. DB 에 없던 버전 보충 ──────────────────────────────────────────────
-- 근거는 각 태그 사이 커밋(git log vA..vB). GitHub 릴리즈 노트는 비어 있었다.

INSERT INTO changelogs (version, date, title, description, improvements, fixes, patches, is_featured, created_at, updated_at)
SELECT 'v1.0.34', 'Dec 23, 2025', 'Terminal Scrollbar Sync Fix',
  'Keeps the terminal scrollbar in step with what you see.',
  '[]'::jsonb,
  '[{"text": "The scrollbar position drifted from the visible output after a terminal was resized"}]'::jsonb,
  '[]'::jsonb, false, '2025-12-23T07:37:05Z', now()
WHERE NOT EXISTS (SELECT 1 FROM changelogs WHERE version = 'v1.0.34');

INSERT INTO changelogs (version, date, title, description, improvements, fixes, patches, is_featured, created_at, updated_at)
SELECT 'v1.0.35', 'Dec 23, 2025', 'Scroll Sync After Session Switch',
  'Follow-up to v1.0.34 for switching between sessions.',
  '[]'::jsonb,
  '[{"text": "The terminal scroll position could be out of sync after switching to another session"}]'::jsonb,
  '[]'::jsonb, false, '2025-12-23T12:38:46Z', now()
WHERE NOT EXISTS (SELECT 1 FROM changelogs WHERE version = 'v1.0.35');

INSERT INTO changelogs (version, date, title, description, improvements, fixes, patches, is_featured, created_at, updated_at)
SELECT 'v1.0.36', 'Dec 23, 2025', 'Custom Editor Path Fix',
  'Your custom editor setting now sticks.',
  '[]'::jsonb,
  '[{"text": "A custom editor path was not saved and had to be set again"}]'::jsonb,
  '[]'::jsonb, false, '2025-12-23T14:29:18Z', now()
WHERE NOT EXISTS (SELECT 1 FROM changelogs WHERE version = 'v1.0.36');

-- v1.3.2 는 v1.3.1 과 코드가 같다(git log v1.3.1..v1.3.2 비어 있음) — 재배포본.
-- created_at 은 v1.3.1(01-10) 과 v1.3.3(01-11 22:49Z) 사이로 둬야 목록 순서가 맞다(태그 게시는 01-12 05:52Z).
INSERT INTO changelogs (version, date, title, description, improvements, fixes, patches, is_featured, created_at, updated_at)
SELECT 'v1.3.2', 'Jan 12, 2026', 'Maintenance Release',
  'A re-release of v1.3.1 (terminals start as a login shell, so PATH matches your usual terminal). No other changes.',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, false, '2026-01-11T21:00:00Z', now()
WHERE NOT EXISTS (SELECT 1 FROM changelogs WHERE version = 'v1.3.2');

INSERT INTO changelogs (version, date, title, description, improvements, fixes, patches, is_featured, created_at, updated_at)
SELECT 'v1.4.3', 'Feb 11, 2026', 'Session Counts & Git File Menu',
  'See how many sessions each workspace has, and act on files straight from the Git panel.',
  '[
    {"text": "Optional session count next to each workspace name (Settings > Appearance, off by default); a parent workspace includes its worktrees"},
    {"text": "Right-click a file in the Git panel to open it in your editor or copy its path"},
    {"text": "Report Issue button on the empty screen, with a feedback email setting"}
  ]'::jsonb,
  '[
    {"text": "Cmd+R no longer reloads the app, so it can be used to rename sessions"},
    {"text": "Sidebar drag and drop recovers if a drag gets stuck"},
    {"text": "Reordering sessions and workspaces saves without stutter"}
  ]'::jsonb,
  '[]'::jsonb, false, '2026-02-11T11:42:16Z', now()
WHERE NOT EXISTS (SELECT 1 FROM changelogs WHERE version = 'v1.4.3');

INSERT INTO changelogs (version, date, title, description, improvements, fixes, patches, is_featured, created_at, updated_at)
SELECT 'v1.5.0', 'Apr 8, 2026', 'Open Source Release',
  'CLI Manager is now free and open source under the MIT license.',
  '[
    {"text": "The paid license system is gone — no limits on workspaces, sessions, worktrees or templates"},
    {"text": "Source code, README and contributing guide published on GitHub"}
  ]'::jsonb,
  '[]'::jsonb, '[]'::jsonb, true, '2026-04-08T01:57:33Z', now()
WHERE NOT EXISTS (SELECT 1 FROM changelogs WHERE version = 'v1.5.0');

-- ── 3. 오타 ─────────────────────────────────────────────────────────────
-- v1.3.1 날짜가 "Jan 11, 2025" 로 들어가 있다(created_at 은 2026-01-10, 태그도 2026-01-11).
UPDATE changelogs SET date = 'Jan 11, 2026', updated_at = now()
WHERE id = 14 AND version = 'v1.3.1' AND date = 'Jan 11, 2025';

COMMIT;

-- ── 롤백용 한국어 원문 (2026-09-30 SELECT) ───────────────────────────────
-- 되돌려야 하면 scratch 로 아래 값을 다시 UPDATE 한다. 보충 행은 version 으로 DELETE.
-- id 30 v1.10.0: title '사이드바 폴더 정렬 · AI 세션 안정성'
--   description '사이드바 폴더를 드래그로 정렬할 수 있고, AI Control API가 세션 메모를 읽습니다. AI가 세션을 조작할 때 입력이 사라지던 문제들을 고쳤습니다.'
-- id 29 v1.9.1: title '세션 재개·포커스 수정'
--   description '템플릿(별칭)으로 연 에이전트 세션이 재시작 후에도 대화를 이어가고, AI가 세션을 보여줄 때 키보드를 가져가지 않습니다.'
-- id 28 v1.9.0: title 'AI Control API'
--   description 'AI가 CLI Manager 안에 터미널 세션을 열고 템플릿을 실행하고 프롬프트를 넣고 결과를 읽을 수 있습니다. 보이지 않는 곳에서 도는 게 아니라 앱 안의 평범한 터미널이라, 진행되는 걸 보면서 직접 끼어들 수 있습니다.'
-- id 27 v1.8.0: title 'Worktree Toggle & Link Fixes'
--   description 'Reload Worktrees가 터미널 기록을 지우던 문제와 Codex 링크가 열리지 않던 문제를 고쳤습니다. 워크트리와 터미널 파일 링크는 이제 설정에서 끌 수 있습니다.'
-- id 26 v1.7.0: title 'Official Agent Hooks'
--   description '터미널 출력을 추측하는 대신 Claude Code와 Codex가 직접 알려주는 이벤트로 세션 상태를 판정합니다. 사용량 한도 표시와 앱 안에서의 Diff 리뷰가 함께 들어갔습니다.'
-- improvements/fixes 한국어 원문 전체: docs/sql/2026-09-30-changelog-ko-backup.json

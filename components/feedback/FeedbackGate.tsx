'use client';
// 부착 타입 `url` 관문: `?feedback` 주소나 숨은 링크(`feedback:toggle` 이벤트) → 비밀번호 입력 → 맞으면 이 브라우저에 기억하고 위젯을 불러온다.
// 위젯 코드(feedback-kit)는 통과한 뒤에만 동적 import 한다 — 일반 방문자는 그 청크를 받지도 않는다.
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { isCorrectPassword, isDevFeedbackHost, isFeedbackHost, UNLOCK_STORAGE_KEY, FEEDBACK_PASSWORD_HASH } from '@/lib/feedback-gate';

const FeedbackWidget = lazy(() => import('./FeedbackWidget'));

type Copy = { title: string; hint: string; placeholder: string; submit: string; cancel: string; wrong: string; lock: string };
const COPY: Record<'ko' | 'en', Copy> = {
  ko: { title: '피드백 모드', hint: '비밀번호를 입력하면 이 브라우저에서 피드백 버튼이 켜져요.', placeholder: '비밀번호', submit: '켜기', cancel: '닫기', wrong: '비밀번호가 맞지 않아요.', lock: '피드백 모드 끄기' },
  en: { title: 'Feedback mode', hint: 'Enter the password to show the feedback button in this browser.', placeholder: 'Password', submit: 'Unlock', cancel: 'Close', wrong: 'Wrong password.', lock: 'Turn off feedback mode' },
};

function readUnlocked(): boolean {
  try { return localStorage.getItem(UNLOCK_STORAGE_KEY) === FEEDBACK_PASSWORD_HASH; } catch { return false; }
}

export default function FeedbackGate({ locale }: { locale: 'ko' | 'en' }) {
  const t = COPY[locale];
  const [allowedHost, setAllowedHost] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const host = isFeedbackHost(location.hostname);
    setAllowedHost(host);
    if (!host) return;
    // dev 호스트는 관문 없이 바로 켠다(dev+url). 비밀번호 창·?feedback=off 도 쓰지 않는다.
    if (isDevFeedbackHost(location.hostname)) {
      setUnlocked(true);
      return;
    }
    const already = readUnlocked();
    setUnlocked(already);
    const params = new URLSearchParams(location.search);
    if (params.get('feedback') === 'off') {
      try { localStorage.removeItem(UNLOCK_STORAGE_KEY); } catch {}
      setUnlocked(false);
    } else if (params.has('feedback') && !already) {
      setOpen(true);
    }
    const onOpen = () => (readUnlocked() ? lock() : setOpen(true));
    document.addEventListener('feedback:toggle', onOpen);
    return () => document.removeEventListener('feedback:toggle', onOpen);
  }, []);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  function lock() {
    try { localStorage.removeItem(UNLOCK_STORAGE_KEY); } catch {}
    setUnlocked(false);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = inputRef.current?.value ?? '';
    if (await isCorrectPassword(value)) {
      try { localStorage.setItem(UNLOCK_STORAGE_KEY, FEEDBACK_PASSWORD_HASH); } catch {}
      setUnlocked(true);
      setOpen(false);
      setError('');
    } else {
      setError(t.wrong);
      inputRef.current?.select();
    }
  }

  if (!allowedHost) return null;
  return (
    <>
      {unlocked && (
        <Suspense fallback={null}>
          <FeedbackWidget />
        </Suspense>
      )}
      {open && (
        <div className="fb-gate-backdrop" role="presentation" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <form className="fb-gate" role="dialog" aria-modal="true" aria-labelledby="fb-gate-title" onSubmit={submit}
            onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}>
            <h2 id="fb-gate-title">{t.title}</h2>
            <p>{t.hint}</p>
            <input ref={inputRef} type="password" autoComplete="current-password" placeholder={t.placeholder} aria-invalid={Boolean(error)} data-feedback-password />
            {error && <p className="fb-gate-error" role="alert">{error}</p>}
            <div className="fb-gate-actions">
              <button type="button" onClick={() => setOpen(false)}>{t.cancel}</button>
              <button type="submit" className="primary">{t.submit}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

// 피드백 버튼 관문 — 부착 타입 `url` (feedback-ui-bootstrap/references/attach-types.md).
// 비밀번호를 맞힌 브라우저에만 위젯을 내려준다.
//
// 이건 보안 경계가 아니라 "일반 방문자에게 내부 도구를 안 보이게" 하는 가림막이다.
// 수집 키는 원래 공개(publishable) 값이고 수집처가 origin 허용목록(host_patterns)으로 통제한다.
// 그래서 해시를 번들에 둬도 된다 — 대신 비밀번호는 무작위 24자라 해시로 역산이 사실상 불가능하다.
//
// 아래 세 상수는 손으로 쓰지 않는다: `node <skill>/scripts/url-gate.mjs init <repo> --app climanager-site ...`

export const FEEDBACK_PASSWORD_SALT = 'climanager-site/feedback/v1';
export const FEEDBACK_PASSWORD_HASH = '52df0591b1fe8940592fd7acdb585f20a8a6e7184963684c64a6238f65fde848';
export const UNLOCK_STORAGE_KEY = 'climanager-site:feedback-unlocked';

/** 위젯을 띄워도 되는 호스트. 수집 소스의 host_patterns 와 같게 둔다(여기만 넓히면 보내도 403). */
const FEEDBACK_HOSTS = ["climanager.solhun.com","solhun-web-page.vercel.app","localhost"];
export function isFeedbackHost(hostname: string): boolean {
  return FEEDBACK_HOSTS.includes(hostname);
}

/**
 * 부착 타입 `dev+url` 의 dev 쪽: 이 호스트에선 비밀번호 없이 바로 위젯을 띄운다.
 * 로컬 개발 서버만 둔다 — solhun-web-page.vercel.app 은 운영 빌드가 공개로 서는 주소라 관문 뒤에 둔다.
 */
const DEV_FEEDBACK_HOSTS = ['localhost'];
export function isDevFeedbackHost(hostname: string): boolean {
  return DEV_FEEDBACK_HOSTS.includes(hostname);
}

export async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${FEEDBACK_PASSWORD_SALT}:${password.trim()}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function isCorrectPassword(password: string): Promise<boolean> {
  return (await hashPassword(password)) === FEEDBACK_PASSWORD_HASH;
}

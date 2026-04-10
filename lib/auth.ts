import { kv } from '@vercel/kv';

const SESSION_PREFIX = 'session:internal:';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export const SESSION_COOKIE = 'nl_internal_auth';

export async function createSession(): Promise<string> {
  const token = crypto.randomUUID().replace(/-/g, '');
  await kv.set(`${SESSION_PREFIX}${token}`, 1, { ex: SESSION_TTL_SECONDS });
  return token;
}

export async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const value = await kv.get(`${SESSION_PREFIX}${token}`);
  return value !== null;
}

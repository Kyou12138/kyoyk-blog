import { cookies } from "next/headers";
import { openNoteKey } from "./auth";
import { openWithKey, type SecretPayload } from "./secret";

export const noteCookieName = (postId: string): string => `note_${postId}`;

export const readNoteKey = async (postId: string): Promise<Buffer | null> => {
  const store = await cookies();
  return openNoteKey(store.get(noteCookieName(postId))?.value);
};

/** 有缓存密钥就返回明文，否则 null（页面渲染解锁表单）。 */
export const readPrivateBody = async (
  postId: string,
  secret: SecretPayload,
): Promise<string | null> => {
  const key = await readNoteKey(postId);
  if (!key) return null;
  return openWithKey(secret, key);
};

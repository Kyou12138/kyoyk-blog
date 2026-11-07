import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

export type SecretPayload = {
  ct: string;
  iv: string;
  tag: string;
  salt: string;
  iterations: number;
  hint: string | null;
};

const KEY_LENGTH = 32;
const ITERATIONS = 16384;

export const deriveKey = (password: string, salt: Buffer): Buffer =>
  scryptSync(password.normalize("NFKC"), salt, KEY_LENGTH, {
    N: ITERATIONS,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  });

export const sealWithKey = (plaintext: string, key: Buffer): { ct: string; iv: string; tag: string } => {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return {
    ct: ct.toString("base64"),
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
  };
};

/** 密码错误或密文被改动时返回 null（GCM tag 校验失败）。 */
export const openWithKey = (
  secret: Pick<SecretPayload, "ct" | "iv" | "tag">,
  key: Buffer,
): string | null => {
  try {
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(secret.iv, "base64"));
    decipher.setAuthTag(Buffer.from(secret.tag, "base64"));
    const plaintext = Buffer.concat([decipher.update(Buffer.from(secret.ct, "base64")), decipher.final()]);
    return plaintext.toString("utf8");
  } catch {
    return null;
  }
};

/** 保存私有笔记时使用：密码派生密钥，盐与迭代次数随密文一起入库。 */
export const sealSecret = (plaintext: string, password: string, hint: string | null = null): SecretPayload => {
  const salt = randomBytes(16);
  const sealed = sealWithKey(plaintext, deriveKey(password, salt));
  return { ...sealed, salt: salt.toString("base64"), iterations: ITERATIONS, hint };
};

export const openSecret = (secret: SecretPayload, password: string): string | null =>
  openWithKey(secret, deriveKey(password, Buffer.from(secret.salt, "base64")));

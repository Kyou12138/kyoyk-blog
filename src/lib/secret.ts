import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

/** 私有笔记的密文：只有加密后的三段，密钥由服务端 AUTH_SECRET 派生。 */
export type SecretPayload = { ct: string; iv: string; tag: string };

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

/** 密钥不对或密文被改动时返回 null（GCM tag 校验失败）。 */
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

const bodyKey = (): Buffer => {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 16) {
    throw new Error("缺少 AUTH_SECRET（至少 16 字符），请在环境变量中配置。");
  }
  return createHash("sha256").update(`note-body:${value}`).digest();
};

/** 私有笔记正文用服务端密钥加密存库：库里和备份里都不是明文，登录后台即可解密阅读。 */
export const sealBody = (plaintext: string): SecretPayload => sealWithKey(plaintext, bodyKey());

export const openBody = (payload: SecretPayload): string | null => openWithKey(payload, bodyKey());

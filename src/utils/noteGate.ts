export const STORAGE_PREFIX = "ky-note-unlock:";
export const DEFAULT_PBKDF2_ITERATIONS = 120000;

export type PasswordConfig = {
  password?: string;
  passwordHash?: string;
  passwordSalt?: string;
  passwordIterations?: number | string;
};

type NormalizedConfig = {
  normalizedHash: string | null;
  normalizedSalt: string | null;
  iterations: number;
  hasPassword: boolean;
  hasHash: boolean;
  usePbkdf2: boolean;
  trimmedPassword: string | null;
};

const normalizeHash = (value?: string): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.toLowerCase() : null;
};

const normalizeSalt = (value?: string): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeIterations = (value?: number | string): number | null => {
  if (value === undefined || value === null) return null;
  const parsed =
    typeof value === "string" ? Number(value.trim()) : value;
  if (!Number.isFinite(parsed)) return null;
  const integer = Math.floor(parsed);
  return integer > 0 ? integer : null;
};

export const canUseCrypto = (): boolean => {
  if (typeof window === "undefined") return false;
  if (typeof TextEncoder === "undefined") return false;
  return Boolean(window.crypto && window.crypto.subtle);
};

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const sha256Hex = async (value: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
};

const pbkdf2Hex = async (
  value: string,
  salt: string,
  iterations: number
): Promise<string> => {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(value),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: encoder.encode(salt),
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  return toHex(derivedBits);
};

const normalizeConfig = (config: PasswordConfig): NormalizedConfig => {
  const normalizedHash = normalizeHash(config.passwordHash);
  const normalizedSalt = normalizeSalt(config.passwordSalt);
  const iterations =
    normalizeIterations(config.passwordIterations) ??
    DEFAULT_PBKDF2_ITERATIONS;
  const trimmedPassword = config.password?.trim() ?? null;
  const hasPassword = Boolean(trimmedPassword);
  const hasHash = Boolean(normalizedHash);
  const usePbkdf2 = Boolean(hasHash && normalizedSalt);

  return {
    normalizedHash,
    normalizedSalt,
    iterations,
    hasPassword,
    hasHash,
    usePbkdf2,
    trimmedPassword,
  };
};

export const getStorageKey = (permalink?: string): string =>
  `${STORAGE_PREFIX}${permalink ?? "unknown"}`;

export const getSignatureForConfig = async (
  config: PasswordConfig
): Promise<string | null> => {
  const normalized = normalizeConfig(config);

  if (normalized.hasHash) {
    return normalized.normalizedHash;
  }

  if (normalized.hasPassword) {
    return canUseCrypto()
      ? await sha256Hex(normalized.trimmedPassword!)
      : normalized.trimmedPassword!;
  }

  return null;
};

export const verifyInputPassword = async (
  input: string,
  config: PasswordConfig
): Promise<{ ok: boolean; signature?: string; error?: string }> => {
  const trimmedInput = input.trim();
  if (!trimmedInput) {
    return { ok: false, error: "请输入密码后再解锁。" };
  }

  const normalized = normalizeConfig(config);

  if (!normalized.hasPassword && !normalized.hasHash) {
    return { ok: false, error: "此笔记已标记为加密，但未配置密码。" };
  }

  if (normalized.hasHash) {
    if (!canUseCrypto()) {
      return {
        ok: false,
        error: "当前浏览器不支持安全校验，请更换浏览器。",
      };
    }

    const digest = normalized.usePbkdf2
      ? await pbkdf2Hex(
          trimmedInput,
          normalized.normalizedSalt!,
          normalized.iterations
        )
      : await sha256Hex(trimmedInput);

    if (digest !== normalized.normalizedHash) {
      return { ok: false, error: "密码不正确，请再试一次。" };
    }

    return { ok: true, signature: normalized.normalizedHash! };
  }

  if (normalized.hasPassword) {
    if (trimmedInput !== normalized.trimmedPassword) {
      return { ok: false, error: "密码不正确，请再试一次。" };
    }

    const signature = canUseCrypto()
      ? await sha256Hex(normalized.trimmedPassword!)
      : normalized.trimmedPassword!;
    return { ok: true, signature };
  }

  return { ok: false, error: "此笔记已标记为加密，但未配置密码。" };
};

export const isUnlockedByCache = async (
  config: PasswordConfig,
  permalink?: string
): Promise<boolean> => {
  if (typeof window === "undefined") return false;
  const signature = await getSignatureForConfig(config);
  if (!signature) return false;
  const cached = window.localStorage.getItem(getStorageKey(permalink));
  return cached === signature;
};

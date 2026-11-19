export const SKINS = [
  { id: "gold", label: "原版" },
  { id: "ink", label: "曜石" },
  { id: "paper", label: "纸墨" },
] as const;

export type SkinId = (typeof SKINS)[number]["id"];
export const DEFAULT_SKIN: SkinId = "ink";
export const SKIN_STORAGE_KEY = "kyou-skin";
export const SKIN_MAX_AGE = 365 * 86400;
export const isSkin = (value: unknown): value is SkinId => SKINS.some(({ id }) => id === value);

// Older versions stored the preference only in this browser. Migrate once, before paint.
export const SKIN_BOOT = `try{var key="${SKIN_STORAGE_KEY}",k=localStorage.getItem(key);if(${JSON.stringify(SKINS.map(({ id }) => id))}.includes(k)&&!document.cookie.split("; ").some(c=>c.startsWith(key+"="))){document.cookie=key+"="+k+"; Path=/; Max-Age=${SKIN_MAX_AGE}; SameSite=Lax";if(k!==document.documentElement.dataset.skin&&document.cookie.split("; ").includes(key+"="+k))location.reload()}}catch(e){}`;

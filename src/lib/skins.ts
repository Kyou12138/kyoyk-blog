/** 皮肤只换配色，不动布局与数据；新增一套 = 这里加一项 + globals.css 一段 token 覆盖。 */
export const SKINS = [
  { id: "gold", label: "原版" },
  { id: "ink", label: "曜石" },
  { id: "paper", label: "纸墨" },
] as const;

export type SkinId = (typeof SKINS)[number]["id"];

export const DEFAULT_SKIN: SkinId = "gold";
export const SKIN_STORAGE_KEY = "kyou-skin";
export const SKIN_IDS: readonly string[] = SKINS.map((skin) => skin.id);

/** 首屏引导：在 head 里同步执行，避免先亮后暗的闪烁。 */
export const SKIN_BOOT = `try{var k=localStorage.getItem("${SKIN_STORAGE_KEY}");document.documentElement.dataset.skin=${JSON.stringify(
  SKIN_IDS,
)}.indexOf(k)>-1?k:"${DEFAULT_SKIN}"}catch(e){document.documentElement.dataset.skin="${DEFAULT_SKIN}"}`;

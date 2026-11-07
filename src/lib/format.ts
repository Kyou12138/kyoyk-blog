const DATE_TZ = "Asia/Shanghai";

/** 固定按东八区计算，避免服务器时区影响 permalink。 */
export const dateParts = (iso: string): { year: string; month: string; day: string } => {
  const formatted = new Intl.DateTimeFormat("en-CA", {
    timeZone: DATE_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
  const [year, month, day] = formatted.split("-");
  return { year, month, day };
};

export const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat("zh-CN", {
    timeZone: DATE_TZ,
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));

export const readingMinutes = (text: string): number => {
  const chinese = (text.match(/[\u4e00-\u9fa5]/g) ?? []).length;
  const words = (text.match(/[A-Za-z0-9_]+/g) ?? []).length;
  return Math.max(1, Math.round(chinese / 400 + words / 220));
};

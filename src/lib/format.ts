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

/** 点分日期格式（YYYY.MM.DD），用于账册与列表时间轴展示。 */
export const formatDateDot = (iso: string | null | undefined): string => {
  if (!iso) return "";
  const { year, month, day } = dateParts(iso);
  return `${year}.${month}.${day}`;
};

export const readingMinutes = (text: string): number => {
  const chinese = (text.match(/[\u4e00-\u9fa5]/g) ?? []).length;
  const words = (text.match(/[A-Za-z0-9_]+/g) ?? []).length;
  return Math.max(1, Math.round(chinese / 400 + words / 220));
};

/** 文章永久地址：/blog/YYYY/MM/DD/<slug>，由发布时间推导。 */
export const permalink = (post: { slug: string; publishedAt: string | null }): string => {
  if (!post.publishedAt) return `/blog/${post.slug}`;
  const { year, month, day } = dateParts(post.publishedAt);
  return `/blog/${year}/${month}/${day}/${post.slug}`;
};

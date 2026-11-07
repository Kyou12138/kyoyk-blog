import { query, getPool } from "./db";
import { dateParts } from "./format";
import type { SecretPayload } from "./secret";

export type PostStatus = "draft" | "published" | "private";

export type PostSummary = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  excerpt: string | null;
  status: PostStatus;
  publishedAt: string | null;
  updatedAt: string;
  tags: string[];
  /** 预计阅读分钟，正文没存（私有笔记）时为 null。由 SQL 按与 readingMinutes() 相同的口径估算。 */
  minutes: number | null;
};

export type Post = PostSummary & {
  body: string | null;
  secret: SecretPayload | null;
};

const SUMMARY_COLUMNS = `
  p.id, p.slug, p.title, p.description, p.excerpt, p.status, p.published_at, p.updated_at,
  coalesce(array_agg(distinct t.name) filter (where t.name is not null), '{}') as tags,
  case when p.body is null then null else greatest(1, round(
    regexp_count(p.body, '[一-龥]') / 400.0
    + regexp_count(p.body, '[A-Za-z0-9_]+') / 220.0
  ))::int end as minutes
`;

type Row = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  excerpt: string | null;
  status: PostStatus;
  published_at: Date | null;
  updated_at: Date;
  tags: string[];
  minutes: number | null;
};

const toSummary = (row: Row): PostSummary => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  description: row.description,
  excerpt: row.excerpt,
  status: row.status,
  publishedAt: row.published_at ? row.published_at.toISOString() : null,
  updatedAt: row.updated_at.toISOString(),
  tags: row.tags ?? [],
  minutes: row.minutes,
});

/** 文章地址：/blog/YYYY/MM/DD/<slug>，由发布时间推导。 */
export const permalink = (post: Pick<PostSummary, "slug" | "publishedAt">): string => {
  if (!post.publishedAt) return `/blog/${post.slug}`;
  const { year, month, day } = dateParts(post.publishedAt);
  return `/blog/${year}/${month}/${day}/${post.slug}`;
};

export const listPosts = async (options?: {
  keyword?: string;
  tag?: string;
  includeUnpublished?: boolean;
  limit?: number;
}): Promise<PostSummary[]> => {
  const params: unknown[] = [];
  const where: string[] = [];

  if (!options?.includeUnpublished) {
    where.push(`p.status = 'published'`);
  }

  const keyword = options?.keyword?.trim();
  if (keyword) {
    params.push(`%${keyword}%`);
    where.push(
      `(p.title ilike $${params.length} or p.description ilike $${params.length} or p.excerpt ilike $${params.length} or p.body ilike $${params.length})`,
    );
  }

  const tag = options?.tag?.trim();
  if (tag) {
    params.push(tag);
    where.push(`exists (
      select 1 from post_tags pt2 join tags t2 on t2.id = pt2.tag_id
      where pt2.post_id = p.id and t2.name = $${params.length}
    )`);
  }

  params.push(Math.min(options?.limit ?? 200, 500));

  const { rows } = await query<Row>(
    `select ${SUMMARY_COLUMNS}
     from posts p
     left join post_tags pt on pt.post_id = p.id
     left join tags t on t.id = pt.tag_id
     ${where.length ? `where ${where.join(" and ")}` : ""}
     group by p.id
     order by coalesce(p.published_at, p.created_at) desc
     limit $${params.length}`,
    params,
  );

  return rows.map(toSummary);
};

export const getPostBySlug = async (slug: string): Promise<Post | null> => {
  const { rows } = await query<Row & { body: string | null; secret: SecretPayload | null }>(
    `select ${SUMMARY_COLUMNS}, p.body, p.secret
     from posts p
     left join post_tags pt on pt.post_id = p.id
     left join tags t on t.id = pt.tag_id
     where p.slug = $1
     group by p.id`,
    [slug],
  );

  const row = rows[0];
  if (!row) return null;
  return { ...toSummary(row), body: row.body, secret: row.secret };
};

export const getPostById = async (id: string): Promise<Post | null> => {
  const { rows } = await query<Row & { body: string | null; secret: SecretPayload | null }>(
    `select ${SUMMARY_COLUMNS}, p.body, p.secret
     from posts p
     left join post_tags pt on pt.post_id = p.id
     left join tags t on t.id = pt.tag_id
     where p.id = $1
     group by p.id`,
    [id],
  );

  const row = rows[0];
  if (!row) return null;
  return { ...toSummary(row), body: row.body, secret: row.secret };
};

export type AdjacentPosts = {
  newer: PostSummary | null;
  older: PostSummary | null;
};

/** 上下篇：只按已发布文章的时间顺序取相邻两条，一条 SQL 搞定。 */
export const getAdjacentPosts = async (slug: string): Promise<AdjacentPosts> => {
  const { rows } = await query<{
    newer_slug: string | null;
    newer_title: string | null;
    newer_at: Date | null;
    older_slug: string | null;
    older_title: string | null;
    older_at: Date | null;
  }>(
    `with ordered as (
       select p.id, p.slug, p.title, p.description, p.excerpt, p.status,
              coalesce(p.published_at, p.created_at) as at, p.updated_at,
              row_number() over (order by coalesce(p.published_at, p.created_at) desc) as rn
       from posts p
       where p.status = 'published'
     )
     select n.slug as newer_slug, n.title as newer_title, n.at as newer_at,
            o.slug as older_slug, o.title as older_title, o.at as older_at
     from ordered cur
     left join ordered n on n.rn = cur.rn - 1
     left join ordered o on o.rn = cur.rn + 1
     where cur.slug = $1`,
    [slug],
  );

  const row = rows[0];
  const pick = (
    s: string | null,
    title: string | null,
    at: Date | null,
  ): PostSummary | null =>
    s && title && at
      ? ({ slug: s, title, publishedAt: at.toISOString() } as PostSummary)
      : null;

  return {
    newer: row ? pick(row.newer_slug, row.newer_title, row.newer_at) : null,
    older: row ? pick(row.older_slug, row.older_title, row.older_at) : null,
  };
};

export const listTags = async (): Promise<Array<{ name: string; count: number }>> => {  const { rows } = await query<{ name: string; count: string }>(
    `select t.name, count(*)::text as count
     from tags t
     join post_tags pt on pt.tag_id = t.id
     join posts p on p.id = pt.post_id and p.status = 'published'
     group by t.name
     order by count(*) desc, t.name asc`,
  );
  return rows.map((row) => ({ name: row.name, count: Number(row.count) }));
};

export type SavePostInput = {
  id?: string;
  slug: string;
  title: string;
  description: string | null;
  body: string | null;
  secret: SecretPayload | null;
  excerpt: string | null;
  status: PostStatus;
  publishedAt: string | null;
  tags: string[];
};

const normalizeTags = (tags: string[]): string[] => {
  const seen = new Set<string>();
  for (const raw of tags) {
    const name = raw.trim().toLowerCase();
    if (name) seen.add(name);
  }
  return [...seen];
};

export const savePost = async (input: SavePostInput): Promise<string> => {
  const pool = await getPool();
  const client = await pool.connect();

  try {
    await client.query("begin");

    let id = input.id;

    if (id) {
      await client.query(
        `insert into post_revisions (post_id, title, body, secret, status)
         select id, title, body, secret, status from posts where id = $1`,
        [id],
      );

      await client.query(
        `update posts
         set slug = $2, title = $3, description = $4, body = $5, secret = $6,
             excerpt = $7, status = $8, published_at = $9, updated_at = now()
         where id = $1`,
        [
          id,
          input.slug,
          input.title,
          input.description,
          input.body,
          input.secret,
          input.excerpt,
          input.status,
          input.publishedAt,
        ],
      );
    } else {
      const { rows } = await client.query<{ id: string }>(
        `insert into posts (slug, title, description, body, secret, excerpt, status, published_at)
         values ($1, $2, $3, $4, $5, $6, $7, $8)
         returning id`,
        [
          input.slug,
          input.title,
          input.description,
          input.body,
          input.secret,
          input.excerpt,
          input.status,
          input.publishedAt,
        ],
      );
      id = rows[0].id;
    }

    await client.query("delete from post_tags where post_id = $1", [id]);

    for (const name of normalizeTags(input.tags)) {
      const { rows } = await client.query<{ id: number }>(
        `insert into tags (name) values ($1)
         on conflict (name) do update set name = excluded.name
         returning id`,
        [name],
      );
      await client.query(
        `insert into post_tags (post_id, tag_id) values ($1, $2) on conflict do nothing`,
        [id, rows[0].id],
      );
    }

    await client.query("commit");
    return id;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
};

export const deletePost = async (id: string): Promise<void> => {
  await query(`delete from posts where id = $1`, [id]);
};

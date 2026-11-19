-- 0001_init.sql
create extension if not exists pgcrypto;

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  body text,
  secret jsonb,
  excerpt text,
  status text not null default 'draft' check (status in ('draft', 'published', 'private')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_body_present check (
    (status = 'private' and secret is not null and body is null)
    or (status <> 'private' and body is not null)
  )
);

create index if not exists posts_status_published_idx on posts (status, published_at desc);

create table if not exists tags (
  id serial primary key,
  name text not null unique
);

create table if not exists post_tags (
  post_id uuid not null references posts (id) on delete cascade,
  tag_id integer not null references tags (id) on delete cascade,
  primary key (post_id, tag_id)
);

create index if not exists post_tags_tag_idx on post_tags (tag_id);

create table if not exists post_revisions (
  id bigserial primary key,
  post_id uuid not null references posts (id) on delete cascade,
  title text not null,
  body text,
  secret jsonb,
  status text not null,
  created_at timestamptz not null default now()
);

create index if not exists post_revisions_post_idx on post_revisions (post_id, created_at desc);

create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  sha256 text not null unique,
  mime text not null,
  size integer not null,
  created_at timestamptz not null default now()
);

import type { Metadata } from "next";
import BlogLedger from "@/components/BlogLedger";
import { listPosts, listTags } from "@/lib/posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "笔记",
  description: "前后端架构、MCP 协议、LLM 智能体流水线与系统工程实践的系统化思考。",
  alternates: { canonical: "/blog" },
};

const pick = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const keyword = pick(params.q)?.trim() ?? "";
  const tag = pick(params.tag)?.trim() ?? "";

  const [posts, tags] = await Promise.all([
    listPosts(), // 获取全部已发布笔记，供客户端做毫秒级即时过滤与无刷新分词搜索
    listTags(),
  ]);

  return (
    <main className="section">
      <div className="container">
        <BlogLedger
          initialPosts={posts}
          tags={tags}
          initialKeyword={keyword}
          initialTag={tag}
        />
      </div>
    </main>
  );
}

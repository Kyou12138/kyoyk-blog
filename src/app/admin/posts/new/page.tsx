import type { Metadata } from "next";
import Link from "next/link";
import PostEditor from "@/components/PostEditor";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "写新笔记", robots: { index: false } };

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;

  return (
    <div>
      <header className="editorial-head">
        <h1 className="editorial-head__title">写新笔记</h1>
        <div className="editorial-head__aside">
          <Link href="/admin" className="editorial-head__link">
            ← 全部笔记
          </Link>
        </div>
      </header>
      <PostEditor post={null} error={error} />
    </div>
  );
}

import type { Metadata } from "next";
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
      <h1 style={{ fontSize: "1.5rem", marginTop: 0 }}>写新笔记</h1>
      <PostEditor post={null} error={error} />
    </div>
  );
}

import type { ReactNode } from "react";
import BlogPostItemContent from "@theme-original/BlogPostItem/Content";
import type { Props } from "@theme/BlogPostItem/Content";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import EncryptedNoteGate from "../../../components/EncryptedNoteGate";

type EncryptedFrontMatter = {
  encrypted?: boolean;
  password?: string;
  passwordHash?: string;
  passwordSalt?: string;
  passwordIterations?: number | string;
  passwordHint?: string;
};

export default function BlogPostItemContentWrapper(props: Props): ReactNode {
  const { frontMatter, metadata } = useBlogPost();
  const encryptedFrontMatter = frontMatter as EncryptedFrontMatter;
  const enabled = Boolean(
    encryptedFrontMatter.encrypted ||
      encryptedFrontMatter.password ||
      encryptedFrontMatter.passwordHash
  );

  const gatedChildren = enabled ? (
    <EncryptedNoteGate
      enabled={enabled}
      password={encryptedFrontMatter.password}
      passwordHash={encryptedFrontMatter.passwordHash}
      passwordSalt={encryptedFrontMatter.passwordSalt}
      passwordIterations={encryptedFrontMatter.passwordIterations}
      passwordHint={encryptedFrontMatter.passwordHint}
      permalink={metadata.permalink}
    >
      {props.children}
    </EncryptedNoteGate>
  ) : (
    props.children
  );

  return (
    <BlogPostItemContent {...props}>{gatedChildren}</BlogPostItemContent>
  );
}


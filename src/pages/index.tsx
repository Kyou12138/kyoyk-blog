import type { ReactNode } from "react";
import Layout from "@theme/Layout";
import HomepageHeader from "../components/HomepageHeader";

export default function Home(): ReactNode {
  return (
    <Layout description="个人笔记">
      <HomepageHeader />
    </Layout>
  );
}

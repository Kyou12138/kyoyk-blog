import type { ReactNode } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";

export default function Projects(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title="项目展示" description="个人项目展示与分享">
      <main>
        <div className="container margin-top--xl margin-bottom--xl">
          <div className="row">
            <div className="col col--12">
              <div className="card margin-bottom--lg">
                <div className="card__header">
                  <h2>🧱 项目展示</h2>
                </div>
                <div className="card__body">
                  <p>
                    这里展示了一些有趣、实用的项目或代码片段。每个项目都包含了详细说明、技术栈和使用方法。
                    欢迎交流与补充！
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col col--6">
              <div
                className="card margin-bottom--lg"
                style={{ height: "100%" }}
              >
                <div className="card__header">
                  <h3>📝 项目一</h3>
                </div>
                <div className="card__body">
                  <p>项目一的简要描述...</p>
                </div>
                <div className="card__footer">
                  <Link
                    // to="/proj/project1"
                    className="button button--primary button--block"
                  >
                    查看详情
                  </Link>
                </div>
              </div>
            </div>

            <div className="col col--6">
              <div
                className="card margin-bottom--lg"
                style={{ height: "100%" }}
              >
                <div className="card__header">
                  <h3>📝 项目二</h3>
                </div>
                <div className="card__body">
                  <p>项目二的简要描述...</p>
                </div>
                <div className="card__footer">
                  <Link
                    // to="/proj/project2"
                    className="button button--primary button--block"
                  >
                    查看详情
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

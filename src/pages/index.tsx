import type { ReactNode } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import HomepageHeader from "../components/HomepageHeader";

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout description="个人笔记">
      <HomepageHeader />
      <main>
        <div className="container margin-top--xl margin-bottom--xl">
          <div className="row">
            <div className="col col--6">
              <div
                className="card margin-bottom--lg"
                style={{ height: "100%" }}
              >
                <div className="card__header">
                  <h3>🏷️ 学习笔记</h3>
                </div>
                <div className="card__body">
                  <p>
                    本页面内容为个人学习笔记与备忘，仅供参考与交流，欢迎指正。
                  </p>
                </div>
                <div className="card__footer">
                  <Link
                    to="/blog"
                    className="button button--primary button--block"
                  >
                    查看笔记
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
                  <h3>🧱 资源&工具</h3>
                </div>
                <div className="card__body">
                  <p>
                    精选的开发资源和工具推荐，以及个人应用服务，欢迎交流与补充。
                  </p>
                </div>
                <div className="card__footer">
                  <Link
                    to="/proj"
                    className="button button--primary button--block"
                  >
                    查看资源
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

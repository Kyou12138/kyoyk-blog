import type { ReactNode } from "react";
import clsx from "clsx";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import GlowingParticles from "../components/GlowingParticles";

import styles from "./index.module.css";
import Link from "@docusaurus/Link";
function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <GlowingParticles />
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        {/* <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Docusaurus Tutorial - 5min ⏱️
          </Link>
        </div> */}
      </div>
    </header>
  );
}

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
                  <h3>🧱 项目展示</h3>
                </div>
                <div className="card__body">
                  <p>
                    本栏目收集和分享一些有趣、实用的项目或代码片段，欢迎交流与补充。
                  </p>
                </div>
                <div className="card__footer">
                  <Link
                    to="/proj"
                    className="button button--primary button--block"
                  >
                    查看项目
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

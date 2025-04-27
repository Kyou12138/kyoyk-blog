import type { ReactNode } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import styles from "./proj.module.css";

export default function Projects(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title="资源&工具"
      description="精选的开发资源和工具推荐，以及个人应用服务"
    >
      <main className="margin-vert--lg">
        <div className="container">
          <div className={styles.projectsRow}>
            {/* 左侧：资源推荐 */}
            <div className={styles.columnWrapper}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>🌟</div>
                <div>
                  <h2 className={styles.sectionTitle}>资源推荐</h2>
                  <p className={styles.sectionDescription}>
                    精选的优质开发工具和资源网站，提升开发效率
                  </p>
                </div>
              </div>

              <div className={styles.cardGrid}>
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardIcon}>🔍</span>
                    <h3 className={styles.cardTitle}>DeepWiki</h3>
                  </div>
                  <div className={styles.cardBody}>
                    <p>
                      一个强大的代码仓库探索工具，可以帮助开发者快速理解和学习开源项目。支持多种编程语言和框架，提供代码搜索、分析和可视化功能。
                    </p>
                  </div>
                  <div className={styles.cardFooter}>
                    <Link
                      to="https://deepwiki.com/"
                      className={styles.cardButton}
                    >
                      访问网站
                      <span className={styles.cardButtonIcon}>→</span>
                    </Link>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardIcon}>🐧</span>
                    <h3 className={styles.cardTitle}>Linux.do</h3>
                  </div>
                  <div className={styles.cardBody}>
                    <p>
                      一个专注于 Linux
                      和开源技术的社区论坛，提供技术讨论、问题解答和资源分享。适合
                      Linux 爱好者和开发者交流学习。
                    </p>
                  </div>
                  <div className={styles.cardFooter}>
                    <Link to="https://linux.do/" className={styles.cardButton}>
                      访问网站
                      <span className={styles.cardButtonIcon}>→</span>
                    </Link>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardIcon}>🤖</span>
                    <h3 className={styles.cardTitle}>QRGPT</h3>
                  </div>
                  <div className={styles.cardBody}>
                    <p>
                      一个基于 GPT
                      的二维码生成工具，可以快速创建包含文本、链接等信息的二维码。支持自定义样式和高级功能，适合各种场景使用。
                    </p>
                  </div>
                  <div className={styles.cardFooter}>
                    <Link
                      to="https://www.qrgpt.io/"
                      className={styles.cardButton}
                    >
                      访问网站
                      <span className={styles.cardButtonIcon}>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧：应用服务 */}
            <div className={styles.columnWrapper}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>🚀</div>
                <div>
                  <h2 className={styles.sectionTitle}>应用服务</h2>
                  <p className={styles.sectionDescription}>
                    自主开发或基于开源项目部署的应用服务，提供便捷的在线工具
                  </p>
                </div>
              </div>

              <div className={styles.cardGrid}>
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardIcon}>💬</span>
                    <h3 className={styles.cardTitle}>AI 对话</h3>
                  </div>
                  <div className={styles.cardBody}>
                    <p>
                      基于 NextChat 开发的 AI 对话应用，支持多种 AI
                      模型，提供智能对话、代码生成等功能，帮助提升工作效率。
                    </p>
                  </div>
                  <div className={styles.cardFooter}>
                    <Link
                      to="https://chat.kyoyk.top/"
                      className={styles.cardButton}
                    >
                      访问应用
                      <span className={styles.cardButtonIcon}>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

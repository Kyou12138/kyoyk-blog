# Kyou Blog

个人技术笔记站，兼作作者的全栈能力展示面。中文文案与代码标识的对应关系在此定死，避免同义词漂移。

## 内容

**Post**（笔记）：
一篇可发布的技术写作单元。中文 UI 一律称「笔记」，代码与表名一律用 `Post`。
_Avoid_: 文章、Note、blog post

**Permalink**：
一篇 Post 的公开地址，形如 `/blog/YYYY/MM/DD/<slug>`。由 `published_at` 与 `slug` 推导，不单独存储。
_Avoid_: 链接、URL、path

**Tag**（标签）：
自由多值的内容标记，无预定义集合，无互斥关系。
_Avoid_: 分类、Category、频道

**Draft**（草稿）：
已保存但尚未发布的 Post，只有作者可见。
_Avoid_: 未发布、暂存、pending

**Private Note**（私有笔记）：
正文以密码派生密钥加密存储、解锁后仅返回明文的 Post。未解锁时不参与搜索、RSS、sitemap。
_Avoid_: 加密文章、锁定文章、隐藏笔记

## 展示

**Colophon**：
列出本站技术栈与每项选择理由的静态页面，面向访客而非作者。
_Avoid_: 技术栈页、about 页

## 监控

**Server Monitoring**（服务器监控）：
作者查看多台服务器资源用量与持久历史的私有视图，区别于网站可用性检测。
_Avoid_: 网站探活、服务状态页

**Server Status**（服务器状态）：
面向访客的在线情况汇总，仅公开在线和离线数量，不含主机身份或资源详情。
_Avoid_: 公开资源面板

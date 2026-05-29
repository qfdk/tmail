## 📮 临时邮箱（魔改版）

> Fork 自 [sunls24/tmail](https://github.com/sunls24/tmail) 并大量魔改，
> UI 设计参考了 [denghongcai/forsaken-mail](https://github.com/denghongcai/forsaken-mail)。

使用 Golang + Astro + React + Server-Sent Events 实时获取邮件

- [x] 邮件 CSS 样式隔离（Shadow DOM）
- [x] **SSE 推送替代长轮询**（25s 心跳，浏览器自动重连）
- [x] 暗色主题和语言切换
- [x] 支持查看和下载附件
- [x] 邮件详情就地展开（不再用弹窗）
- [x] 邮件可手动删除（数据库 + 附件磁盘文件）
- [x] **支持 MySQL 驱动**（除原版 SQLite 外）
- [x] 三段式 UI 重构（状态横幅 / 邮件表格 / 详情或 FAQ 卡片），参考 forsaken-mail 的视觉风格
- [x] 响应式 Header：小屏地址栏独占第二行
- [x] Toast 通知底部居中弹出（适配移动端拇指区）

[English](README-en.md)

匿名的一次性邮箱，保护您的个人电子邮件地址免受垃圾邮件的骚扰。

[🧰 自建部署教程](deploy.md)

## 🛠 与上游主要差异

| 项 | 上游 | 本仓库 |
| --- | --- | --- |
| 实时推送 | Long polling (`/api/fetch/latest`) | SSE (`/api/stream`) |
| 数据库 | SQLite | SQLite / MySQL |
| 邮件详情 | AlertDialog 弹窗 | 列表下方就地展开卡片 |
| 删除邮件 | 无 | `DELETE /api/fetch/:id` + 前端按钮 |
| 头部布局 | 单列 + 侧边 Actions | forsaken-mail 风格地址栏，移动端响应式 |

## 🎉 可以做什么？

- 用于注册不想暴露自己真实邮件地址的网站，以避免垃圾邮件的骚扰。
- 用于在同一个平台注册多个账号，而又不需要去注册多个邮箱。

## ⚠️ 注意

- **❗接收到的邮件内容仅能保留 10 天**
- **❗随机生成的邮箱地址任何人都可以使用，请勿用于注册重要账号**

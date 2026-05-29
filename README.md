## 📮 临时邮箱（UI 魔改版）

> 沿用 [sunls24/tmail](https://github.com/sunls24/tmail) 的后端核心（SMTP 收信、ent ORM、附件处理），
> **主要改动在前端 UI**，视觉风格参考 [denghongcai/forsaken-mail](https://github.com/denghongcai/forsaken-mail)；
> 顺手把实时推送从长轮询换成了 Server-Sent Events，并加了几样小功能。

使用 Golang + Astro + React + Server-Sent Events 实时获取邮件

### UI 重构（主要工作）

- [x] 三段式布局：服务状态横幅 / 邮件表格 / 详情或 FAQ 卡片
- [x] 邮件详情就地展开（替代原 AlertDialog 弹窗）
- [x] 地址栏 forsaken-mail 风格：信封图标 / input 点击复制 / 内联编辑（Enter 确认、Esc 取消）
- [x] 响应式 Header：小屏地址栏独占第二行
- [x] Toast 通知底部居中弹出（适配移动端拇指区）

### 其他改动

- [x] **SSE 单向推送，完全弃用长轮询**（25s 心跳防代理超时，浏览器自动重连）
- [x] **新增 MySQL 驱动支持**（上游只支持 PostgreSQL）
- [x] 邮件可手动删除（数据库 + 附件磁盘文件）
- [x] 邮件 CSS 样式隔离（Shadow DOM，沿用上游）
- [x] 暗色主题和语言切换（沿用上游）
- [x] 附件查看和下载（沿用上游）

[English](README-en.md)

匿名的一次性邮箱，保护您的个人电子邮件地址免受垃圾邮件的骚扰。

[🧰 自建部署教程](deploy.md)

## 🛠 与上游主要差异

| 项 | 上游 | 本仓库 |
| --- | --- | --- |
| 实时推送 | Long polling (`/api/fetch/latest`) | SSE (`/api/stream`) |
| 数据库 | PostgreSQL | PostgreSQL / MySQL |
| 邮件详情 | AlertDialog 弹窗 | 列表下方就地展开卡片 |
| 删除邮件 | 无 | `DELETE /api/fetch/:id` + 前端按钮 |
| 头部布局 | 单列 + 侧边 Actions | forsaken-mail 风格地址栏，移动端响应式 |

## 🎉 可以做什么？

- 用于注册不想暴露自己真实邮件地址的网站，以避免垃圾邮件的骚扰。
- 用于在同一个平台注册多个账号，而又不需要去注册多个邮箱。

## ⚠️ 注意

- **❗接收到的邮件内容仅能保留 10 天**
- **❗随机生成的邮箱地址任何人都可以使用，请勿用于注册重要账号**

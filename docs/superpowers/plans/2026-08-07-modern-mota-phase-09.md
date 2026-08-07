# Phase 9: 发布

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Phase 目标**: git tag v0.1.0 + 部署到静态托管 + 生成可下载链接。

**Phase 估时**: 1 天

**依赖**: Phase 8 完成

---

## Task 总览

### Task 1: 最终 build
```bash
pnpm clean
pnpm install --frozen-lockfile
pnpm build
```

预期: `apps/web/dist/` 产出 < 5MB

### Task 2: 部署到 Cloudflare Pages
- 创建 Cloudflare Pages 项目（UI 操作 / 或 `wrangler pages deploy apps/web/dist --project-name modern-mota`）
- 绑定自定义域名（可选）

### Task 3: 部署到 Vercel（备选）
- `vercel deploy apps/web/dist --prod`

### Task 4: 部署到自家 Nginx（备选）
- `rsync -avz apps/web/dist/ user@server:/var/www/modern-mota/`

### Task 5: PWA 验证
- Chrome DevTools → Application → Manifest 检查 PWA 可安装
- 离线模式下刷新页面能加载（service worker 已注册）

### Task 6: git tag v0.1.0
```bash
git tag -a v0.1.0 -m "Initial release: 20-floor Magic Tower modern rebuild"
git push origin v0.1.0
```

### Task 7: GitHub Release
- 在 GitHub 创建 Release
- 标题："v0.1.0 - Initial Release"
- 内容：CHANGELOG.md + 设计文档链接 + 部署链接

### Task 8: README 顶部加部署链接
- 更新 README.md 的状态行加 demo 链接

---

## Phase 9 完成检查

- [ ] 部署链接可访问
- [ ] git tag v0.1.0 已 push
- [ ] GitHub Release 已创建
- [ ] PWA 可安装
- [ ] 离线模式可用

---

## 🎉 首版发布完成

Phase 9 完成后，整个首版（v0.1.0）正式发布。

**接下来的工作**（v0.2+）：
- 多塔支持（导入 24 / 50 层）
- 关卡可视化编辑器
- 在线排行榜（需要后端）
- 云存档
- 完整 en + ja 翻译
- 美术全套重做
- 移动 App（Capacitor）
- 好友系统
- 塔市场（UGC）

参考 spec 附录 B 未来路线。
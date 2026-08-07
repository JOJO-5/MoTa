# Phase 7: 美术

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Phase 目标**: 用 AI 出图替换 3 块关键美术（标题背景 + hero 立绘 + 状态栏背景），并接入主题切换。

**Phase 估时**: 2-3 天单人

**依赖**: Phase 5 完成（UI 框架稳定）

---

## 详细 spec 参考

- [§7.3 art-pipeline](../specs/2026-08-07-modern-mota-design.md#73-art-pipeline)
- [§6.11 视觉风格](../specs/2026-08-07-modern-mota-design.md#611-视觉风格)
- [§8.5 美术首版范围](../specs/2026-08-07-modern-mota-design.md#85-美术首版范围)

---

## Task 总览

### Task 1: style.md 模板
- `content/mota-2014/art/style.md`: 复古像素升级 32×32 6 色调色板定义
- 不写代码，纯文档

### Task 2: AI 出图 — 标题背景
- `content/mota-2014/art/bg/title.jpg` 1920×1080
- 调用 MiniMax skill（image generation）
- style.md 风格指南

### Task 3: AI 出图 — hero 立绘
- `content/mota-2014/art/actors/hero_walk.png` 128×128 (4 方向 × 4 帧 = 16 帧)
- style.md 风格指南

### Task 4: AI 出图 — 状态栏背景
- `content/mota-2014/art/ui/statusbar_bg.png` 可平铺
- style.md 风格指南

### Task 5: 后处理 — 调色板量化
- `tools/art-pipeline/src/post-process/quantize.ts`: sharp + pngjs 限制 6 色
- 测试

### Task 6: 后处理 — 像素缩放
- `tools/art-pipeline/src/post-process/pixelize.ts`: nearest neighbor
- 测试

### Task 7: 主题切换（spec §6.11）
- `apps/web/src/styles/themes/classic.css`
- `apps/web/src/styles/themes/dark.css`
- 测试：切换 CSS 变量

### Task 8: 字体接入（spec §6.3）
- 添加 `@fontsource/ma-shan-zheng` `@fontsource/press-start-2p` `@fontsource/jetbrains-mono`
- `apps/web/src/styles/fonts.css` 加载
- 测试

### Task 9: Phaser 加载新美术
- `packages/render/src/scenes/BootScene.ts` 加：加载 title.jpg / hero_walk.png / statusbar_bg.png
- 测试

### Task 10: React UI 接入新美术
- `packages/ui/src/Hud/StatusBar.tsx` 用 statusbar_bg.png 作背景
- `packages/ui/src/Title/TitleScreen.tsx` 用 title.jpg
- 测试

---

## Phase 7 完成检查

- [ ] 3 个 AI 出图文件存在
- [ ] 主题切换：classic / dark 都好看
- [ ] hero 立绘在游戏中正确显示（4 方向）
- [ ] 状态栏用新背景

---

## 下一步

进入 Phase 8：打磨（e2e + Lighthouse + a11y + i18n + 文档）。
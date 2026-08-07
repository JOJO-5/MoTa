# 魔塔 · Modern Rebuild

用现代前端栈（Phaser 3 + React + TypeScript + Vite）从零复刻经典 20 层魔塔。

## 状态

🚧 开发中。当前在 Phase 0（脚手架）。

## 技术栈

- 运行时：Vite + React 18 + TypeScript 5 + Phaser 3
- 测试：Vitest + Playwright
- 数据：zod schema + JSON
- 包管理：pnpm 9 monorepo

## 快速开始

要求 Node.js 20+ 和 pnpm 9+。

```bash
pnpm install
pnpm dev          # 启动 Vite dev server (http://localhost:5173)
pnpm test         # 跑全部测试
pnpm typecheck    # TS 类型检查
pnpm build        # 产出 production build
```

## 仓库结构

```
apps/web/                    浏览器入口
packages/core/               纯游戏逻辑（无 UI）
packages/data/               数据 schema + 加载器
packages/render/             Phaser 渲染层
packages/ui/                 React UI 组件
packages/persistence/         存档 / 录像 / 设置
content/                     关卡数据 + 美术资源
tools/                       importer / validator / art-pipeline
docs/                        设计文档 + spec
```

## 设计文档: [docs/superpowers/specs/2026-08-07-modern-mota-design.md](docs/superpowers/specs/2026-08-07-modern-mota-design.md)

## License

MIT

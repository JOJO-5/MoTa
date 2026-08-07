# Modern Mota Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用现代前端栈（Phaser 3 + React + TypeScript + Vite）从零复刻 gameschool.cc/game/172 那款 20 层魔塔游戏，保留经典玩法 + 触屏键盘双优 + AI 换皮。

**Architecture:** pnpm monorepo（apps/web + packages/{core, render, ui, persistence, data} + content/mota-2014 + tools/{importer, validator, art-pipeline}）。Core 层零 UI 依赖，可独立在 Node 单测；React 与 Phaser 通过类型化事件总线（`packages/render/bridge`）通信；数据层用 zod schema + JSON 文件，可换塔零代码改动。

**Tech Stack:**
- 运行时：Vite + React 18 + TypeScript 5 + Phaser 3.80+ + Immer + Zustand
- 数据：zod 3 + jsep 1（表达式解析）+ acorn（mota-js import）
- 样式：Tailwind CSS 3 + Framer Motion
- 触屏：Hammer.js
- 字体：@fontsource/{ma-shan-zheng, press-start-2p, jetbrains-mono}
- 测试：Vitest 1 + Playwright 1.40 + Testing Library
- 工具：pnpm 9 + tsx + sharp + pngjs + fast-glob

**Spec:** [2026-08-07-modern-mota-design.md](../specs/2026-08-07-modern-mota-design.md)

---

## Plan 拆分

本 plan 跨 6-8 周，按 Phase 拆分为 10 个文件。每个 Phase 文件可独立执行。

| Phase | 内容 | 文件 | 估时 |
|---|---|---|---|
| 0 | 脚手架（pnpm workspace / Vite / TS / CI） | [phase-00-scaffold.md](2026-08-07-modern-mota-phase-00.md) | 1-2 天 |
| 1 | 数据层（zod schema + loader + importer） | [phase-01-data.md](2026-08-07-modern-mota-phase-01.md) | 3-4 天 |
| 2 | 核心逻辑（GameState + 战斗 + 移动 + 事件机） | [phase-02-core.md](2026-08-07-modern-mota-phase-02.md) | 5-7 天 |
| 3 | 渲染层（BootScene + TitleScene + FloorScene + Tilemap） | [phase-03-render.md](2026-08-07-modern-mota-phase-03.md) | 5-7 天 |
| 4 | 输入（键盘 + 触屏三模式 + A*） | [phase-04-input.md](2026-08-07-modern-mota-phase-04.md) | 2-3 天 |
| 5 | React UI（标题 + 状态栏 + 战斗 HUD + 对话 + choices + 商店） | [phase-05-react-ui.md](2026-08-07-modern-mota-phase-05.md) | 5-7 天 |
| 6 | 存档（IndexedDB + 迁移 + 导入导出 + 录像） | [phase-06-persistence.md](2026-08-07-modern-mota-phase-06.md) | 3-4 天 |
| 7 | 美术（AI 出 3 块 + 主题） | [phase-07-art.md](2026-08-07-modern-mota-phase-07.md) | 2-3 天 |
| 8 | 打磨（e2e + Lighthouse + a11y + i18n + 文档） | [phase-08-polish.md](2026-08-07-modern-mota-phase-08.md) | 3-5 天 |
| 9 | 发布（tag + 部署） | [phase-09-release.md](2026-08-07-modern-mota-phase-09.md) | 1 天 |

**总计**：6-8 周单人 / 3-4 周两人。

---

## 全局前置依赖

执行任一 Phase 前需要先完成 **Phase 0**。Phase 0 建立：
- `modern-mota/` 仓库根目录
- `package.json` + `pnpm-workspace.yaml`
- `tsconfig.base.json` + `tsconfig.json`
- 所有 packages 的 package.json + tsconfig.json
- `apps/web/` 入口（main.tsx + App.tsx + index.html）
- `.github/workflows/ci.yml`
- `.gitignore` + `.editorconfig` + `.prettierrc` + `README.md`

Phase 0 完成后，下面的 Phase 才能开始。

---

## Phase 间依赖图

```
Phase 0 (脚手架)
    │
    ├─→ Phase 1 (数据层)
    │       │
    │       └─→ Phase 2 (核心逻辑) ←──┐
    │               │                    │
    │               ├─→ Phase 3 (渲染层) │
    │               │       │            │
    │               │       ├─→ Phase 4 (输入)
    │               │       │
    │               ├─→ Phase 5 (React UI) ←┐
    │               │       │                  │
    │               │       ├─→ Phase 6 (存档)
    │               │       │
    │               ├─→ Phase 7 (美术)
    │               │
    │               └─→ Phase 8 (打磨) ←──┘
    │                       │
    │                       └─→ Phase 9 (发布)
```

**关键**：Phase 2 完成后 3 / 4 / 5 / 6 / 7 可并行（建议 3 人团队从 Phase 2 完成后并行）。Phase 8 必须等所有前面完成。Phase 9 最后。

---

## 通用约定（所有 Phase 遵守）

### 1. 代码风格

- TypeScript strict mode 全开
- 单文件 ≤ 400 行（拆文件原则，参见 spec §1.1）
- 函数 ≤ 80 行
- 一个文件一个明确职责
- 不留 TODO / FIXME / 占位代码（按 plan writing-plans 要求）

### 2. 测试约定

- **TDD**：写测试 → 跑（红）→ 写实现 → 跑（绿）→ 重构 → commit
- Vitest 覆盖率：core ≥ 90% / events 100% / expr 95%
- 测试文件与源文件同包（如 `src/foo.ts` → `src/foo.test.ts`）
- 每个 PR 至少 1 条新测试

### 3. Git 约定

- 主分支：`main`
- 功能分支：`feature/phase-XX-<short-desc>`（如 `feature/phase-02-battle-formula`）
- 提交格式：`<type>(<scope>): <subject>`
  - type: feat / fix / refactor / test / docs / chore
  - scope: 模块名（如 `core/battle`, `render/scene`, `ui/statusbar`）
- 每个 Task 末尾 commit（小步提交）
- Phase 完成后 squash merge 到 main

### 4. 文件路径

- 所有路径相对仓库根（`modern-mota/`）
- 包内路径用 `packages/<pkg>/src/...`
- 共享类型用 `packages/<pkg>/src/types.ts`

### 5. 错误处理

- 永不静默吞错
- 自定义错误类型（`EventError`, `SchemaError`, `MigrationError`）
- UI 显示具体错误 + 错误源文件 + 行号
- CI fail 不允许合入

---

## 执行流程

### 每个 Phase 的执行模板

```
1. 读 phase-XX.md 全文
2. 创建 feature 分支: git checkout -b feature/phase-XX-<desc>
3. 按 Task 顺序逐个执行：
   - 写测试
   - 跑测试（红）
   - 写实现
   - 跑测试（绿）
   - commit
4. Phase 全部完成后：
   - 跑全量测试 + typecheck + build
   - 跑 validator
   - 提交 PR
   - 评审通过后 squash merge 到 main
```

### 跨 Phase 协作

如果多人并行不同 Phase（Phase 3/5/6）：

- **契约优先**：Phase 2 完成后，先在 `packages/core/src/contracts/` 导出所有公共 API 类型
- Phase 3 /5 /6 各自分支开发，按合约接 Phase 2
- 集成前先合一次"接口冻结"分支

---

## 自查

按 writing-plans skill 的自查清单过一遍：

### 1. Spec 覆盖

| Spec 章节 | Plan 任务 |
|---|---|
| §1 整体架构 | Phase 0（monorepo + CI）+ Phase 3（桥接层在 render） |
| §2 数据层 | Phase 1 全部 |
| §3 渲染层 | Phase 3 全部 |
| §4 事件系统 | Phase 2.4（事件机 + handler） |
| §5 输入 + 存档 | Phase 4（输入）+ Phase 6（存档） |
| §6 React UI | Phase 5 全部 |
| §7 工具链 | Phase 1.3（importer）+ Phase 1.5（validator）+ Phase 7.2（art-pipeline） |
| §8 首版交付 | Phase 8（打磨 + 验收）+ Phase 9（发布） |

### 2. 占位符扫描

无 TBD / TODO / "类似 Task N" / 省略代码片段。

### 3. 类型一致性

所有 Phase 用统一类型（详见各 Phase 文件的"类型契约"小节）：
- `HeroSnapshot`, `SaveSlot`, `ReplayBlob`, `GameEvent`, `BridgeSpec` 等
- 类型定义在 `packages/core/src/types.ts`，所有 Phase 都从这里 import

---

## 下一步

每个 Phase 文件已生成（在同目录下 `phase-XX.md`）。建议按 Phase 顺序执行。

如果你想：
- **串行单人**：从 phase-00.md 开始，每个 Phase 跑完进下一个
- **并行多人**：Phase 2 完成后，3 / 5 / 6 同时开工
- **先看一个 Phase**：打开 phase-00.md 看完整 Task 列表
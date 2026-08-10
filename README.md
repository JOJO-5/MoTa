# 魔塔 2014 · Rebuilt Edition

[![CI](https://github.com/JOJO-5/MoTa/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/JOJO-5/MoTa/actions/workflows/ci.yml)
[![在线试玩](https://img.shields.io/badge/在线试玩-GitHub%20Pages-d6ae55)](https://jojo-5.github.io/MoTa/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)](https://www.typescriptlang.org/)
[![Phaser](https://img.shields.io/badge/Phaser-3-82589f)](https://phaser.io/)

保留《魔塔 2014》的关卡、事件、敌人数值与道具规则，用 React、TypeScript、Phaser 3 和 Vite 重建浏览器运行时、手机操作和现代化界面。

> 当前版本已经可以完整体验基础冒险闭环，但仍处于持续完善阶段。玩法数据以原版基线为准，现代化主要发生在界面、可读性、交互反馈和素材表现层。

**[立即在线试玩](https://jojo-5.github.io/MoTa/)** · [查看构建状态](https://github.com/JOJO-5/MoTa/actions/workflows/ci.yml) · [阅读设计文档](docs/superpowers/specs/2026-08-07-modern-mota-design.md)

![战斗演出与勇者档案](docs/screenshots/readme-battle.png)

## 当前内容

- **65 个楼层 ID**：MT0–MT26、JX1–JX24、SM1–SM10、Dark1–Dark2，以及 JXZTFG、MTSMFG。
- **原版数据驱动**：地图、事件、敌人数值、道具效果和换层关系来自恢复后的《魔塔 2014》内容基线。
- **完整基础闭环**：移动、拾取、开门、战斗、楼层往返、坐标事件、对话、选择、商店、死亡重开和手动存档。
- **战斗可预判**：无法取胜时说明原因且不扣血；胜利后展示双方属性、伤害、回合数和短时战斗演出。
- **桌面与手机适配**：键盘与触控方向键均支持长按连续移动，桌面和手机都可点击地图自动寻路，并显示逐格箭头路线与终点标记；手机操作区与游戏画布分离。
- **现代视觉层**：原创复古俯视地牢材质、高辨识度地图语义、勇者档案、新版勇者和 16 类常见怪物；未重制的 NPC、道具和罕见怪物安全回退到原版素材。

## 操作

| 场景               | 操作                                      |
| ------------------ | ----------------------------------------- |
| 桌面移动           | `WASD` 或方向键，支持长按连续移动         |
| 地图寻路           | 点击 / 触摸目标格，显示路线并自动绕开墙体 |
| 对话 / 交互 / 确认 | `Enter` 或 `Space`                        |
| 手机移动           | 屏幕方向键，支持长按连续移动              |
| 手机确认           | `A` 键                                    |
| 存档               | 游戏顶部“保存”按钮                        |

存档写入浏览器 `localStorage`。底层支持 3 个存档槽，当前界面使用槽位 0；清理站点数据会同时清除本地存档。

## 技术架构

这是一个 pnpm 9 monorepo，各层职责保持分离：

| 目录                   | 职责                                                   |
| ---------------------- | ------------------------------------------------------ |
| `apps/web`             | React 入口、主菜单、设置、游戏容器、手机控制和死亡界面 |
| `packages/core`        | 状态、移动、战斗、表达式、事件机与运行时地图覆盖       |
| `packages/data`        | Zod schema、浏览器/Node 内容加载和数据类型             |
| `packages/render`      | Phaser 场景、地图、精灵、HUD、战斗演出、换层和输入     |
| `packages/ui`          | 共享 React UI                                          |
| `packages/persistence` | 持久化边界                                             |
| `tools/importer`       | mota-js 内容导入工具                                   |
| `tools/validator`      | schema、引用与数值验证                                 |
| `content/mota-2014`    | 当前发布的 65 层内容基线                               |

核心运行链路：

```text
React App
  → initTower('mota-2014')
  → data loader / Zod validation
  → Zustand GameState
  → Phaser GameScene + runtime map
  → Canvas、HUD、对话与战斗演出
```

## 本地运行

需要 Node.js 20+、Corepack 和 pnpm 9。

```powershell
git clone https://github.com/JOJO-5/MoTa.git
Set-Location MoTa
corepack enable
corepack pnpm install
corepack pnpm dev
```

打开 <http://localhost:5173>。

## 验证

```powershell
corepack pnpm test
corepack pnpm typecheck
corepack pnpm build
```

首次运行浏览器测试时安装 Chromium：

```powershell
corepack pnpm --filter @modern-mota/web exec playwright install chromium
corepack pnpm test:e2e
```

CI 会在每次推送和拉取请求中执行：

1. 全仓 TypeScript 类型检查；
2. Vitest 单元与组件测试；
3. Vite production build；
4. 桌面 Chromium 与 Pixel 7 视口的 Playwright 冒烟测试；
5. `main` 分支的 GitHub Pages 部署。

## 内容基线与修改原则

[`content/mota-2014/baseline-manifest.json`](content/mota-2014/baseline-manifest.json) 是当前内容快照：

- `floorCount` 必须与 `data.json.floorIds` 和实际楼层文件数量一致；
- 修改表现素材时不得悄悄改变地图碰撞、敌人数值或剧情事件；
- 运行时判断必须使用收集状态和 `tileOverrides` 计算后的地图，不能只读取静态 `floor.map`；
- 新版素材缺少映射时必须保留原版回退，避免剧情怪物或 NPC 变成空白。

## 已知限制

- 设置页中的 BGM/SFX 音量和小地图开关尚未连接运行状态。
- `playSound`、`animate`、`setCurtain` 等少数纯表现型旧事件仍等待完整渲染桥支持。
- 当前 UI 只开放一个手动存档槽，尚无自动存档、导入与导出。
- 常见勇者和怪物已经统一画风，NPC、道具及罕见怪物仍在逐步优化。

## 路线图

- [x] 恢复 65 个楼层及原版玩法数据
- [x] 移动、战斗、道具、门、商店、事件和双向换层
- [x] 桌面 / 手机输入与 GitHub Pages 发布
- [x] 长按连续移动、点击 / 触摸地图寻路与可视路线
- [x] 打不过提示、死亡重开、战斗演出和勇者档案
- [ ] 接通设置项与剩余视觉 / 音频事件
- [ ] 多槽、自动存档和存档导入导出
- [ ] 继续统一 NPC、道具和罕见怪物素材

## 来源与许可

本仓库的 package metadata 声明为 MIT。原版《魔塔 2014》内容、mota-js 及第三方素材仍遵循各自来源目录中的许可与归属说明。

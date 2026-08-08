# 魔塔 · Modern Rebuild

用现代前端栈（Phaser 3 + React + TypeScript + Vite）从零复刻经典 20 层魔塔。

## 状态

**Phase 6 ✅ 构建完成** — 构建通过、类型检查全绿、55 个测试全部通过。

路线图：
- [x] Phase 1: 数据层（schema + importer + validator）
- [x] Phase 2: 游戏逻辑（GameState + 战斗 + 移动 + 事件机 + A* 寻路）
- [x] Phase 3: 渲染层（Phaser 场景 + Tilemap + Autotile + 精灵 + UI + 摄像机 + 粒子 + 字体 + 存档 + 对话框 + 小地图 + 商店 + 天气 + HUD + 动画 + BGM/SFX）
- [x] Phase 4: 输入系统（键盘 + 虚拟手柄 + 游戏手柄）
- [x] Phase 5: Web 应用（React 主界面 + 游戏画布 + 状态桥接 + DevTools）
- [x] Phase 6: 构建验证（pnpm build + typecheck + test）
- [ ] Phase 7: 文档
- [ ] Phase 8: 演示
- [ ] Phase 9: 发布准备

## 技术栈

- 运行时：Vite + React 18 + TypeScript 5 + Phaser 3
- 测试：Vitest
- 数据：Zod schema + JSON
- 包管理：pnpm 9 monorepo
- CI/CD：GitHub Actions

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
apps/web/                    浏览器入口（React + Vite）
packages/core/               纯游戏逻辑（无 UI 依赖）
  src/logic/move.ts         移动逻辑
  src/logic/battle.ts       战斗逻辑
  src/logic/battle-utils.ts 伤害计算 + 特殊属性
  src/logic/expr.ts         AST 表达式求值器
  src/logic/event-machine.ts 事件机（Generator-based）
  src/logic/pathfinding.ts   A* 寻路
  src/state/store.ts         Zustand 状态管理
packages/data/              数据 schema + 加载器
  src/schema/               Zod schema 定义
  src/loader.ts             Node.js 加载器（CLI 工具用）
  src/loader-browser.ts    浏览器加载器（fetch）
packages/render/            Phaser 3 渲染层
  src/boot.ts              BootScene
  src/game.ts              Phaser.Game 工厂
  src/scene-transition.ts   GameScene + 楼层切换
  src/tilemap.ts           瓦片地图渲染
  src/autotile.ts          自动拼接瓦片
  src/sprite.ts            角色精灵
  src/camera.ts            摄像机系统
  src/particles.ts         粒子特效
  src/font.ts              字体渲染
  src/save.ts              存档系统
  src/dialog.ts            对话框
  src/minimap.ts           小地图
  src/hud.ts               HUD 显示
  src/animation.ts         动画系统
  src/sound.ts             声音系统
  src/weather.ts           天气效果
  src/input/               输入系统（键盘/虚拟手柄/游戏手柄）
  src/bridge.ts            状态桥接（core ↔ render）
packages/ui/               React UI 组件
packages/persistence/       存档 / 录像 / 设置
content/                    关卡数据（已导入魔塔 2014 MT0-MT20）
tools/importer/            mota-js → JSON 导入器
tools/validator/           内容验证器
docs/                      设计文档
```

## 导入新关卡

```bash
pnpm --filter @modern-mota/importer tsx src/cli.ts \
  --source "./Magictower2014/魔塔2014/project" \
  --output "./content/mota-2014" \
  --floors "MT0,MT1,...,MT20"
```

## 验证内容

```bash
pnpm --filter @modern-mota/validator tsx src/cli.ts mota-2014
```

## 设计文档

详见 [docs/superpowers/specs/2026-08-07-modern-mota-design.md](docs/superpowers/specs/2026-08-07-modern-mota-design.md)

## License

MIT

# Phase 3: 渲染层

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Phase 目标**: 在 packages/render 里实现 Phaser 适配层：BootScene / TitleScene / FloorScene / Tilemap 渲染 / 桥接层。

**Phase 估时**: 5-7 天单人

**依赖**: Phase 2 完成（GameState + 事件机稳定）

---

## 详细 spec 参考

- [§1.3 桥接层](../specs/2026-08-07-modern-mota-design.md#13-react--phaser-桥接层)
- [§3 渲染层](../specs/2026-08-07-modern-mota-design.md#3-渲染层)

---

## Task 总览

### Task 1: 桥接层类型契约
- `packages/render/src/bridge/types.ts`: BridgeSpec 接口（spec §1.3）
- 测试：类型编译通过

### Task 2: EventEmitter 实现
- `packages/render/src/bridge/emitter.ts`: 类型安全 EventEmitter<BridgeSpec>
- 测试：on / emit / off / once

### Task 3: 桥接层初始化
- `packages/render/src/bridge/index.ts`: 创建 bridge 实例 + 路由订制
- 测试

### Task 4: Phaser Game 启动器
- `packages/render/src/phaser-game.ts`: createPhaserGame(container, options)
- 测试：DOM 元素存在 / 不存在时报错

### Task 5: BootScene
- `packages/render/src/scenes/BootScene.ts`: 用 Phaser Loader 加载全部 tileset / animate / audio / fonts
- 加载完 emit 'render:ready'
- 测试：mock Phaser.Loader，验证加载清单正确生成

### Task 6: Tile 渲染 — 静态 Tilemap
- `packages/render/src/tiles/static-tilemap.ts`: createTilemap(scene, map2d, tileKey)
- 测试：11×11 数据生成 Tilemap 正确

### Task 7: Tile 渲染 — Autotile 解析
- `packages/render/src/tiles/autotile.ts`: pickAutotileFrame + 47-frame Wang-tile 算法
- 测试：所有邻居组合（最多 2^8 = 256 种）

### Task 8: 动画系统 — MotaAnimate → Phaser Animation
- `packages/render/src/animates/compiler.ts`: fromMotaAnimate
- 测试：输入一个 .animate JSON，输出 Phaser AnimationConfig[]

### Task 9: FloorScene — 整体结构
- `packages/render/src/scenes/FloorScene.ts`: 5 个 layer + grid + actors + camera
- 测试：create / preload / create 生命周期

### Task 10: FloorScene — 玩家渲染
- `packages/render/src/scenes/FloorScene.ts` 加：hero sprite + 走路动画
- 测试：监听到 state.hero 变化，sprite 位置更新

### Task 11: FloorScene — 怪物 / NPC 渲染
- 加：enemy sprite / npc sprite + Group 管理
- 测试：state.actors 变化时正确增删 sprite

### Task 12: FloorScene — 道具渲染
- 加：item sprite（钥匙、宝石、血瓶、装备）
- 测试：拾取时 sprite 消失

### Task 13: FloorScene — 切层淡入淡出
- 加：changeFloor 触发的 fade out / fade in + 楼层名显示
- 测试

### Task 14: TitleScene — 假 3D 背景
- `packages/render/src/scenes/TitleScene.ts`: mota 经典 3D 城堡 + 飘云
- 测试

### Task 15: BattleScene — 战斗动画
- `packages/render/src/scenes/BattleScene.ts`: 挥剑 + 受击闪烁 + 钱币飞向 hero
- 测试：动画时间线正确

### Task 16: DialogueScene — 对话动画
- `packages/render/src/scenes/DialogueScene.ts`: hero/NPC 立绘 + 对话打字机
- 测试

### Task 17: 桥接层路由（接 §1.3）
- `packages/render/src/bridge/router.ts`: bridge.on('render:loadFloor', ...) → FloorScene 监听
- 测试：emit 一个事件，FloorScene 收到

### Task 18: Phaser ↔ Core 状态同步
- `packages/render/src/state-sync.ts`: 监听 gameStore，重画 dirty cell
- 测试：state 变更触发最小重绘

### Task 19: apps/web 集成 Phaser Game
- `apps/web/src/main.tsx` + `App.tsx`: mount Phaser Game
- 测试：浏览器打开看到空 Phaser canvas（无内容但没崩）

---

## Phase 3 完成检查

- [ ] `pnpm typecheck` 0 errors
- [ ] `pnpm test` 全部通过
- [ ] `pnpm dev` 起 Vite，浏览器打开后挂载 Phaser Game（无内容但显示 canvas）
- [ ] BridgeSpec 类型编译通过
- [ ] 桥接层事件路由测试通过
- [ ] FloorScene 渲染 MT0（空层）成功

---

## 下一步

进入 Phase 4：输入层（键盘 + 触屏 + A*）。
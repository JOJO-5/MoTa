# Phase 4: 输入层

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Phase 目标**: 实现 InputSource 抽象 + 键盘 + 触屏三模式（滑动 / 方向键 / 单击）+ A* 寻路集成。

**Phase 估时**: 2-3 天单人

**依赖**: Phase 3 完成

---

## 详细 spec 参考

- [§5.1 输入](../specs/2026-08-07-modern-mota-design.md#51-输入键盘--触屏--鼠标三合一)
- [§3.5 输入抽象层](../specs/2026-08-07-modern-mota-design.md#35-输入抽象层)

---

## Task 总览

### Task 1: PlayerIntent 类型 + InputSource 接口
- `packages/render/src/input/types.ts`: PlayerIntent + InputSource（spec §5.1）
- 测试：类型编译

### Task 2: 键盘输入
- `packages/render/src/input/keyboard.ts`: KeyboardInput 类
  - 方向键 / WASD / 空格 / Esc / F5 / F9 / X（快进）
  - 80ms 节流
- 测试：mock keydown，emit intent

### Task 3: 触屏输入 — 滑动模式
- `packages/render/src/input/touch-swipe.ts`: TouchSwipeInput 类
  - hammer.js: swipe / tap / doubletap / press
  - 节流 / 防抖
- 测试：mock pointer events，emit intent

### Task 4: 触屏输入 — 虚拟方向键模式
- `packages/render/src/input/touch-dpad.ts`: TouchDpadInput 类
  - 4 方向 + 4 动作按钮
  - 长按 300ms 触发 longMove
- 测试

### Task 5: 触屏输入 — 单击格子模式
- `packages/render/src/input/touch-tap.ts`: TouchTapInput 类
  - 每点一格走一格
- 测试

### Task 6: A* 寻路调用
- `packages/render/src/input/path-finder.ts`: 接 Core.aStar，触屏 tap 时调用
- 测试：mock Core，返回路径，转为 move 序列

### Task 7: 输入管理器
- `packages/render/src/input/manager.ts`: InputManager
  - 根据 settings.touchMode 选择 InputSource
  - 启用 / 禁用 / 销毁生命周期
- 测试

### Task 8: 设置面板集成（先做最小）
- `apps/web/src/Settings.tsx`: 简易设置页（含触屏模式切换）
- 测试：切换模式后 InputManager 重建

### Task 9: FloorScene 集成输入
- `packages/render/src/scenes/FloorScene.ts` 加 InputManager
- 测试：玩家按方向键，state 更新

---

## Phase 4 完成检查

- [ ] `pnpm typecheck` 0 errors
- [ ] `pnpm test` 全部通过
- [ ] 桌面浏览器按方向键能移动玩家
- [ ] 触屏浏览器（Chrome DevTools mobile mode）滑动能移动
- [ ] 设置面板切换触屏模式正常

---

## 下一步

进入 Phase 5：React UI（标题 + 状态栏 + 战斗 HUD + 对话 + choices + 商店）。
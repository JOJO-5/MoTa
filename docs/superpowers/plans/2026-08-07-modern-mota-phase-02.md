# Phase 2: 核心逻辑

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Phase 目标**: 在 packages/core 里实现 GameState、战斗公式、移动规则、表达式 AST 求值、事件机。零 UI 依赖，全部可在 Node 单测。

**Phase 估时**: 5-7 天单人

**依赖**: Phase 1 完成（schema 已定义）

---

## 详细 spec 参考

本 Phase 涉及 spec：
- [§1.4 数据流](../specs/2026-08-07-modern-mota-design.md#14-数据流一次玩家上方向键的完整调用链)
- [§4 事件系统](../specs/2026-08-07-modern-mota-design.md#4-事件系统)
- [§2.7 表达式求值](../specs/2026-08-07-modern-mota-design.md#27-表达式求值不-eval-也能算)
- [§2.10 战斗公式](../specs/2026-08-07-modern-mota-design.md)（隐含于 §4.5 battle handler）
- [§5.1.2 触屏寻路 A*](../specs/2026-08-07-modern-mota-design.md#512-触屏寻路)

---

## Task 总览

按以下顺序逐 Task 执行（每个 Task 在执行时展开详细代码 + 测试 + commit 命令）：

### Task 1: GameState 类型 + Zustand store
- `packages/core/src/types.ts`: HeroSnapshot, GameState, FloorSnapshot
- `packages/core/src/state/store.ts`: zustand store + immer 中间件
- 测试：store 初始化、set hero、set flag、set item

### Task 2: 战斗公式（spec §4.5 battle handler）
- `packages/core/src/domain/battle.ts`: `computeBattle(hero, enemy, flags)` 返回 `{ damage, lose, canWin, turns }`
- 测试：100+ cases 从 mota-js 公开公式
  - greenSlime vs hero atk 100, def 100 → 1 回合击杀
  - 蓝衣武士 vs hero hp 9999 → 损失 N（N 随 HP 增长）
  - 中毒/衰弱/诅咒/先攻/吸血特殊属性的怪

### Task 3: 移动规则（spec §4.5 movement handler）
- `packages/core/src/domain/movement.ts`: `tryMove(state, dir)` 返回新 state
- 判断：墙（不可走）/ 门（钥匙够就开）/ 怪（撞上去战斗）/ 道具（拾取）/ NPC / 楼梯 / 推箱
- 测试：30+ cases

### Task 4: 楼层切换（spec §4.5 changeFloor handler）
- `packages/core/src/domain/floor.ts`: `changeFloor(state, floorId, loc)` 返回新 state
- 测试：从 MT1 上楼到 MT2、边界、循环引用报错

### Task 5: 表达式 AST 求值（spec §4.2）
- `packages/core/src/events/expr.ts`: 用 jsep 解析 + 白名单 visitor
- `packages/core/src/events/scope.ts`: Scope 接口 + makeScope
- 测试：100+ cases
  - `status:hp` / `status:hp+10` / `flag:tutorial>=2`
  - `${1*flag:arg1}` 模板渲染
  - 拒绝 `eval` / `Function` / `setTimeout`

### Task 6: 事件机主循环（spec §4.3）
- `packages/core/src/events/runner.ts`: AsyncGenerator
- `EventMachine` 类：start / resume / wait
- 测试：yield/resume 流程

### Task 7: Handler — control.ts
- `packages/core/src/events/handlers/control.ts`: if / switch / while / for / break / continue
- 测试：30+ cases

### Task 8: Handler — value.ts
- `packages/core/src/events/handlers/value.ts`: setValue / addValue / setFlag / addFlag / setAttr
- 测试：各种 namespace

### Task 9: Handler — ui.ts
- `packages/core/src/events/handlers/ui.ts`: tip / choices / showText / wait / sleep / input
- 测试：异步 yield

### Task 10: Handler — visual.ts
- `packages/core/src/events/handlers/visual.ts`: showImage / hideImage / moveImage / show / hide / setBlock / animate
- 测试

### Task 11: Handler — battle.ts
- `packages/core/src/events/handlers/battle.ts`: battle / getItem / setItem / loseItem / useItem
- 测试：调用 §4.2 的 battle 公式

### Task 12: Handler — movement.ts
- `packages/core/src/events/handlers/movement.ts`: openDoor / changeFloor / passNet / pushBox / changeLight / ski
- 测试

### Task 13: Handler — system.ts（含 function 灰名单）
- `packages/core/src/events/handlers/system.ts`: comment / exit / callSave / callLoad / replay / function (灰名单)
- 测试：function 灰名单被调用时抛 warning

### Task 14: commonEvent 字典桥接（spec §4.6）
- `packages/core/src/plugin.ts`: `corePlugin.commonEvent(name, ...args)`
- 测试：跨楼复用

### Task 15: 错误处理（spec §4.7）
- `packages/core/src/events/error.ts`: EventError
- 测试：错误信息含 floorId + path

### Task 16: A* 寻路（spec §5.1.2）
- `packages/core/src/pathfinding/a-star.ts`
- 测试：阻挡 / 钥匙开销 / 怪阻挡

### Task 17: 整合 + 出口
- `packages/core/src/index.ts`: 导出所有公共 API
- 测试：端到端"玩家上方向键"流程

---

## Phase 2 完成检查

- [ ] `pnpm typecheck` 0 errors
- [ ] `pnpm test` 全部通过，覆盖率：
  - core/src/domain ≥ 90%
  - core/src/events ≥ 90%
  - core/src/events/expr.ts ≥ 95%
- [ ] 战斗公式 100+ 单测与 mota-js 公开案例一致
- [ ] 事件机 yield/resume 端到端流程跑通
- [ ] `git log` 看得到 17+ 个 commit（每个 Task 一个）

---

## 下一步

进入 Phase 3：渲染层（Phaser Scene + Tilemap + 桥接层）。
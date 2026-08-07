# Phase 6: 存档

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Phase 目标**: 实现 SaveSlot + IndexedDBStorage + LocalStorageStorage 降级 + 录像录制/回放 + 导入/导出。

**Phase 估时**: 3-4 天单人

**依赖**: Phase 2 完成（GameState 稳定）

---

## 详细 spec 参考

- [§5.2 存档](../specs/2026-08-07-modern-mota-design.md#52-存档三层结构)
- [§5.3 录像](../specs/2026-08-07-modern-mota-design.md#53-录像replay)
- [§5.4 玩家设置](../specs/2026-08-07-modern-mota-design.md#54-玩家设置)

---

## Task 总览

### Task 1: 存档类型
- `packages/persistence/src/types.ts`: SaveSlot, HeroSnapshot, EquipmentSnapshot, ReplayBlob, ReplayStep
- 测试：类型编译

### Task 2: IndexedDBStorage
- `packages/persistence/src/storage/IndexedDBStorage.ts`
- 5 个 slot + 1 个 autoSave + replays store
- 测试：用 fake-indexeddb 跑 CRUD

### Task 3: LocalStorageStorage
- `packages/persistence/src/storage/LocalStorageStorage.ts`
- 5MB 限制 + replay 截断
- 测试

### Task 4: 存储抽象 + 自动降级
- `packages/persistence/src/storage/index.ts`: createStorage() try IDB fallback localStorage
- 测试

### Task 5: 版本迁移
- `packages/persistence/src/migrate.ts`: migrate(raw, targetVersion)
- 测试：v0.1.0 → v0.2.0 字段加 manamax

### Task 6: 存档时机（spec §5.2.3）
- `packages/persistence/src/auto-save.ts`: 监听 step count + 切楼层 + choices 弹窗
- 测试

### Task 7: 导入/导出
- `packages/persistence/src/io/export.ts`: exportAll() → Blob
- `packages/persistence/src/io/import.ts`: importAll(blob)
- 测试：往返一致性

### Task 8: 录像录制
- `packages/persistence/src/replay/recorder.ts`: ReplayRecorder
- 过滤非游戏操作
- 测试：模拟 100 个 move intent，验证 steps 数组

### Task 9: 录像回放
- `packages/persistence/src/replay/player.ts`: ReplayPlayer
- tick() + setSpeed + pause / resume / seek / step / stepBack
- 测试

### Task 10: 缩录图生成
- `packages/persistence/src/screenshot.ts`: Phaser canvas.toDataURL 200×150 jpeg
- 测试

### Task 11: 玩家设置
- `packages/persistence/src/settings.ts`: PlayerSettings + localStorage 持久化
- 测试

### Task 12: 存档 UI（接入 Phase 5 的 SaveModal）
- `apps/web/src/SaveModal.tsx` 集成 createStorage + listSlots + write/read/delete
- 测试

### Task 13: 录像 UI
- `apps/web/src/ReplayModal.tsx`
- 测试

---

## Phase 6 完成检查

- [ ] `pnpm typecheck` 0 errors
- [ ] `pnpm test` 全部通过
- [ ] IndexedDBStorage + LocalStorageStorage 都跑通
- [ ] 存档/读档端到端：玩家走到 MT3，存档，重启浏览器，读档，状态完整
- [ ] 录像录制 100+ 步 + 回放速率 0.5x/1x/2x/4x 正确
- [ ] 导入导出 JSON 往返一致

---

## 下一步

进入 Phase 7：美术（AI 出图 + 主题）。
# Phase 1: 数据层

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Phase 目标**: 把 mota-js 的 JSON 资产搬到 packages/data，建立 zod schema + loader + importer + validator。把 Magictower2014 前 20 层导入 content/mota-2014。

**Phase 估时**: 3-4 天单人

**依赖**: Phase 0 完成

---

## 本 Phase 概览

执行顺序：

1. **Task 1**: zod schema — main / flags / values / enemy / mapBlock / item / floor / event（覆盖 spec §2.4-2.6）
2. **Task 2**: loader.ts — 读 JSON → 校验 → 冻结（spec §2.8）
3. **Task 3**: importer CLI — mota-js → 新格式（spec §2.9）
4. **Task 4**: 导入 Magictower2014 前 20 层 → content/mota-2014
5. **Task 5**: validator CLI — schema / 引用 / 可达性 / 可解性（spec §7.4）
6. **Task 6**: 跑 validator 通过，生成导入报告

**详细 Task 内容在本 Phase 执行时展开**（writing-plans skill 要求每个 Task 包含完整代码 + 测试）。执行本 Phase 时按以下章节逐 Task 完成。

---

## Task 1: zod schema

### Files

- Create: `packages/data/src/schema/flags.ts`
- Create: `packages/data/src/schema/values.ts`
- Create: `packages/data/src/schema/enemy.ts`
- Create: `packages/data/src/schema/mapBlock.ts`
- Create: `packages/data/src/schema/item.ts`
- Create: `packages/data/src/schema/event.ts`
- Create: `packages/data/src/schema/floor.ts`
- Create: `packages/data/src/schema/main.ts`
- Create: `packages/data/src/schema/index.ts`
- Create: `packages/data/src/schema/__tests__/*.test.ts`（每 schema 一个测试）

### 关键 Schema 内容（spec §2.4-2.6 已定义完整代码）

每个 schema 是 zod 对象，加 `.strict()` 禁止未知字段。`flags.ts` 30+ 字段从 mota-js 全保留。`event.ts` 用 `z.discriminatedUnion('type', [...])` 实现 30+ 事件类型判别联合。`floor.ts` 包含 13 个事件钩子（firstArrive / eachArrive / parallelDo / events / cannotMove / afterBattle / afterGetItem / afterOpenDoor / changeFloor 等）。

### TDD 步骤（每个 schema 文件按此循环）

1. 写 `__tests__/<name>.test.ts`，定义 3-5 个合法 + 1-2 个非法样本
2. 跑 `pnpm test`，确认 fail
3. 写 schema 实现
4. 跑 `pnpm test`，确认 pass
5. commit

### 验收

- 所有 schema 测试通过
- `pnpm typecheck` 通过
- 任意一个 schema 拒绝未知字段时抛 clear error

---

## Task 2: loader.ts

### Files

- Create: `packages/data/src/loader.ts`
- Create: `packages/data/src/loader.test.ts`
- Create: `packages/data/src/index.ts`（导出 loader + 所有 schema）

### 关键代码（spec §2.8）

`loadTowerContent(root)` 异步函数：Promise.all 拉所有 JSON → zod parse → Object.freeze。返回 `TowerContent` 不可变对象。

### TDD 步骤

1. 写测试：传一个临时目录（Vitest fixture）含合法 JSON → 期望解析成功
2. 写测试：传缺字段的 JSON → 期望抛 ZodError，错误信息含字段名
3. 写测试：传未知字段 → 期望抛 ZodError（strict）
4. 写实现
5. 跑测试
7. commit

---

## Task 3: importer CLI

### Files

- Create: `tools/importer/src/parse-mota-js.ts`
- Create: `tools/importer/src/parse-mota-js.test.ts`
- Create: `tools/importer/src/import.ts`
- Create: `tools/importer/src/cli.ts`
- Create: `tools/importer/package.json`
- Create: `tools/importer/tsconfig.json`

### 关键实现（spec §7.2）

`extractTopLevelObject(code)`: 用 acorn 解析 `var X = {...}` 抽出对象字面量。`extractMainFloors(code)`: 处理 `main.floors.MTxx = {...}` 模式。

`importOne(srcDir, outDir)`: 遍历 srcDir/project/ + srcDir/project/floors/，转换 + 复制 art/originals/ + 写 _meta.json + 跑 validator + 输出报告。

### TDD 步骤

1. 写 fixtures/ 目录：放几个真实 mota-js 文件样本
2. 写 parse-mota-js 测试
3. 写 import.ts 测试
4. 写 cli.ts（tsx 可执行）
5. commit

### CLI 用法

```bash
pnpm tsx tools/importer/src/cli.ts <srcDir> <outDir>
```

---

## Task 4: 导入 Magictower2014 前 20 层

### Files

- Create: `content/mota-2014/data.json`
- Create: `content/mota-2014/enemys.json`
- Create: `content/mota-2014/maps.json`
- Create: `content/mota-2014/items.json`
- Create: `content/mota-2014/events.json`
- Create: `content/mota-2014/floors/MT0.json` ~ `MT20.json`
- Create: `content/mota-2014/_meta.json`

### 步骤

1. 准备 Magictower2014 工程在仓库根（或 git submodule / 单独下载）
2. 跑 importer：截 MT0 + MT1~MT20（不导 MT21~MT26 / SM* / JX* / Dark*）
3. 手动修改 `data.json.floorIds` 改 `[MT0, MT1, ..., MT20]`
4. 检查 MT20 之后的 `changeFloor` 引用：手动改为"通顶"事件（玩家走到 MT20 后无下层）
5. 写 _meta.json：{ id: 'mota-2014', version: '1.0.0', source: 'Magictower2014' }
6. 跑 validator 确认通过

### 验收

- `pnpm validate mota-2014` 0 error
- 全部 21 层（MT0~MT20）通过 schema 校验

---

## Task 5: validator CLI

### Files

- Create: `tools/validator/src/checks/schema.ts`
- Create: `tools/validator/src/checks/references.ts`
- Create: `tools/validator/src/checks/balance.ts`
- Create: `tools/validator/src/checks/reachable.ts`
- Create: `tools/validator/src/checks/solvable.ts`
- Create: `tools/validator/src/checks/resources.ts`
- Create: `tools/validator/src/checks/names.ts`
- Create: `tools/validator/src/checks/i18n.ts`
- Create: `tools/validator/src/checks/a11y.ts`
- Create: `tools/validator/src/cli.ts`
- Create: `tools/validator/package.json`
- Create: `tools/validator/tsconfig.json`
- Create: `tools/validator/src/__tests__/*.test.ts`

### 检查项（spec §7.4）

| 检查 | 实现思路 |
|---|---|
| Schema | 所有 JSON 走 zod parse |
| 引用完整性 | 收集所有 enemyId / itemId / mapBlockId，验证每个引用都在 |
| 数值平衡 | 怪物 atk/def/money 范围合理（如 1 ≤ atk ≤ 9999） |
| 可达性 | BFS/DFS 从 MT0 出发，看能走到哪些层 |
| 可解性 | BFS 找通关路径（蒙特卡洛 + 剪枝） |
| 资源 | 读 data.json 的 tilesets/animates/bgms/sounds，验证文件存在 |
| 命名 | 所有 floorId / enemyId / itemId 唯一 |
| i18n | 检查 events.json / npc 文本非空 |
| a11y | 暂时 stub（spec 不要求首版实现） |

### TDD

每个 check 写测试 → 跑红 → 实现 → 跑绿 → commit。

---

## Task 6: 跑 validator 通过

```bash
pnpm validate mota-2014
```

预期输出（spec §7.4 示例）：

```
Validating tower: mota-2014
✓ Schema: 32/32 files
✓ References: all resolve
✓ Balance: 60 enemies, all within range
✓ Reachable: 21/21 floors reachable
✓ Solvable: BFS found winning path in 0.8s
✓ Resources: 412 sprites, 22 audio, 0 missing
✓ Names: 0 duplicates
✓ i18n: 0 missing keys
⚠ A11y: 2 buttons have contrast 3.8:1
✓ ALL CHECKS PASSED (1 warning)
```

如果某项 fail，回到对应 Task 修。

---

## Phase 1 完成检查

- [ ] `pnpm typecheck` 0 errors
- [ ] `pnpm test` 全部通过（含 schema + loader + importer + validator）
- [ ] `pnpm validate mota-2014` 通过
- [ ] `content/mota-2014/` 完整 21 层数据
- [ ] `git log` 看得到 6+ 个 commit

---

## 下一步

进入 Phase 2：核心逻辑（GameState + 战斗 + 移动 + 事件机）。详细 plan 在执行 Phase 2 时展开。
# 魔塔玩法正确性与存档安全修复计划

> 计划日期：2026-08-10
> 审查基线：`main` / `68708c3`
> 线上复现版本：`https://jojo-5.github.io/MoTa/?audit=68708c3`
> 本文用途：交给后续模型按阶段执行；本文自身不包含游戏代码修改。

## 目标

先修复会卡死存档、阻断通关或破坏数值成长的问题，再补齐旧版特殊规则，最后处理低风险 UI 问题。执行结束后，玩家应能安全保存、正确获得装备和成长道具，关键剧情不会堵路，怪物特殊能力与特殊模式道具符合《魔塔2014》本地原始工程的规则。

## 当前确认的问题

| 优先级 | 编号        | 问题                               | 已确认结果                                                                 |
| ------ | ----------- | ---------------------------------- | -------------------------------------------------------------------------- |
| P0     | SAVE-01     | 对话或选择中保存后读档永久卡住     | `ui.modal` 被恢复，但事件生成器和待选项没有恢复；移动、行动均被 modal 拦截 |
| P0     | ITEM-01     | 高级装备进入背包但不装备、不加属性 | MT11 银光剑领取后 ATK 仍为 18，当前装备仍是铁剑，地图物品已消失            |
| P0     | ITEM-02     | 中后期即时属性道具不生效           | JX10 粉色元气瓶领取后 HP 仍为 1000，只进入“暂未接入”的背包                 |
| P0     | EVENT-01    | JX21 的 NPC 移动事件被跳过         | NPC 留在 `(4,13)`，目标 `(5,13)` 和后续敌人却已隐藏，可能堵死走廊          |
| P1     | TOOL-01     | 特殊模式破墙镐规则缺失             | `flag:pzf=1` 时，MT11 星图块仍提示不可破坏                                 |
| P1     | ENEMY-01    | 领域、夹击、阻击没有进入移动结算   | JX18 进入领域怪范围后没有受到应有的 100 点伤害                             |
| P1     | EVENT-02    | `setFloor` 被错误解释为切换楼层    | 数据中的 8 处楼层属性更新没有真正写入楼层状态                              |
| P2     | SETTINGS-01 | 设置页控件没有运行时效果           | BGM、SFX、小地图均只有 `defaultValue/defaultChecked`                       |
| P2     | COPY-01     | 开门提示泄露内部英文 ID            | 显示 `yellowDoor 已开启`，而不是“黄门已开启”                               |

## 执行约束

1. 按本文阶段顺序执行；P0 未全部通过前，不做素材和地图美术调整。
2. 每个任务先补失败测试，再实现修复。不得只修改测试来适配错误行为。
3. 旧版行为以仓库内 `Magictower2014/魔塔2014/project/` 和 `content/mota-2014/` 为主要证据，不凭印象重写规则。
4. 禁止通过 `eval`、`Function` 或脚本注入直接执行 `items.json` 中的 `itemEffect` 字符串；必须转换为受控、可测试的效果描述。
5. 不批量改写 65 层关卡 JSON 来绕过运行时缺陷。相同语义应在核心逻辑中统一实现。
6. 保存数据只包含可持久化状态。对话框、战斗动画、路径队列、计时器和事件生成器都属于瞬态状态。
7. 每个阶段单独提交。仓库已有的截图、恢复数据、源素材、`.playwright-cli/` 和 `output/` 不得加入提交。
8. 不宣称“全部可通关”，除非至少完成本文规定的自动化、浏览器和发布后验证。

---

## Phase 0：建立失败基线和内容覆盖清单

### Task 0.1：为九个问题补回归测试

**修改或新增文件：**

- `packages/render/src/save.test.ts`
- `apps/web/src/App.test.tsx`
- `packages/core/src/logic/tile-interactions.test.ts`
- `packages/core/src/logic/item-use.test.ts`
- `packages/core/src/logic/event-machine.test.ts`
- `packages/core/src/logic/move.test.ts`
- `packages/render/src/scene-transition.test.ts`
- `apps/web/src/components/Settings.test.tsx`
- `apps/web/e2e/main-flow.spec.ts`

**测试要求：**

- [ ] 保存测试证明持久化数据中不包含 `ui.modal`、`ui.floorMsg`、`battle` 等瞬态字段。
- [ ] 兼容测试加载一个旧版“modal 已打开”的坏存档，加载后必须可移动、事件机为 `idle`。
- [ ] 领取 `sword1` 后再领取 `sword2`，ATK 从基础 10 变为 18、再变为 36；不能变为 44，也不能停在 18。
- [ ] 重复加载同一存档、重复渲染背包都不能再次叠加装备属性。
- [ ] `I451/I452/I453/I455/I456/I457/I458/I353/superPotion` 分别按原始定义修改 HP、ATK、DEF、MDEF、金币。
- [ ] MT11 特殊模式破星图块成功；普通模式失败且不消耗破墙镐。
- [ ] JX18 领域怪测试、同种怪夹击测试、阻击伤害和推怪测试均先失败。
- [ ] JX21 事件结束后 `(4,13)` 为空、NPC 到达或按剧情从 `(5,13)` 消失，且玩家可以通过走廊。
- [ ] `setFloor` 修改 `canFlyFrom` 等属性时不得改变当前 `floorId`。
- [ ] 黄门打开后的中文消息为“黄门已开启”。

### Task 0.2：增加内容能力审计

**建议新增：**

- `tools/validator/src/checks/gameplay-coverage.ts`
- `tools/validator/src/checks/gameplay-coverage.test.ts`

**要求：**

- [ ] 扫描所有非空 `itemEffect`，输出“已转换/明确不需要/未支持”三类，未支持项使 CI 失败。
- [ ] 扫描所有怪物 `special` 编号，生成唯一编号和使用次数；运行时未支持的玩法型 special 使 CI 失败。
- [ ] 扫描所有旧版事件类型；会改变状态但仍落入 deferred/no-op 的事件使 CI 失败。
- [ ] 报告必须列出道具 ID、怪物 ID、楼层和坐标，不能只给总数。

**Phase 0 验收：**

- [ ] 新测试能稳定复现问题，而不是依赖随机计时。
- [ ] 原有 146 项测试仍通过；新增测试在实现前按预期失败。

---

## Phase 1：修复保存、读档和旧坏存档恢复

### Task 1.1：定义持久化状态边界和存档版本

**修改文件：**

- `packages/render/src/save.ts`
- `packages/render/src/save.test.ts`
- `packages/core/src/types.ts`（如需新增持久化类型）

**设计要求：**

- [ ] 给存档增加显式 `version`，不要继续把整个 `GameState` 原样塞入 localStorage。
- [ ] 建立 `serializeGameState()` 和 `hydrateGameState()`，使用字段白名单保存英雄、楼层、位置、方向、flags、values、钥匙/背包/装备、访问楼层、地图 override、已拾取坐标等持久化数据。
- [ ] 不持久化 `ui`、`battle`、事件机 generator、pending choice、路径队列、动画和计时器。
- [ ] 读档后以默认瞬态状态初始化：`ui.modal=null`、消息为空、`battle=null`，事件机为 `idle`。
- [ ] 对无版本的旧存档做一次迁移；即使旧存档带 modal 或 battle，也要清理瞬态字段后恢复，不能要求玩家删档。
- [ ] JSON 损坏、字段缺失或版本过新时返回可读中文错误，不得白屏。

### Task 1.2：只允许在稳定检查点保存

**修改文件：**

- `apps/web/src/components/GameCanvas.tsx`
- `packages/render/src/save.ts`
- 对应测试和样式

**规则：**

- [ ] 新增统一 `canSaveGame(state, eventMachineState)`。
- [ ] 事件机为 `running/waiting`、对话/选择打开、战斗中、切层中、自动寻路执行中时不允许保存。
- [ ] 保存按钮禁用并显示中文原因，例如“请结束当前对话后再保存”。
- [ ] `backToMenu`、`restartGame`、`continueGame` 在加载新场景前统一 `eventMachine.stop()` 并清理瞬态状态。
- [ ] 保存成功提示只能在序列化成功后出现。

**Phase 1 验收：**

- [ ] MT0 贤者选择对话中点击保存，不写入坏存档，并显示原因。
- [ ] 构造旧坏存档后继续游戏，对话框不会残留，方向键和 A 键可用。
- [ ] 正常位置保存、返回菜单、继续后，英雄属性、位置、已开门和已拾取道具完全一致。

---

## Phase 2：统一物品获取、装备替换和即时效果

### Task 2.1：建立受控的物品效果模型

**建议新增：**

- `packages/core/src/logic/item-effects.ts`
- `packages/core/src/logic/item-effects.test.ts`

**修改：**

- `packages/core/src/logic/tile-interactions.ts`
- `packages/core/src/logic/event-machine.ts`
- `packages/core/src/types.ts`

**建议接口：**

```ts
type ItemEffect =
  | { type: 'add-stat'; stat: 'hp' | 'atk' | 'def' | 'mdef' | 'money' | 'exp'; value: number }
  | { type: 'multiply-stat'; stat: 'hp'; value: number }
  | { type: 'add-key'; key: string; value: number }
  | { type: 'equip'; slot: 'weapon' | 'shield' | 'accessory'; itemId: string }
  | { type: 'add-tool'; itemId: string; value: number }

resolveItemEffects(itemId, rawItem): ItemEffect[]
grantItem(itemId, count, source): GrantItemResult
```

**要求：**

- [ ] 将现有钥匙、四种基础宝石、基础药水和装备逻辑全部迁移到同一个 `grantItem` 入口。
- [ ] 为当前内容中的全部 `itemEffect` 建立显式转换；允许用构建期脚本生成 manifest，但运行时不得执行任意代码字符串。
- [ ] `setValue item:<id>` 从 0 增加到正数时，也必须经过统一授予逻辑；不能只更新 `State.values`。
- [ ] 数量赋值、数量增加和首次获得要区分，防止读档或事件重复运行时重复加属性。
- [ ] 提示文案来自 `item.name` 和规范化效果，不再出现多余开头逗号或“暂未接入”。

### Task 2.2：正确实现装备替换

**规则：**

- [ ] `equip.value` 表示该装备的累计槽位加成；切换时使用“当前属性 - 旧槽位累计值 + 新槽位累计值”。
- [ ] 示例：基础 ATK 10，铁剑累计 +8，银光剑累计 +26；最终应为 36。
- [ ] 不能在获得银光剑时直接把 +26 叠到已经含铁剑 +8 的属性上，否则会错误变成 44。
- [ ] 装备 ID、装备槽位和背包数量一次状态提交完成，避免 UI 短暂显示属性与装备不一致。
- [ ] 同一装备重复授予不重复加属性；降级/切换也必须按旧值与新值差额正确计算。
- [ ] 为所有 `sword1..5`、`shield1..5` 建立表驱动测试，并检查正常关卡获取顺序。

### Task 2.3：补齐中后期即时物品

**最低必须覆盖：**

- [ ] `I451` HP +500
- [ ] `I452` HP +1000
- [ ] `I453` HP +2000
- [ ] `I455` ATK +10
- [ ] `I456` DEF +10
- [ ] `I457` ATK +5、DEF +5
- [ ] `I458` MDEF +10
- [ ] `I353` 金币 +200
- [ ] `superPotion` 当前 HP ×2
- [ ] 审计工具列出的其余非空 `itemEffect`

**Phase 2 验收：**

- [ ] MT4 铁剑、MT11 银光剑真实关卡事件连续执行后，装备和 ATK 均正确。
- [ ] JX10 粉色元气瓶拾取后 HP 立即 +500，物品不留在“暂未接入”背包。
- [ ] 保存再读取不会重新结算任何一次性效果。
- [ ] 内容审计中不存在未支持的非空 `itemEffect`。

---

## Phase 3：补齐特殊模式工具和主动道具

### Task 3.1：实现特殊模式破墙规则

**修改文件：**

- `packages/core/src/logic/item-use.ts`
- `packages/core/src/logic/item-use.test.ts`
- `packages/render/src/scene-transition.ts`

**要求：**

- [ ] 从本地原始工程提取破墙镐判定，不在测试里臆造规则。
- [ ] 普通 `canBreak: true` 墙继续可破坏。
- [ ] `flag:pzf=1` 时允许原版声明的 MT10/MT26 特殊墙和 MT11～MT20 星图块。
- [ ] 成功时只清除前方目标并消耗 1 个；失败不消耗。
- [ ] 地图 override、碰撞、渲染和存档保持一致。

### Task 3.2：完成当前背包中声明可用的工具

**范围：**

- [ ] `weakWine`：按旧版规则解除衰弱并恢复对应损失属性。
- [ ] `poisonWine`：解除中毒。
- [ ] `centerFly`：校验中心对称落点、目标可通行且不触发非法穿墙。
- [ ] `bomb`、`book`、`pickaxe` 保持现有行为并补无效目标测试。
- [ ] 无法在当前架构安全实现的工具必须从“可使用”列表移除并给出准确中文状态，不能显示假按钮。

**Phase 3 验收：**

- [ ] MT11 特殊模式星图块可破，普通模式不可破。
- [ ] 主动道具成功/失败的消耗规则均有单测。
- [ ] 使用道具后保存读档，库存和地图变化保持一致。

---

## Phase 4：实现怪物地图特殊能力

### Task 4.1：建立纯函数步进危险结算器

**建议新增：**

- `packages/core/src/logic/step-hazards.ts`
- `packages/core/src/logic/step-hazards.test.ts`

**修改：**

- `packages/core/src/logic/move.ts`
- `packages/core/src/logic/battle-utils.ts`
- `packages/render/src/scene-transition.ts`

**设计要求：**

- [ ] 从 `Magictower2014/魔塔2014/project/functions.js` 对照 special 15、16、18 的计算顺序、范围、伤害来源和例外条件。
- [ ] 结算输入只依赖当前状态、运行时地图、怪物表和目标位置，输出 HP 变化、推怪 override、提示信息等 effect，不直接操作 Phaser。
- [ ] 移动顺序固定为：验证移动 → 提交位置 → 结算步进状态/怪物特殊能力 → 判断死亡 → 再处理目标格互动；若原版顺序不同，以原版为准并在测试注明。
- [ ] 使用运行时地图，已死亡或隐藏的怪物不能继续产生领域、夹击或阻击。
- [ ] 怪物手册中的预计损伤要明确区分普通战斗伤害和地图额外伤害。

### Task 4.2：实现 special 15、16、18

- [ ] 领域（15）：进入有效范围时按怪物参数扣血，多个领域的叠加规则与原版一致。
- [ ] 夹击（16）：玩家处于满足条件的两只对应怪物之间时按原版比例扣血，处理奇数 HP 和最低值。
- [ ] 阻击（18）：按原版扣血并移动怪物；目标格不可用时不产生非法覆盖。
- [ ] 每种能力覆盖边界、地图边缘、隐藏怪、多个怪物重叠范围和致死情况。
- [ ] 死亡统一进入已有失败弹窗和重新开始流程，不得只把 HP 变成 0 后锁住输入。

**Phase 4 验收：**

- [ ] JX18 watcherSlime 的复现位置从 `(4,5)` 移到 `(4,4)` 后正确受到 100 点领域伤害。
- [ ] 夹击和阻击至少各选择一个真实楼层坐标做 fixture 回归。
- [ ] 所有内容中出现的玩法型怪物 special 都被审计标记为已支持，或另有明确后续计划并阻止宣称全关卡可玩。

---

## Phase 5：修复状态型旧版事件

### Task 5.1：实现通用 `move` 事件并修复 JX21

**修改文件：**

- `packages/core/src/logic/event-machine.ts`
- `packages/core/src/logic/event-machine.test.ts`
- `packages/core/src/logic/floor-state.ts`
- `packages/render/src/scene-transition.ts`

**要求：**

- [ ] `move` 按事件指定的起点、方向序列和步数移动运行时图块，而不是只播放动画。
- [ ] 每一步验证边界和目标格；状态移动成功后再由渲染层补动画。
- [ ] `turnBlock` 方向和 `move` 后位置保存到运行时 override，离开楼层再返回仍一致。
- [ ] JX21 剧情结束时 NPC 不留在 `(4,13)`，玩家可通过走廊。
- [ ] 事件中途停止、切层或重复进入时不得复制 NPC。

### Task 5.2：按语义实现 `setFloor`

**建议状态：**

```ts
type RuntimeFloorProperties = Record<string, Record<string, unknown>>
```

**要求：**

- [ ] `setFloor` 读取目标楼层、属性名和 value/operator，写入对应楼层运行时属性。
- [ ] 不能 dispatch `ENTER_FLOOR` 代替属性更新。
- [ ] `canFlyFrom`、`canFlyTo` 等消费者统一读取“静态楼层数据 + 运行时覆盖”。
- [ ] 属性覆盖进入存档并通过旧存档默认值迁移。
- [ ] 用 MT25 和 SM1～SM7 的真实事件建立表驱动测试。

**Phase 5 验收：**

- [ ] JX21 首次剧情和再次进入均不会堵路或重复 NPC。
- [ ] 8 处 `setFloor` 事件全部有明确测试结果。
- [ ] 内容审计不再报告玩法型 `move/setFloor` 为 deferred/no-op。

---

## Phase 6：低风险 UI 与中文提示

### Task 6.1：中文化内部 ID 提示

- [ ] `tryOpenDoor` 使用地图条目的中文 `name`；缺失时使用门 ID 到中文名的集中映射。
- [ ] 黄、蓝、红、绿、铁门和特殊门均有测试。
- [ ] 扫描用户可见字符串，禁止直接拼接 `entry.id`、`itemId`、内部变量名。

### Task 6.2：让设置页反映真实能力

**原则：** 不提供没有运行时效果的设置。

- [ ] BGM/SFX 若音频系统尚未接入，则暂时移除或标为“音频功能开发中”，不能保留可拖动但无效的滑块。
- [ ] 若接入音频，使用受控 React 状态并持久化设置，播放器实时读取音量。
- [ ] “显示小地图”只有在确实存在小地图渲染时保留；否则删除该选项。
- [ ] 设置返回主菜单再进入时保持用户选择。

**Phase 6 验收：**

- [ ] 开黄门显示“黄门已开启”。
- [ ] 设置页每个可操作控件都能观察到实际效果并有组件测试。

---

## 分层验证与发布门禁

### 每个阶段必须执行

```powershell
corepack pnpm --filter @modern-mota/core test
corepack pnpm --filter @modern-mota/render test
corepack pnpm --filter @modern-mota/web test
corepack pnpm -r typecheck
```

### 全部完成后必须执行

```powershell
corepack pnpm test
corepack pnpm typecheck
corepack pnpm build
corepack pnpm test:e2e
```

### 浏览器验收矩阵

| 场景                   | 桌面 Chromium | 412×915 移动视口 | 断言                                 |
| ---------------------- | ------------- | ---------------- | ------------------------------------ |
| 对话中保存             | 必测          | 必测             | 保存被阻止且有中文原因；旧坏档可恢复 |
| MT4 铁剑 → MT11 银光剑 | 必测          | 至少复验最终属性 | ATK 10→18→36，装备为银光剑           |
| JX10 粉色元气瓶        | 必测          | 可选             | HP 立即 +500，不进入不可用背包       |
| MT11 特殊模式破星      | 必测          | 可选             | 成功清除并消耗 1 个破墙镐            |
| JX18 领域              | 必测          | 可选             | 进入范围扣 100 HP                    |
| JX21 剧情              | 必测          | 必测             | NPC 正确移动/消失，走廊可通行        |
| 黄门提示               | 必测          | 必测             | 只显示中文名称                       |

浏览器测试应使用真实 UI 输入完成保存、读档、移动、对话推进和道具使用。深层楼层允许使用明确的测试存档或测试夹具快速到达，但到达后的核心动作不得直接 dispatch 结果状态代替玩家操作。

### 发布后确认

- [ ] 只提交本计划涉及的代码和测试，不提交当前无关的未跟踪文件。
- [ ] 推送后等待 GitHub Actions 的 test/typecheck/build/e2e/deploy 全部成功。
- [ ] 记录精确 commit SHA，并打开 `https://jojo-5.github.io/MoTa/?v=<short-sha>`，避免缓存旧版本。
- [ ] 对上表至少 P0 场景做一次 Pages 复验。
- [ ] 自动化通过、Pages 入口可打开、真实交互通过要分别记录，不能互相代替。

## 推荐提交顺序

1. `test: add gameplay correctness regression baselines`
2. `fix: version saves and recover transient-state saves`
3. `fix: centralize item grants and equipment replacement`
4. `feat: support special-mode tools and active items`
5. `feat: resolve zone between and repulse step hazards`
6. `fix: execute legacy move and setFloor events`
7. `fix: localize door feedback and align settings UI`
8. `test: add gameplay coverage validator and e2e gates`

## 最终完成定义

- [ ] 对话、选择、战斗和切层期间不能产生无法恢复的存档；已有坏档可迁移恢复。
- [ ] 所有装备升级正确替换累计加成，读档和重复事件不会重复叠加。
- [ ] 所有非空 `itemEffect` 均已受控实现或由 CI 明确阻止发布。
- [ ] 特殊模式破墙镐、当前展示为可用的主动道具均符合旧版规则。
- [ ] 领域、夹击、阻击在运行时地图上正确结算，并接入死亡/重新开始流程。
- [ ] JX21 不堵路，`move` 和 `setFloor` 不再是玩法型 no-op。
- [ ] 用户可见的开门和物品反馈不泄露内部英文 ID。
- [ ] 全量测试、类型检查、构建、E2E、CI、Pages 精确版本复验全部通过。

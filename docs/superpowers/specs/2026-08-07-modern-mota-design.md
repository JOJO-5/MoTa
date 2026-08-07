# Modern Mota — 现代化魔塔 20 层复刻设计文档

- **日期**：2026-08-07
- **作者**：与 TRAE 协作产出
- **状态**：Draft v1，待用户审阅
- **项目代号**：`modern-mota`（暂定名，可改）
- **目标**：用现代前端栈（Phaser 3 + React + TypeScript + Vite）从零复刻 [gameschool.cc/game/172/](http://gameschool.cc/game/172/) 那款 20 层魔塔游戏，保留经典玩法 + 触屏键盘双优 + AI 换皮

---

## 目录

- [0. 背景与动机](#0-背景与动机)
- [1. 整体架构](#1-整体架构)
- [2. 数据层](#2-数据层)
- [3. 渲染层](#3-渲染层)
- [4. 事件系统](#4-事件系统)
- [5. 输入 + 存档](#5-输入--存档)
- [6. React UI 边界](#6-react-ui-边界)
- [7. 工具链](#7-工具链)
- [8. 首版交付清单](#8-首版交付清单)
- [附录 A：决策记录](#附录-a决策记录)
- [附录 B：未来路线](#附录-b未来路线)

---

## 0. 背景与动机

### 0.1 起点

[gameschool.cc/game/172/](http://gameschool.cc/game/172/) 是一款"魔塔(20 層版)"网页游戏，是 2010s 年代玩家社区里"魔塔 20 层救公主"的代表作品。游戏受 Cloudflare 拦截，无法直接从源头抓取源码 / HTML。

经搜索发现：
- 该游戏使用 H5mota 引擎（[h5mota.com](https://h5mota.com)）— 国内魔塔圈事实标准
- H5mota 的核心开源版本为 **mota-js v2.6.4**（仓库：[github.com/ckcz123/mota-js](https://github.com/ckcz123/mota-js)）
- 社区现成最接近 20 层的作品是 **Magictower2014**（[h5mota.com/games/Magictower2014](https://h5mota.com/tower/?name=Magictower2014)），主塔 27 层，截前 20 层即可

### 0.2 痛点

mota-js 是 2010s 时代的产物：
- 渲染用 DOM div 堆叠（13×13 = 169 个 div + 子元素 600+），性能差
- `main.js` 30KB 全局命名空间，代码组织混乱
- 触屏支持差（仅桌面浏览器）
- 无单元测试、无 TypeScript
- 事件系统用字符串 + `eval`，无类型检查、不可测试、有安全风险
- 美术风格单一（纯像素 RPG Maker 素材）

### 0.3 目标

**首版交付**一款：
1. **玩法 100% 复刻** 20 层魔塔（基于 mota-js 数据格式 + Magictower2014 数据）
2. **触屏 + 键盘双优**，手机可玩
3. **现代视觉**（AI 换皮后的复古像素升级）
4. **可测试、可维护、可扩展**（TS + 单测 + 强类型事件）
5. **离线 PWA**（可安装到桌面/主屏）
6. **不在线、不联网、不收集数据**（首版）

---

## 1. 整体架构

### 1.1 仓库结构

采用 pnpm monorepo，将 core / render / ui / persistence 拆为独立 package，便于在 Node 环境跑单测：

```
modern-mota/
├─ apps/
│  └─ web/                        # 浏览器入口 (Vite + React + Phaser)
│     ├─ index.html
│     ├─ main.tsx                 # React 根
│     ├─ App.tsx                  # 路由壳
│     ├─ vite.config.ts
│     └─ tsconfig.json
├─ packages/
│  ├─ core/                       # 纯逻辑 (无 UI/无 Phaser 依赖)
│  │  ├─ domain/                  # 战斗、移动、事件求值
│  │  ├─ data/                    # mota-js JSON 的 TS 类型 + 加载器
│  │  ├─ state/                   # 游戏状态机 (Zustand)
│  │  └─ events/                  # 事件系统 (强类型版)
│  ├─ render/                     # Phaser 适配层
│  │  ├─ scenes/                  # BootScene / TitleScene / FloorScene / UIScene
│  │  ├─ tiles/                   # tile 渲染、autotile、动画
│  │  ├─ input/                   # 键盘 + 触屏输入抽象
│  │  └─ bridge/                  # React↔Phaser 桥接 (类型化事件总线)
│  ├─ ui/                         # React UI 组件
│  │  ├─ Title/ Settings/ Save/ Help/ ...
│  │  └─ common/                  # Button / Modal / Toast
│  └─ persistence/                # 存档 / 录像 / 设置
├─ content/
│  ├─ mota-2014/                  # 复刻自 Magictower2014
│  │  ├─ data.json
│  │  ├─ enemys.json
│  │  ├─ maps.json
│  │  ├─ items.json
│  │  ├─ floors/MT0.js ~ MT20.js
│  │  └─ _meta.json
│  └─ art/                        # AI 换皮后的资源
├─ tools/
│  ├─ importer/                   # mota-js 旧工程 → 新格式
│  ├─ art-pipeline/               # AI 换皮批量化
│  └─ validator/                  # 楼层/事件/战斗公式校验
├─ docs/
│  └─ design/                     # 设计文档（本套）
├─ package.json                   # pnpm workspace
└─ pnpm-workspace.yaml
```

### 1.2 进程模型（单页应用内的 4 套状态机）

| 层 | 运行时 | 职责 |
|---|---|---|
| React UI | 主线程 | 标题 / 设置 / 存档 / 帮助 / 状态栏 / 战斗 HUD / 对话 / 商店 |
| Phaser 渲染 | 主线程，单个 `<canvas>` | 地图、动画、战斗动作、剧情演出 |
| Core 逻辑 | 主线程，纯函数 + 状态机 | 战斗、行走、事件、楼层切换 |
| Persistence | 主线程 + IndexedDB | 存档、录像、设置、导入导出 |

- `render` 读 `core` 状态，从不写
- `core` 通过事件总线通知 `render` 重绘
- `ui` 通过桥接层与 `core` 通信

### 1.3 React ↔ Phaser 桥接层

**核心**：类型化的事件总线（不直接共享 store）：

```ts
// packages/render/bridge/types.ts
export interface BridgeSpec {
  // 渲染层 → Core / UI
  'player:move':       { dir: 'up'|'down'|'left'|'right' }
  'player:action':     { kind: 'pickup'|'interact'|'openMenu'|... }
  'ui:openSave':       void
  'ui:openSettings':   void
  'ui:openHelp':       void
  'ui:openTitle':      void

  // Core → 渲染层
  'render:loadFloor':  { floorId: string }
  'render:playAnimate':{ key: string; loc: [number, number] }
  'render:showText':   { lines: string[]; portrait?: string }
  'render:shake':      { ms: number; intensity: number }

  // Core → UI
  'ui:showToast':      { msg: string; kind: 'info'|'warn'|'error' }
  'ui:openShop':       { shop: Shop }
  'ui:openDialog':     { npc: Npc; text: string[]; choices?: Choice[] }
  'ui:showBattle':     { hero: HeroSnapshot; enemy: EnemySnapshot; damage: number; lose: number }
  'ui:hideBattle':     void
  'ui:showFloorMsg':   { title: string; subtitle?: string }
  'ui:hideFloorMsg':   void
  'ui:requestSaveList':void
  'ui:setBgm':         { url: string | null; loop: boolean }
}
```

**实现**：`EventEmitter<BridgeSpec>`。两端引用同一份协议类型。桥接层只承担 3 件事：协议定义、路由订制、节流/防抖。

**为什么不用全局 store**：Phaser 那边没有 React 渲染管线，全局 store 会被 Phaser 频繁 mutate 触发 React 无谓 re-render。

### 1.4 数据流：一次玩家"上方向键"的完整调用链

```
键盘/触屏
  ↓
Phaser KeyboardPlugin / TouchInput
  ↓ 'player:move' { dir: 'up' }
Bridge (事件总线)
  ↓
Core.moveHero(state, dir)  // 纯函数
  ↓
State 更新 (Zustand)
  ↓
  ├─ Phaser FloorScene 监听 store → 重绘玩家位置
  └─ React UI 监听 store → 更新状态栏
```

`Core.moveHero` 是纯函数，可在 Node 里跑 Vitest。

### 1.5 启动时序

```
[1] React 挂载，显示启动 splash
[2] Vite 动态 import 拉取 content/mota-2014/*.json
[3] content 加载完 → 初始化 Phaser Game
[4] Phaser BootScene 加载 spritesheet + audio
[5] Phaser 'render:ready' → React 切到 TitleScene
[6] 用户点开始 → 'player:action startGame' → Core 初始化 → Phaser 切 FloorScene(MT1)
```

### 1.6 测试策略

| 层 | 工具 | 覆盖 |
|---|---|---|
| `core/domain` | Vitest | 战斗、移动、楼层 |
| `core/events` | Vitest | 60+ 事件类型全覆盖 |
| `core/state` | Vitest | 状态迁移不变量 |
| `render` | Playwright e2e | 视觉回归 + 关键路径 |
| `ui` | Vitest + RTL | 组件交互、存档列表 |
| `persistence` | Vitest | 读写、迁移、损坏恢复 |
| `tools/importer` | Vitest + fixture | mota-js → 新格式无损 |

### 1.7 部署

- Web：Vite 静态构建 → Cloudflare Pages / Vercel / 自家 Nginx
- PWA：service worker 离线可玩
- iOS/Android 套壳：暂不做
- 桌面 Electron：不做

### 1.8 风险（留待后续段）

- 触屏摇杆 UI 与 Phaser Scene 的 z-index / pointer event 透传
- 战斗动画"快进/跳过" 与事件系统的协调
- 录像回放："复读 state" vs "复读操作"
- AI 换皮批处理工作流

---

## 2. 数据层

### 2.1 一图流

```
content/mota-2014/                  ← 源（关卡设计者手写 / 旧 mota-js 工程导入）
  ├─ data.json
  ├─ enemys.json
  ├─ maps.json
  ├─ items.json
  ├─ events.json
  └─ floors/*.json
            │
            │ Vite import.meta.glob
            ▼
packages/data/
  ├─ schema/                        ← 运行时校验 + TS 类型 (zod)
  │  ├─ main.ts
  │  ├─ enemy.ts
  │  ├─ mapBlock.ts
  │  ├─ item.ts
  │  ├─ floor.ts
  │  └─ event.ts
  ├─ loader.ts                      ← 读 JSON → 校验 → 冻结
  └─ codegen.ts                     ← zod schema → .d.ts
            │
            ▼
packages/core/state/   packages/render/   packages/ui/
```

### 2.2 三大原则

**(a) JSON 即真相**：所有真值在 `content/<tower>/*.json`。TS 写的是类型 + 校验 + 加载器。换皮 / 加塔 = 加一个 `content/<新塔>/` 目录，业务代码零改动。

**(b) 编译时 + 运行时双重校验**：zod schema 用 `z.infer` 导出 `.d.ts`（IDE 补全/跳转）；加载时 `schema.parse()` 校验，错误立刻在标题画面显示"哪个文件第几行哪个字段错了"。

**(c) 旧 mota-js 语法 → 纯 JSON 一次性转换**：mota-js `var data_xxx = {...}` 在 import 时用 acorn 解析抽对象，**运行时不做转换**。

### 2.3 文件格式对照

| mota-js 原文件 | 新格式 | 关键改动 |
|---|---|---|
| `data.js` (var data_xxx = {...}) | `data.json` | 去 var 壳 |
| `enemys.js` (60+ 怪物) | `enemys.json` | `special: 0` 统一为 `[]` |
| `maps.js` (1~264 编号→资源) | `maps.json` | 字符串 key `"1"` 保持 |
| `items.js` | `items.json` | `equip: undefined` 字段去掉 |
| `floors/MT1.js` (main.floors.MT1 = {...}) | `floors/MT1.json` | 数字 map 数组保留 |
| `events.js` (commonEvent 字典) | `events.json` | 不变 |
| `functions.js` (字符串 JS) | `functions.json` + 强类型事件 | 灰名单保留 eval 兜底 |

### 2.4 关键 Schema

```ts
// packages/data/schema/main.ts
import { z } from 'zod'

export const MainSchema = z.object({
  floorIds: z.array(z.string()).min(1),
  startFloorId: z.string(),
  tilesets: z.array(z.string()),
  animates: z.array(z.string()),
  bgms:    z.array(z.string()),
  sounds:  z.array(z.string()),
  portraits: z.array(z.string()).default([]),
  theme: z.object({
    borderColor:   z.string().default('#CCCCCC'),
    statusBarBg:   z.string().default('url(/art/tiles/ground.png)'),
    font:          z.string().default('Verdana'),
    startButtonBg: z.string().default('#32369F'),
  }),
  levelChoose: z.array(z.tuple([z.string(), z.string()])).default([
    ['简单', 'Easy'], ['普通', 'Normal'], ['困难', 'Hard'], ['噩梦', 'Hell']
  ]),
  flags: FlagsSchema,
  values: ValuesSchema,
})

// packages/data/schema/floor.ts
export const FloorSchema = z.object({
  floorId: z.string(),
  title:   z.string(),
  name:    z.string(),
  width:  z.number().int().positive(),
  height: z.number().int().positive(),
  map: z.array(z.array(z.number().int().min(0).max(999))),
  bgmap: z.array(z.array(z.number())).default([]),
  fgmap: z.array(z.array(z.number())).default([]),
  firstArrive:   EventListSchema.default([]),
  eachArrive:    EventListSchema.default([]),
  parallelDo:    EventListSchema.default([]),
  events:        z.record(z.string(), EventListSchema).default({}),
  cannotMove:    z.record(z.string(), EventListSchema).default({}),
  afterBattle:   z.record(z.string(), EventListSchema).default({}),
  afterGetItem:  z.record(z.string(), EventListSchema).default({}),
  afterOpenDoor: z.record(z.string(), EventListSchema).default({}),
  changeFloor:   z.record(z.string(), ChangeFloorSchema).default({}),
})
```

### 2.5 flags 全局开关（从 mota-js 搬）

完整保留 mota-js 30+ 字段，加 `.strict()` 禁止未知字段：

```ts
export const FlagsSchema = z.object({
  enableFloor:     z.boolean().default(true),
  enableName:      z.boolean().default(false),
  enableLv:        z.boolean().default(false),
  enableHPMax:     z.boolean().default(false),
  enableMana:      z.boolean().default(false),
  enableMDef:      z.boolean().default(true),
  enableMoney:     z.boolean().default(true),
  enableExperience:z.boolean().default(false),
  enableLevelUp:   z.boolean().default(false),
  enableKeys:      z.boolean().default(true),
  enablePZF:       z.boolean().default(false),
  enableDebuff:    z.boolean().default(false),
  enableSkill:     z.boolean().default(false),
  enableAddPoint:  z.boolean().default(false),
  flyNearStair:      z.boolean().default(true),
  flyRecordPosition: z.boolean().default(false),
  pickaxeFourDirections: z.boolean().default(false),
  bombFourDirections:    z.boolean().default(false),
  snowFourDirections:    z.boolean().default(false),
  bigKeyIsBox:          z.boolean().default(false),
  steelDoorWithoutKey:  z.boolean().default(false),
  itemFirstText:        z.boolean().default(true),
  equipment:            z.boolean().default(false),
  enableNegativeDamage: z.boolean().default(false),
  hatredDecrease:       z.boolean().default(true),
  betweenAttackCeil:    z.boolean().default(false),
  betweenAttackMax:     z.boolean().default(false),
  useLoop:              z.boolean().default(false),
  animateSpeed:         z.number().int().default(400),
}).strict()
```

### 2.6 事件强类型化（关键改造）

mota-js 的事件是字符串 + 运行时 eval，改为判别联合：

```ts
export const EventSchema = z.discriminatedUnion('type', [
  // 数值
  z.object({ type: z.literal('setValue'),  name: z.string(), value: z.string() }),
  z.object({ type: z.literal('addValue'),  name: z.string(), value: z.string() }),
  z.object({ type: z.literal('setFlag'),   name: z.string(), value: z.union([z.boolean(), z.string(), z.number()]) }),

  // 控制流
  z.object({ type: z.literal('if'),     condition: z.string(), true: EventListSchema, false: EventListSchema.default([]) }),
  z.object({ type: z.literal('switch'), condition: z.string(), caseList: z.array(z.object({ case: z.string(), action: EventListSchema })) }),
  z.object({ type: z.literal('while'),  condition: z.string(), data: EventListSchema }),
  z.object({ type: z.literal('for'),    variable: z.string(), from: z.string(), to: z.string(), step: z.string().default('1'), data: EventListSchema }),
  z.object({ type: z.literal('break') }),
  z.object({ type: z.literal('continue') }),

  // UI
  z.object({ type: z.literal('tip'),         text: z.string() }),
  z.object({ type: z.literal('choices'),     choices: z.array(z.object({ text: z.string(), action: EventListSchema })) }),
  z.object({ type: z.literal('wait'),        time: z.number().int().min(0) }),
  z.object({ type: z.literal('function'),    function: z.string() }),  // 灰名单

  // 视觉
  z.object({ type: z.literal('showImage'),   code: z.union([z.string(), z.number()]), image: z.string(), loc: z.tuple([z.number(), z.number()]), dw: z.number(), dh: z.number(), opacity: z.number().default(1), time: z.number().default(0) }),
  z.object({ type: z.literal('hideImage'),   code: z.union([z.string(), z.number()]), time: z.number().default(0) }),
  z.object({ type: z.literal('showText'),    text: z.union([z.string(), z.array(z.string())]) }),

  // 战斗/移动
  z.object({ type: z.literal('battle'),      id: z.string() }),
  z.object({ type: z.literal('openDoor'),    id: z.string(), loc: z.union([z.tuple([z.number(), z.number()]), z.array(z.tuple([z.number(), z.number()]))]).optional() }),
  z.object({ type: z.literal('changeFloor'), floorId: z.string(), loc: z.tuple([z.number(), z.number()]).optional(), direction: z.enum(['up','down','left','right']).optional(), stair: z.string().optional(), time: z.number().int().default(800) }),

  // 道具
  z.object({ type: z.literal('getItem'),     id: z.string(), number: z.number().int().default(1) }),
  z.object({ type: z.literal('setItem'),     id: z.string(), number: z.number().int() }),

  // 系统
  z.object({ type: z.literal('comment'),     text: z.string() }),
  z.object({ type: z.literal('sleep'),       time: z.number().int().min(0) }),
  z.object({ type: z.literal('exit') }),
  z.object({ type: z.literal('callSave'),    slot: z.number().int().min(0).max(4) }),
  z.object({ type: z.literal('callLoad') }),
])
```

### 2.7 表达式求值（不 eval 也能算）

```ts
// packages/core/events/expr.ts
import jsep from 'jsep'

jsep.hooks.add('colon-var', () => {})  // 'status:hp' → Variable
jsep.hooks.add('dot-member', () => {}) // 'core.values.x' → Member

export type Expr = number | string | boolean | null
                 | { kind: 'var'; ns: string; name: string }
                 | { kind: 'op'; op: string; args: Expr[] }
                 | { kind: 'fn'; name: string; args: Expr[] }  // 仅白名单

const ALLOWED_FNS = new Set([
  'Math.max', 'Math.min', 'Math.abs', 'Math.floor', 'Math.ceil', 'Math.round',
  'parseInt', 'parseFloat', 'isNaN', 'Number', 'String',
  'core.values.get', 'core.flags.get', 'core.status.get',
])

export function evalExpr(expr: string, scope: Scope): unknown
```

- `status:hp+10` 原样支持
- 模板字符串 `${1*flag:arg1}` 通过 `renderTemplate` 渲染
- 拒绝 `eval` / `Function` / `setTimeout` 等黑名单

### 2.8 加载管线

```ts
// packages/data/loader.ts
export async function loadTowerContent(root: string): Promise<TowerContent> {
  const [main, enemys, maps, items, events, ...floorFiles] = await Promise.all([
    fetchJson(`${root}/data.json`),
    fetchJson(`${root}/enemys.json`),
    fetchJson(`${root}/maps.json`),
    fetchJson(`${root}/items.json`),
    fetchJson(`${root}/events.json`),
    ...floorIds.map(id => fetchJson(`${root}/floors/${id}.json`)),
  ])

  return Object.freeze({
    main:    MainSchema.parse(main),
    enemys:  EnemysSchema.parse(enemys),
    maps:    MapsSchema.parse(maps),
    items:   ItemsSchema.parse(items),
    events:  EventsSchema.parse(events),
    floors:  Object.fromEntries(floorFiles.map(f => [f.floorId, FloorSchema.parse(f)])),
  })
}
```

**错误处理**：
- schema 错 → 标题画面红屏"哪个文件第几行哪个字段错了"
- 楼层引用不存在 → 启动前做引用检查
- 缺资源 → 加载图片 404 弹 toast

### 2.9 importer 脚本

```ts
// tools/importer/import-mota-js.ts
import { parse } from 'acorn'

async function importOne(srcDir: string, outDir: string) {
  for (const f of await fs.readdir(`${srcDir}/project`)) {
    if (f.endsWith('.js')) {
      const code = await fs.readFile(`${srcDir}/project/${f}`, 'utf-8')
      const ast = parse(code, { ecmaVersion: 2022 })
      const obj = extractFirstObjectLiteral(ast)
      await fs.writeFile(`${outDir}/${f.replace('.js', '.json')}`, JSON.stringify(obj, null, 2))
    }
  }
}

// CLI: pnpm tsx tools/importer/cli.ts <srcDir> <outDir>
```

### 2.10 20 层截取策略

Magictower2014 有 27 层主塔（MT0~MT26）。首版采用**物理截取**（A 方案）：

- 保留 `MT0.js`（起点层）+ `MT1.js`~`MT20.js`
- `data.json` 的 `floorIds` 改为 `[MT0, MT1, ..., MT20]`
- MT20 之后所有 `changeFloor` 引用改成"通顶"事件（救公主、显示通关画面）
- 删除 SM/JX/Dark 那 50+ 个文件

**剧情重排**（B 方案）放到首版之后。

---

## 3. 渲染层

### 3.1 职责边界

Phaser Game 内含 6 个 Scene：
- `BootScene`：用 Phaser Loader 加载全部 tileset / animate / audio / fonts
- `TitleScene`：标题画面假 3D 滚动背景（mota 经典感）
- `FloorScene`：核心，渲染当前楼层、玩家、actor
- `BattleScene`：战斗动画叠加层
- `DialogueScene`：剧情对话（虽然 React 弹窗会重画，但对话时 hero/NPC 立绘用 Phaser 动画）
- `UIBootScene`：占位

**关键决定**：剧情对话、商店、战斗结算 → **用 React Modal**（不嵌 Phaser Scene）。原因：React Modal 平台一致性 + 不和 Phaser RAF 抢资源。

### 3.2 FloorScene 内部结构

```
FloorScene
├─ this.layers                  // 5 个 Phaser.GameObjects.Layer
│  ├─ bgLayer                  // 背景 autotile
│  ├─ terrainLayer             // 墙、门、楼梯、传送门
│  ├─ itemLayer                // 宝石、钥匙、血瓶、装备
│  ├─ actorLayer               // 怪物、NPC、玩家
│  └─ fgLayer                  // 前景装饰
├─ this.grid                    // 逻辑网格
├─ this.actors                  // Map<id, Actor>
├─ this.camera                  // Phaser.Camera
└─ this.input                   // 见 §5
```

**绘制流水线**：`Core 状态变化 → dirty = diff(newState, lastState) → 对每个 dirty cell 重绘`。

**核心优化**：永远不全量重绘，只 touch 变化的格子。

### 3.3 Tile 渲染

#### 3.3.1 静态层（墙、地板、门、楼梯）

用 Phaser Tilemap API：

```ts
const map = this.make.tilemap({ data: this.map2d, tileWidth: 32, tileHeight: 32 })
const tileset = map.addTilesetImage('magictower', 'terrains')
const layer = map.createLayer(0, tileset, 0, 0)
```

一次 draw call 画完全部静态 tile。

#### 3.3.2 Autotile

mota-js 用 4 套 8×8 = 64 个 tile 的 autotile sprite。我们自写轻量级 autotile 解析器：

```ts
// packages/render/tiles/autotile.ts
type AutotileId = 'autotile' | 'autotile1' | 'autotile2' | ...
const AUTOTILE_MAP_SIZE = [4, 8] as const

export function pickAutotileFrame(
  self: [number, number],
  neighbors: NeighborMap,
  variant: number
): number {
  return AUTOTILE_TABLE[neighborKey(neighbors)][variant]
}
```

运行时算一次 → 烤成静态 Tilemap（DynamicTexture）。

#### 3.3.3 动态层（玩家、怪物、NPC、动画道具）

每个 = 1 个 `Phaser.GameObjects.Sprite`，用 `Group` 批量管理。总数 ≤ 200。

### 3.4 sprite atlas 规范

```
project/art/tiles/
├─ terrains.png       (32x32 grid)
├─ autotile_0.png
├─ items.png
├─ npcs.png
├─ enemys.png
├─ actors/
│  ├─ hero_walk.png   (4 方向 × 4 帧)
│  └─ ...
├─ animates/
│  └─ ...
└─ ui/
   └─ icons.png
```

### 3.5 输入抽象层

```ts
export type MoveIntent = { kind: 'move'; dir: 'up' | 'down' | 'left' | 'right' }
export type ActionIntent = { kind: 'pickup' } | { kind: 'openMenu' } | { kind: 'fly' } | ...
export type PlayerIntent = MoveIntent | ActionIntent

export interface InputSource {
  enable(): void
  disable(): void
  destroy(): void
  onIntent(cb: (i: PlayerIntent) => void): () => void
}
```

#### 3.5.1 触屏三模式

| 模式 | 操作 | 适合 |
|---|---|---|
| A 滑动（默认） | swipe 走 / tap 寻路 / press 0.5s 弹信息 / 底边上滑开菜单 | 老玩家 |
| B 虚拟方向键 | 4 方向 + 4 动作键，拖动位置 | 怀旧 |
| C 单击格子 | 每点一格走一格 | 休闲 |

实现：hammer.js 处理 swipe/tap/press，A* 寻路由 Core 跑。

```ts
class TouchInput implements InputSource {
  private gestures = new Hammer.Manager(this.scene.input.pluginEvents.canvas)
  enable() {
    this.gestures.add(new Hammer.Swipe({ direction: Hammer.DIRECTION_ALL }))
              .add(new Hammer.Tap({ event: 'singletap' }))
              .add(new Hammer.Tap({ event: 'doubletap', taps: 2 }))
              .add(new Hammer.Press({ time: 500 }))
  }
}
```

**A\* 寻路**：

```ts
// packages/core/pathfinding/a-star.ts
export function aStar(
  map: number[][],
  start: [number, number],
  end: [number, number],
  canPass: (n: number) => boolean
): [number, number][] | null
```

### 3.6 动画系统

mota-js 的 `.animate` JSON 直接复用，预编译成 Phaser Animation：

```ts
class AnimationCompiler {
  static fromMotaAnimate(anim: MotaAnimate, textureKey: string): Phaser.Animations.AnimationConfig[] {
    return anim.frame.map((f, i) => ({
      key: `${textureKey}_${i}`,
      frames: [{ key: textureKey, frame: f.x / 32, duration: f.frame || 100 }],
      hideOnComplete: f.hide,
      repeat: -1,
    }))
  }
}
```

mota-js 一共 41 个 animate 文件 → 41 个 AnimationKey。

### 3.7 战斗动画

```
[hero_sprite]   ──挥剑动画 200ms──>   [hero_sprite]  (回到原位)
[enemy_sprite]  ──受击闪烁 150ms──>   [enemy_sprite] (掉血数字飘出)
                                      ──若击破：
                                          钱币 sprite 飞向 hero
                                          经验 +N 飞向状态栏
                                          enemy 消失 200ms 淡出
```

实现：Phaser Timeline + BattleScene 跑时间线。Core 算 damage/lose/击破，BattleScene 只管动画。

**快进模式**：玩家长按 X 进入，动画 duration 缩到 30%。

### 3.8 切层动画

```
[当前层画面]  ─ 整屏淡黑 200ms
              ─ 显示 "主塔 7 层" 大字 800ms
              ─ 整屏淡入 200ms
              ─ hero 从楼梯口走出
```

性能：淡黑淡入期间 Phaser.Scene.transition 预加载。

### 3.9 资源加载

```ts
export class ContentManifest {
  tilesets:    { key: string; url: string }[]
  sprites:     { key: string; url: string }[]
  animates:    { key: string; jsonUrl: string; textureUrl: string }[]
  audio:       { key: string; url: string; type: 'bgm' | 'sfx' }[]
  fonts:       { family: string; url: string }[]
}
```

从 `data.json` 的清单字段读，转 Phaser Loader batch。

**首屏时间预算**：必等 ≈ 2-4MB，懒加载怪物立绘 / 楼层插画 / 特殊音效。

### 3.10 性能预算

| 指标 | 目标 |
|---|---|
| 单帧绘制 | ≤ 4 ms |
| 输入到画面延迟 | ≤ 50 ms |
| 切层时间 | ≤ 1.2 s |
| 战斗动画 | ≤ 800 ms / 回合 |
| 首屏（白屏→标题） | ≤ 2s（4G） |
| 内存 | ≤ 80 MB |

---

## 4. 事件系统

### 4.1 全景

```
content/mota-2014/floors/MT7.json
  events: { "3,5": [ ... events ... ] }
            │
            │ 加载时 zod 校验 → 强类型 GameEvent
            ▼
packages/core/events/
├─ types.ts                // GameEvent 判别联合
├─ expr.ts                 // 表达式 AST 求值器
├─ runner.ts               // 事件机主循环
├─ handlers/
│  ├─ control.ts          // if / switch / while / for / break / continue
│  ├─ value.ts            // setValue / addValue / setFlag
│  ├─ ui.ts               // tip / choices / showText / sleep / wait
│  ├─ visual.ts           // showImage / hideImage / moveImage / animate
│  ├─ battle.ts           // battle
│  ├─ movement.ts         // openDoor / changeFloor / getItem / setItem
│  └─ system.ts           // comment / function (灰名单) / exit / callSave / callLoad
├─ scope.ts                // 表达式求值的变量作用域
└─ __tests__/
```

### 4.2 表达式求值（关键安全边界）

```ts
import jsep from 'jsep'

const ALLOWED_FNS = new Set([
  'Math.max', 'Math.min', 'Math.abs', 'Math.floor', 'Math.ceil', 'Math.round',
  'parseInt', 'parseFloat', 'isNaN', 'Number', 'String',
  'core.values.get', 'core.flags.get', 'core.status.get',
])

export function evalExpr(expr: string, scope: Scope): unknown
```

作用域接口：

```ts
export interface Scope {
  get(ns: string, name?: string): unknown
  set?(ns: string, name: string, value: unknown): void
}
```

**安全**：
- 完全不走 eval，jsep 解析 AST
- 白名单函数
- `scope.get` 找不到抛 UnknownVarError

### 4.3 事件机主循环

```ts
// packages/core/events/runner.ts
export type EventResult =
  | { kind: 'continue' }
  | { kind: 'wait'; reason: 'sleep' | 'choices' | 'wait' | 'callback'; token: YieldToken }
  | { kind: 'break' }
  | { kind: 'return' }

export async function* runEvents(
  events: GameEvent[],
  state: GameState,
  ctx: EventContext
): AsyncGenerator<EventResult> { ... }
```

**关键**：AsyncGenerator 让事件机可暂停和恢复；state 通过 closure 引用 + immer 安全 mutate；yield token 外部可 resume。

### 4.4 Handler 约定

```ts
// packages/core/events/handlers/control.ts
import type { Handler } from '../runner'

export const ifHandler: Handler<IfEvent> = async (event, state, ctx) => {
  const cond = evalExpr(event.condition, ctx.scope)
  const branch = truthy(cond) ? event.true : event.false
  await runEventsToEnd(branch, state, ctx)
  return { kind: 'continue' }
}
```

约定：
1. handler 收到 state 直接 mutate（immer 包装）
2. 暂停型 handler 返回 `{ kind: 'wait' }`
3. 错误抛 EventError，runner 抓到后 UI 显示

### 4.5 完整 Handler 清单

| 文件 | type | 行为 |
|---|---|---|
| control | if | 求值 condition，递归跑 true/false 分支 |
| control | switch | case 匹配 |
| control | while | iter 上限 10000 |
| control | for | 步进 |
| control | break / continue | 跳出/继续最近循环 |
| value | setValue / addValue / setFlag / addFlag / setAttr | 数值操作 |
| ui | tip | 推 toast |
| ui | showText | 走 DialogueScene，await |
| ui | choices | React 弹窗 + yield |
| ui | wait / sleep | await sleep |
| ui | input | 弹输入框 |
| visual | showImage / hideImage / moveImage | 推 render 事件 |
| visual | show / hide / setBlock / animate | 改地图/播动画 |
| battle | battle / getItem / setItem / loseItem / useItem | 战斗与道具 |
| movement | openDoor / changeFloor / passNet / pushBox / changeLight / ski | 移动相关 |
| system | comment / exit / callSave / callLoad / replay | 系统 |
| system | function | **灰名单**：new Function 兜底 |

### 4.6 commonEvent

mota-js 的 `events.json.commonEvent` 是事件字典，跨楼复用：

```ts
export const corePlugin = {
  commonEvent(name: string, ...args: unknown[]) {
    const list = events.commonEvent[name]
    return runEvents(list, state, { args: { arg1: args[0], ... } })
  },
  // 其他 mota-js 暴露的全局方法
  setInitData(hard: string) { ... },
  checkBgm() { ... },
  // ...
}
```

import 时扫一遍 commonEvent 字典名，建调用图，引用未定义的就 warning。

### 4.7 错误处理

```ts
export class EventError extends Error {
  constructor(
    msg: string,
    public event: GameEvent,
    public floorId: string,
    public path?: string
  ) { super(msg) }
}
```

**策略**：
- 未定义事件类型 → 红屏
- 表达式 SyntaxError → 红屏
- 未知变量 → 红屏
- 事件机挂死（iter > 10000）→ 红屏 + 截图
- function 灰名单抛错 → toast 提示

**永远不静默吞错**。

### 4.8 单元测试

| 文件 | 覆盖 |
|---|---|
| control.test.ts | if / switch / while / for / break 30+ cases |
| value.test.ts | setValue / addValue 各种 ns |
| ui.test.ts | choices / wait / sleep 异步 |
| visual.test.ts | show / hide / setBlock |
| movement.test.ts | openDoor / changeFloor |
| battle.test.ts | 战斗伤害公式 + 战后事件 |
| expr.test.ts | 表达式求值 100+ cases |
| commonEvent.test.ts | 跨楼复用 |
| runner.test.ts | yield/resume 流程 |

**目标覆盖率**：events ≥ 90%，expr ≥ 95%。

### 4.9 性能

| 场景 | 目标 |
|---|---|
| 单次表达式求值 | < 0.1 ms |
| 单条事件 handler | < 1 ms |
| 1000 步战斗链 | < 500 ms |
| while 10000 步 | < 100 ms |

---

## 5. 输入 + 存档

### 5.1 输入：键盘 / 触屏 / 鼠标三合一

```ts
export type PlayerIntent =
  | { kind: 'move';       dir: 'up' | 'down' | 'left' | 'right' }
  | { kind: 'longMove';   dir: 'up' | 'down' | 'left' | 'right' }
  | { kind: 'pickup' }
  | { kind: 'fly' }
  | { kind: 'useItem';  itemId: string }
  | { kind: 'openMenu' }
  | { kind: 'openHelp' }
  | { kind: 'openMap' }
  | { kind: 'speedUp';  on: boolean }
  | { kind: 'systemSave' }
  | { kind: 'systemLoad' }
  | { kind: 'systemRestart' }
  | { kind: 'cancelDialog' }

export interface InputSource {
  readonly name: 'keyboard' | 'touch' | 'mouse'
  enable(): void
  disable(): void
  onIntent(cb: (i: PlayerIntent) => void): () => void
  onCellTap?(cb: (loc: [number, number]) => void): () => void
  destroy(): void
}
```

#### 5.1.1 触屏三模式

详见 §3.5.1。设置在 `localStorage`（不依赖存档）。

#### 5.1.2 触屏寻路

```ts
export function aStar(
  map: number[][],
  start: [number, number],
  end: [number, number],
  canPass: (cell: number, x: number, y: number, ctx: AStarContext) => boolean,
  ctx?: AStarContext
): [number, number][] | null
```

A\* 在 Core 里跑（不是 Phaser），可在 Node 单测。

#### 5.1.3 节流 / 防抖

```ts
const INPUT_THROTTLE_MS = 80        // 12.5 步/秒
const LONG_MOVE_INTERVAL_MS = 160
const TOUCH_TAP_DEBOUNCE_MS = 100
```

节流在 InputSource 做，不在 Core 做。

#### 5.1.4 a11y

- 键盘单手可玩（方向键或 WASD）
- 触屏 44×44px 最小点击区
- 键盘焦点环
- 状态栏图标双编码（色+形）

### 5.2 存档：三层结构

#### 5.2.1 SaveSlot

```ts
export interface SaveSlot {
  id: string
  slot: number                  // 0-4 或 -1 (autoSave)
  createdAt: number
  updatedAt: number
  playTime: number
  stepCount: number
  screenshot?: string           // 200x150 jpeg base64

  contentId: string
  contentVersion: string
  contentHash: string           // SHA-256
  engineVersion: string

  hero: HeroSnapshot
  flags: Record<string, unknown>
  items: Record<string, number>
  equipment: EquipmentSnapshot
  floorId: string
  loc: [number, number]
  direction: 'up' | 'down' | 'left' | 'right'
  hard: 'Easy' | 'Normal' | 'Hard' | 'Hell'
  visitedFloors: string[]

  replay?: ReplayBlob
}
```

#### 5.2.2 后端

两套实现：
- `IndexedDBStorage`（主）
- `LocalStorageStorage`（降级）

自动降级：try IDB，失败 fallback localStorage。

```ts
export interface SaveStorage {
  listSlots(): Promise<SaveSlot[]>
  readSlot(id: string): Promise<SaveSlot | null>
  writeSlot(slot: SaveSlot): Promise<void>
  deleteSlot(id: string): Promise<void>
  exportAll(): Promise<Blob>
  importAll(blob: Blob): Promise<{ imported: number; skipped: number; errors: string[] }>
}
```

#### 5.2.3 存档时机

| 类型 | 触发 |
|---|---|
| Auto save | 每 5 步 / 切楼层 / 重大事件完成 / choices 弹窗弹出时 |
| Manual save | F5 或主菜单"存到当前槽" |
| Yield 期间 | 玩家按 Esc 取消 choices 后弹"是否存档" |

**关键**：存档粒度 = 一个完整 SaveSlot，不存在"半截"。

#### 5.2.4 读档 + 版本迁移

```ts
export async function migrate(raw: SaveSlot, target: string): Promise<SaveSlot> {
  let current = raw.engineVersion
  while (current !== target) {
    const next = nextVersionAfter(current)
    if (!next) return raw
    const m = MIGRATIONS[`${current}→${next}`]
    if (!m) return raw
    raw = m(raw)
    current = next
  }
  return raw
}
```

策略：
- 永远 additive（加字段不删）
- schema 改字段名：写迁移函数
- 删字段：先 deprecate 一版
- 大改：bump major，旧档变只读

#### 5.2.5 导入/导出

JSON 格式：

```json
{
  "version": 1,
  "exportedAt": 1234567890,
  "engineVersion": "0.1.0",
  "slots": [ ... ],
  "replays": [ ... ]
}
```

**隐私**：存档纯本地，不上云，不调用远程 API，不收集 analytics。

### 5.3 录像（Replay）

#### 5.3.1 ReplayBlob

```ts
export interface ReplayBlob {
  id: string
  contentId: string
  contentVersion: string
  contentHash: string
  engineVersion: string
  createdAt: number

  steps: ReplayStep[]
  initial: { floorId, loc, direction, hero, flags, hard }
  endState: 'won' | 'died' | 'gave-up' | 'in-progress'
  endAt: number

  title?: string
  author?: string
  totalTime: number
}

export type ReplayStep =
  | { t: number; kind: 'move'; dir }
  | { t: number; kind: 'pickup' }
  | { t: number; kind: 'useItem'; itemId }
  | { t: number; kind: 'systemSave'; slot }
  | { t: number; kind: 'systemLoad'; slot }
```

#### 5.3.2 录制 / 回放 / 速度

- 录制：Recorder.record(intent)，过滤非游戏操作
- 回放：Player.tick() 在 game loop 里按时间戳 apply
- 速度：0.5x / 1x / 2x / 4x
- 暂停 / 单步 / 跳到步

#### 5.3.3 导入/分享

- 导出：blob → JSON → `.mota-replay`
- 导入：校验 contentHash（不匹配则禁用回放）
- Web Share API（移动）/ 复制 URL（带 base64，限制大小）

### 5.4 玩家设置

```ts
export interface PlayerSettings {
  bgmVolume: number
  sfxVolume: number
  mute: boolean

  tileSize: 32 | 48 | 64
  showAnimations: boolean
  speedMode: 'normal' | 'fast'
  themeId: 'classic' | 'dark' | 'high-contrast'

  touchMode: 'swipe' | 'dpad' | 'tap'
  keyMap: Record<string, PlayerIntent['kind']>

  language: 'zh-CN' | 'en' | 'ja'
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'
  a11yHighContrast: boolean

  analyticsOptIn: boolean  // 默认 false
}
```

存储：localStorage（小，全平台支持）。

---

## 6. React UI 边界

### 6.1 整体职责

```
┌────────────────────────────────────────────────────────┐
│  React 层 (Zustand store + 组件)                        │
│  ├─ TitleScreen  SettingsModal  SaveModal              │
│  ├─ HelpModal    BattleHud     DialogHud               │
│  └─ ToastStack   StatusBar     FloorMsg                │
│                                                         │
│  Zustand stores:                                        │
│  ├─ uiStore        当前 Modal / 全局 UI 状态           │
│  ├─ settingsStore  玩家设置                             │
│  ├─ gameStore      Core 状态的 React 镜像               │
│  └─ bridgeStore    桥接事件缓冲                         │
└────────────────────────────────────────────────────────┘
                              │ 桥接层
                              ▼
┌────────────────────────────────────────────────────────┐
│  Phaser Game (一个 <canvas>)                            │
└────────────────────────────────────────────────────────┘
```

**关键决定**：状态栏、战斗 HUD、剧情 → **React 浮层**，不嵌入 Phaser Scene。

### 6.2 桥接层（细化）

```ts
import { EventEmitter } from './emitter'
const bridge = new EventEmitter<BridgeSpec>()

bridge.on('render:showText', (p) => uiStore.getState().openDialog(p))
bridge.on('render:showBattle', (p) => uiStore.getState().openBattle(p))
bridge.on('render:hideBattle', () => uiStore.getState().closeBattle())
// ... 全部桥接到 uiStore / settingsStore
```

**为什么用 EventEmitter**：Zustand 直连会触发 React 无谓 re-render，EventEmitter 可节流。

### 6.3 标题画面

- 背景：Phaser TitleScene 跑 mota 经典假 3D 城堡 + 飘云
- 中央菜单：React 组件，CSS 定位 absolute
- 玩家点"开始" → `bridge.emit('player:action startGame')` → Core 初始化

**字体**：用 `@fontsource/ma-shan-zheng`（演示佛系体） / `@fontsource/press-start-2p`（复古像素） / `@fontsource/jetbrains-mono`（数字）。

### 6.4 状态栏

```
┌─ Canvas ─┐  ┌─ StatusBar ─────┐
│          │  │ ☀ 阳光 LV 1     │
│          │  │ HP ━━━●━ 1000/9999 │
│          │  │ ATK 100  DEF 100  │
│          │  │ MONEY 0  EXP 0    │
│          │  │ ┌──┐┌──┐┌──┐     │
│          │  │ │黄││蓝││红│     │
│          │  │ └──┘└──┘└──┘     │
│          │  │ [Fly] [Book]      │
│          │  │ ──────────────    │
│          │  │ 主塔 1 层          │
└──────────┘  └──────────────────┘
```

**性能**：
- `useSyncExternalStore` 订阅 Zustand + `useShallow`
- HP 数字滚动用 CSS `transition`
- 血条用 CSS 变量

### 6.5 战斗 HUD

React Modal 覆盖在 Phaser canvas 上：
- 显示双方立绘、HP、ATK、DEF
- 战斗动画在 Phaser BattleScene 跑
- 动画完 → React 弹结算 → 玩家点继续

### 6.6 剧情 / 对话 Modal

- 打字机效果（每字 50ms，CSS transition）
- 玩家按 Enter/点击继续
- 多行 `showText` 不重开 Modal，append 到队列

### 6.7 choices / 商店 Modal

- 键盘可操作（上下选 + Enter 确认）
- 商店分页 + 已购次数

### 6.8 存档 Modal

5 槽宫格 / 1 列（手机）+ autoSave + 缩略图（`canvas.toDataURL` 200×150 jpeg）。

### 6.9 设置 Modal

受控组件，"保存"才生效，"恢复默认"二次确认。

### 6.10 Toast 通知栈

全局唯一，3 种 kind（info/warn/error），3s 自动消失。

### 6.11 视觉风格

- 像素风 + 配色降饱和 + 阴影渐变
- 主题：classic（黄底黑字）/ dark（黑底绿字）
- 字体：演示佛系体 + Press Start 2P + JetBrains Mono
- 过渡：Framer Motion 180ms

**不做**：全 3D 渲染 / 实时光照 / 4K 高清 / 过场 CG

### 6.12 i18n

```ts
import i18next from 'i18next'
i18next.init({ resources: { 'zh-CN': zhCN, en, ja }, lng: settingsStore.getState().language })
```

i18n 只在 React 层，Phaser 0 文字。

### 6.13 性能

| 指标 | 目标 |
|---|---|
| Modal 打开到首帧 | < 50 ms |
| 状态栏 re-render 频率 | ≤ 10 Hz |
| 设置项生效延迟 | < 100 ms |
| Toast 动画 | 200 ms |

---

## 7. 工具链

### 7.1 全景

```
content/mota-2014/        content/新塔-A/
       │                       │
       ▼                       ▼
tools/importer          tools/art-pipeline
(mota-js → 新格式)       (AI 换皮批量化)
       │                       │
       └──────────┬────────────┘
                  ▼
         tools/validator
         (CI 必跑, 不通过不能合入)
                  │
                  ▼
          apps/web 打包 → 部署
```

### 7.2 importer

```bash
pnpm tsx tools/importer/cli.ts <srcDir> <outDir>
```

**流程**：
1. 读 srcDir/project/ 全部 .js
2. 用 acorn 解析 → 抽 var X = {...} 里的对象
3. 读 srcDir/project/floors/ 全部 .js → floors/*.json
4. 复制 art/ originals/
5. 写 outDir/_meta.json
6. 自动跑 validator
7. 输出导入报告

**关键代码**：

```ts
export function extractTopLevelObject(code: string): any {
  const ast = parse(code, { ecmaVersion: 2022, sourceType: 'script' })
  let result: any = null
  simple(ast as any, {
    VariableDeclarator(node: any) {
      if (node.init?.type === 'ObjectExpression') {
        result = objectExpressionToJson(node.init)
      }
    },
  })
  return result
}
```

### 7.3 art-pipeline

#### 7.3.1 美术规范

```
art/
├─ tiles/         (32×32)
├─ actors/        (32×32 动画 sprite)
├─ animates/      (32×32 动画)
├─ portraits/     (256×256 立绘)
├─ bg/            (1920×1080 背景)
├─ ui/            (UI 用图)
└─ audio/
   ├─ bgm/
   └─ sfx/
```

#### 7.3.2 AI 出图

```bash
pnpm art generate --tower mota-2014 --type tile --id yellowWall
pnpm art generate --tower mota-2014 --type all --style "复古像素升级 32x32 limited palette"
```

**流程**：
1. 读 data.json → 找 tilesets/animates
2. 查 maps.json → 需要哪些图块
3. 查 art/ 是否已有（跳过）
4. 查 originals/ 是否有原图（image-to-image）
5. 调 AI 图像生成（用 MiniMax skill）
6. 后处理：缩放、量化调色板、加像素网格
7. 写入 art/，校验完整性

**首版范围**：**只换 3 块**（标题背景 + hero 立绘 + 状态栏背景），保留原 mota-js 的怪物/NPC/道具 sprite。

#### 7.3.3 style.md 模板

```markdown
# Tower Style: mota-2014

## Mood
复古但现代的 32×32 像素风。限制 6-8 色调色板（暖色为主）。
深色描边（#1a1a1a 1px），无渐变。

## Color Palette
- 暖灰：#c4b8a0
- 深棕：#5c3a1e
- 金：#d4a017
- ...
```

### 7.4 validator

```bash
pnpm validate <tower>
```

| 类别 | 检查 |
|---|---|
| Schema | 所有 JSON 走 zod parse |
| 引用完整性 | floorId/enemy id/item id/map 编号都存在 |
| 数值平衡 | 怪物属性范围合理 |
| 可达性 | 从主塔 1 层能走到每层 |
| 可解性 | BFS 找通关路径（蒙特卡洛 + 剪枝） |
| 资源 | 所有 art/audio 文件存在 |
| 命名 | id 唯一 |
| i18n | 至少 zh-CN 完整 |
| a11y | 颜色对比度 ≥ 4.5:1 |

输出示例：

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

### 7.5 dev-server

```bash
pnpm dev
# 启动 Vite (5173) + Node API (5174)
# 监听 content/ 改动 hot-reload
```

### 7.6 CI

```yaml
# .github/workflows/ci.yml
jobs:
  validate:
    steps:
      - pnpm install
      - pnpm typecheck
      - pnpm test
      - pnpm test:e2e
      - pnpm validate mota-2014
      - pnpm build
```

### 7.7 关键依赖

```json
{
  "acorn": "^8.0.0",          // 解析旧 mota-js
  "jsep": "^1.0.0",            // 表达式解析
  "zod": "^3.0.0",             // schema 校验
  "vitest": "^1.0.0",
  "playwright": "^1.40.0",
  "monaco-editor": "^0.45.0",  // 编辑器 UI（首版可省）
  "fast-glob": "^3.0.0",
  "pngjs": "^7.0.0",
  "sharp": "^0.33.0"
}
```

---

## 8. 首版交付清单

### 8.1 定位

**一句话**：20 层魔塔完整可玩一遍（从主塔 1 层到 20 层救公主），覆盖键盘 + 触屏双操作，经典视觉但干净。

**不是**：在线排行榜、云存档、好友系统、塔市场、3D 美术、过场 CG。

### 8.2 ✅ 首版必做（Must Have）

| 模块 | 范围 |
|---|---|
| 数据层 | Magictower2014 前 20 层（MT0 + MT1~MT20）导入，schema 校验通过；function 灰名单兼容 |
| 渲染 | Phaser FloorScene：Tilemap + autotile + sprite + 切层淡入淡出；32×32 |
| 输入 | 键盘 + 触屏三模式 + A* 寻路 |
| 事件 | §4 全部 60+ 事件类型；表达式 AST 求值；commonEvent；yield/resume |
| 战斗 | 回合制 + 战斗 HUD（React 弹层）+ 战后事件 |
| 存档 | 5 槽 + autoSave；IndexedDB + localStorage 降级；导入/导出；版本迁移；缩略图 |
| 录像 | 录制 + 回放 + 0.5x/1x/2x/4x + 暂停 + 跳步；导入/导出 |
| React UI | 标题 + 设置 + 存档 + 帮助 + 关于 + Toast + 状态栏 + 战斗结算 + 对话 + choices + 商店 + 楼层提示 |
| 设置 | 音 / 主题（classic + dark）/ 动画速度 / 视口缩放 / 触屏模式 / 键盘重绑 / 语言（中英日）/ 色盲 / 高对比 |
| i18n | zh-CN 完整；en + ja 留接口 |
| a11y | 键盘焦点环 / 44×44 触屏 / 双编码 / 对比度 ≥ 4.5:1 |
| 工具链 | importer + validator + art-pipeline（基础） |
| 测试 | core ≥ 90% / events 100% / expr 95% / e2e 5 条 |
| CI | typecheck + test + validate + build |
| 部署 | 静态产物 → Cloudflare Pages / Vercel / Nginx |
| PWA | 可安装 + 离线可玩 |

### 8.3 ❌ 首版不做（Won't Have）

- 在线排行榜 / 云存档 / 好友系统 / 塔市场（UGC）
- 多塔切换 UI（首版只装 1 塔）
- 关卡可视化编辑器（GUI）
- 3D 美术 / iOS / Android 原生 / 桌面 Electron
- mota-js 老塔兼容（24/50 层）
- 直播/录播分享、AI 关卡平衡性调优、动画编辑器

### 8.4 ⏳ 后期做（Could Have）

- 主题扩展（paper / high-contrast）
- 完整 en + ja 翻译
- 战斗"快进模式"全局开关
- 自定义色盲模式
- 战斗动画速度独立设置
- 录像分享
- 关卡可视化编辑器

### 8.5 美术首版范围

**只换 3 块**（AI 出图）：
1. 标题画面背景
2. hero 立绘（4 方向 4 帧 = 16 帧）
3. 状态栏背景

**保留**原 mota-js 的怪物 / NPC / 道具 / 地形 / 门 / 楼梯 sprite。

### 8.6 验收标准

#### 功能
- [ ] 冷启动 → 看到标题画面 < 3s（4G）
- [ ] 主流程可通关（标题 → 开始 → MT1 → MT20 → 救公主）
- [ ] 存档/读档完整恢复
- [ ] iOS Safari 触屏可用
- [ ] 桌面键盘完整可用
- [ ] HP 归零 → 失败画面 → 读档可恢复
- [ ] 改坏 JSON → 标题红屏显示具体错误
- [ ] i18n 切换英文正常

#### 质量
- [ ] Vitest 覆盖率 ≥ 85%
- [ ] Playwright 5 条 e2e 通过
- [ ] validator 0 error，warning ≤ 5
- [ ] typecheck 全过
- [ ] build 产物 < 5MB（gzipped < 1.5MB）
- [ ] Lighthouse Performance ≥ 80 / A11y ≥ 95 / BP ≥ 90

#### 文档
- [ ] README / CONTRIBUTING
- [ ] 本套设计文档已 commit
- [ ] API 文档自动生成
- [ ] CHANGELOG v0.1.0

### 8.7 实施分阶段

| Phase | 内容 | 估时 |
|---|---|---|
| 0 脚手架 | pnpm workspace / Vite / React / Phaser / TS / CI | 1-2 天 |
| 1 数据层 | zod schema + loader + importer + validator 基础 | 3-4 天 |
| 2 核心逻辑 | GameState + 战斗 + 移动 + 事件机 | 5-7 天 |
| 3 渲染层 | BootScene + TitleScene + FloorScene + Tilemap | 5-7 天 |
| 4 输入 | 键盘 + 触屏三模式 + A* | 2-3 天 |
| 5 React UI | 标题 + 状态栏 + 战斗 HUD + 对话 + choices + 商店 | 5-7 天 |
| 6 存档 | IndexedDB + 迁移 + 导入导出 + 录像 | 3-4 天 |
| 7 美术 | AI 出 3 块 + 主题 | 2-3 天 |
| 8 打磨 | e2e + Lighthouse + a11y + i18n + 文档 | 3-5 天 |
| 9 发布 | tag + 部署 | 1 天 |

**总计**：6-8 周单人 / 3-4 周两人。

### 8.8 风险

| 风险 | 概率 | 影响 | 缓解 |
|---|---|---|---|
| 旧 function 灰名单有未实现 core API | 中 | 高 | importer 时扫常用 API |
| 战斗公式不准确 | 中 | 中 | 照搬 mota-js + 100+ 单测 |
| Phaser 低端手机卡 | 中 | 中 | 触屏 A 模式默认关闭 autotile 重算 |
| 存档 / 录像占空间 | 低 | 低 | LZ 压缩 + 缩略图 + replay 限步 |
| AI 出图风格不统一 | 中 | 中 | style.md + 调色板限制 + 人工 review |
| 设计某段不可行 | 中 | 中 | Phase 8 后留 1 周 buffer |

### 8.9 长期路线

```
v0.2  多塔支持 / 录像分享 / 主题扩展
v0.3  关卡可视化编辑器 / 在线排行榜
v0.4  云存档
v0.5  多语言完整翻译 / 美术全套重做
v1.0  移动 App（Capacitor）/ 好友系统 / 塔市场
```

---

## 附录 A：决策记录

| # | 决策 | 原因 |
|---|---|---|
| 1 | monorepo（pnpm workspace） | core/render/ui 拆 package，便于 Node 单测 |
| 2 | Phaser 3（不是 PixiJS / Cocos / Three） | 游戏循环 + 触屏 + 动画 + Tilemap 全包；触屏节约踩坑量 |
| 3 | React 外层 UI（不是纯 Phaser UI） | 平台一致性 + 不和 Phaser 抢资源 |
| 4 | 保 mota-js 数据格式（路线 C） | 数据格式是 H5mota 生态事实标准 |
| 5 | 强类型事件 + AST 求值（不是 eval 沙箱） | 不可测试/不可类型检查/有安全风险 |
| 6 | 触屏三模式（滑动 / 方向键 / 单击） | 覆盖三类玩家 |
| 7 | IndexedDB + localStorage 降级 | 隐私模式 / Safari ITP 兼容 |
| 8 | 录像"复读操作流"（不是"复读 state"） | 体积小 + 可读 |
| 9 | React 状态栏 + 战斗 HUD 浮层 | 不嵌入 Phaser Scene，平台一致 |
| 10 | 美术首版只换 3 块 | 成本最低 + 视觉最显眼的改动 |
| 11 | 截 Magictower2014 前 20 层 | 现成最接近 20 层的作品 |
| 12 | 剧情重排放到首版之后 | 物理截取已足够"能玩" |

## 附录 B：未来路线

- 多塔支持：UI 切换 / import 工具支持多格式
- 关卡可视化编辑器：Monaco + React 树
- 在线排行榜：自建后端 + 反作弊（hash chain + 重放校验）
- 云存档：用户系统 + sync 协议
- 美术全套重做：style.md 系统化 + AI 训练
- 移动 App：Capacitor 套壳
- 好友系统 / 塔市场：UGC + 审核风控
- 直播 / 录播：截图 + 录像流

---

**文档结束**。下一步：审阅本设计 → 修改定稿 → 调用 writing-plans skill 拆实施 plan。

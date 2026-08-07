# Phase 5: React UI

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Phase 目标**: 在 packages/ui + apps/web 里实现所有"游戏外" React UI（标题 / 设置 / 存档 / 帮助 / 状态栏 / 战斗 HUD / 对话 / choices / 商店 / Toast）。

**Phase 估时**: 5-7 天单人

**依赖**: Phase 4 完成

---

## 详细 spec 参考

- [§6 React UI 边界](../specs/2026-08-07-modern-mota-design.md#6-react-ui-边界)

---

## Task 总览

### Task 1: 桥接层桥接到 uiStore（spec §6.2）
- `apps/web/src/stores/uiStore.ts`: Zustand store 含 currentModal / dialogs / battle / toasts
- `apps/web/src/stores/gameStore.ts`: Core 状态的 React 镜像
- `apps/web/src/stores/settingsStore.ts`: 玩家设置
- 测试：emit bridge 事件，store 更新

### Task 2: Modal 框架组件
- `packages/ui/src/common/Modal.tsx`: 通用 Modal（含 Framer Motion）
- `packages/ui/src/common/Button.tsx`
- `packages/ui/src/common/Slider.tsx`
- 测试：RTL 渲染 + 交互

### Task 3: Toast 通知栈
- `packages/ui/src/Toast.tsx` + `ToastStack.tsx`
- 3 种 kind（info/warn/error），3s 自动消失
- 测试

### Task 4: 标题画面
- `packages/ui/src/Title/TitleScreen.tsx`
- 6 个按钮：开始 / 读取存档 / 录像回放 / 游戏说明 / 设置 / 关于
- 测试

### Task 5: 状态栏（spec §6.4）
- `packages/ui/src/Hud/StatusBar.tsx`
- `useSyncExternalStore` + useShallow
- 测试：HP/Atk/Def 变化时只更新必要 cell

### Task 6: 战斗 HUD（spec §6.5）
- `packages/ui/src/Hud/BattleHud.tsx`
- 显示双方立绘 / HP / ATK / DEF / 战斗结果
- 测试

### Task 7: 剧情对话 Modal（spec §6.6）
- `packages/ui/src/Dialog/DialogModal.tsx`
- 打字机效果（CSS transition）
- 多行 showText 不重开 Modal，append 到队列
- 测试

### Task 8: choices 弹窗（spec §6.7）
- `packages/ui/src/Dialog/ChoicesModal.tsx`
- 键盘可操作（上下 + Enter）
- 选完 emit bridge 事件
- 测试

### Task 9: 商店 Modal（spec §6.7）
- `packages/ui/src/Shop/ShopModal.tsx`
- 分页 + 已购次数
- 测试

### Task 10: 楼层切换提示
- `packages/ui/src/Hud/FloorMsg.tsx`
- 测试

### Task 11: 存档 Modal（spec §6.8）
- `packages/ui/src/Save/SaveModal.tsx`
- 5 槽 + autoSave + 缩略图
- 槽位 UI 宫格（桌面）/ 1 列（手机）
- 测试

### Task 12: 设置 Modal（spec §6.9）
- `packages/ui/src/Settings/SettingsModal.tsx`
- 所有设置项（spec §5.4）
- 受控 + "保存" / "取消" / "恢复默认"
- 测试

### Task 13: 帮助 / 关于 Modal
- `packages/ui/src/HelpModal.tsx`
- `packages/ui/src/AboutModal.tsx`
- 测试

### Task 14: i18n 接入（spec §6.12）
- `packages/ui/src/i18n/`: i18next + locales/zh-CN.json / en.json / ja.json
- zh-CN 完整；en + ja 留接口
- 测试

### Task 15: 视觉风格（spec §6.11）
- `apps/web/src/styles/`: Tailwind 配置 + 主题 CSS 变量
- 2 套主题：classic + dark
- 测试：切换主题 CSS 变量生效

### Task 16: apps/web 集成所有 Modal
- `apps/web/src/App.tsx`: 路由 Modal 状态 → 渲染对应组件
- 测试：点击不同入口打开不同 Modal

---

## Phase 5 完成检查

- [ ] `pnpm typecheck` 0 errors
- [ ] `pnpm test` 全部通过
- [ ] 浏览器打开：标题画面 + 6 个菜单按钮
- [ ] 点开始：进入 FloorScene + 状态栏显示
- [ ] 设置 Modal 可切换主题 + 语言 + 触屏模式
- [ ] 切到英文：界面文字英文化

---

## 下一步

进入 Phase 6：存档（IndexedDB + 迁移 + 录像）。
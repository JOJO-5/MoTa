# Phase 8: 打磨

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Phase 目标**: 端到端测试 + 性能调优 + 无障碍 + i18n 完整化 + 文档收尾。**Phase 8 完成 = 首版发布条件达成**。

**Phase 估时**: 3-5 天单人

**依赖**: Phase 7 完成

---

## 详细 spec 参考

- [§8.6 验收标准](../specs/2026-08-07-modern-mota-design.md#86-验收标准)

---

## Task 总览

### Task 1: Playwright 配置
- `apps/web/playwright.config.ts`: Chrome + WebKit（Safari/iOS）+ Firefox
- 测试

### Task 2: e2e — 主流程可通关
- `apps/web/e2e/main-flow.spec.ts`: 标题 → 开始 → MT1 → MT3 → 存档 → 重启 → 读档 → 继续 → MT20 → 救公主 → 通关
- 验证：通关画面出现

### Task 3: e2e — 存档读档
- `apps/web/e2e/save-load.spec.ts`: 存档 + 关闭浏览器 + 重开 + 读档 + 状态完整
- 验证：HP / 钥匙 / 楼层 / 剧情进度一致

### Task 4: e2e — 触屏
- `apps/web/e2e/touch.spec.ts`: 用 mobile viewport + 触发 pointer events，验证走格 / 战斗
- 验证：战斗能胜利

### Task 5: e2e — 键盘
- `apps/web/e2e/keyboard.spec.ts`: 桌面浏览器按方向键，验证走格
- 验证：玩家位置变化

### Task 6: e2e — i18n
- `apps/web/e2e/i18n.spec.ts`: 切换语言，验证 UI 文字变化
- 验证：英文版标题正确

### Task 7: Lighthouse 调优
- Performance ≥ 80：分包、压缩、懒加载
- Accessibility ≥ 95：加 ARIA、焦点环、对比度
- Best Practices ≥ 90：HTTPS（部署时）、CSP

### Task 8: a11y 调优
- 键盘焦点环
- 触屏 44×44 目标
- 状态栏图标双编码
- 对比度校验（axe-core）

### Task 9: i18n 完整化
- 补全 en.json + ja.json 所有 key
- 测试：每个 UI 组件都有三语言

### Task 10: 错误注入测试
- 故意改坏 `content/mota-2014/floors/MT7.json`（删 width）
- 重启 → 标题红屏显示具体错误

### Task 11: 文档收尾
- 更新 README（首版功能清单 + 链接到 design + plan）
- 更新 CONTRIBUTING
- 写 CHANGELOG.md v0.1.0
- API 文档：typedoc 自动生成

### Task 12: 最终验收
- 跑 `pnpm typecheck && pnpm test && pnpm test:e2e && pnpm validate mota-2014 && pnpm build`
- 跑 Lighthouse（手动）
- 跑 5 条 e2e
- 全部通过 → Phase 8 完成

---

## Phase 8 完成检查（首版发布条件）

- [ ] `pnpm typecheck` 0 errors
- [ ] `pnpm test` 覆盖率 ≥ 85%
- [ ] `pnpm test:e2e` 5 条全过
- [ ] `pnpm validate mota-2014` 0 error, warning ≤ 5
- [ ] `pnpm build` 产物 < 5MB（gzipped < 1.5MB）
- [ ] Lighthouse Performance ≥ 80 / A11y ≥ 95 / BP ≥ 90
- [ ] 改坏 JSON 标题红屏显示具体错误
- [ ] i18n 切换英文正常
- [ ] 触屏（mobile viewport）能玩
- [ ] 键盘能玩
- [ ] 存档读档完整恢复
- [ ] 通关流程可达
- [ ] 文档完整

---

## 下一步

进入 Phase 9：发布（git tag + 部署）。
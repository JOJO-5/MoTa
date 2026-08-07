# 贡献指南

## 开发流程

1. fork + 克隆仓库
2. 创建 feature 分支：`git checkout -b feature/<name>`
3. 写代码 + 测试（必须 TDD：先写测试，再写实现）
4. 跑 `pnpm typecheck && pnpm test && pnpm build`
5. commit（格式：`<type>(<scope>): <subject>`）
6. 推送到你的 fork + 开 PR
7. 等 CI 通过 + reviewer 批准

## 提交格式

```
<type>(<scope>): <subject>

<body (optional)

<footer (optional)
```

type: feat / fix / refactor / test / docs / chore
scope: 模块名（core / render / ui / persistence / data / web）

## 测试约定

- 单文件 ≤ 400 行
- 函数 ≤ 80 行
- 测试覆盖率：core ≥ 90% / events 100% / expr 95%
- 一个文件一个明确职责

## 文档

设计文档在 `docs/superpowers/specs/`。改设计要先改文档再改代码。

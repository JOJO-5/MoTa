# Phase 0: 脚手架

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Phase 目标**: 建立 pnpm monorepo、Vite + React + Phaser 入口、TypeScript 配置、Vitest 配置、CI。Phase 0 完成后整个仓库能 `pnpm dev` 起 Vite + 一个 hello world。

**Phase 估时**: 1-2 天单人

**依赖**: 无（这是第一个 Phase）

**前置 Task**: 仓库已 init（`git init` 已执行；如未执行见 Task 0）

---

## 全局说明

- **Node 版本**: ≥ 20
- **包管理器**: pnpm 9+
- **所有文件路径相对仓库根** `modern-mota/`
- **每次 commit 前** 跑 `pnpm typecheck` 和 `pnpm test` 确保通过

---

## Task 0: 初始化仓库（如果还没 init）

**Files:**
- N/A（git 操作）

- [ ] **Step 1: 检查 git 是否已 init**

```bash
cd modern-mota
git status
```

如果返回 "fatal: not a git repository"，继续 Step 2。否则跳过 Task 0。

- [ ] **Step 2: git init + 首次 commit**

```bash
cd modern-mota
git init
git checkout -b main
git config user.email "dev@modern-mota.local"
git config user.name "Modern Mota Dev"
```

预期: 仓库初始化成功。

- [ ] **Step 3: 不创建初始文件（Phase 0.1 会建）**

直接进入 Task 1。

---

## Task 1: 根 package.json + pnpm workspace

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `.gitignore`
- Create: `.editorconfig`
- Create: `.prettierrc.json`
- Create: `.nvmrc`

- [ ] **Step 1: 写根 package.json**

`package.json`:
```json
{
  "name": "modern-mota",
  "version": "0.1.0",
  "private": true,
  "description": "Modern rebuild of the classic 20-floor Magic Tower game",
  "license": "MIT",
  "engines": {
    "node": ">=20",
    "pnpm": ">=9"
  },
  "packageManager": "pnpm@9.0.0",
  "scripts": {
    "dev": "pnpm --filter @modern-mota/web dev",
    "build": "pnpm -r build",
    "typecheck": "pnpm -r typecheck",
    "test": "pnpm -r test",
    "test:e2e": "pnpm --filter @modern-mota/web test:e2e",
    "lint": "prettier --check .",
    "format": "prettier --write .",
    "clean": "pnpm -r exec rm -rf dist node_modules .turbo"
  },
  "devDependencies": {
    "prettier": "^3.2.0",
    "typescript": "^5.4.0",
    "@types/node": "^20.11.0"
  }
}
```

- [ ] **Step 2: 写 pnpm-workspace.yaml**

`pnpm-workspace.yaml`:
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'tools/*'
```

- [ ] **Step 3: 写 .gitignore**

`.gitignore`:
```
node_modules
dist
.turbo
.DS_Store
*.log
.env
.env.local
.vscode/*
!.vscode/settings.json
.idea
coverage
*.tsbuildinfo
apps/web/dist
apps/web/.vite
content/mota-2014/art/originals
tools/importer/.cache
```

- [ ] **Step 4: 写 .editorconfig**

`.editorconfig`:
```
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

- [ ] **Step 5: 写 .prettierrc.json**

`.prettierrc.json`:
```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

- [ ] **Step 6: 写 .nvmrc**

`.nvmrc`:
```
20
```

- [ ] **Step 7: 安装根依赖**

```bash
cd modern-mota
pnpm install
```

预期: 输出包含 `Done in X.Xs`，根 `node_modules` 创建。

- [ ] **Step 8: commit**

```bash
git add package.json pnpm-workspace.yaml .gitignore .editorconfig .prettierrc.json .nvmrc pnpm-lock.yaml
git commit -m "chore: scaffold pnpm monorepo"
```

---

## Task 2: TypeScript 基础配置

**Files:**
- Create: `tsconfig.base.json`
- Create: `tsconfig.json`

- [ ] **Step 1: 写 tsconfig.base.json（所有 package 继承）**

`tsconfig.base.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "verbatimModuleSyntax": false,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  },
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

- [ ] **Step 2: 写根 tsconfig.json（引用所有 package）**

`tsconfig.json`:
```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "noEmit": true
  },
  "files": [],
  "references": [
    { "path": "./apps/web" },
    { "path": "./packages/core" },
    { "path": "./packages/data" },
    { "path": "./packages/render" },
    { "path": "./packages/ui" },
    { "path": "./packages/persistence" }
  ]
}
```

- [ ] **Step 3: 创建所有 package 目录占位**

```bash
mkdir -p apps/web packages/core/src packages/data/src packages/render/src packages/ui/src packages/persistence/src
```

- [ ] **Step 4: 给每个 package 创建最小 tsconfig.json**

`apps/web/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
```

`packages/core/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true
  },
  "include": ["src/**/*.ts"]
}
```

`packages/data/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true
  },
  "include": ["src/**/*.ts"]
}
```

`packages/render/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true
  },
  "include": ["src/**/*.ts"]
}
```

`packages/ui/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
```

`packages/persistence/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true
  },
  "include": ["src/**/*.ts"]
}
```

- [ ] **Step 5: 给每个 package 创建 package.json（最小占位）**

`apps/web/package.json`:
```json
{
  "name": "@modern-mota/web",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

`packages/core/package.json`:
```json
{
  "name": "@modern-mota/core",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

`packages/data/package.json`:
```json
{
  "name": "@modern-mota/data",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  }
}
```

`packages/render/package.json`:
```json
{
  "name": "@modern-mota/render",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  }
}
```

`packages/ui/package.json`:
```json
{
  "name": "@modern-mota/ui",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  }
}
```

`packages/persistence/package.json`:
```json
{
  "name": "@modern-mota/persistence",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  }
}
```

- [ ] **Step 6: 给每个 package 创建占位 index.ts**

`packages/core/src/index.ts`:
```ts
export const CORE_VERSION = '0.1.0'
```

`packages/data/src/index.ts`:
```ts
export const DATA_VERSION = '0.1.0'
```

`packages/render/src/index.ts`:
```ts
export const RENDER_VERSION = '0.1.0'
```

`packages/ui/src/index.ts`:
```tsx
export const UI_VERSION = '0.1.0'
```

`packages/persistence/src/index.ts`:
```ts
export const PERSISTENCE_VERSION = '0.1.0'
```

- [ ] **Step 7: 跑 install**

```bash
pnpm install
```

预期: 输出 "Done in X.Xs"，每个 package 的 node_modules 被链接。

- [ ] **Step 8: 跑 typecheck**

```bash
pnpm typecheck
```

预期: 0 errors。

- [ ] **Step 9: commit**

```bash
git add tsconfig.base.json tsconfig.json apps packages
git commit -m "chore: configure TypeScript project references"
```

---

## Task 3: Vitest 基础配置

**Files:**
- Create: `vitest.config.ts`（根）
- Create: `packages/core/vitest.config.ts`
- Create: `packages/core/src/index.test.ts`（最小测试）

- [ ] **Step 1: 给所有需要测试的 package 加 vitest 依赖**

修改 `packages/core/package.json`，加 dependencies 和 devDependencies：

```json
{
  "name": "@modern-mota/core",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "vitest": "^1.4.0"
  }
}
```

同样模式改 `packages/data/package.json`、`packages/render/package.json`、`packages/ui/package.json`、`packages/persistence/package.json`。

- [ ] **Step 2: 给 packages/core 创建 vitest.config.ts**

`packages/core/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        statements: 85,
        branches: 80,
        functions: 85,
        lines: 85,
      },
    },
  },
})
```

- [ ] **Step 3: 写最小测试**

`packages/core/src/index.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { CORE_VERSION } from './index'

describe('@modern-mota/core', () => {
  it('exports a version string', () => {
    expect(CORE_VERSION).toBe('0.1.0')
  })
})
```

- [ ] **Step 4: 跑测试**

```bash
cd packages/core && pnpm test
```

预期:
```
✓ src/index.test.ts (1)
  ✓ exports a version string

Test Files  1 passed (1)
     Tests  1 passed (1)
```

- [ ] **Step 5: 给其他 package 也加 vitest.config.ts**

`packages/data/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
```

`packages/render/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
```

`packages/ui/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
```

`packages/persistence/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
```

每个 package 的 `package.json` 加 `@vitejs/plugin-react` + `jsdom` 依赖（仅 ui 包需要）：

```json
"devDependencies": {
  "vitest": "^1.4.0",
  "@vitejs/plugin-react": "^4.2.0",
  "jsdom": "^24.0.0"
}
```

- [ ] **Step 6: 给 ui 包加最小测试**

`packages/ui/src/index.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { UI_VERSION } from './index'

describe('@modern-mota/ui', () => {
  it('exports a version string', () => {
    expect(UI_VERSION).toBe('0.1.0')
  })
})
```

- [ ] **Step 7: 跑全部测试**

```bash
pnpm install
pnpm test
```

预期: 所有 package 测试通过。

- [ ] **Step 8: commit**

```bash
git add .
git commit -m "chore: configure Vitest for all packages"
```

---

## Task 4: Vite + React 入口

**Files:**
- Create: `apps/web/index.html`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/App.tsx`
- Create: `apps/web/src/App.test.tsx`
- Modify: `apps/web/package.json`

- [ ] **Step 1: 给 apps/web 加依赖**

`apps/web/package.json`:
```json
{
  "name": "@modern-mota/web",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "@modern-mota/core": "workspace:*",
    "@modern-mota/data": "workspace:*",
    "@modern-mota/render": "workspace:*",
    "@modern-mota/ui": "workspace:*",
    "@modern-mota/persistence": "workspace:*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.2.0",
    "vitest": "^1.4.0",
    "jsdom": "^24.0.0"
  }
}
```

- [ ] **Step 2: 写 apps/web/index.html**

`apps/web/index.html`:
```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
    <title>魔塔 · 2026 Modern Rebuild</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: 写 apps/web/vite.config.ts**

`apps/web/vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@modern-mota/core': path.resolve(__dirname, '../../packages/core/src'),
      '@modern-mota/data': path.resolve(__dirname, '../../packages/data/src'),
      '@modern-mota/render': path.resolve(__dirname, '../../packages/render/src'),
      '@modern-mota/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@modern-mota/persistence': path.resolve(__dirname, '../../packages/persistence/src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2022',
  },
})
```

- [ ] **Step 4: 写 apps/web/src/main.tsx**

`apps/web/src/main.tsx`:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('root element not found')

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

- [ ] **Step 5: 写 apps/web/src/App.tsx**

`apps/web/src/App.tsx`:
```tsx
import { CORE_VERSION } from '@modern-mota/core'

export function App() {
  return (
    <div className="app">
      <header className="app__header">
        <h1>魔塔 · 2026 Modern Rebuild</h1>
      </header>
      <main className="app__main">
        <p>脚手架已就绪。Core version: {CORE_VERSION}</p>
      </main>
    </div>
  )
}
```

- [ ] **Step 6: 写 apps/web/src/App.test.tsx**

`apps/web/src/App.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { App } from './App'

describe('App', () => {
  it('renders the title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/魔塔/)
  })
})
```

- [ ] **Step 7: 给 apps/web 加 vitest.config.ts**

`apps/web/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@modern-mota/core': path.resolve(__dirname, '../../packages/core/src'),
      '@modern-mota/data': path.resolve(__dirname, '../../packages/data/src'),
      '@modern-mota/render': path.resolve(__dirname, '../../packages/render/src'),
      '@modern-mota/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@modern-mota/persistence': path.resolve(__dirname, '../../packages/persistence/src'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
```

- [ ] **Step 8: 给 apps/web 加 Testing Library 依赖**

修改 `apps/web/package.json` 加 `@testing-library/react` 和 `@testing-library/jest-dom`:

```json
"devDependencies": {
  "@testing-library/jest-dom": "^6.4.0",
  "@testing-library/react": "^14.2.0",
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  "@vitejs/plugin-react": "^4.2.0",
  "jsdom": "^24.0.0",
  "vite": "^5.2.0",
  "vitest": "^1.4.0"
}
```

- [ ] **Step 9: 写 apps/web/src/test-setup.ts**

`apps/web/src/test-setup.ts`:
```ts
import '@testing-library/jest-dom/vitest'
```

更新 `apps/web/vitest.config.ts` 加 setupFiles：

```ts
test: {
  environment: 'jsdom',
  include: ['src/**/*.test.{ts,tsx}'],
  setupFiles: ['./src/test-setup.ts'],
},
```

- [ ] **Step 10: 跑 install + typecheck + test**

```bash
pnpm install
pnpm typecheck
pnpm test
```

预期:
- install: `Done in X.Xs`
- typecheck: 0 errors
- test: 所有测试通过

- [ ] **Step 11: 跑 dev server 验证**

```bash
cd apps/web && pnpm dev
```

预期: `Local: http://localhost:5173/`，浏览器打开看到 "魔塔 · 2026 Modern Rebuild"。

Ctrl+C 停止 dev server。

- [ ] **Step 12: commit**

```bash
git add .
git commit -m "feat(web): scaffold Vite + React entry with hello world"
```

---

## Task 5: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: 写 CI workflow**

`.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Typecheck
        run: pnpm typecheck

      - name: Test
        run: pnpm test

      - name: Build
        run: pnpm build
```

- [ ] **Step 2: 本地跑一次确认所有命令都能过**

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
```

预期: 全部通过，无错误。

注意：`pnpm build` 会因为 packages 用 `tsc --noEmit` 或 vite build 跑过，apps/web 会输出到 `apps/web/dist`。

- [ ] **Step 3: commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow"
```

- [ ] **Step 4: 推送到远程**

```bash
git remote add origin <your-git-url>
git push -u origin main
```

（这一步如果还没创建 GitHub repo 可跳过，但 CI workflow 文件已经 commit）

---

## Task 6: README + CONTRIBUTING

**Files:**
- Create: `README.md`
- Create: `CONTRIBUTING.md`

- [ ] **Step 1: 写 README.md**

`README.md`:
```markdown
# 魔塔 · Modern Rebuild

用现代前端栈（Phaser 3 + React + TypeScript + Vite）从零复刻经典 20 层魔塔。

## 状态

🚧 开发中。当前在 Phase 0（脚手架）。

## 技术栈

- 运行时：Vite + React 18 + TypeScript 5 + Phaser 3
- 测试：Vitest + Playwright
- 数据：zod schema + JSON
- 包管理：pnpm 9 monorepo

## 快速开始

要求 Node.js 20+ 和 pnpm 9+。

\`\`\`bash
pnpm install
pnpm dev          # 启动 Vite dev server (http://localhost:5173)
pnpm test         # 跑全部测试
pnpm typecheck    # TS 类型检查
pnpm build        # 产出 production build
\`\`\`

## 仓库结构

\`\`\`
apps/web/                    浏览器入口
packages/core/               纯游戏逻辑（无 UI）
packages/data/               数据 schema + 加载器
packages/render/             Phaser 渲染层
packages/ui/                 React UI 组件
packages/persistence/        存档 / 录像 / 设置
content/                     关卡数据 + 美术资源
tools/                       importer / validator / art-pipeline
docs/                        设计文档 + spec
\`\`\`

## 设计文档: [docs/superpowers/specs/2026-08-07-modern-mota-design.md](docs/superpowers/specs/2026-08-07-modern-mota-design.md)

## License

MIT
```

- [ ] **Step 2: 写 CONTRIBUTING.md**

`CONTRIBUTING.md`:
```markdown
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

\`\`\`
<type>(<scope>): <subject>

<body (optional)

<footer (optional)
\`\`\`

type: feat / fix / refactor / test / docs / chore
scope: 模块名（core / render / ui / persistence / data / web）

## 测试约定

- 单文件 ≤ 400 行
- 函数 ≤ 80 行
- 测试覆盖率：core ≥ 90% / events 100% / expr 95%
- 一个文件一个明确职责

## 文档

设计文档在 `docs/superpowers/specs/`。改设计要先改文档再改代码。
```

- [ ] **Step 3: commit**

```bash
git add README.md CONTRIBUTING.md
git commit -m "docs: add README and CONTRIBUTING"
```

---

## Phase 0 完成检查

- [ ] `pnpm install` 无错误
- [ ] `pnpm typecheck` 0 errors
- [ ] `pnpm test` 全部通过
- [ ] `pnpm build` 成功
- [ ] `pnpm dev` 启动 Vite + React hello world
- [ ] GitHub Actions CI 通过
- [ ] README + CONTRIBUTING 完整

**全部通过 → 进入 Phase 1（数据层）**

---

## 下一步

打开 [phase-01-data.md](2026-08-07-modern-mota-phase-01.md) 开始 Phase 1：zod schema + loader + importer + validator。
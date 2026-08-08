# MoTa 项目长期记忆

## 项目概况
- 魔塔(Magic Tower)2014 现代重制版
- 技术栈：Phaser 3 + React 18 + TypeScript 5 + Vite monorepo (pnpm workspace)
- 结构：apps/web (React入口)、packages/core (游戏逻辑)、packages/data (数据schema+加载器)、packages/render (Phaser渲染)

## 环境注意事项
- 本机 Esafenet 透明加密软件会对 node_modules 中的 JS 文件加密，导致 esbuild 预构建可能读到密文报错
- Python 和 Node fs.readFileSync 读到明文，bash/head 读到密文
- 验证策略：用 Python 起静态服务器伺服 dist、用 Node --experimental-strip-types 直接执行 TS、用 Chrome --dump-dom 做端到端验证

## 数据加载架构
- bridge.ts: initTower() 加载数据 → 设置 globalThis['__towerData'] → dispatch SET_FLOOR/SET_POSITION
- scene-transition.ts: GameScene 订阅 Zustand 状态变化，从 globalThis['__towerData'] 取楼层数据
- loader-browser.ts: permissiveFloorSchema().safeParse，校验失败降级使用原始数据

## 已知未修复问题
- changeFloor 数据中的 `:next`/`:before` 特殊 floorId 值未解析
- floor-level changeFloor 楼梯数据未连接到渲染层触发逻辑

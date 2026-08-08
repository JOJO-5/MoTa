# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] — 2026-08-08

### Added

#### Phase 1: 数据层
- Zod schema definitions for all mota-js data structures (flags, values, enemy, mapBlock, item, event, floor, main)
- `loader.ts` — Node.js loader (CLI tools)
- `loader-browser.ts` — Browser-compatible loader using fetch API
- Importer CLI (`@modern-mota/importer`) — parses mota-js format with acorn, exports clean JSON
- Validator CLI (`@modern-mota/validator`) — schema validation, reference checks, balance analysis
- **Content import**: Magictower2014 MT0–MT20 floors loaded into `content/mota-2014/`

#### Phase 2: 游戏逻辑
- `GameState` types + Zustand + Immer store
- Movement logic with wall/boundary collision
- Battle logic with turn-based damage calculation
- `battle-utils.ts` — hero/enemy damage with special attributes (magical, shield, etc.)
- AST expression evaluator (jsep-based, no `eval`)
- Event machine (Generator-based, pausable/resumable)
- A* pathfinding algorithm

#### Phase 3: 渲染层 (Phaser 3)
- `BootScene` — asset loading entry
- `GameScene` — floor loading + scene transitions (fade in/out)
- `TileMapLayer` — grid-based tile rendering
- Autotile system — 4-bit neighbor detection
- `HeroSprite` + `EnemySprite` — character rendering
- `CameraSystem` — follow, shake, flash, fade, zoom
- `ParticleSystem` — battle/item/door/heal effects
- `FontRenderer` — floating text, damage numbers, floor titles
- `SaveSystem` — 3 slots via localStorage
- `DialogBox` — text + button options
- `MiniMap` — 4px scale overview
- `ShopSystem` — placeholder with interface
- `EnemyGuide` — monster attribute card
- `AnimationSystem` — walk/idle animations
- `SoundSystem` — BGM loop + SFX
- `WeatherSystem` — rain/snow/fog
- `Hud` — HP/ATK/DEF/Money/Level display
- `GameLoop` — state → UI sync

#### Phase 4: 输入系统
- `KeyboardInput` — WASD / Arrow keys / Space / Enter
- `VirtualPad` — touch d-pad + action button
- `GamepadInput` — D-pad + stick axes

#### Phase 5: Web 应用
- React app shell with main menu, game canvas, settings
- State bridge (`bridge.ts`) — connects core state ↔ render engine
- `useGameState` React hook
- DevTools panel — real-time state inspection
- Demo panel — HP/Money/Reset controls

#### Phase 6: 构建验证
- Full CI/CD pipeline via GitHub Actions
- `pnpm build` ✅ | `pnpm typecheck` ✅ 0 errors | `pnpm test` ✅ 55 tests

#### Phase 7-8: 文档 & 演示
- `README.md` — full feature list + quick start
- `DEMO.md` — screenshots + performance metrics
- Automated screenshot script (`scripts/screenshot.mjs`)
- 4 demo screenshots in `docs/screenshots/`

### Technical Decisions

- **No `eval()`** — expression evaluation uses jsep AST parser
- **Generator-based events** — event machine is pausable without async/await complexity
- **Browser/Node dual loader** — CLI tools use Node.js fs, browser uses fetch
- **Zustand + Immer** — immutable state updates with minimal boilerplate
- **Phaser 3 Canvas** — 416×416 (13×13 tiles), pixel art mode

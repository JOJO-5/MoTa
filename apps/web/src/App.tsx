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

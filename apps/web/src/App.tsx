import { useEffect, useState } from 'react'
import { GameCanvas } from './components/GameCanvas'
import { MainMenu } from './components/MainMenu'
import { Settings } from './components/Settings'
import { DevTools } from './components/DevTools'
import { Demo } from './components/Demo'
import { initTower } from '@modern-mota/render'
import './styles/global.css'

export type Screen = 'menu' | 'game' | 'settings' | 'save'

export function App() {
  const [screen, setScreen] = useState<Screen>('menu')
  const [towerReady, setTowerReady] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const viteEnv = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env
  const showDevTools =
    Boolean(viteEnv?.DEV) && new URLSearchParams(window.location.search).has('dev')

  useEffect(() => {
    if (screen !== 'game' || towerReady || loadError) return undefined
    let cancelled = false
    initTower('mota-2014')
      .then(() => {
        if (!cancelled) setTowerReady(true)
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : String(err)
          setLoadError(msg)
        }
      })
    return () => {
      cancelled = true
    }
  }, [screen, towerReady, loadError])

  const backToMenu = () => {
    setTowerReady(false)
    setLoadError(null)
    setScreen('menu')
  }

  return (
    <div className="app">
      {screen === 'menu' && (
        <MainMenu onStart={() => setScreen('game')} onSettings={() => setScreen('settings')} />
      )}
      {screen === 'settings' && <Settings onClose={() => setScreen('menu')} />}
      {screen === 'game' &&
        (towerReady ? (
          <GameCanvas onBackToMenu={backToMenu} />
        ) : loadError ? (
          <div
            className="game-screen"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <p style={{ color: '#ff6b6b' }}>数据加载失败</p>
            <pre style={{ maxWidth: 360, fontSize: 12, color: '#999', whiteSpace: 'pre-wrap' }}>
              {loadError}
            </pre>
            <button onClick={backToMenu}>返回菜单</button>
          </div>
        ) : (
          <div
            className="game-screen"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <p>加载中…</p>
          </div>
        ))}
      {showDevTools && <DevTools />}
      {showDevTools && <Demo />}
    </div>
  )
}

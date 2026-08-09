import { useEffect, useState } from 'react'
import { GameCanvas } from './components/GameCanvas'
import { MainMenu } from './components/MainMenu'
import { Settings } from './components/Settings'
import { DevTools } from './components/DevTools'
import { Demo } from './components/Demo'
import { initTower, listSaves, loadGame } from '@modern-mota/render'
import { dispatch } from '@modern-mota/core'
import './styles/global.css'

export type Screen = 'menu' | 'game' | 'settings' | 'save'

export function App() {
  const [screen, setScreen] = useState<Screen>('menu')
  const [towerReady, setTowerReady] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loadSlotId, setLoadSlotId] = useState<number | null>(null)
  const viteEnv = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env
  const showDevTools =
    Boolean(viteEnv?.DEV) && new URLSearchParams(window.location.search).has('dev')

  useEffect(() => {
    if (screen !== 'game' || towerReady || loadError) return undefined
    let cancelled = false
    initTower('mota-2014')
      .then(() => {
        if (cancelled) return
        if (loadSlotId !== null) {
          const save = loadGame(loadSlotId)
          if (save) dispatch({ type: 'LOAD_STATE', state: save.data })
        }
        setTowerReady(true)
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
  }, [screen, towerReady, loadError, loadSlotId])

  const backToMenu = () => {
    setTowerReady(false)
    setLoadError(null)
    setLoadSlotId(null)
    setScreen('menu')
  }

  const saves = screen === 'menu' ? listSaves() : []
  const latestSave = saves
    .filter((save): save is NonNullable<typeof save> => save !== null)
    .sort((a, b) => b.timestamp - a.timestamp)[0]

  const startNewGame = () => {
    dispatch({ type: 'RESET' })
    setLoadSlotId(null)
    setScreen('game')
  }

  const continueGame = () => {
    if (!latestSave) return
    setLoadSlotId(latestSave.id)
    setScreen('game')
  }

  return (
    <div className="app">
      {screen === 'menu' && (
        <MainMenu
          onStart={startNewGame}
          onContinue={continueGame}
          onSettings={() => setScreen('settings')}
          hasSave={Boolean(latestSave)}
        />
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

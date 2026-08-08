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

  useEffect(() => {
    if (screen === 'game' && !towerReady) {
      initTower('mota-2014').then(() => setTowerReady(true))
    }
  }, [screen, towerReady])

  return (
    <div className="app">
      {screen === 'menu' && (
        <MainMenu
          onStart={() => setScreen('game')}
          onSettings={() => setScreen('settings')}
        />
      )}
      {screen === 'settings' && (
        <Settings onClose={() => setScreen('menu')} />
      )}
      {screen === 'game' && (
        <GameCanvas onBackToMenu={() => { setTowerReady(false); setScreen('menu') }} />
      )}
      <DevTools />
      <Demo />
    </div>
  )
}

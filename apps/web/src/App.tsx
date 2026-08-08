import { useState } from 'react'
import { GameCanvas } from './components/GameCanvas'
import { MainMenu } from './components/MainMenu'
import { Settings } from './components/Settings'
import { DevTools } from './components/DevTools'
import { Demo } from './components/Demo'
import './styles/global.css'

export type Screen = 'menu' | 'game' | 'settings' | 'save'

export function App() {
  const [screen, setScreen] = useState<Screen>('menu')
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="app">
      {screen === 'menu' && (
        <MainMenu
          onStart={() => setScreen('game')}
          onSettings={() => setSettingsOpen(true)}
        />
      )}
      {screen === 'game' && (
        <GameCanvas onBackToMenu={() => setScreen('menu')} />
      )}
      {settingsOpen && (
        <Settings onClose={() => setSettingsOpen(false)} />
      )}
      {screen === 'game' && <DevTools />}
      {screen === 'game' && <Demo />}
    </div>
  )
}

import { useState } from 'react'
import { useGameState } from './useGameState'

export function DevTools() {
  const gameState = useGameState()
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button className="dev-tools-toggle" onClick={() => setOpen(true)}>
        🛠
      </button>
    )
  }

  return (
    <div className="dev-tools">
      <div className="dev-tools__header">
        <span>Dev Tools</span>
        <button onClick={() => setOpen(false)}>✕</button>
      </div>
      <div className="dev-tools__content">
        <h4>Hero State</h4>
        <pre>{JSON.stringify(gameState.hero, null, 2)}</pre>
        <h4>Floor</h4>
        <p>{gameState.floorId}</p>
        <h4>Position</h4>
        <p>({gameState.position.x}, {gameState.position.y})</p>
        <h4>Flags</h4>
        <pre>{JSON.stringify(gameState.flags, null, 2)}</pre>
        <h4>Values</h4>
        <pre>{JSON.stringify(gameState.values, null, 2)}</pre>
      </div>
    </div>
  )
}

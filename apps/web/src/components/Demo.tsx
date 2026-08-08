import { useState } from 'react'
import { gameStore } from '@modern-mota/core'

export function Demo() {
  const [hp, setHp] = useState(1000)

  return (
    <div className="demo-panel">
      <h3>🧪 Demo Controls</h3>
      <div>
        <label>HP: </label>
        <input
          type="number"
          value={hp}
          onChange={(e) => setHp(Number(e.target.value))}
        />
        <button onClick={() => gameStore.getState().dispatch({ type: 'SET_HERO', hero: { hp } })}>
          Set HP
        </button>
      </div>
      <div>
        <button onClick={() => gameStore.getState().dispatch({ type: 'SET_HERO', hero: { money: 9999 } })}>
          💰 +9999 Gold
        </button>
      </div>
      <div>
        <button onClick={() => gameStore.getState().dispatch({ type: 'RESET' })}>
          🔄 Reset Game
        </button>
      </div>
    </div>
  )
}

import { useEffect, useRef } from 'react'
import { createGame } from '@modern-mota/render'

interface Props {
  onBackToMenu: () => void
}

export function GameCanvas({ onBackToMenu }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<ReturnType<typeof createGame> | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const game = createGame(containerRef.current)
    gameRef.current = game

    return () => {
      game.destroy(true)
    }
  }, [])

  return (
    <div className="game-screen">
      <div className="game-container" ref={containerRef} />
      <div className="game-hud-top">
        <button className="back-btn" aria-label="返回主菜单" onClick={onBackToMenu}>
          ←
        </button>
      </div>
    </div>
  )
}

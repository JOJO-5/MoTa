import { useEffect, useRef } from 'react'
import type React from 'react'
import { createGame } from '@modern-mota/render'
import type { Direction } from '@modern-mota/core'

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

  const moveFromTouch = (direction: Direction) => {
    const scene = (window as unknown as { __gameScene?: { tryMove?: (direction: Direction) => void } }).__gameScene
    scene?.tryMove?.(direction)
  }

  const actionFromTouch = () => {
    const scene = (window as unknown as { __gameScene?: { tryAction?: () => void } }).__gameScene
    scene?.tryAction?.()
  }

  const preventTouchScroll = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <div className="game-screen">
      <div className="game-container" ref={containerRef} />
      <div className="mobile-controls" aria-label="手机操作">
        <div className="mobile-dpad" aria-label="方向控制">
          <button aria-label="向上移动" onPointerDown={(event) => { preventTouchScroll(event); moveFromTouch('up') }}>▲</button>
          <button aria-label="向左移动" onPointerDown={(event) => { preventTouchScroll(event); moveFromTouch('left') }}>◀</button>
          <button aria-label="向下移动" onPointerDown={(event) => { preventTouchScroll(event); moveFromTouch('down') }}>▼</button>
          <button aria-label="向右移动" onPointerDown={(event) => { preventTouchScroll(event); moveFromTouch('right') }}>▶</button>
        </div>
        <button className="mobile-action" aria-label="确认或继续" onPointerDown={(event) => { preventTouchScroll(event); actionFromTouch() }}>A</button>
      </div>
      <div className="game-hud-top">
        <button className="back-btn" aria-label="返回主菜单" onClick={onBackToMenu}>
          ←
        </button>
      </div>
    </div>
  )
}

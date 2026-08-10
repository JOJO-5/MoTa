import { useEffect, useRef, useState } from 'react'
import type React from 'react'
import { createGame, saveGame } from '@modern-mota/render'
import { gameStore, type Direction } from '@modern-mota/core'
import { useGameState } from './useGameState'

interface Props {
  onBackToMenu: () => void
  onRestart: () => void
}

export function GameCanvas({ onBackToMenu, onRestart }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<ReturnType<typeof createGame> | null>(null)
  const [saveNotice, setSaveNotice] = useState<string | null>(null)
  const gameState = useGameState()

  useEffect(() => {
    if (!containerRef.current) return

    const game = createGame(containerRef.current)
    gameRef.current = game

    return () => {
      game.destroy(true)
    }
  }, [])

  const moveFromTouch = (direction: Direction) => {
    const scene = (
      window as unknown as { __gameScene?: { tryMove?: (direction: Direction) => void } }
    ).__gameScene
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

  const saveCurrentGame = () => {
    const saved = saveGame(0, gameStore.getState().state)
    setSaveNotice(saved ? '已保存' : '保存失败')
  }

  return (
    <div className="game-screen">
      <div className="game-container" ref={containerRef} />
      <div className="mobile-controls" aria-label="手机操作">
        <div className="mobile-dpad" aria-label="方向控制">
          <button
            aria-label="向上移动"
            onPointerDown={(event) => {
              preventTouchScroll(event)
              moveFromTouch('up')
            }}
          >
            ▲
          </button>
          <button
            aria-label="向左移动"
            onPointerDown={(event) => {
              preventTouchScroll(event)
              moveFromTouch('left')
            }}
          >
            ◀
          </button>
          <button
            aria-label="向下移动"
            onPointerDown={(event) => {
              preventTouchScroll(event)
              moveFromTouch('down')
            }}
          >
            ▼
          </button>
          <button
            aria-label="向右移动"
            onPointerDown={(event) => {
              preventTouchScroll(event)
              moveFromTouch('right')
            }}
          >
            ▶
          </button>
        </div>
        <button
          className="mobile-action"
          aria-label="确认或继续"
          onPointerDown={(event) => {
            preventTouchScroll(event)
            actionFromTouch()
          }}
        >
          A
        </button>
      </div>
      <div className="game-hud-top">
        <button className="back-btn" aria-label="返回主菜单" onClick={onBackToMenu}>
          ←
        </button>
        <button className="save-btn" aria-label="保存游戏" onClick={saveCurrentGame}>
          保存
        </button>
        {saveNotice && <span className="save-notice">{saveNotice}</span>}
      </div>
      {gameState.hero.hp <= 0 && (
        <div
          className="death-overlay"
          role="dialog"
          aria-labelledby="death-title"
          aria-modal="true"
        >
          <div className="death-panel">
            <p className="death-panel__eyebrow">RUN ENDED</p>
            <h2 id="death-title">挑战失败</h2>
            <p>勇者已经倒下。本次挑战已经结束，你可以立即从主塔入口重新开始。</p>
            <div className="death-panel__actions">
              <button className="death-panel__restart" onClick={onRestart}>
                重新开始
              </button>
              <button onClick={onBackToMenu}>返回主菜单</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

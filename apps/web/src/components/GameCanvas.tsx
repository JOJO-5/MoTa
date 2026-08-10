import { useEffect, useRef, useState } from 'react'
import type React from 'react'
import { canSaveGame, createGame, saveGame } from '@modern-mota/render'
import { eventMachine, gameStore, type Direction } from '@modern-mota/core'
import { useGameState } from './useGameState'

interface Props {
  onBackToMenu: () => void
  onRestart: () => void
}

export function GameCanvas({ onBackToMenu, onRestart }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<ReturnType<typeof createGame> | null>(null)
  const moveHoldRef = useRef<{
    delay: ReturnType<typeof setTimeout>
    repeat: ReturnType<typeof setInterval> | null
  } | null>(null)
  const [saveNotice, setSaveNotice] = useState<string | null>(null)
  const gameState = useGameState()

  useEffect(() => {
    if (!containerRef.current) return

    const game = createGame(containerRef.current)
    gameRef.current = game

    return () => {
      if (moveHoldRef.current) {
        clearTimeout(moveHoldRef.current.delay)
        if (moveHoldRef.current.repeat) clearInterval(moveHoldRef.current.repeat)
        moveHoldRef.current = null
      }
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

  const stopMoveHold = () => {
    const active = moveHoldRef.current
    if (!active) return
    clearTimeout(active.delay)
    if (active.repeat) clearInterval(active.repeat)
    moveHoldRef.current = null
  }

  const startMoveHold = (direction: Direction, event: React.PointerEvent<HTMLButtonElement>) => {
    preventTouchScroll(event)
    stopMoveHold()
    event.currentTarget.setPointerCapture(event.pointerId)
    moveFromTouch(direction)
    const delay = setTimeout(() => {
      moveFromTouch(direction)
      const active = moveHoldRef.current
      if (!active) return
      active.repeat = setInterval(() => moveFromTouch(direction), 90)
    }, 180)
    moveHoldRef.current = { delay, repeat: null }
  }

  const saveCurrentGame = () => {
    if (!canSaveGame(gameState, eventMachine.getState())) {
      setSaveNotice(gameState.ui.modal ? '请结束当前对话后再保存' : '当前状态无法保存，请稍后再试')
      return
    }
    const saved = saveGame(0, gameStore.getState().state)
    setSaveNotice(saved ? '已保存' : '保存失败')
  }

  const saveAllowed = canSaveGame(gameState, eventMachine.getState())
  const displayedSaveNotice = saveAllowed
    ? saveNotice
    : gameState.ui.modal
      ? '请结束当前对话后再保存'
      : '当前状态无法保存，请稍后再试'

  return (
    <div className="game-screen">
      <div className="game-container" ref={containerRef} />
      <div className="mobile-controls" aria-label="手机操作">
        <div className="mobile-dpad" aria-label="方向控制">
          <button
            aria-label="向上移动"
            onPointerDown={(event) => startMoveHold('up', event)}
            onPointerUp={stopMoveHold}
            onPointerCancel={stopMoveHold}
            onLostPointerCapture={stopMoveHold}
          >
            ▲
          </button>
          <button
            aria-label="向左移动"
            onPointerDown={(event) => startMoveHold('left', event)}
            onPointerUp={stopMoveHold}
            onPointerCancel={stopMoveHold}
            onLostPointerCapture={stopMoveHold}
          >
            ◀
          </button>
          <button
            aria-label="向下移动"
            onPointerDown={(event) => startMoveHold('down', event)}
            onPointerUp={stopMoveHold}
            onPointerCancel={stopMoveHold}
            onLostPointerCapture={stopMoveHold}
          >
            ▼
          </button>
          <button
            aria-label="向右移动"
            onPointerDown={(event) => startMoveHold('right', event)}
            onPointerUp={stopMoveHold}
            onPointerCancel={stopMoveHold}
            onLostPointerCapture={stopMoveHold}
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
        <button
          className="save-btn"
          aria-label="保存游戏"
          onClick={saveCurrentGame}
          disabled={!saveAllowed}
          title={saveAllowed ? '保存当前进度' : '请结束当前对话或战斗后再保存'}
        >
          保存
        </button>
        {displayedSaveNotice && <span className="save-notice">{displayedSaveNotice}</span>}
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

import { expect, test, type Page } from '@playwright/test'

type Direction = 'up' | 'down' | 'left' | 'right'
type Step = { direction: Direction; x: number; y: number }

async function startGame(page: Page) {
  await page.goto('/')
  await page.locator('.menu-button--primary').click()
  await expect(page.locator('canvas')).toBeVisible({ timeout: 30_000 })
  await page.waitForFunction(() =>
    Boolean((window as unknown as { __gameScene?: unknown }).__gameScene)
  )
  await page.waitForFunction(() =>
    Boolean((window as unknown as { __towerData?: unknown }).__towerData)
  )
}

async function state(page: Page) {
  return page.evaluate(() => {
    const store = (
      window as unknown as {
        __gameStore?: {
          getState: () => {
            state: {
              floorId: string
              position: { x: number; y: number }
              visitedFloors: string[]
              ui: { modal: string | null }
            }
          }
        }
      }
    ).__gameStore
    const snapshot = store?.getState().state
    return snapshot
      ? {
          floorId: snapshot.floorId,
          position: snapshot.position,
          visitedFloors: snapshot.visitedFloors,
          modal: snapshot.ui.modal,
        }
      : null
  })
}

async function routeToFloor(page: Page, targetFloorId: string): Promise<Step[]> {
  return page.evaluate((targetFloorId) => {
    const win = window as unknown as {
      __towerData: {
        main: { floorIds: string[] }
        floors: Record<
          string,
          {
            map: number[][]
            changeFloor?: Record<
              string,
              { floorId: string; loc?: [number, number]; stair?: string }
            >
          }
        >
        maps: Record<string, { id: string; cls?: string; canPass?: boolean; doorInfo?: unknown }>
      }
      __gameStore: {
        getState: () => { state: { floorId: string; position: { x: number; y: number } } }
      }
    }
    const data = win.__towerData
    const current = win.__gameStore.getState().state
    const floor = data.floors[current.floorId]
    const floorIds = data.main.floorIds
    const currentIndex = floorIds.indexOf(current.floorId)
    const stairs = Object.entries(floor.changeFloor ?? {})
      .filter(([, change]) => {
        const resolved =
          change.floorId === ':next'
            ? floorIds[currentIndex + 1]
            : change.floorId === ':before'
              ? floorIds[currentIndex - 1]
              : change.floorId
        return resolved === targetFloorId
      })
      .map(([key, change]) => ({
        point: key.split(',').map(Number) as [number, number],
        landing: change.loc,
      }))
    if (stairs.length === 0) throw new Error(`No stair from ${current.floorId} to ${targetFloorId}`)

    const blockedTerrain = new Set([
      'sWallT',
      'sWallL',
      'sWallR',
      'sWallB',
      'sWallTL',
      'sWallTR',
      'sWallBL',
      'sWallBR',
      'sWallTB',
      'sWallLR',
      'sWallBLR',
      'sWallTLR',
      'sWallTBR',
      'sWallTBL',
    ])
    const canEnter = (x: number, y: number) => {
      if (stairs.some(({ point }) => point[0] === x && point[1] === y)) return true
      const tile = floor.map[y]?.[x]
      if (tile === undefined || tile === 0) return true
      const entry = data.maps[String(tile)]
      if (entry?.canPass) return true
      if (tile >= 10000) return false
      if (entry?.doorInfo != null) return false
      if (entry?.cls === 'terrains' && blockedTerrain.has(entry.id)) return false
      return true
    }
    const directions: Array<{ direction: Direction; dx: number; dy: number }> = [
      { direction: 'up', dx: 0, dy: -1 },
      { direction: 'down', dx: 0, dy: 1 },
      { direction: 'left', dx: -1, dy: 0 },
      { direction: 'right', dx: 1, dy: 0 },
    ]
    const queue: Array<{ x: number; y: number; path: Step[] }> = [
      { x: current.position.x, y: current.position.y, path: [] },
    ]
    const seen = new Set([`${current.position.x},${current.position.y}`])
    const startsOnStair = stairs.some(
      ({ point }) => point[0] === current.position.x && point[1] === current.position.y
    )
    while (queue.length) {
      const node = queue.shift()!
      if (
        stairs.some(({ point }) => point[0] === node.x && point[1] === node.y) &&
        (!startsOnStair || node.path.length > 0)
      ) {
        return node.path
      }
      for (const step of directions) {
        const x = node.x + step.dx
        const y = node.y + step.dy
        const key = `${x},${y}`
        if (seen.has(key) || !canEnter(x, y)) continue
        seen.add(key)
        queue.push({ x, y, path: [...node.path, { direction: step.direction, x, y }] })
      }
    }
    throw new Error(
      `No route from ${current.floorId} ${current.position.x},${current.position.y} to ${targetFloorId}`
    )
  }, targetFloorId)
}

async function completeRoute(page: Page, steps: Step[], touch: boolean) {
  const keyboardKey: Record<Direction, string> = {
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight',
  }
  const buttonIndex: Record<Direction, number> = { up: 0, left: 1, down: 2, right: 3 }
  const dpad = page.locator('.mobile-dpad button')

  for (const step of steps) {
    const originFloor = (await state(page))?.floorId
    if (touch) await dpad.nth(buttonIndex[step.direction]).tap()
    else await page.keyboard.press(keyboardKey[step.direction])

    await expect
      .poll(async () => {
        const snapshot = await state(page)
        if (!snapshot) return false
        return (
          snapshot.floorId !== originFloor ||
          (snapshot.position.x === step.x && snapshot.position.y === step.y)
        )
      })
      .toBe(true)
    const current = await state(page)
    if (current?.modal) {
      if (touch) await page.locator('.mobile-action').tap()
      else await page.keyboard.press('Enter')
      await expect.poll(async () => (await state(page))?.modal).toBeNull()
    }
  }
}

test('desktop keyboard can enter MT1 and return to MT0 with one atomic landing state', async ({
  page,
}) => {
  await startGame(page)
  const toMt1 = await routeToFloor(page, 'MT1')
  expect(toMt1.length).toBeGreaterThan(0)
  await completeRoute(page, toMt1, false)
  await expect.poll(async () => (await state(page))?.floorId).toBe('MT1')
  await expect.poll(async () => (await state(page))?.position).toEqual({ x: 7, y: 13 })

  const toMt0 = await routeToFloor(page, 'MT0')
  await completeRoute(page, toMt0, false)
  await expect.poll(async () => (await state(page))?.floorId).toBe('MT0')
  await expect.poll(async () => (await state(page))?.position).toEqual({ x: 7, y: 2 })
  await expect.poll(async () => (await state(page))?.visitedFloors).toEqual(['MT0', 'MT1'])
})

test('Pixel 7 touch controls stay below the game and can enter MT1', async ({ page }) => {
  await startGame(page)
  const canvasBox = await page.locator('canvas').boundingBox()
  const controlsBox = await page.locator('.mobile-controls').boundingBox()
  expect(canvasBox).not.toBeNull()
  expect(controlsBox).not.toBeNull()
  expect(canvasBox!.y + canvasBox!.height).toBeLessThanOrEqual(controlsBox!.y)

  const toMt1 = await routeToFloor(page, 'MT1')
  await completeRoute(page, toMt1, true)
  await expect.poll(async () => (await state(page))?.floorId).toBe('MT1')
  await expect.poll(async () => (await state(page))?.position).toEqual({ x: 7, y: 13 })
})

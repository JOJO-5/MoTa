import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mkdir, writeFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { loadTowerContent } from './loader.js'

describe('loadTowerContent', () => {
  const tmpDir = join(tmpdir(), `mota-test-${Date.now()}`)

  beforeAll(async () => {
    await mkdir(join(tmpDir, 'floors'), { recursive: true })

    const data = {
      floorIds: ['MT0', 'MT1'],
      startFloorId: 'MT0',
      tilesets: [],
      animates: [],
      bgms: [],
      sounds: [],
      flags: {},
      values: {},
    }
    await writeFile(join(tmpDir, 'data.json'), JSON.stringify(data))
    await writeFile(
      join(tmpDir, 'enemys.json'),
      JSON.stringify({
        greenSlime: {
          id: 'greenSlime',
          name: '史莱姆',
          hp: 100,
          atk: 10,
          def: 10,
          money: 5,
          exp: 2,
        },
      })
    )
    await writeFile(join(tmpDir, 'maps.json'), JSON.stringify({ '0': { id: '0', name: '地板' } }))
    await writeFile(
      join(tmpDir, 'items.json'),
      JSON.stringify({ redKey: { id: 'redKey', name: '红钥匙' } })
    )
    await writeFile(join(tmpDir, 'events.json'), JSON.stringify({}))
    await writeFile(
      join(tmpDir, 'shops.json'),
      JSON.stringify([{ id: 'shop1', text: '测试商店', choices: [] }])
    )

    const map13 = Array(13)
      .fill(null)
      .map(() => Array(13).fill(0))
    await writeFile(
      join(tmpDir, 'floors', 'MT0.json'),
      JSON.stringify({
        floorId: 'MT0',
        title: '一层',
        name: '第1层',
        width: 13,
        height: 13,
        map: map13,
      })
    )
    await writeFile(
      join(tmpDir, 'floors', 'MT1.json'),
      JSON.stringify({
        floorId: 'MT1',
        title: '二层',
        name: '第2层',
        width: 13,
        height: 13,
        map: map13,
      })
    )
  })

  afterAll(async () => {
    await rm(tmpDir, { recursive: true, force: true })
  })

  it('loads all files successfully', async () => {
    const content = await loadTowerContent(tmpDir)
    expect(content.main.floorIds).toEqual(['MT0', 'MT1'])
    expect(content.main.startFloorId).toBe('MT0')
    expect(content.enemys.greenSlime.name).toBe('史莱姆')
    expect(content.floors.MT0.floorId).toBe('MT0')
    expect(content.floors.MT1.floorId).toBe('MT1')
    expect(content.shops[0].id).toBe('shop1')
  })

  it('freezes returned objects', async () => {
    const content = await loadTowerContent(tmpDir)
    expect(Object.isFrozen(content)).toBe(true)
    expect(Object.isFrozen(content.main)).toBe(true)
    expect(Object.isFrozen(content.enemys)).toBe(true)
    expect(Object.isFrozen(content.floors.MT0)).toBe(true)
  })

  it('rejects invalid floorId reference', async () => {
    const invalidData = {
      floorIds: ['NONEXISTENT'],
      startFloorId: 'NONEXISTENT',
      tilesets: [],
      animates: [],
      bgms: [],
      sounds: [],
      flags: {},
      values: {},
    }
    await writeFile(join(tmpDir, 'data.json'), JSON.stringify(invalidData))
    await expect(loadTowerContent(tmpDir)).rejects.toThrow()
  })
})

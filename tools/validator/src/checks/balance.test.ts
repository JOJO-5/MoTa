import { describe, it, expect } from 'vitest'
import { validateBalance } from './balance.js'
import { join } from 'node:path'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'

describe('validateBalance', () => {
  const tmpDir = join(process.cwd(), `balance-test-${Date.now()}`)
  beforeAll(() => mkdirSync(tmpDir, { recursive: true }))
  afterAll(() => rmSync(tmpDir, { recursive: true, force: true }))

  it('passes for valid enemies', () => {
    writeFileSync(join(tmpDir, 'enemys.json'), JSON.stringify({
      greenSlime: { id: 'greenSlime', name: '史莱姆', hp: 100, atk: 10, def: 10, money: 5, exp: 2 }
    }))
    const result = validateBalance(tmpDir)
    expect(result.passed).toBe(true)
  })

  it('fails for negative values', () => {
    writeFileSync(join(tmpDir, 'enemys.json'), JSON.stringify({
      bad: { id: 'bad', name: '坏怪', hp: 100, atk: -5, def: 10, money: 5, exp: 2 }
    }))
    const result = validateBalance(tmpDir)
    expect(result.passed).toBe(false)
    expect(result.errors.some((e: string) => e.includes('negative'))).toBe(true)
  })
})

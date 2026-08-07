import { describe, it, expect } from 'vitest'
import { EnemySchema } from './enemy.js'

describe('EnemySchema', () => {
  it('parses a valid enemy', () => {
    const enemy = {
      id: 'greenSlime',
      name: '绿色史莱姆',
      hp: 100,
      atk: 10,
      def: 10,
      money: 5,
      exp: 2,
    }
    expect(EnemySchema.parse(enemy)).toMatchObject(enemy)
  })

  it('parses enemy with special properties', () => {
    const enemy = {
      id: 'ghost',
      name: '幽灵',
      hp: 200,
      atk: 50,
      def: 30,
      money: 100,
      exp: 50,
      special: ['flying', 'poison'],
    }
    expect(EnemySchema.parse(enemy)).toMatchObject(enemy)
  })

  it('rejects unknown fields (strict)', () => {
    const enemy = {
      id: 'slime',
      name: '史莱姆',
      hp: 100,
      atk: 10,
      def: 10,
      money: 5,
      exp: 2,
      unknownField: true,
    }
    expect(() => EnemySchema.parse(enemy)).toThrow()
  })

  it('rejects negative HP', () => {
    const enemy = {
      id: 'slime',
      name: '史莱姆',
      hp: -1,
      atk: 10,
      def: 10,
      money: 5,
      exp: 2,
    }
    expect(() => EnemySchema.parse(enemy)).toThrow()
  })

  it('applies defaults for optional fields', () => {
    const enemy = {
      id: 'slime',
      name: '史莱姆',
      hp: 100,
      atk: 10,
      def: 10,
      money: 5,
      exp: 2,
    }
    const parsed = EnemySchema.parse(enemy)
    expect(parsed.special).toEqual([])
    expect(parsed.priority).toBe(0)
  })
})

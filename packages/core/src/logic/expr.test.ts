import { describe, it, expect, beforeEach } from 'vitest'
import { evaluate, getContext } from './expr.js'
import { dispatch, State, createInitialState } from '../state/store.js'

describe('expression evaluator', () => {
  beforeEach(() => {
    dispatch({ type: 'LOAD_STATE', state: createInitialState('MT0', 6, 6) })
    dispatch({ type: 'SET_HERO', hero: { hp: 100, atk: 20, def: 10, mdef: 5 } })
  })

  it('evaluates literals', () => {
    expect(evaluate('42')).toBe(42)
    expect(evaluate('3.14')).toBe(3.14)
    expect(evaluate('"hello"')).toBe('hello')
    expect(evaluate('true')).toBe(true)
    expect(evaluate('false')).toBe(false)
  })

  it('evaluates arithmetic', () => {
    expect(evaluate('2 + 3')).toBe(5)
    expect(evaluate('10 - 4')).toBe(6)
    expect(evaluate('3 * 4')).toBe(12)
    expect(evaluate('10 / 3')).toBe(3)
    expect(evaluate('10 % 3')).toBe(1)
  })

  it('evaluates comparisons', () => {
    expect(evaluate('5 > 3')).toBe(true)
    expect(evaluate('5 < 3')).toBe(false)
    expect(evaluate('5 == 5')).toBe(true)
    expect(evaluate('5 != 3')).toBe(true)
  })

  it('evaluates logical', () => {
    expect(evaluate('true && false')).toBe(false)
    expect(evaluate('true || false')).toBe(true)
    expect(evaluate('!false')).toBe(true)
  })

  it('reads hero attributes', () => {
    expect(evaluate('hp')).toBe(100)
    expect(evaluate('atk')).toBe(20)
    expect(evaluate('def')).toBe(10)
    expect(evaluate('mdef')).toBe(5)
  })

  it('reads flags and values', () => {
    dispatch({ type: 'SET_FLAG', name: 'hasYellowKey', value: true })
    expect(evaluate('hasYellowKey')).toBe(true)
    dispatch({ type: 'SET_VALUE', name: 'coins', value: 50 })
    expect(evaluate('coins')).toBe(50)
  })

  it('evaluates complex conditions', () => {
    dispatch({ type: 'SET_HERO', hero: { atk: 50 } })
    expect(evaluate('atk > 30')).toBe(true)
    expect(evaluate('hp > 50 && atk > 30')).toBe(true)
  })

  it('handles division by zero', () => {
    expect(evaluate('10 / 0')).toBe(0)
  })

  it('handles string concatenation', () => {
    expect(evaluate('"hello" + " world"')).toBe('hello world')
    expect(evaluate('"value: " + 123')).toBe('value: 123')
  })

  it('handles member expression', () => {
    expect(evaluate('hero.hp')).toBe(100)
    expect(evaluate('hero.atk')).toBe(20)
    expect(evaluate('hero.mdef')).toBe(5)
  })
})
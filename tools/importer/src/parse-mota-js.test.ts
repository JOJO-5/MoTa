import { describe, it, expect } from 'vitest'
import { extractDataObjects, extractFloorObjects } from './parse-mota-js.js'

describe('extractDataObjects', () => {
  it('extracts var declarations', () => {
    const code = `var data = {"floorIds": ["MT0"]};`
    const result = extractDataObjects(code)
    expect(result.has('data')).toBe(true)
    expect((result.get('data') as any).floorIds).toEqual(['MT0'])
  })

  it('extracts object assignments', () => {
    const code = `var data = {"hp": 1000}; data.count = 10;`
    const result = extractDataObjects(code)
    expect(result.has('data')).toBe(true)
    expect((result.get('data') as any).hp).toBe(1000)
  })

  it('handles complex nested objects', () => {
    const code = `var items = {"redKey": {"id": "redKey", "name": "红钥匙", "key": true}};`
    const result = extractDataObjects(code)
    expect(result.has('items')).toBe(true)
    expect((result.get('items') as any).redKey.name).toBe('红钥匙')
  })
})

describe('extractFloorObjects', () => {
  it('extracts main.floors object', () => {
    const code = `var main = {"floors": {"MT0": {"floorId": "MT0", "title": "一层"}}};`
    const result = extractFloorObjects(code)
    expect(result.has('MT0')).toBe(true)
    expect((result.get('MT0') as any).floorId).toBe('MT0')
  })
})

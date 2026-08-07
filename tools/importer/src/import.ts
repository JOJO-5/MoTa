import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { extractDataObjects, extractFloorObjects } from './parse-mota-js.js'

export interface ImportOptions {
  sourceDir: string
  outputDir: string
  floorIds?: string[]
}

export function importTower(options: ImportOptions): void {
  const { sourceDir, outputDir, floorIds } = options
  mkdirSync(join(outputDir, 'floors'), { recursive: true })

  const files = ['enemys.js', 'maps.js', 'items.js', 'events.js']
  for (const file of files) {
    const srcPath = join(sourceDir, file)
    if (!existsSync(srcPath)) continue
    const code = readFileSync(srcPath, 'utf-8')
    const objs = extractDataObjects(code)
    const outName = file.replace('.js', '.json')
    const value = objs.get(file.replace('.js', ''))
    if (value === undefined) continue
    writeFileSync(join(outputDir, outName), JSON.stringify(value, null, 2))
  }

  const dataSrc = join(sourceDir, 'data.js')
  if (existsSync(dataSrc)) {
    const code = readFileSync(dataSrc, 'utf-8')
    const objs = extractDataObjects(code)
    const data = objs.get('data') as Record<string, unknown> | undefined
    if (data) {
      const main = data.main as Record<string, unknown> | undefined
      if (main && Array.isArray(main.floorIds) && floorIds) {
        main.floorIds = [...floorIds]
        if (typeof main.startFloorId !== 'string' && floorIds.length > 0) {
          main.startFloorId = floorIds[0]
        }
      }
      writeFileSync(join(outputDir, 'data.json'), JSON.stringify(data, null, 2))
    }
  }

  const floorsDir = join(sourceDir, 'floors')
  if (existsSync(floorsDir)) {
    const allFloorFiles = readdirSync(floorsDir).filter(f => f.endsWith('.js'))
    const targetFloors = floorIds
      ? allFloorFiles.filter(f => {
          const name = f.replace('.js', '')
          return floorIds.includes(name)
        })
      : allFloorFiles

    for (const floorFile of targetFloors) {
      const code = readFileSync(join(floorsDir, floorFile), 'utf-8')
      const objs = extractFloorObjects(code)
      for (const [floorId, floorData] of objs) {
        writeFileSync(
          join(outputDir, 'floors', `${floorId}.json`),
          JSON.stringify(floorData, null, 2)
        )
      }
    }
  }
}

export function generateMeta(outputDir: string, sourceName: string): void {
  const meta = {
    id: sourceName.toLowerCase().replace(/\s+/g, '-'),
    version: '1.0.0',
    source: sourceName,
    importedAt: new Date().toISOString(),
  }
  writeFileSync(join(outputDir, '_meta.json'), JSON.stringify(meta, null, 2))
}

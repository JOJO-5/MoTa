import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { extractDataObjects, extractFloorObjects } from './parse-mota-js.js'

export interface ImportOptions {
  sourceDir: string
  outputDir: string
  floorIds?: string[]
}

function toCurrentMain(
  legacyData: Record<string, unknown>,
  floorIds?: string[]
): Record<string, unknown> | undefined {
  const legacyMain = legacyData.main as Record<string, unknown> | undefined
  if (!legacyMain || !Array.isArray(legacyMain.floorIds)) return undefined

  const ids = floorIds ? [...floorIds] : ([...legacyMain.floorIds] as string[])
  const firstData = legacyData.firstData as Record<string, unknown> | undefined
  const startFloorId = typeof firstData?.floorId === 'string' ? firstData.floorId : ids[0]

  return {
    floorIds: ids,
    startFloorId,
    tilesets: Array.isArray(legacyMain.tilesets) ? legacyMain.tilesets : [],
    animates: Array.isArray(legacyMain.animates) ? legacyMain.animates : [],
    bgms: Array.isArray(legacyMain.bgms) ? legacyMain.bgms : [],
    sounds: Array.isArray(legacyMain.sounds) ? legacyMain.sounds : [],
    portraits: [],
  }
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
      const main = toCurrentMain(data, floorIds)
      if (main) writeFileSync(join(outputDir, 'data.json'), JSON.stringify(main, null, 2))
    }
  }

  const floorsDir = join(sourceDir, 'floors')
  if (existsSync(floorsDir)) {
    const allFloorFiles = readdirSync(floorsDir).filter((f) => f.endsWith('.js'))
    const targetFloors = floorIds
      ? allFloorFiles.filter((f) => {
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

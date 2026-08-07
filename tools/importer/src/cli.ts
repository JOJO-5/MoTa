#!/usr/bin/env node
import { parseArgs } from 'node:util'
import { importTower, generateMeta } from './import.js'

const { values } = parseArgs({
  options: {
    'source': { type: 'string', short: 's' },
    'output': { type: 'string', short: 'o' },
    'name': { type: 'string', short: 'n', default: 'mota-tower' },
    'floors': { type: 'string', short: 'f' },
  },
})

const sourceDir = values.source
const outputDir = values.output

if (!sourceDir || !outputDir) {
  console.error('Usage: mota-import --source <dir> --output <dir> [--name <name>] [--floors MT0,MT1,...]')
  process.exit(1)
}

const floorIds = values.floors ? values.floors.split(',') : undefined

console.log(`Importing from ${sourceDir} to ${outputDir}...`)
importTower({ sourceDir, outputDir, floorIds })
generateMeta(outputDir, values.name ?? 'mota-tower')
console.log('Done!')

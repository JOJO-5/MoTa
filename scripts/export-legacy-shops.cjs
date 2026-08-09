const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

const [sourcePath, ...outputPaths] = process.argv.slice(2)
if (!sourcePath || outputPaths.length === 0) {
  throw new Error('Usage: node export-legacy-shops.cjs <data.js> <shops.json> [...]')
}

const context = {}
vm.createContext(context)
vm.runInContext(fs.readFileSync(sourcePath, 'utf8'), context)
const sourceData = Object.values(context)[0]
const shops = sourceData?.firstData?.shops
if (!Array.isArray(shops) || shops.length === 0) {
  throw new Error('No firstData.shops found in source data.js')
}

const json = `${JSON.stringify(shops, null, 2)}\n`
for (const outputPath of outputPaths) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, json, 'utf8')
}

console.log(`Exported ${shops.length} shops to ${outputPaths.length} location(s)`)

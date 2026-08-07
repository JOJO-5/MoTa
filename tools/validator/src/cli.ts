#!/usr/bin/env node
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { validateSchema } from './checks/schema.js'
import { validateReferences } from './checks/references.js'
import { validateBalance } from './checks/balance.js'

function exists(path: string): boolean {
  try { require('node:fs').accessSync(path); return true } catch { return false }
}

function main() {
  const args = process.argv.slice(2)
  let towerId = 'mota-2014'
  let dir = join(process.cwd(), 'content', towerId)

  if (args[0]) {
    if (exists(join(process.cwd(), 'content', args[0]))) {
      towerId = args[0]
      dir = join(process.cwd(), 'content', args[0])
    } else if (exists(args[0])) {
      dir = args[0]
      towerId = args[0].split('/').pop() ?? args[0]
    }
  }

  if (!existsSync(dir)) {
    console.error(`Error: Tower directory not found: ${dir}`)
    process.exit(1)
  }

  console.log(`\nValidating tower: ${towerId}\n`)

  let allPassed = true
  let allWarnings: string[] = []

  const schema = validateSchema(dir)
  if (schema.passed) {
    console.log('✓ Schema: all files valid')
  } else {
    console.log('✗ Schema errors:')
    for (const e of schema.errors.slice(0, 10)) console.log(`  ${e}`)
    allPassed = false
  }

  const refs = validateReferences(dir)
  if (refs.passed) {
    console.log('✓ References: all resolve')
  } else {
    console.log('✗ Reference errors:')
    for (const e of refs.errors.slice(0, 10)) console.log(`  ${e}`)
    allPassed = false
  }
  allWarnings.push(...refs.warnings)

  const balance = validateBalance(dir)
  if (balance.passed) {
    console.log('✓ Balance: enemies within range')
  } else {
    console.log('✗ Balance errors:')
    for (const e of balance.errors.slice(0, 10)) console.log(`  ${e}`)
    allPassed = false
  }
  allWarnings.push(...balance.warnings)

  if (allWarnings.length > 0) {
    console.log(`\n⚠ ${allWarnings.length} warnings (ignored):`)
    for (const w of allWarnings.slice(0, 5)) console.log(`  ${w}`)
  }

  console.log(`\n${allPassed ? '✓ ALL CHECKS PASSED' : '✗ VALIDATION FAILED'}`)
  process.exit(allPassed ? 0 : 1)
}

main()

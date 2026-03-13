#!/usr/bin/env node

import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { buildFieldSchema } from './template-meta-utils.mjs'

async function walkFiles(directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true })
  const collected = []

  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name)
    if (entry.isDirectory()) {
      const nested = await walkFiles(fullPath)
      collected.push(...nested)
      continue
    }

    collected.push(fullPath)
  }

  return collected
}

async function fileExists(filePath) {
  try {
    await stat(filePath)
    return true
  } catch {
    return false
  }
}

async function run() {
  const root = process.cwd()
  const shouldRewrite = process.argv.includes('--rewrite')
  const servicesRoot = path.join(root, 'src', 'templates', 'services')
  const allFiles = await walkFiles(servicesRoot)
  const composeFiles = allFiles.filter((filePath) => /\.compose\.ya?ml$/.test(filePath))
  let generatedCount = 0
  let rewrittenCount = 0

  for (const composePath of composeFiles) {
    const metaPath = composePath.replace(/\.compose\.ya?ml$/, '.meta.json')
    const metaExists = await fileExists(metaPath)
    if (metaExists && !shouldRewrite) {
      continue
    }

    const composeContent = await readFile(composePath, 'utf8')
    const payload = {
      fields: buildFieldSchema(composeContent),
    }

    await mkdir(path.dirname(metaPath), { recursive: true })
    await writeFile(metaPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
    if (metaExists) {
      rewrittenCount += 1
    } else {
      generatedCount += 1
    }
  }

  process.stdout.write(
    `Template meta sync complete. Generated ${generatedCount} file(s), rewritten ${rewrittenCount} file(s).\n`,
  )
}

run().catch((error) => {
  process.stderr.write(`Meta sync failed: ${error instanceof Error ? error.message : String(error)}\n`)
  process.exit(1)
})

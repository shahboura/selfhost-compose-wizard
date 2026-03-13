#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const CATEGORY_MAP = [
  { key: 'performance', title: 'Performance' },
  { key: 'accessibility', title: 'Accessibility' },
  { key: 'best-practices', title: 'Best Practices' },
]

function scoreToColor(score) {
  if (score >= 0.9) {
    return 'brightgreen'
  }
  if (score >= 0.75) {
    return 'yellow'
  }
  return 'red'
}

async function locateLighthouseManifest(rootDir) {
  const possiblePaths = [
    path.join(rootDir, '.lighthouseci', 'manifest.json'),
    path.join(rootDir, '.lighthouseci', 'report-history.json'),
  ]

  for (const candidate of possiblePaths) {
    try {
      await readFile(candidate, 'utf8')
      return candidate
    } catch {
      continue
    }
  }

  throw new Error('Could not find Lighthouse manifest in .lighthouseci/')
}

function findLatestLhrPathFromManifest(manifest, rootDir) {
  if (Array.isArray(manifest) && manifest.length > 0) {
    const latest = manifest.at(-1)
    if (latest && typeof latest === 'object' && 'jsonPath' in latest) {
      const value = latest.jsonPath
      if (typeof value === 'string') {
        return path.resolve(rootDir, value)
      }
    }
  }

  if (manifest && typeof manifest === 'object' && 'items' in manifest) {
    const items = manifest.items
    if (Array.isArray(items) && items.length > 0) {
      const latest = items.at(-1)
      if (latest && typeof latest === 'object' && 'jsonPath' in latest) {
        const value = latest.jsonPath
        if (typeof value === 'string') {
          return path.resolve(rootDir, value)
        }
      }
    }
  }

  throw new Error('Unable to resolve Lighthouse JSON report path from manifest')
}

async function writeBadge(outputDirectory, categoryKey, categoryTitle, score) {
  const rounded = Math.round(score * 100)
  const badge = {
    schemaVersion: 1,
    label: `lighthouse ${categoryTitle.toLowerCase()}`,
    message: `${rounded}`,
    color: scoreToColor(score),
  }

  const outputPath = path.join(outputDirectory, `lighthouse-${categoryKey}.json`)
  await writeFile(outputPath, `${JSON.stringify(badge, null, 2)}\n`, 'utf8')
}

async function run() {
  const rootDir = process.cwd()
  const manifestPath = await locateLighthouseManifest(rootDir)
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  const lhrPath = findLatestLhrPathFromManifest(manifest, rootDir)
  const lhr = JSON.parse(await readFile(lhrPath, 'utf8'))

  const outputDirectory = path.join(rootDir, '.badge-data')
  await mkdir(outputDirectory, { recursive: true })

  for (const category of CATEGORY_MAP) {
    const categoryScore = lhr?.categories?.[category.key]?.score
    if (typeof categoryScore !== 'number') {
      throw new Error(`Missing Lighthouse category score: ${category.key}`)
    }
    await writeBadge(outputDirectory, category.key, category.title, categoryScore)
  }

  process.stdout.write('Lighthouse badge endpoint JSON generated in .badge-data/\n')
}

run().catch((error) => {
  process.stderr.write(`Badge generation failed: ${error instanceof Error ? error.message : String(error)}\n`)
  process.exit(1)
})

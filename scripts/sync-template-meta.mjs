#!/usr/bin/env node

import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

const PLACEHOLDER_REGEX = /\$\{([A-Za-z_][A-Za-z0-9_]*)(?:(:-|-)([^}]*))?\}/g
const FIELD_TYPES = ['text', 'secret', 'url', 'number', 'timezone', 'path']

function inferFieldType(key) {
  if (key === 'TZ') {
    return 'timezone'
  }

  if (/(PASSWORD|SECRET|TOKEN|API_KEY|PRIVATE_KEY|CLIENT_SECRET)$/i.test(key)) {
    return 'secret'
  }

  if (/(^|_)URL$/i.test(key)) {
    return 'url'
  }

  if (/(^|_)PORT$/i.test(key)) {
    return 'number'
  }

  if (/(^|_)(DIR|PATH|LOCATION)$/i.test(key)) {
    return 'path'
  }

  return 'text'
}

function buildFieldDescription(key, fieldType) {
  if (fieldType === 'secret') {
    return `${key} secret value.`
  }

  if (fieldType === 'timezone') {
    return 'Timezone in TZ database format.'
  }

  if (fieldType === 'url') {
    return `${key} URL.`
  }

  if (fieldType === 'number') {
    return `${key} numeric value.`
  }

  if (fieldType === 'path') {
    return `${key} filesystem path.`
  }

  return 'Environment variable used by this compose template.'
}

function extractComposeVariables(templateContent) {
  const references = new Map()

  for (const match of templateContent.matchAll(PLACEHOLDER_REGEX)) {
    const key = match[1]
    if (!key) {
      continue
    }

    const operator = match[2]
    const fallback = match[3]
    const composeDefault = operator === ':-' || operator === '-' ? fallback : undefined
    const existing = references.get(key)

    if (existing) {
      if (!existing.composeDefault && composeDefault) {
        existing.composeDefault = composeDefault
      }
      existing.occurrences += 1
      continue
    }

    references.set(key, {
      key,
      composeDefault,
      occurrences: 1,
    })
  }

  return [...references.values()].sort((left, right) => left.key.localeCompare(right.key))
}

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

function expectedServiceId(service, variant) {
  return variant === 'base' ? service : `${service}-${variant}`
}

function toDisplayName(service, variant) {
  const base = service
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
  return variant === 'base' ? base : `${base} (${variant})`
}

async function fileExists(filePath) {
  try {
    await stat(filePath)
    return true
  } catch {
    return false
  }
}

function buildFieldMeta(composeContent) {
  const variables = extractComposeVariables(composeContent)
  const fields = {}

  for (const variable of variables) {
    const inferredType = inferFieldType(variable.key)
    const type = FIELD_TYPES.includes(inferredType) ? inferredType : 'text'
    fields[variable.key] = {
      type,
      required: variable.composeDefault ? false : true,
      sensitive: type === 'secret',
      description: buildFieldDescription(variable.key, type),
      recommendedDefault: variable.composeDefault ?? '',
    }
  }

  return fields
}

async function run() {
  const root = process.cwd()
  const servicesRoot = path.join(root, 'src', 'templates', 'services')
  const allFiles = await walkFiles(servicesRoot)
  const composeFiles = allFiles.filter((filePath) => /\.compose\.ya?ml$/.test(filePath))
  let generatedCount = 0

  for (const composePath of composeFiles) {
    const metaPath = composePath.replace(/\.compose\.ya?ml$/, '.meta.json')
    if (await fileExists(metaPath)) {
      continue
    }

    const service = path.basename(path.dirname(composePath))
    const variant = path.basename(composePath).replace(/\.compose\.ya?ml$/, '')
    const composeContent = await readFile(composePath, 'utf8')

    const payload = {
      id: expectedServiceId(service, variant),
      service,
      variant,
      name: toDisplayName(service, variant),
      category: 'utilities',
      description: 'Scaffolded metadata. Review and customize.',
      tags: [service],
      docs: null,
      riskWarnings: [],
      references: [],
      fields: buildFieldMeta(composeContent),
    }

    await mkdir(path.dirname(metaPath), { recursive: true })
    await writeFile(metaPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
    generatedCount += 1
  }

  process.stdout.write(`Template meta sync complete. Generated ${generatedCount} file(s).\n`)
}

run().catch((error) => {
  process.stderr.write(`Meta sync failed: ${error instanceof Error ? error.message : String(error)}\n`)
  process.exit(1)
})

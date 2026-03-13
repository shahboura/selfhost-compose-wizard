#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { ALLOWED_FIELD_TYPES, extractComposeVariables } from './template-meta-utils.mjs'
import { SERVICE_CATALOG } from '../src/data/service-catalog.ts'

async function walkFiles(dirPath) {
  const entries = await readdir(dirPath, { withFileTypes: true })
  const collected = []

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)
    if (entry.isDirectory()) {
      const nested = await walkFiles(fullPath)
      collected.push(...nested)
      continue
    }

    collected.push(fullPath)
  }

  return collected
}

async function validateComposeTemplate(composePath) {
  const failures = []
  const composeContent = await readFile(composePath, 'utf8')
  const composeVariables = extractComposeVariables(composeContent).map((entry) => entry.key)
  const metaPath = composePath.replace(/\.compose\.ya?ml$/, '.meta.json')

  let meta
  try {
    meta = JSON.parse(await readFile(metaPath, 'utf8'))
  } catch (error) {
    failures.push({
      path: composePath,
      reason: `Missing or invalid meta file: ${metaPath}`,
      detail: error instanceof Error ? error.message : String(error),
    })
    return failures
  }

  const fields = typeof meta.fields === 'object' && meta.fields !== null ? meta.fields : {}
  if (Object.keys(fields).length === 0) {
    failures.push({
      path: metaPath,
      reason: 'Missing fields object',
      detail: 'Expected non-empty "fields" metadata map',
    })
  }
  const metaKeys = Object.keys(fields).sort()

  const missingInMeta = composeVariables.filter((key) => !metaKeys.includes(key))
  const staleInMeta = metaKeys.filter((key) => !composeVariables.includes(key))

  for (const key of missingInMeta) {
    failures.push({
      path: metaPath,
      reason: 'Missing field metadata',
      detail: key,
    })
  }

  for (const key of staleInMeta) {
    failures.push({
      path: metaPath,
      reason: 'Field metadata not found in compose template',
      detail: key,
    })
  }

  for (const key of metaKeys) {
    const field = fields[key]
    if (!field || typeof field !== 'object') {
      failures.push({
        path: metaPath,
        reason: 'Invalid field metadata object',
        detail: key,
      })
      continue
    }

    if (!ALLOWED_FIELD_TYPES.has(field.type)) {
      failures.push({
        path: metaPath,
        reason: 'Unsupported field type',
        detail: `${key}: ${String(field.type)}`,
      })
    }

    if (typeof field.required !== 'boolean') {
      failures.push({
        path: metaPath,
        reason: 'Invalid required flag',
        detail: key,
      })
    }

    if (typeof field.sensitive !== 'boolean') {
      failures.push({
        path: metaPath,
        reason: 'Invalid sensitive flag',
        detail: key,
      })
    }

    if (typeof field.recommendedDefault !== 'string') {
      failures.push({
        path: metaPath,
        reason: 'Invalid recommendedDefault type',
        detail: key,
      })
    }

    if (typeof field.description !== 'string' || field.description.trim().length === 0) {
      failures.push({
        path: metaPath,
        reason: 'Missing field description',
        detail: key,
      })
    }
  }

  return failures
}

async function run() {
  const rootDir = process.cwd()
  const servicesRoot = path.join(rootDir, 'src', 'templates', 'services')
  const files = await walkFiles(servicesRoot)
  const composeFiles = files.filter((filePath) => /\.compose\.ya?ml$/.test(filePath))
  const metaFiles = files.filter((filePath) => /\.meta\.json$/.test(filePath))
  const expectedMetaFiles = new Set(composeFiles.map((composePath) => composePath.replace(/\.compose\.ya?ml$/, '.meta.json')))
  const templateFilesFromCompose = new Set(
    composeFiles.map(
      (composePath) =>
        `services/${composePath.replace(`${servicesRoot}${path.sep}`, '').replace(/\\/g, '/')}`,
    ),
  )
  const templateFilesFromCatalog = new Set(SERVICE_CATALOG.map((service) => service.templateFile))
  const failures = []

  for (const composePath of composeFiles) {
    const templateFailures = await validateComposeTemplate(composePath)
    failures.push(...templateFailures)
  }

  for (const metaPath of metaFiles) {
    if (!expectedMetaFiles.has(metaPath)) {
      failures.push({
        path: metaPath,
        reason: 'Meta file has no matching compose template',
        detail: 'No corresponding *.compose.yaml|yml file found',
      })
    }
  }

  for (const templateFile of templateFilesFromCatalog) {
    if (!templateFilesFromCompose.has(templateFile)) {
      failures.push({
        path: 'src/data/service-catalog.ts',
        reason: 'Catalog template missing compose file',
        detail: templateFile,
      })
    }
  }

  for (const templateFile of templateFilesFromCompose) {
    if (!templateFilesFromCatalog.has(templateFile)) {
      failures.push({
        path: 'src/data/service-catalog.ts',
        reason: 'Compose template missing service catalog entry',
        detail: templateFile,
      })
    }
  }

  if (failures.length > 0) {
    process.stderr.write(`Template validation failed (${failures.length} issue(s)).\n`)
    for (const failure of failures) {
      process.stderr.write(`- ${failure.path}\n  ${failure.reason}: ${failure.detail}\n`)
    }
    process.exit(1)
  }

  process.stdout.write(`Template validation passed (${composeFiles.length} template(s) checked).\n`)
}

run().catch((error) => {
  process.stderr.write(`Template validation crashed: ${error instanceof Error ? error.message : String(error)}\n`)
  process.exit(1)
})

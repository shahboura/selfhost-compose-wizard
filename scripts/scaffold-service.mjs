#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ALLOWED_CATEGORIES = new Set(['media', 'observability', 'utilities'])
const ALLOWED_FIELD_TYPES = new Set(['text', 'secret', 'url', 'number', 'timezone', 'path'])
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const PLACEHOLDER_REGEX = /\$\{([A-Za-z_][A-Za-z0-9_]*)(?:(:-|-)([^}]*))?\}/g

function toTsStringLiteral(value) {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

function parseArgs(argv) {
  const args = {
    service: '',
    variant: 'base',
    name: '',
    category: 'utilities',
    description: '',
    docs: '',
    risk: [],
    tag: [],
    fromCompose: '',
  }

  for (let index = 2; index < argv.length; index += 1) {
    const current = argv[index]
    if (!current.startsWith('--')) {
      continue
    }

    const key = current.slice(2)
    const value = argv[index + 1]
    if (!value || value.startsWith('--')) {
      continue
    }

    if (key === 'risk') {
      args.risk.push(value)
      index += 1
      continue
    }

    if (key === 'tag') {
      args.tag.push(value)
      index += 1
      continue
    }

    if (key in args) {
      args[key] = value
      index += 1
    }
  }

  return args
}

function ensureRequired(args) {
  const requiredKeys = ['service', 'name', 'description']
  const missing = requiredKeys.filter((key) => !args[key])
  if (missing.length > 0) {
    throw new Error(`Missing required arguments: ${missing.join(', ')}`)
  }

  if (!SLUG_REGEX.test(args.service)) {
    throw new Error('Invalid --service slug. Use lowercase letters, numbers, and hyphens only.')
  }

  if (!SLUG_REGEX.test(args.variant)) {
    throw new Error('Invalid --variant slug. Use lowercase letters, numbers, and hyphens only.')
  }

  if (!ALLOWED_CATEGORIES.has(args.category)) {
    throw new Error(`Invalid --category. Allowed values: ${[...ALLOWED_CATEGORIES].join(', ')}`)
  }
}

function toServiceId(service, variant) {
  return variant === 'base' ? service : `${service}-${variant}`
}

function composeTemplatePath(service, variant) {
  return `services/${service}/${variant}.compose.yaml`
}

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

function buildFieldMeta(templateContent) {
  const vars = extractComposeVariables(templateContent)
  const fieldMeta = {}

  for (const variable of vars) {
    const fieldType = inferFieldType(variable.key)
    fieldMeta[variable.key] = {
      type: ALLOWED_FIELD_TYPES.has(fieldType) ? fieldType : 'text',
      required: variable.composeDefault ? false : true,
      sensitive: fieldType === 'secret',
      description: buildFieldDescription(variable.key, fieldType),
      recommendedDefault: variable.composeDefault ?? '',
    }
  }

  return fieldMeta
}

async function scaffoldTemplateFile(rootDir, args) {
  const folder = path.join(rootDir, 'src', 'templates', 'services', args.service)
  const filePath = path.join(folder, `${args.variant}.compose.yaml`)
  await mkdir(folder, { recursive: true })

  if (args.fromCompose) {
    const importedContent = await readFile(path.resolve(rootDir, args.fromCompose), 'utf8')
    await writeFile(filePath, importedContent, 'utf8')
    return importedContent
  }

  const starter = [
    'services:',
    `  ${args.service}:`,
    `    image: ${args.service}:latest`,
    '    restart: unless-stopped',
    '    environment:',
    '      TZ: ${TZ:-Etc/UTC}',
    '',
  ].join('\n')

  await writeFile(filePath, starter, 'utf8')
  return starter
}

async function writeMetaFile(rootDir, args, templateContent) {
  const folder = path.join(rootDir, 'src', 'templates', 'services', args.service)
  const filePath = path.join(folder, `${args.variant}.meta.json`)
  const id = toServiceId(args.service, args.variant)
  const tags = args.tag.length > 0 ? args.tag : [args.service]
  const fieldMeta = buildFieldMeta(templateContent)

  const payload = {
    id,
    service: args.service,
    variant: args.variant,
    name: args.name,
    category: args.category,
    description: args.description,
    tags,
    docs: args.docs || null,
    riskWarnings: args.risk,
    references: args.docs
      ? [
          {
            title: `${args.name} documentation`,
            url: args.docs,
          },
        ]
      : [],
    fields: fieldMeta,
  }

  await writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
}

async function updateRegistry(rootDir, service, variant) {
  const registryPath = path.join(rootDir, 'src', 'templates', 'registry.ts')
  const fileContent = await readFile(registryPath, 'utf8')

  const importName = `${toSafeIdentifier(service)}${capitalize(toSafeIdentifier(variant))}`
  const importToken = `import ${importName} from './services/${service}/${variant}.compose.yaml?raw'`
  const mappingToken = `  'services/${service}/${variant}.compose.yaml': ${importName},`

  if (fileContent.includes(importToken)) {
    return
  }

  const lines = fileContent.split('\n')
  const lastImportIndex = lines
    .map((line, index) => ({ line, index }))
    .filter((entry) => entry.line.startsWith('import '))
    .at(-1)?.index

  if (lastImportIndex === undefined) {
    throw new Error('Could not locate import section in registry.ts')
  }

  lines.splice(lastImportIndex + 1, 0, importToken)
  const updatedImports = lines.join('\n')
  const updatedMappings = updatedImports.replace(
    /\} as const satisfies Record<string, string>/,
    `${mappingToken}\n} as const satisfies Record<string, string>`,
  )

  await writeFile(registryPath, updatedMappings, 'utf8')
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function toSafeIdentifier(value) {
  return value.replace(/[^A-Za-z0-9]/g, '_')
}

async function updateCatalog(rootDir, args) {
  const catalogPath = path.join(rootDir, 'src', 'data', 'service-catalog.ts')
  const fileContent = await readFile(catalogPath, 'utf8')
  const id = toServiceId(args.service, args.variant)
  const templatePath = composeTemplatePath(args.service, args.variant)
  const tags = args.tag.length > 0 ? args.tag : [args.service]
  const docsReference = args.docs
    ? `\n    researchReferences: [\n      {\n        title: ${toTsStringLiteral(`${args.name} documentation`)},\n        url: ${toTsStringLiteral(args.docs)},\n      },\n    ],\n`
    : '\n    researchReferences: [],\n'

  if (fileContent.includes(`id: '${id}'`)) {
    return
  }

  const riskWarningsBlock =
    args.risk.length > 0
      ? `\n    riskWarnings: [\n${args.risk.map((item) => `      ${toTsStringLiteral(item)},`).join('\n')}\n    ],`
      : ''

  const entry = `  {\n    id: ${toTsStringLiteral(id)},\n    name: ${toTsStringLiteral(args.name)},\n    templateFile: ${toTsStringLiteral(templatePath)},\n    templateKey: ${toTsStringLiteral(templatePath)},\n    category: ${toTsStringLiteral(args.category)},\n    description: ${toTsStringLiteral(args.description)},\n    tags: [${tags.map((tag) => toTsStringLiteral(tag)).join(', ')}],${riskWarningsBlock}\n    fieldOverrides: {},\n    extraTooling: [],${docsReference}  },\n`

  const updated = fileContent.replace(/\]\s*$/, `${entry}]`)
  await writeFile(catalogPath, updated, 'utf8')
}

async function updateReadmeServiceTable(rootDir, args) {
  const readmePath = path.join(rootDir, 'README.md')
  const fileContent = await readFile(readmePath, 'utf8')
  const tableAnchor = '| Service | Category | Variant |'

  if (!fileContent.includes(tableAnchor)) {
    return
  }

  const row = `| ${args.name} | ${args.category} | ${args.variant} |`
  if (fileContent.includes(row)) {
    return
  }

  const lines = fileContent.split('\n')
  const insertAt = lines.findIndex((line, index) => index > 0 && line.startsWith('## ') && lines[index - 1] === '')

  const tableStart = lines.findIndex((line) => line.trim() === tableAnchor)
  if (tableStart < 0) {
    return
  }

  let tableEnd = tableStart + 2
  while (tableEnd < lines.length && lines[tableEnd].startsWith('|')) {
    tableEnd += 1
  }

  lines.splice(tableEnd, 0, row)
  await writeFile(readmePath, `${lines.join('\n')}\n`, 'utf8')
}

async function run() {
  const args = parseArgs(process.argv)
  ensureRequired(args)

  const rootDir = process.cwd()
  const templateContent = await scaffoldTemplateFile(rootDir, args)
  await writeMetaFile(rootDir, args, templateContent)
  await updateRegistry(rootDir, args.service, args.variant)
  await updateCatalog(rootDir, args)
  await updateReadmeServiceTable(rootDir, args)

  process.stdout.write('Service scaffolded successfully.\n')
}

run().catch((error) => {
  process.stderr.write(`${String(error.message)}\n`)
  process.exit(1)
})

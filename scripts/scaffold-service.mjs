#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { buildFieldSchema } from './template-meta-utils.mjs'

const ALLOWED_CATEGORIES = new Set(['media', 'observability', 'utilities'])
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

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
      throw new Error(`Unexpected argument: ${current}`)
    }

    const key = current.slice(2)
    const value = argv[index + 1]
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for --${key}`)
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
      continue
    }

    throw new Error(`Unknown argument: --${key}`)
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
  const fieldMeta = buildFieldSchema(templateContent)

  const payload = {
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

  const updatedImports = fileContent.replace('// @scaffold-imports', `${importToken}\n// @scaffold-imports`)
  const updatedMappings = updatedImports.replace('// @scaffold-mappings', `${mappingToken}\n  // @scaffold-mappings`)

  if (updatedMappings === fileContent) {
    throw new Error('Unable to update template registry mappings. Please update src/templates/registry.ts manually.')
  }

  await writeFile(registryPath, updatedMappings, 'utf8')
}

async function updateMetaRegistry(rootDir, service, variant) {
  const registryPath = path.join(rootDir, 'src', 'templates', 'meta-registry.ts')
  const fileContent = await readFile(registryPath, 'utf8')

  const importName = `${toSafeIdentifier(service)}${capitalize(toSafeIdentifier(variant))}Meta`
  const importToken = `import ${importName} from './services/${service}/${variant}.meta.json'`
  const mappingToken = `  'services/${service}/${variant}.compose.yaml': ${importName},`

  if (fileContent.includes(importToken)) {
    return
  }

  const updatedImports = fileContent.replace('// @scaffold-meta-imports', `${importToken}\n// @scaffold-meta-imports`)
  const updatedMappings = updatedImports.replace('// @scaffold-meta-mappings', `${mappingToken}\n  // @scaffold-meta-mappings`)

  if (updatedMappings === fileContent) {
    throw new Error('Unable to update template meta registry. Please update src/templates/meta-registry.ts manually.')
  }

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

  const updated = fileContent.replace('// @scaffold-catalog-entries', `${entry}  // @scaffold-catalog-entries`)

  if (updated === fileContent) {
    throw new Error('Unable to update service catalog. Please add the service entry manually.')
  }

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
  await updateMetaRegistry(rootDir, args.service, args.variant)
  await updateCatalog(rootDir, args)
  await updateReadmeServiceTable(rootDir, args)

  process.stdout.write('Service scaffolded successfully.\n')
}

run().catch((error) => {
  process.stderr.write(`${String(error.message)}\n`)
  process.exit(1)
})

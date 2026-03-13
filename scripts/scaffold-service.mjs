#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

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

async function scaffoldTemplateFile(rootDir, service, variant) {
  const folder = path.join(rootDir, 'src', 'templates', 'services', service)
  const filePath = path.join(folder, `${variant}.compose.yaml`)
  await mkdir(folder, { recursive: true })

  const starter = [
    'services:',
    `  ${service}:`,
    `    image: ${service}:latest`,
    '    restart: unless-stopped',
    '    environment:',
    '      TZ: ${TZ:-Etc/UTC}',
    '',
  ].join('\n')

  await writeFile(filePath, starter, 'utf8')
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

  if (fileContent.includes(`id: '${id}'`)) {
    return
  }

  const entry = `  {\n    id: ${toTsStringLiteral(id)},\n    name: ${toTsStringLiteral(args.name)},\n    templateFile: ${toTsStringLiteral(templatePath)},\n    templateKey: ${toTsStringLiteral(templatePath)},\n    category: ${toTsStringLiteral(args.category)},\n    description: ${toTsStringLiteral(args.description)},\n    tags: [${toTsStringLiteral(args.service)}],\n    fieldOverrides: {},\n    extraTooling: [],\n    researchReferences: [],\n  },\n`

  const updated = fileContent.replace(/\]\s*$/, `${entry}]`)
  await writeFile(catalogPath, updated, 'utf8')
}

async function run() {
  const args = parseArgs(process.argv)
  ensureRequired(args)

  const rootDir = process.cwd()
  await scaffoldTemplateFile(rootDir, args.service, args.variant)
  await updateRegistry(rootDir, args.service, args.variant)
  await updateCatalog(rootDir, args)

  process.stdout.write('Service scaffolded successfully.\n')
}

run().catch((error) => {
  process.stderr.write(`${String(error.message)}\n`)
  process.exit(1)
})

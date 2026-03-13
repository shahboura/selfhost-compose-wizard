#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import path from 'node:path'

const TARGET_FILES = ['README.md', 'src/data/service-catalog.ts']
const URL_REGEX = /https?:\/\/[^\s"'`<>)}\]]+/g
const REQUEST_TIMEOUT_MS = 12_000
const MAX_ATTEMPTS = 2
const USER_AGENT = 'hosting-template-link-validator/1.0'
const ALLOWED_NON_2XX_STATUSES = new Set([401, 403, 405, 429])

function normalizeExtractedUrl(rawUrl) {
  return rawUrl.replace(/[.,;:!?]+$/u, '')
}

function isSkippableUrl(url) {
  try {
    const parsed = new URL(url)
    return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1'
  } catch {
    return false
  }
}

async function collectUrlEntries(rootDir) {
  const entries = []

  for (const relativeFilePath of TARGET_FILES) {
    const absoluteFilePath = path.join(rootDir, relativeFilePath)
    const fileContent = await readFile(absoluteFilePath, 'utf8')
    const lines = fileContent.split('\n')

    lines.forEach((line, lineIndex) => {
      const matches = line.match(URL_REGEX)
      if (!matches) {
        return
      }

      for (const match of matches) {
        const normalizedUrl = normalizeExtractedUrl(match)
        entries.push({
          filePath: relativeFilePath,
          line: lineIndex + 1,
          url: normalizedUrl,
        })
      }
    })
  }

  return entries
}

async function checkUrlOnce(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent': USER_AGENT,
      },
    })

    return {
      ok: response.ok || ALLOWED_NON_2XX_STATUSES.has(response.status),
      status: response.status,
    }
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : String(error),
    }
  } finally {
    clearTimeout(timeout)
  }
}

async function checkUrlWithRetry(url) {
  let lastResult = null

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const result = await checkUrlOnce(url)
    lastResult = result
    if (result.ok) {
      return result
    }
  }

  return lastResult
}

function validateUrlShape(url) {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

async function run() {
  const rootDir = process.cwd()
  const discoveredEntries = await collectUrlEntries(rootDir)

  const groupedEntries = new Map()
  for (const entry of discoveredEntries) {
    if (isSkippableUrl(entry.url)) {
      continue
    }

    const existing = groupedEntries.get(entry.url)
    if (existing) {
      existing.sources.push(`${entry.filePath}:${entry.line}`)
      continue
    }

    groupedEntries.set(entry.url, {
      url: entry.url,
      sources: [`${entry.filePath}:${entry.line}`],
    })
  }

  const failures = []

  for (const entry of groupedEntries.values()) {
    if (!validateUrlShape(entry.url)) {
      failures.push({
        ...entry,
        reason: 'Invalid URL format',
      })
      continue
    }

    const result = await checkUrlWithRetry(entry.url)
    if (!result?.ok) {
      failures.push({
        ...entry,
        reason: result?.status
          ? `HTTP ${result.status}`
          : `Request failed${result?.error ? `: ${result.error}` : ''}`,
      })
    }
  }

  if (failures.length > 0) {
    process.stderr.write(`Link validation failed (${failures.length} broken URL(s)).\n`)
    for (const failure of failures) {
      process.stderr.write(`- ${failure.url}\n`)
      process.stderr.write(`  Reason: ${failure.reason}\n`)
      process.stderr.write(`  Referenced at: ${failure.sources.join(', ')}\n`)
    }
    process.exit(1)
  }

  process.stdout.write(`Link validation passed (${groupedEntries.size} unique URL(s) checked).\n`)
}

run().catch((error) => {
  process.stderr.write(`Link validation crashed: ${error instanceof Error ? error.message : String(error)}\n`)
  process.exit(1)
})

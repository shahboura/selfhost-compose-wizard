export interface ParsedEnvMap {
  [key: string]: string
}

const ENV_KEY_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/

function needsQuoting(value: string): boolean {
  return value.length === 0 || /\s|#|=|\n|\r|"/.test(value)
}

function escapeForDoubleQuotes(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/"/g, '\\"')
}

export function serializeEnvValue(value: string): string {
  if (!needsQuoting(value)) {
    return value
  }

  return `"${escapeForDoubleQuotes(value)}"`
}

export function parseEnvContent(content: string): ParsedEnvMap {
  const lines = content.split(/\r?\n/)
  const parsed: ParsedEnvMap = {}

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (line.length === 0 || line.startsWith('#')) {
      continue
    }

    const separatorIndex = line.indexOf('=')
    if (separatorIndex <= 0) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    if (!ENV_KEY_REGEX.test(key)) {
      continue
    }

    let value = line.slice(separatorIndex + 1)

    if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
      value = value.slice(1, -1)
      value = value
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
    }

    if (!value.startsWith('"')) {
      const commentIndex = value.indexOf(' #')
      if (commentIndex >= 0) {
        value = value.slice(0, commentIndex)
      }
      value = value.trimEnd()
    }

    parsed[key] = value
  }

  return parsed
}

export interface ParsedEnvMap {
  [key: string]: string
}

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
    let value = line.slice(separatorIndex + 1)

    if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
      value = value.slice(1, -1)
      value = value
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
    }

    parsed[key] = value
  }

  return parsed
}

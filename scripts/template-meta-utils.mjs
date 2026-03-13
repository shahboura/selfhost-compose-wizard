export const PLACEHOLDER_REGEX = /\$\{([A-Za-z_][A-Za-z0-9_]*)(?:(:-|-)([^}]*))?\}/g
export const ALLOWED_FIELD_TYPES = new Set(['text', 'secret', 'url', 'number', 'timezone', 'path'])

export function inferFieldType(key) {
  if (key === 'TZ') {
    return 'timezone'
  }

  if (/(PASSWORD|SECRET|TOKEN|API_KEY|PRIVATE_KEY|CLIENT_SECRET|(^|_)KEY)$/i.test(key)) {
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

export function buildFieldDescription(key, fieldType) {
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

export function extractComposeVariables(templateContent) {
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
      if (!existing.composeDefault && composeDefault !== undefined) {
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

export function buildFieldSchema(templateContent) {
  const variables = extractComposeVariables(templateContent)
  const fields = {}

  for (const variable of variables) {
    const inferredType = inferFieldType(variable.key)
    const type = ALLOWED_FIELD_TYPES.has(inferredType) ? inferredType : 'text'
    fields[variable.key] = {
      type,
      required: variable.composeDefault === undefined,
      sensitive: type === 'secret',
      description: buildFieldDescription(variable.key, type),
      recommendedDefault: variable.composeDefault ?? '',
    }
  }

  return fields
}

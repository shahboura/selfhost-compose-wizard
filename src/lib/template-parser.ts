import type { ComposeVariableReference } from '../types'

const PLACEHOLDER_REGEX = /\$\{([A-Za-z_][A-Za-z0-9_]*)(?:(:-|-)([^}]*))?\}/g

export function extractComposeVariables(template: string): ComposeVariableReference[] {
  const references = new Map<string, ComposeVariableReference>()

  for (const match of template.matchAll(PLACEHOLDER_REGEX)) {
    const key = match[1]

    if (!key) {
      continue
    }

    const operator = match[2]
    const fallback = match[3]
    const composeDefault = operator === ':-' || operator === '-' ? fallback : undefined

    const existingReference = references.get(key)
    if (existingReference) {
      existingReference.occurrences += 1

      if (!existingReference.composeDefault && composeDefault) {
        existingReference.composeDefault = composeDefault
      }

      continue
    }

    references.set(key, {
      key,
      composeDefault,
      occurrences: 1,
    })
  }

  return [...references.values()]
}

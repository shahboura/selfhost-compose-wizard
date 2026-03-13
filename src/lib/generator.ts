import { FIELD_DESCRIPTIONS, RECOMMENDED_DEFAULTS, SENSITIVE_KEYS } from '../data/defaults'
import { serializeEnvValue } from './env'
import { extractComposeVariables } from './template-parser'
import type { ComposeVariableReference, FieldDefinition, WizardFieldState } from '../types'

interface BuildFieldDefinitionsParams {
  templateVariables: ComposeVariableReference[]
  fieldOverrides: Record<string, Partial<FieldDefinition>>
}

interface GenerateOutputsParams {
  templateContent: string
  fields: FieldDefinition[]
  wizardState: Record<string, WizardFieldState>
}

export interface GenerationOutput {
  composeContent: string
  envContent: string
  missingRequired: string[]
}

const HUMANIZE_SPLIT_REGEX = /_/g

function humanizeKey(key: string): string {
  return key
    .toLowerCase()
    .replace(HUMANIZE_SPLIT_REGEX, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function resolveEffectiveDefault(field: FieldDefinition): string {
  return field.recommendedDefault ?? field.composeDefault ?? ''
}

export function resolveWizardStateForService(
  templateContent: string,
  fieldOverrides: Record<string, Partial<FieldDefinition>>,
): Record<string, WizardFieldState> {
  const variables = extractComposeVariables(templateContent)
  const fields = buildFieldDefinitions({
    templateVariables: variables,
    fieldOverrides,
  })

  return initializeWizardState(fields)
}

export function buildFieldDefinitions({
  templateVariables,
  fieldOverrides,
}: BuildFieldDefinitionsParams): FieldDefinition[] {
  return templateVariables
    .map((variable) => {
      const overrides = fieldOverrides[variable.key]
      const defaultRecommended = RECOMMENDED_DEFAULTS[variable.key]
      const definition: FieldDefinition = {
        key: variable.key,
        label: overrides?.label ?? humanizeKey(variable.key),
        description:
          overrides?.description ?? FIELD_DESCRIPTIONS[variable.key] ?? 'Environment variable used by this compose template.',
        composeDefault: variable.composeDefault,
        recommendedDefault: overrides?.recommendedDefault ?? defaultRecommended,
        required: overrides?.required ?? (!variable.composeDefault && !defaultRecommended),
        sensitive: overrides?.sensitive ?? SENSITIVE_KEYS.has(variable.key),
      }

      return {
        ...definition,
        ...overrides,
      }
    })
    .sort((left, right) => left.key.localeCompare(right.key))
}

export function initializeWizardState(fields: FieldDefinition[]): Record<string, WizardFieldState> {
  return fields.reduce<Record<string, WizardFieldState>>((accumulator, field) => {
    accumulator[field.key] = {
      value: '',
      useDefault: true,
    }

    return accumulator
  }, {})
}

function resolveFieldValue(field: FieldDefinition, state?: WizardFieldState): string {
  if (!state) {
    return resolveEffectiveDefault(field)
  }

  if (state.useDefault) {
    return resolveEffectiveDefault(field)
  }

  return state.value.trim()
}

export function generateOutputs({ fields, templateContent, wizardState }: GenerateOutputsParams): GenerationOutput {
  const missingRequired: string[] = []
  const envLines: string[] = []

  for (const field of fields) {
    const value = resolveFieldValue(field, wizardState[field.key])
    if (field.required && value.length === 0) {
      missingRequired.push(field.key)
    }

    envLines.push(`${field.key}=${serializeEnvValue(value)}`)
  }

  return {
    composeContent: templateContent,
    envContent: envLines.join('\n'),
    missingRequired,
  }
}

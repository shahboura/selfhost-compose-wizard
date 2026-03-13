import type { TemplateKey } from './templates/registry'

export type ServiceCategory = 'media' | 'documents' | 'observability' | 'utilities' | 'photos'

export interface ComposeVariableReference {
  key: string
  composeDefault?: string
  occurrences: number
}

export interface FieldDefinition {
  key: string
  label: string
  description: string
  composeDefault?: string
  recommendedDefault?: string
  required: boolean
  sensitive: boolean
}

export interface WizardFieldState {
  value: string
  useDefault: boolean
}

export interface ToolingHint {
  title: string
  description: string
  command?: string
  url?: string
}

export interface ServiceDefinition {
  id: string
  name: string
  templateFile: string
  templateKey: TemplateKey
  category: ServiceCategory
  description: string
  tags: string[]
  riskWarnings?: string[]
  fieldOverrides: Record<string, Partial<FieldDefinition>>
  extraTooling: ToolingHint[]
}

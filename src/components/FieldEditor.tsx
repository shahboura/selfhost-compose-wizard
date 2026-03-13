import type { JSX } from 'react'
import type { FieldDefinition, WizardFieldState } from '../types'

interface FieldEditorProps {
  field: FieldDefinition
  state?: WizardFieldState
  idPrefix: string
  onChange: (patch: Partial<WizardFieldState>) => void
}

export function FieldEditor({ field, state, idPrefix, onChange }: FieldEditorProps): JSX.Element {
  const resolvedState = state ?? { value: '', useDefault: true }
  const defaultValue = field.recommendedDefault ?? field.composeDefault ?? ''
  const helperText = field.recommendedDefault
    ? `Recommended default: ${field.recommendedDefault}`
    : field.composeDefault
      ? `Compose fallback: ${field.composeDefault}`
      : 'No default available (required input).'
  const inputId = `${idPrefix}-${field.key.toLowerCase()}`
  const checkboxId = `${inputId}-use-default`
  const hintId = `${inputId}-hint`

  return (
    <article className="field-card">
      <div className="field-head">
        <div>
          <h3 id={`${inputId}-label`}>
            {field.label} <code>{field.key}</code>
          </h3>
          <p>{field.description}</p>
          <p className="hint" id={hintId}>
            {helperText}
          </p>
        </div>
        {field.required ? <span className="required">Required</span> : <span className="optional">Optional</span>}
      </div>

      <div className="field-controls">
        <label htmlFor={checkboxId}>
          <input
            id={checkboxId}
            type="checkbox"
            checked={resolvedState.useDefault}
            onChange={(event) => onChange({ useDefault: event.currentTarget.checked })}
          />
          Use default value
        </label>

        <label htmlFor={inputId} className="sr-only">
          {field.key}
        </label>
        <input
          id={inputId}
          type={field.sensitive ? 'password' : 'text'}
          value={resolvedState.useDefault ? defaultValue : resolvedState.value}
          onChange={(event) => onChange({ value: event.currentTarget.value, useDefault: false })}
          readOnly={resolvedState.useDefault}
          placeholder={field.required ? 'Required value' : 'Optional override'}
          aria-describedby={hintId}
          autoComplete="off"
        />
      </div>
    </article>
  )
}

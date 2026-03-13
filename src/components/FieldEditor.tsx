import { useMemo, useState, type JSX } from 'react'
import { generateSecretForField, getSecretGenerationSpec, validateFieldValue } from '../lib/field-security'
import type { FieldDefinition, WizardFieldState } from '../types'

const intlWithSupportedValues = Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] }

const timezoneOptions =
  typeof Intl !== 'undefined' && typeof intlWithSupportedValues.supportedValuesOf === 'function'
    ? intlWithSupportedValues.supportedValuesOf('timeZone')
    : []

interface FieldEditorProps {
  field: FieldDefinition
  state?: WizardFieldState
  idPrefix: string
  onChange: (patch: Partial<WizardFieldState>) => void
}

export function FieldEditor({ field, state, idPrefix, onChange }: FieldEditorProps): JSX.Element {
  const resolvedState = state ?? { value: '', useDefault: true }
  const [generatedNotice, setGeneratedNotice] = useState<string>('')
  const [showSensitiveValue, setShowSensitiveValue] = useState<boolean>(false)
  const isTimezoneField = field.key === 'TZ' && timezoneOptions.length > 0
  const defaultValue = field.recommendedDefault ?? field.composeDefault ?? ''
  const helperText = field.recommendedDefault
    ? `Recommended default: ${field.recommendedDefault}`
    : field.composeDefault
      ? `Compose fallback: ${field.composeDefault}`
      : 'No default available (required input).'
  const inputId = `${idPrefix}-${field.key.toLowerCase()}`
  const checkboxId = `${inputId}-use-default`
  const hintId = `${inputId}-hint`

  const generationSpec = useMemo(() => getSecretGenerationSpec(field.key, field.sensitive), [field.key, field.sensitive])

  const activeValue = resolvedState.useDefault ? defaultValue : resolvedState.value
  const validation = useMemo(() => validateFieldValue(field.key, activeValue), [activeValue, field.key])

  const handleGenerate = (): void => {
    const generated = generateSecretForField(field.key, field.sensitive)
    if (!generated) {
      setGeneratedNotice('Unable to generate value in this environment.')
      return
    }

    onChange({ value: generated, useDefault: false })
    setGeneratedNotice('Generated secure value.')
  }

  const currentInputType = field.sensitive && !showSensitiveValue ? 'password' : 'text'

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
          {generationSpec ? <p className="hint">{generationSpec.note}</p> : null}
          {validation ? <p className={`hint validation-${validation.level}`}>{validation.message}</p> : null}
          {generatedNotice ? <p className="hint validation-ok">{generatedNotice}</p> : null}
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
        <div className="field-input-row">
          {isTimezoneField ? (
            <>
              <input
                id={inputId}
                type="text"
                value={resolvedState.useDefault ? defaultValue : resolvedState.value}
                onChange={(event) => onChange({ value: event.currentTarget.value, useDefault: false })}
                readOnly={resolvedState.useDefault}
                placeholder={field.required ? 'Required value' : 'Optional override'}
                aria-describedby={hintId}
                autoComplete="off"
                list={`${inputId}-timezone-list`}
              />
              <datalist id={`${inputId}-timezone-list`}>
                {timezoneOptions.map((timezone) => (
                  <option key={timezone} value={timezone} />
                ))}
              </datalist>
            </>
          ) : (
            <input
              id={inputId}
              type={currentInputType}
              value={resolvedState.useDefault ? defaultValue : resolvedState.value}
              onChange={(event) => onChange({ value: event.currentTarget.value, useDefault: false })}
              readOnly={resolvedState.useDefault}
              placeholder={field.required ? 'Required value' : 'Optional override'}
              aria-describedby={hintId}
              autoComplete="off"
            />
          )}

          {field.sensitive ? (
            <button
              type="button"
              className="button"
              onClick={() => setShowSensitiveValue((current) => !current)}
              aria-label={showSensitiveValue ? 'Hide value' : 'Show value'}
            >
              {showSensitiveValue ? 'Hide' : 'Show'}
            </button>
          ) : null}

          {generationSpec ? (
            <button
              type="button"
              className="button"
              onClick={handleGenerate}
              title="Generate secure value"
            >
              Generate
            </button>
          ) : null}
        </div>
      </div>
    </article>
  )
}

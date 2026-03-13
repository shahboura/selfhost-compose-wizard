import { describe, expect, it } from 'vitest'
import { buildFieldDefinitions, generateOutputs, initializeWizardState } from './generator'

describe('generator', () => {
  it('builds fields with required marker fallback', () => {
    const fields = buildFieldDefinitions({
      templateVariables: [
        { key: 'TZ', occurrences: 1 },
        { key: 'CUSTOM_SECRET', occurrences: 1 },
      ],
      fieldOverrides: {},
    })

    const tzField = fields.find((field) => field.key === 'TZ')
    const customField = fields.find((field) => field.key === 'CUSTOM_SECRET')

    expect(tzField?.required).toBe(false)
    expect(tzField?.recommendedDefault).toBe('Etc/UTC')
    expect(customField?.required).toBe(true)
  })

  it('uses default values when user opts out and flags missing required', () => {
    const fields = buildFieldDefinitions({
      templateVariables: [
        { key: 'TZ', occurrences: 1 },
        { key: 'CUSTOM_SECRET', occurrences: 1 },
      ],
      fieldOverrides: {},
    })
    const state = initializeWizardState(fields)

    state.CUSTOM_SECRET = { value: '', useDefault: false }

    const output = generateOutputs({
      templateContent: 'services: {}',
      fields,
      wizardState: state,
    })

    expect(output.envContent).toContain('TZ=Etc/UTC')
    expect(output.missingRequired).toContain('CUSTOM_SECRET')
  })

  it('serializes env values safely', () => {
    const fields = buildFieldDefinitions({
      templateVariables: [{ key: 'SPECIAL', occurrences: 1 }],
      fieldOverrides: {
        SPECIAL: { required: false },
      },
    })

    const output = generateOutputs({
      templateContent: 'services: {}',
      fields,
      wizardState: {
        SPECIAL: { value: 'value with spaces', useDefault: false },
      },
    })

    expect(output.envContent).toContain('SPECIAL="value with spaces"')
  })
})

import { describe, expect, it } from 'vitest'
import { extractComposeVariables } from './template-parser'

describe('extractComposeVariables', () => {
  it('parses variables and compose defaults', () => {
    const template = `
      services:
        app:
          ports:
            - \${APP_PORT:-8080}:8080
          environment:
            TZ: \${TZ}
            MODE: \${MODE-default}
            TZ2: \${TZ}
    `

    const variables = extractComposeVariables(template)
    const keyMap = new Map(variables.map((entry) => [entry.key, entry]))

    expect(keyMap.get('APP_PORT')?.composeDefault).toBe('8080')
    expect(keyMap.get('TZ')?.occurrences).toBe(2)
    expect(keyMap.get('MODE')?.composeDefault).toBe('default')
  })

  it('supports lowercase and mixed-case variable names', () => {
    const template = `
      services:
        app:
          environment:
            - \${db_password:-secret}
            - \${CamelCase_1}
    `

    const variables = extractComposeVariables(template)
    const keys = variables.map((entry) => entry.key)

    expect(keys).toContain('db_password')
    expect(keys).toContain('CamelCase_1')
    expect(variables.find((entry) => entry.key === 'db_password')?.composeDefault).toBe('secret')
  })
})

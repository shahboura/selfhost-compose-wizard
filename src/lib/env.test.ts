import { describe, expect, it } from 'vitest'
import { parseEnvContent, serializeEnvValue } from './env'

describe('env serialization', () => {
  it('quotes values when needed', () => {
    expect(serializeEnvValue('simple')).toBe('simple')
    expect(serializeEnvValue('value with spaces')).toBe('"value with spaces"')
    expect(serializeEnvValue('has#hash')).toBe('"has#hash"')
  })

  it('parses quoted and plain env entries', () => {
    const parsed = parseEnvContent('A=plain\nB="quoted value"\n#comment\nC="line\\nnext"')

    expect(parsed.A).toBe('plain')
    expect(parsed.B).toBe('quoted value')
    expect(parsed.C).toBe('line\nnext')
  })
})

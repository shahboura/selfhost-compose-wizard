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

  it('ignores invalid keys and trims inline comments for unquoted values', () => {
    const parsed = parseEnvContent('VALID_KEY=value # comment\n1INVALID=abc\nALSO_OK=done')

    expect(parsed.VALID_KEY).toBe('value')
    expect(parsed.ALSO_OK).toBe('done')
    expect(parsed['1INVALID']).toBeUndefined()
  })
})

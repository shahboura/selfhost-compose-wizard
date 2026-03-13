import { describe, expect, it } from 'vitest'
import { generateSecretForField, getSecretGenerationSpec, validateFieldValue } from './field-security'

describe('field-security', () => {
  it('uses hex32 generation for Arcane core keys', () => {
    const spec = getSecretGenerationSpec('GETARCANE_ENCRYPTION_KEY', true)
    expect(spec?.mode).toBe('hex32')

    const generated = generateSecretForField('GETARCANE_ENCRYPTION_KEY', true)
    expect(generated).toMatch(/^[a-f0-9]{64}$/)
  })

  it('uses base64url generation for oauth2-proxy cookie secrets', () => {
    const spec = getSecretGenerationSpec('OAUTH2_PROXY_COOKIE_SECRET', true)
    expect(spec?.mode).toBe('base64url32')

    const generated = generateSecretForField('OAUTH2_PROXY_COOKIE_SECRET', true)
    expect(generated).toMatch(/^[A-Za-z0-9_-]{43}$/)
  })

  it('warns on trailing slash issuer URL', () => {
    const validation = validateFieldValue('GETARCANE_OIDC_ISSUER_URL', 'https://idp.example.com/')
    expect(validation).toEqual({
      level: 'warn',
      message: 'OIDC issuer URL should not have a trailing slash.',
    })
  })

  it('validates port range', () => {
    const invalid = validateFieldValue('DOZZLE_PORT', '99999')
    expect(invalid?.level).toBe('error')
  })
})

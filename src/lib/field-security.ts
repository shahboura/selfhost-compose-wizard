type SecretGenerationMode = 'hex32' | 'base64url32' | 'alnum32'

interface SecretGenerationSpec {
  mode: SecretGenerationMode
  note: string
}

interface FieldValidation {
  level: 'ok' | 'warn' | 'error'
  message: string
}

const NON_GENERATABLE_SECRET_KEYS = new Set<string>([
  'OIDC_CLIENT_SECRET',
  'CLIENT_SECRET',
  'OIDC_TOKEN_ENDPOINT',
])

const HEX32_KEYS = new Set<string>(['ENCRYPTION_KEY', 'JWT_SECRET'])
const BASE64URL32_KEYS = new Set<string>(['OAUTH2_PROXY_COOKIE_SECRET', 'COOKIE_SECRET'])

const ALNUM_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

function randomBytes(size: number): Uint8Array | null {
  const cryptoApi = globalThis.crypto
  if (!cryptoApi?.getRandomValues) {
    return null
  }

  const bytes = new Uint8Array(size)
  cryptoApi.getRandomValues(bytes)
  return bytes
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')
}

function bytesToBase64Url(bytes: Uint8Array): string {
  const asBinary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')
  const base64 = btoa(asBinary)
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function randomFromCharset(length: number, charset: string): string | null {
  const bytes = randomBytes(length)
  if (!bytes) {
    return null
  }

  return Array.from(bytes, (value) => charset[value % charset.length]).join('')
}

export function getSecretGenerationSpec(fieldKey: string, sensitive: boolean): SecretGenerationSpec | null {
  if (NON_GENERATABLE_SECRET_KEYS.has(fieldKey)) {
    return null
  }

  if (HEX32_KEYS.has(fieldKey)) {
    return {
      mode: 'hex32',
      note: 'Generates 32-byte hex (compatible with OpenSSL rand -hex 32).',
    }
  }

  if (BASE64URL32_KEYS.has(fieldKey)) {
    return {
      mode: 'base64url32',
      note: 'Generates URL-safe base64 from 32 random bytes.',
    }
  }

  if (fieldKey.endsWith('_PASSWORD') || fieldKey === 'DB_PASSWORD') {
    return {
      mode: 'alnum32',
      note: 'Generates 32-char alphanumeric password.',
    }
  }

  if (sensitive || /(SECRET|TOKEN|API_KEY|PRIVATE_KEY|COOKIE_SECRET|(^|_)KEY)$/i.test(fieldKey)) {
    return {
      mode: 'base64url32',
      note: 'Generates URL-safe base64 from 32 random bytes.',
    }
  }

  return null
}

export function generateSecretForField(fieldKey: string, sensitive: boolean): string | null {
  const spec = getSecretGenerationSpec(fieldKey, sensitive)
  if (!spec) {
    return null
  }

  if (spec.mode === 'hex32') {
    const bytes = randomBytes(32)
    return bytes ? bytesToHex(bytes) : null
  }

  if (spec.mode === 'base64url32') {
    const bytes = randomBytes(32)
    return bytes ? bytesToBase64Url(bytes) : null
  }

  return randomFromCharset(32, ALNUM_CHARSET)
}

export function validateFieldValue(fieldKey: string, value: string): FieldValidation | null {
  const normalized = value.trim()
  if (normalized.length === 0) {
    return null
  }

  if (/(^|_)PORT$/i.test(fieldKey)) {
    const numeric = Number(normalized)
    if (!Number.isInteger(numeric) || numeric < 1 || numeric > 65535) {
      return { level: 'error', message: 'Port must be an integer between 1 and 65535.' }
    }

    return { level: 'ok', message: 'Valid port value.' }
  }

  if (/(^|_)URL$/i.test(fieldKey)) {
    try {
      const parsed = new URL(normalized)
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return { level: 'error', message: 'URL must use http or https.' }
      }

      if (fieldKey === 'OIDC_ISSUER_URL' && parsed.pathname.endsWith('/')) {
        return { level: 'warn', message: 'OIDC issuer URL should not have a trailing slash.' }
      }

      return { level: 'ok', message: 'Valid URL format.' }
    } catch {
      return { level: 'error', message: 'Invalid URL format.' }
    }
  }

  if (/SECRET|PASSWORD|TOKEN|API_KEY|PRIVATE_KEY|(^|_)KEY/i.test(fieldKey) && normalized.length < 24) {
    return { level: 'warn', message: 'Consider using a longer random value (24+ chars).' }
  }

  return null
}

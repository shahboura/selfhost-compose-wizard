export const RECOMMENDED_DEFAULTS: Record<string, string> = {
  TZ: 'Etc/UTC',
  PUID: '1000',
  PGID: '1000',
  IMMICH_DB_USER: 'postgres',
  IMMICH_DB_NAME: 'immich',
  IMMICH_VERSION: 'v2',
  IMMICH_UPLOAD_DIR: './library',
  IMMICH_DB_DATA_DIR: './postgres',
  IMMICH_VALKEY_DIR: './valkey',
  IMMICH_MODEL_CACHE_DIR: './model-cache',
  IMMICH_MODEL_CONFIG_DIR: './model-config',
  IMMICH_MATPLOTLIB_DIR: './matplotlib',
}

export const FIELD_DESCRIPTIONS: Record<string, string> = {
  TZ: 'Timezone in TZ database format.',
  PUID: 'Linux user ID for container process permissions.',
  PGID: 'Linux group ID for container process permissions.',
  IMMICH_DB_PASSWORD: 'Immich Postgres password (prefer a strong random value).',
  IMMICH_DB_USER: 'Immich Postgres username used by app and DB.',
  IMMICH_DB_NAME: 'Immich Postgres database name.',
  IMMICH_VERSION: 'Immich image tag/version selector.',
  BENTOPDF_OAUTH2_PROXY_CONFIG_FILE: 'Path to oauth2-proxy configuration file on host.',
  BENTOPDF_OAUTH2_PROXY_AUTHENTICATED_EMAILS_FILE:
    'Path to authenticated emails file on host.',
  DOZZLE_OAUTH2_PROXY_CONFIG_FILE: 'Path to oauth2-proxy config file mounted read-only.',
  DOZZLE_OAUTH2_PROXY_AUTHENTICATED_EMAILS_FILE:
    'Path to allowed-authenticated-emails file mounted read-only.',
  GETARCANE_APP_URL: 'Public base URL used by Arcane for callback and link generation.',
  GETARCANE_PORT: 'Published HTTP port for Arcane web UI.',
  GETARCANE_DATA_DIR: 'Host path mounted to /app/data for Arcane state and projects.',
  GETARCANE_ENCRYPTION_KEY: 'Arcane encryption key. Must be 32 bytes (hex/base64/raw).',
  GETARCANE_JWT_SECRET: 'Arcane JWT/session signing secret.',
  GETARCANE_OIDC_ISSUER_URL: 'OIDC issuer URL with no trailing slash.',
  GETARCANE_OIDC_SCOPES:
    'Include any claim scopes needed for GETARCANE_OIDC_ADMIN_CLAIM (for example groups).',
}

export const SENSITIVE_KEYS: Set<string> = new Set<string>([
  'IMMICH_DB_PASSWORD',
  'GETARCANE_ENCRYPTION_KEY',
  'GETARCANE_JWT_SECRET',
  'GETARCANE_OIDC_CLIENT_SECRET',
  'OAUTH2_PROXY_COOKIE_SECRET',
  'OAUTH2_PROXY_CLIENT_SECRET',
  'CLIENT_SECRET',
  'COOKIE_SECRET',
])

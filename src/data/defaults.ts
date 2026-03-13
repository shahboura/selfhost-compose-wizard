export const RECOMMENDED_DEFAULTS: Record<string, string> = {
  TZ: 'Etc/UTC',
  PUID: '1000',
  PGID: '1000',
  DB_USERNAME: 'postgres',
  DB_DATABASE_NAME: 'immich',
  IMMICH_VERSION: 'v2',
  UPLOAD_LOCATION: './library',
  DB_DATA_LOCATION: './postgres',
  IMMICH_VALKEY_DATA: './valkey',
  IMMICH_CACHE_LOCATION: './model-cache',
  IMMICH_CONFIG_LOCATION: './model-config',
  IMMICH_MATPLOTLIB_LOCATION: './matplotlib',
}

export const FIELD_DESCRIPTIONS: Record<string, string> = {
  TZ: 'Timezone in TZ database format.',
  PUID: 'Linux user ID for container process permissions.',
  PGID: 'Linux group ID for container process permissions.',
  DB_PASSWORD: 'Postgres password (prefer a strong random value).',
  DB_USERNAME: 'Postgres username used by app and DB.',
  DB_DATABASE_NAME: 'Postgres database name.',
  IMMICH_VERSION: 'Immich image tag/version selector.',
}

export const SENSITIVE_KEYS: Set<string> = new Set<string>([
  'DB_PASSWORD',
  'OAUTH2_PROXY_COOKIE_SECRET',
  'OAUTH2_PROXY_CLIENT_SECRET',
  'CLIENT_SECRET',
  'COOKIE_SECRET',
])

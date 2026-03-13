import type { ServiceDefinition } from '../types'

export const SERVICE_CATALOG: ServiceDefinition[] = [
  {
    id: 'bentopdf',
    name: 'BentoPDF',
    templateFile: 'services/bentopdf/base.compose.yaml',
    templateKey: 'services/bentopdf/base.compose.yaml',
    category: 'documents',
    description: 'Privacy-first PDF toolkit service.',
    tags: ['pdf', 'privacy', 'single-service'],
    fieldOverrides: {},
    extraTooling: [],
  },
  {
    id: 'bentopdf-oauth2-proxy',
    name: 'BentoPDF + OAuth2 Proxy',
    templateFile: 'services/bentopdf/oauth2-proxy.compose.yaml',
    templateKey: 'services/bentopdf/oauth2-proxy.compose.yaml',
    category: 'documents',
    description: 'BentoPDF with OIDC reverse-proxy authentication flow.',
    tags: ['pdf', 'oauth2-proxy', 'oidc'],
    fieldOverrides: {
      OAUTH2_PROXY_CONFIG_DIR: {
        description: 'Path to oauth2-proxy configuration file on host.',
      },
      OAUTH2_PROXY_AUTH_DIR: {
        description: 'Path to authenticated emails file on host.',
      },
    },
    extraTooling: [
      {
        title: 'Generate OAuth2 Proxy cookie secret',
        description: 'Generate a secure base64url cookie secret for oauth2-proxy config.',
        command: "openssl rand -base64 32 | tr -- '+/' '-_'",
        url: 'https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview/#generating-a-cookie-secret',
      },
    ],
  },
  {
    id: 'dozzle',
    name: 'Dozzle',
    templateFile: 'services/dozzle/base.compose.yaml',
    templateKey: 'services/dozzle/base.compose.yaml',
    category: 'observability',
    description: 'Container logs viewer with mounted docker socket.',
    tags: ['logs', 'observability', 'docker'],
    riskWarnings: [
      'Mounts /var/run/docker.sock, which grants broad host Docker control.',
    ],
    fieldOverrides: {},
    extraTooling: [],
  },
  {
    id: 'dozzle-oauth2-proxy',
    name: 'Dozzle + OAuth2 Proxy',
    templateFile: 'services/dozzle/oauth2-proxy.compose.yaml',
    templateKey: 'services/dozzle/oauth2-proxy.compose.yaml',
    category: 'observability',
    description: 'Dozzle protected by OAuth2 Proxy in forward-proxy mode.',
    tags: ['logs', 'oauth2-proxy', 'auth'],
    riskWarnings: [
      'Mounts /var/run/docker.sock, which grants broad host Docker control.',
    ],
    fieldOverrides: {
      DOZZLE_OAUTH2_PROXY_CONFIG: {
        description: 'Path to oauth2-proxy config file mounted read-only.',
      },
      DOZZLE_OAUTH2_PROXY_AUTHENTICATED_EMAILS: {
        description: 'Path to allowed-authenticated-emails file mounted read-only.',
      },
    },
    extraTooling: [
      {
        title: 'Generate OAuth2 Proxy cookie secret',
        description: 'Generate a secure cookie secret for oauth2-proxy configuration.',
        command: "openssl rand -base64 32 | tr -- '+/' '-_'",
        url: 'https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview/#generating-a-cookie-secret',
      },
    ],
  },
  {
    id: 'immich',
    name: 'Immich',
    templateFile: 'services/immich/base.compose.yaml',
    templateKey: 'services/immich/base.compose.yaml',
    category: 'photos',
    description: 'Self-hosted photo and video backup stack.',
    tags: ['photos', 'postgres', 'valkey'],
    fieldOverrides: {
      DB_PASSWORD: {
        description:
          'Database password. Immich docs recommend using A-Za-z0-9 for compatibility.',
        sensitive: true,
      },
      IMMICH_VERSION: {
        recommendedDefault: 'v2',
      },
    },
    extraTooling: [
      {
        title: 'Generate a strong DB password',
        description: 'Optional helper command to create an alphanumeric DB password.',
        command: 'pwgen 32 1',
        url: 'https://docs.immich.app/install/docker-compose/',
      },
    ],
  },
  {
    id: 'it-tools',
    name: 'IT Tools',
    templateFile: 'services/it-tools/base.compose.yaml',
    templateKey: 'services/it-tools/base.compose.yaml',
    category: 'utilities',
    description: 'Collection of handy developer utilities.',
    tags: ['utilities', 'single-service'],
    fieldOverrides: {},
    extraTooling: [],
  },
  {
    id: 'jellyfin',
    name: 'Jellyfin',
    templateFile: 'services/jellyfin/base.compose.yaml',
    templateKey: 'services/jellyfin/base.compose.yaml',
    category: 'media',
    description: 'Media server for movies, music, and shows.',
    tags: ['media', 'streaming', 'hardware-acceleration'],
    riskWarnings: [
      'Uses host network mode; service ports bind directly on host network namespace.',
      'Maps GPU devices from /dev/dri; verify host permissions and trusted workloads.',
    ],
    fieldOverrides: {
      JELLYFIN_CONFIG_DIR: {
        description: 'Host path for Jellyfin config data.',
      },
      JELLYFIN_CACHE_DIR: {
        description: 'Host path for Jellyfin cache data.',
      },
    },
    extraTooling: [
      {
        title: 'Optional hardware acceleration check',
        description:
          'If you enable /dev/dri device mapping, verify host GPU drivers and permissions first.',
        url: 'https://jellyfin.org/docs/general/installation/container',
      },
    ],
  },
]

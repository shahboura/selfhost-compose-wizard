import type { ServiceDefinition } from '../types'

export const SERVICE_CATALOG: ServiceDefinition[] = [
  {
    id: 'bentopdf',
    name: 'BentoPDF',
    templateFile: 'services/bentopdf/base.compose.yaml',
    templateKey: 'services/bentopdf/base.compose.yaml',
    category: 'utilities',
    description: 'Privacy-first PDF toolkit service.',
    tags: ['pdf', 'privacy', 'single-service'],
    fieldOverrides: {},
    extraTooling: [],
    researchReferences: [
      {
        title: 'BentoPDF repository',
        url: 'https://github.com/alam00000/bentopdf',
      },
    ],
  },
  {
    id: 'bentopdf-oauth2-proxy',
    name: 'BentoPDF + OAuth2 Proxy',
    templateFile: 'services/bentopdf/oauth2-proxy.compose.yaml',
    templateKey: 'services/bentopdf/oauth2-proxy.compose.yaml',
    category: 'utilities',
    description: 'BentoPDF with OIDC reverse-proxy authentication flow.',
    tags: ['pdf', 'oauth2-proxy', 'oidc'],
    fieldOverrides: {
      BENTOPDF_OAUTH2_PROXY_CONFIG_FILE: {
        description: 'Path to oauth2-proxy configuration file on host.',
      },
      BENTOPDF_OAUTH2_PROXY_AUTHENTICATED_EMAILS_FILE: {
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
    researchReferences: [
      {
        title: 'BentoPDF repository',
        url: 'https://github.com/alam00000/bentopdf',
      },
      {
        title: 'OAuth2 Proxy configuration overview',
        url: 'https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview/',
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
    researchReferences: [
      {
        title: 'Dozzle getting started + auth docs',
        url: 'https://dozzle.dev/guide/getting-started',
      },
      {
        title: 'Dozzle authentication options',
        url: 'https://dozzle.dev/guide/authentication',
      },
    ],
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
      DOZZLE_OAUTH2_PROXY_CONFIG_FILE: {
        description: 'Path to oauth2-proxy config file mounted read-only.',
      },
      DOZZLE_OAUTH2_PROXY_AUTHENTICATED_EMAILS_FILE: {
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
    researchReferences: [
      {
        title: 'Dozzle getting started + auth docs',
        url: 'https://dozzle.dev/guide/getting-started',
      },
      {
        title: 'Dozzle authentication options',
        url: 'https://dozzle.dev/guide/authentication',
      },
      {
        title: 'OAuth2 Proxy configuration overview',
        url: 'https://oauth2-proxy.github.io/oauth2-proxy/configuration/overview/',
      },
    ],
  },
  {
    id: 'immich',
    name: 'Immich',
    templateFile: 'services/immich/base.compose.yaml',
    templateKey: 'services/immich/base.compose.yaml',
    category: 'media',
    description: 'Self-hosted photo and video backup stack.',
    tags: ['photos', 'postgres', 'valkey'],
    fieldOverrides: {
      IMMICH_DB_PASSWORD: {
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
    researchReferences: [
      {
        title: 'Immich docker compose install',
        url: 'https://docs.immich.app/install/docker-compose/',
      },
      {
        title: 'Immich environment variables',
        url: 'https://docs.immich.app/install/environment-variables/',
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
    researchReferences: [
      {
        title: 'IT Tools repository self-hosting section',
        url: 'https://github.com/CorentinTh/it-tools',
      },
    ],
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
    researchReferences: [
      {
        title: 'Jellyfin container installation',
        url: 'https://jellyfin.org/docs/general/installation/container',
      },
    ],
  },
  {
    id: 'getarcane',
    name: 'GetArcane',
    templateFile: 'services/getarcane/base.compose.yaml',
    templateKey: 'services/getarcane/base.compose.yaml',
    category: 'utilities',
    description: 'Self-hosted Docker and compose management UI for homelab environments.',
    tags: ['homelab', 'docker', 'arcane'],
    riskWarnings: [
      'Mounts /var/run/docker.sock, which grants broad host Docker control.',
      'Uses cgroup: host; review host runtime isolation requirements.',
    ],
    fieldOverrides: {
      GETARCANE_ENCRYPTION_KEY: {
        description: 'Arcane encryption key. Must be 32 bytes (hex/base64/raw).',
        sensitive: true,
      },
      GETARCANE_JWT_SECRET: {
        description: 'Arcane JWT/session signing secret.',
        sensitive: true,
      },
      GETARCANE_DATA_DIR: {
        description: 'Host path mounted to /app/data for Arcane state and projects.',
      },
    },
    extraTooling: [
      {
        title: 'Generate Arcane secrets',
        description: 'Generate GETARCANE_ENCRYPTION_KEY and GETARCANE_JWT_SECRET with OpenSSL.',
        command: 'openssl rand -hex 32',
        url: 'https://getarcane.app/docs/setup/installation',
      },
    ],
    researchReferences: [
      {
        title: 'GetArcane installation (compose)',
        url: 'https://getarcane.app/docs/setup/installation',
      },
      {
        title: 'GetArcane environment variables',
        url: 'https://getarcane.app/docs/configuration/environment',
      },
      {
        title: 'GetArcane compose generator',
        url: 'https://getarcane.app/generator',
      },
    ],
  },
  {
    id: 'getarcane-oidc',
    name: 'GetArcane + OIDC',
    templateFile: 'services/getarcane/oidc.compose.yaml',
    templateKey: 'services/getarcane/oidc.compose.yaml',
    category: 'utilities',
    description: 'GetArcane configured for OIDC single sign-on environments.',
    tags: ['homelab', 'docker', 'oidc'],
    riskWarnings: [
      'Mounts /var/run/docker.sock, which grants broad host Docker control.',
      'OIDC issuer URL must be configured without trailing slash.',
    ],
    fieldOverrides: {
      GETARCANE_ENCRYPTION_KEY: {
        description: 'Arcane encryption key. Must be 32 bytes (hex/base64/raw).',
        sensitive: true,
      },
      GETARCANE_JWT_SECRET: {
        description: 'Arcane JWT/session signing secret.',
        sensitive: true,
      },
      GETARCANE_OIDC_ISSUER_URL: {
        description: 'OIDC issuer URL with no trailing slash.',
      },
      GETARCANE_OIDC_SCOPES: {
        description: 'Include any claim scopes needed for GETARCANE_OIDC_ADMIN_CLAIM (for example groups).',
      },
    },
    extraTooling: [
      {
        title: 'OIDC callback URL reminder',
        description: 'Register this callback URI in your identity provider config.',
        command: '${GETARCANE_APP_URL}/auth/oidc/callback',
        url: 'https://getarcane.app/docs/configuration/sso',
      },
    ],
    researchReferences: [
      {
        title: 'GetArcane OIDC SSO configuration',
        url: 'https://getarcane.app/docs/configuration/sso',
      },
      {
        title: 'GetArcane environment variables',
        url: 'https://getarcane.app/docs/configuration/environment',
      },
      {
        title: 'GetArcane compose generator',
        url: 'https://getarcane.app/generator',
      },
    ],
  },
  // @scaffold-catalog-entries
]

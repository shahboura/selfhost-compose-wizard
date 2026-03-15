import bentopdfBase from './services/bentopdf/base.compose.yaml?raw'
import bentopdfOauth2Proxy from './services/bentopdf/oauth2-proxy.compose.yaml?raw'
import audiobookshelfBase from './services/audiobookshelf/base.compose.yaml?raw'
import dozzleBase from './services/dozzle/base.compose.yaml?raw'
import dozzleOauth2Proxy from './services/dozzle/oauth2-proxy.compose.yaml?raw'
import immichBase from './services/immich/base.compose.yaml?raw'
import itToolsBase from './services/it-tools/base.compose.yaml?raw'
import jellyfinBase from './services/jellyfin/base.compose.yaml?raw'
import getarcaneBase from './services/getarcane/base.compose.yaml?raw'
import getarcaneOidc from './services/getarcane/oidc.compose.yaml?raw'
import homepageBase from './services/homepage/base.compose.yaml?raw'
import homepageOauth2Proxy from './services/homepage/oauth2-proxy.compose.yaml?raw'
import plexBase from './services/plex/base.compose.yaml?raw'
import watchtowerBase from './services/watchtower/base.compose.yaml?raw'
// @scaffold-imports

export const TEMPLATE_CONTENT = {
  'services/bentopdf/base.compose.yaml': bentopdfBase,
  'services/bentopdf/oauth2-proxy.compose.yaml': bentopdfOauth2Proxy,
  'services/audiobookshelf/base.compose.yaml': audiobookshelfBase,
  'services/dozzle/base.compose.yaml': dozzleBase,
  'services/dozzle/oauth2-proxy.compose.yaml': dozzleOauth2Proxy,
  'services/immich/base.compose.yaml': immichBase,
  'services/it-tools/base.compose.yaml': itToolsBase,
  'services/jellyfin/base.compose.yaml': jellyfinBase,
  'services/getarcane/base.compose.yaml': getarcaneBase,
  'services/getarcane/oidc.compose.yaml': getarcaneOidc,
  'services/homepage/base.compose.yaml': homepageBase,
  'services/homepage/oauth2-proxy.compose.yaml': homepageOauth2Proxy,
  'services/plex/base.compose.yaml': plexBase,
  'services/watchtower/base.compose.yaml': watchtowerBase,
  // @scaffold-mappings
} as const satisfies Record<string, string>

export type TemplateKey = keyof typeof TEMPLATE_CONTENT

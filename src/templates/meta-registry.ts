import bentopdfBaseMeta from './services/bentopdf/base.meta.json'
import bentopdfOauth2ProxyMeta from './services/bentopdf/oauth2-proxy.meta.json'
import dozzleBaseMeta from './services/dozzle/base.meta.json'
import dozzleOauth2ProxyMeta from './services/dozzle/oauth2-proxy.meta.json'
import immichBaseMeta from './services/immich/base.meta.json'
import itToolsBaseMeta from './services/it-tools/base.meta.json'
import jellyfinBaseMeta from './services/jellyfin/base.meta.json'
// @scaffold-meta-imports

export const TEMPLATE_FIELD_META = {
  'services/bentopdf/base.compose.yaml': bentopdfBaseMeta,
  'services/bentopdf/oauth2-proxy.compose.yaml': bentopdfOauth2ProxyMeta,
  'services/dozzle/base.compose.yaml': dozzleBaseMeta,
  'services/dozzle/oauth2-proxy.compose.yaml': dozzleOauth2ProxyMeta,
  'services/immich/base.compose.yaml': immichBaseMeta,
  'services/it-tools/base.compose.yaml': itToolsBaseMeta,
  'services/jellyfin/base.compose.yaml': jellyfinBaseMeta,
  // @scaffold-meta-mappings
} as const

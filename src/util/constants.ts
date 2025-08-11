import type { SekaiKeyset, SekaiPlatform, SekaiRegion } from '../types.js'

export const SEKAI_UNITY_VERSION = '2022.3.21f1'

export const DEFAULT_KEYSETS = new Map<SekaiRegion, SekaiKeyset>([
  ['cn', { key: '6732666343305a637a4e394d544a3631', iv: '6d737833495630693958453575595a31' }],
  ['en', { key: 'df384214b29a3adfbf1bd9ee5b16f884', iv: '7e856c907987f8aec6afc0c54738fc7e' }],
  ['jp', { key: '6732666343305a637a4e394d544a3631', iv: '6d737833495630693958453575595a31' }],
  ['kr', { key: '6732666343305a637a4e394d544a3631', iv: '6d737833495630693958453575595a31' }],
  ['tw', { key: '6732666343305a637a4e394d544a3631', iv: '6d737833495630693958453575595a31' }],
])

export const GAME_ENDPOINT = new Map<SekaiRegion, string>([
  ['cn', 'https://mkcn-prod-public-60001-1.dailygn.com'],
  ['en', 'https://n-production-game-api.sekai-en.com'],
  ['jp', 'https://production-game-api.sekai.colorfulpalette.org'],
  ['kr', 'https://mkkorea-obt-prod01-cdn.bytedgame.com'],
  ['tw', 'https://mk-zian-obt-cdn.bytedgame.com'],
])

export const SIGNATURE_ENDPOINT = new Map<SekaiRegion, string>([
  ['jp', 'https://issue.sekai.colorfulpalette.org'],
])

const ANDROID_UA = new Map<SekaiRegion, string>([
  ['cn', 'UnityPlayer/2022.3.21f1 (UnityWebRequest/1.0, libcurl/8.5.0-DEV)'],
  ['en', 'UnityPlayer/2022.3.21f1 (UnityWebRequest/1.0, libcurl/8.5.0-DEV)'],
  ['jp', 'UnityPlayer/2022.3.21f1 (UnityWebRequest/1.0, libcurl/8.5.0-DEV)'],
  ['kr', 'UnityPlayer/2022.3.21f1 (UnityWebRequest/1.0, libcurl/8.5.0-DEV)'],
  ['tw', 'UnityPlayer/2022.3.21f1 (UnityWebRequest/1.0, libcurl/8.5.0-DEV)'],
])

const IOS_UA = new Map<SekaiRegion, string>([
  ['cn', 'ColorfulStage/68 CFNetwork/1568.200.51 Darwin/24.1.0'],
  ['en', 'ColorfulStage/68 CFNetwork/1568.200.51 Darwin/24.1.0'],
  ['jp', 'ProductName/230 CFNetwork/3826.500.111.2.2 Darwin/24.4.0'],
  ['kr', 'ColorfulStage/68 CFNetwork/1568.200.51 Darwin/24.1.0'],
  ['tw', 'ColorfulStage/68 CFNetwork/1568.200.51 Darwin/24.1.0'],
])

export const USER_AGENT = new Map<SekaiPlatform, Map<SekaiRegion, string>>([
  ['android', ANDROID_UA],
  ['ios', IOS_UA],
])

export const PLATFORM_HEADER: Record<SekaiPlatform, string> = {
  android: 'Android',
  ios: 'iOS',
}

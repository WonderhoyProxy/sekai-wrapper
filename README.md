## @wonderhoy/sekai-wrapper

TypeScript client wrapper for Project Sekai game API (semi-experimental).

### Install

```ts
pnpm add @wonderhoy/sekai-wrapper
```

### Usage

```ts
import { createSekaiClient } from '@wonderhoy/sekai-wrapper'

const client = createSekaiClient({
  region: 'jp',
  platform: 'android',
  retries: 2,
  timeoutMs: 10000,
})

client.setVersion({ appVersion: '1.0.0', appHash: '00000000-0000-0000-0000-000000000000', assetVersion: '1.0.0.00', dataVersion: '1.0.0.00' })
client.setDevice({ model: 'Pixel 7', osVersion: 'Android 14', id: '00000000-0000-0000-0000-000000000000' })

const system = await client.system.get()
console.log(system)
```


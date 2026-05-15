# libraryapi

[![npm](https://img.shields.io/npm/v/libraryapi.svg)](https://www.npmjs.com/package/libraryapi)
[![Node](https://img.shields.io/node/v/libraryapi.svg)](https://www.npmjs.com/package/libraryapi)

Official Node.js + TypeScript SDK for [libraryapi.dev](https://libraryapi.dev) — US public library facility, hours, services, and statistics data from the federal IMLS Public Libraries Survey. **9,252 systems · 17,586 outlets · FY 2023.**

Zero runtime dependencies. Native `fetch`. Works in Node 18+, Cloudflare Workers, Deno, Bun, and modern browsers.

## Install

```bash
npm install libraryapi
```

## Quickstart

```js
const { LibraryAPI } = require('libraryapi');
// or: import { LibraryAPI } from 'libraryapi';

const client = new LibraryAPI('sk_live_...');  // https://libraryapi.dev/pricing

// Nearest outlets to an address
const outlets = await client.outlets.near({
  address: '14901 Dale Evans Pkwy, Apple Valley, CA',
  radiusMiles: 10,
});
for (const o of outlets) {
  console.log(`${o.distanceMiles.toFixed(2)} mi  ${o.name}  (${o.weeklyHours} hrs/wk)`);
}

// Full parent-system profile (collections, usage, programs, finance)
const system = await client.libraries.fetch(outlets[0].fscsId);
console.log(system.name);                           // San Bernardino County Library
console.log(system.serviceArea.population);         // 1263869
console.log(system.finance.totalRevenue);           // 28327522

// State-level rollup
const ca = await client.states.summary('CA');
console.log(ca.totals.librarySystems, ca.totals.outlets); // 186 1192
```

## TypeScript

Full type definitions ship in the package — no `@types/...` install needed.

```ts
import { LibraryAPI, Outlet, NotFoundError } from 'libraryapi';

const client = new LibraryAPI(process.env.LIBRARYAPI_KEY!);

try {
  const outlet: Outlet = await client.outlets.fetch('CA0109-004');
} catch (e) {
  if (e instanceof NotFoundError) {
    // handle 404
  }
}
```

## API surface

| Method | Returns |
|---|---|
| `client.outlets.near({ address, radiusMiles, limit })` | `Outlet[]` |
| `client.outlets.near({ lat, lng, radiusMiles, limit })` | `Outlet[]` |
| `client.outlets.fetch(outletId)` | `Outlet` |
| `client.libraries.fetch(fscsId)` | `LibrarySystem` |
| `client.libraries.search({ name, state, city, limit, offset })` | `LibrarySystem[]` |
| `client.states.summary(code)` | `StateSummary` |
| `client.health()` | `{ status, db, source }` |

Each `Outlet` has a derived `weeklyHours` property (`round(annualHours / weeksOpen)`).

## Errors

Exception hierarchy:

```
LibraryAPIError
├── AuthenticationError    (401)
├── InvalidParamsError     (400 — bad params or unresolvable address)
├── QuotaExceededError     (402)
├── NotFoundError          (404)
└── RateLimitError         (429)
```

All carry `.statusCode` and `.code` (the API's machine-readable error code).

## Links

- [libraryapi.dev](https://libraryapi.dev)
- [API reference](https://libraryapi.dev/docs)
- [Pricing](https://libraryapi.dev/pricing)
- [LLM-friendly reference](https://libraryapi.dev/llms.txt)
- [Status](https://libraryapi.dev/status)
- [GitHub](https://github.com/library-api/libraryapi-js)
- [Python SDK](https://pypi.org/project/libraryapi-sdk/)

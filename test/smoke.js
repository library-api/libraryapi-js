'use strict';

/**
 * Smoke test for the libraryapi Node.js SDK against api.libraryapi.dev.
 *
 *   LIBRARYAPI_TEST_KEY=sk_live_... node test/smoke.js
 *
 * Non-zero exit on any failure.
 */

const assert = require('node:assert/strict');
const {
  LibraryAPI,
  AuthenticationError,
  InvalidParamsError,
  NotFoundError,
} = require('..');

const KEY = process.env.LIBRARYAPI_TEST_KEY;
if (!KEY) {
  console.error('LIBRARYAPI_TEST_KEY env var required');
  process.exit(1);
}

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

test('health (no auth required path)', async () => {
  const client = new LibraryAPI(KEY);
  const body = await client.health();
  assert.equal(body.db, true);
  assert.equal(body.source.imls_year, 'FY 2023');
});

test('outlets.near by address', async () => {
  const client = new LibraryAPI(KEY);
  const outlets = await client.outlets.near({
    address: '14901 Dale Evans Pkwy, Apple Valley, CA',
    radiusMiles: 10,
    limit: 3,
  });
  assert.ok(outlets.length >= 1, 'expected at least one outlet');
  const top = outlets[0];
  assert.ok(top.name.toLowerCase().includes('apple valley'), `got ${top.name}`);
  assert.equal(top.fscsId, 'CA0109');
  assert.ok(top.distanceMiles < 1, `expected < 1 mi, got ${top.distanceMiles}`);
  assert.ok(top.weeklyHours > 0, 'weeklyHours derived field');
});

test('outlets.near by coords', async () => {
  const client = new LibraryAPI(KEY);
  const outlets = await client.outlets.near({ lat: 34.5008, lng: -117.1825, radiusMiles: 5 });
  assert.ok(outlets.length >= 1);
});

test('outlets.fetch by id', async () => {
  const client = new LibraryAPI(KEY);
  const o = await client.outlets.fetch('CA0109-004');
  assert.equal(o.outletId, 'CA0109-004');
  assert.ok(o.geo && typeof o.geo.lat === 'number');
});

test('libraries.fetch full profile', async () => {
  const client = new LibraryAPI(KEY);
  const sys = await client.libraries.fetch('CA0109');
  assert.equal(sys.fscsId, 'CA0109');
  assert.ok(sys.serviceArea.population > 1_000_000);
  assert.ok(sys.finance.totalRevenue > 0);
  assert.ok(sys.collections.printVolumes > 0);
});

test('libraries.search', async () => {
  const client = new LibraryAPI(KEY);
  const results = await client.libraries.search({ name: 'brooklyn', state: 'NY', limit: 5 });
  assert.ok(results.some((r) => r.name.toLowerCase().includes('brooklyn')));
});

test('states.summary CA', async () => {
  const client = new LibraryAPI(KEY);
  const ca = await client.states.summary('CA');
  assert.equal(ca.state, 'CA');
  assert.ok(ca.totals.librarySystems > 100);
});

test('states.summary invalid → InvalidParamsError', async () => {
  const client = new LibraryAPI(KEY);
  await assert.rejects(client.states.summary('CALIFORNIA'), InvalidParamsError);
});

test('libraries.fetch unknown → NotFoundError', async () => {
  const client = new LibraryAPI(KEY);
  await assert.rejects(client.libraries.fetch('ZZ9999'), NotFoundError);
});

test('bad key → AuthenticationError', async () => {
  const client = new LibraryAPI('sk_live_DEFINITELY_BOGUS');
  await assert.rejects(client.outlets.fetch('CA0109-004'), AuthenticationError);
});

test('constructor requires apiKey', async () => {
  assert.throws(() => new LibraryAPI(), /apiKey is required/);
});

(async function run() {
  let passed = 0;
  let failed = 0;
  for (const { name, fn } of tests) {
    const start = Date.now();
    try {
      await fn();
      const ms = Date.now() - start;
      console.log(`  \x1b[32m✓\x1b[0m ${name}  \x1b[2m${ms}ms\x1b[0m`);
      passed++;
    } catch (err) {
      const ms = Date.now() - start;
      console.error(`  \x1b[31m✗\x1b[0m ${name}  \x1b[2m${ms}ms\x1b[0m`);
      console.error(`     ${err.message}`);
      failed++;
    }
  }
  console.log();
  console.log(`  ${passed} passed · ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
})();

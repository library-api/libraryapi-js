'use strict';

const { request, VERSION } = require('./src/http');
const { OutletResource, LibraryResource, StateResource } = require('./src/resources');
const {
  LibraryAPIError,
  AuthenticationError,
  QuotaExceededError,
  NotFoundError,
  RateLimitError,
  InvalidParamsError,
} = require('./src/errors');

const BASE_URL = 'https://api.libraryapi.dev';

/**
 * Official Node.js client for libraryapi.dev — US public library data API.
 *
 * Requires Node.js 18+, Cloudflare Workers, Deno, or any environment with native fetch.
 *
 * @example
 * const { LibraryAPI } = require('libraryapi');
 * const client = new LibraryAPI('sk_live_...');
 *
 * const outlets = await client.outlets.near({
 *   address: '14901 Dale Evans Pkwy, Apple Valley, CA',
 *   radiusMiles: 10,
 * });
 * console.log(outlets[0].name, outlets[0].distanceMiles);
 *
 * const system = await client.libraries.fetch(outlets[0].fscsId);
 * console.log(system.serviceArea.population);
 */
class LibraryAPI {
  /**
   * @param {string} apiKey                Your libraryapi.dev API key
   * @param {Object} [options]
   * @param {string} [options.baseUrl='https://api.libraryapi.dev']
   * @param {number} [options.timeout=30000] Request timeout in ms
   */
  constructor(apiKey, { baseUrl = BASE_URL, timeout = 30000 } = {}) {
    if (!apiKey) {
      throw new Error('apiKey is required. Get one at https://libraryapi.dev/pricing');
    }

    const req = (method, path, params) =>
      request(baseUrl, apiKey, timeout, method, path, params);

    this.outlets   = new OutletResource(req);
    this.libraries = new LibraryResource(req);
    this.states    = new StateResource(req);

    this._req = req;
  }

  /**
   * Hit /v1/health. Does not require an API key and does not consume credits.
   * @returns {Promise<Object>}
   */
  async health() {
    return this._req('GET', '/v1/health');
  }
}

module.exports = {
  LibraryAPI,
  VERSION,
  // Exceptions
  LibraryAPIError,
  AuthenticationError,
  QuotaExceededError,
  NotFoundError,
  RateLimitError,
  InvalidParamsError,
};

// Named ESM-style default export for `import { LibraryAPI } from 'libraryapi'` users
module.exports.default = LibraryAPI;

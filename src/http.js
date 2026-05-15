'use strict';

const {
  LibraryAPIError,
  AuthenticationError,
  QuotaExceededError,
  NotFoundError,
  RateLimitError,
  InvalidParamsError,
} = require('./errors');

const VERSION = '0.1.0';

async function request(baseUrl, apiKey, timeout, method, path, params) {
  const url = new URL(path, baseUrl);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) {
        url.searchParams.set(k, String(v));
      }
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  let res;
  try {
    res = await fetch(url.toString(), {
      method,
      headers: {
        'X-API-Key': apiKey,
        'User-Agent': `libraryapi-js/${VERSION}`,
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new LibraryAPIError(`Request timed out after ${timeout}ms`);
    }
    throw new LibraryAPIError(err.message);
  }
  clearTimeout(timer);

  let body;
  try {
    body = await res.json();
  } catch {
    body = {};
  }

  if (!res.ok) {
    const detail = body.detail;
    const msg = typeof detail === 'string'
      ? detail
      : (detail?.message ?? res.statusText ?? 'Unknown error');
    const code = typeof detail === 'object' ? (detail?.code ?? null) : null;

    if (res.status === 400) throw new InvalidParamsError(msg, res.status, code);
    if (res.status === 401) throw new AuthenticationError(msg, res.status, code);
    if (res.status === 402) throw new QuotaExceededError(msg, res.status, code);
    if (res.status === 404) throw new NotFoundError(msg, res.status, code);
    if (res.status === 429) throw new RateLimitError(msg, res.status, code);
    throw new LibraryAPIError(msg, res.status, code);
  }

  return body;
}

module.exports = { request, VERSION };

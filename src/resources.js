'use strict';

class OutletResource {
  constructor(req) { this._req = req; }

  /**
   * Find the nearest public library outlets to an address or coordinate.
   * Provide either `address` or `lat`+`lng`.
   *
   * @param {Object} opts
   * @param {string} [opts.address]
   * @param {number} [opts.lat]
   * @param {number} [opts.lng]
   * @param {number} [opts.radiusMiles=10]
   * @param {number} [opts.limit=10]
   * @returns {Promise<Object[]>}
   */
  async near({ address, lat, lng, radiusMiles = 10, limit = 10 } = {}) {
    const body = await this._req('GET', '/v1/outlets', {
      address,
      lat,
      lng,
      radius_miles: radiusMiles,
      limit,
    });
    return body.data.map(addWeeklyHours);
  }

  /**
   * Fetch a single outlet by its compound id, e.g. 'CA0109-004'.
   * @param {string} outletId
   * @returns {Promise<Object>}
   */
  async fetch(outletId) {
    const body = await this._req('GET', `/v1/outlets/${encodeURIComponent(outletId)}`);
    return addWeeklyHours(body.data);
  }
}

class LibraryResource {
  constructor(req) { this._req = req; }

  /**
   * Fetch a library system's full profile by its 6-character FSCSKEY.
   * @param {string} fscsId
   * @returns {Promise<Object>}
   */
  async fetch(fscsId) {
    const body = await this._req('GET', `/v1/libraries/${encodeURIComponent(fscsId.toUpperCase())}`);
    return body.data;
  }

  /**
   * Search library systems by name, state, and/or city.
   * @param {Object} opts
   * @param {string} [opts.name]
   * @param {string} [opts.state]
   * @param {string} [opts.city]
   * @param {number} [opts.limit=20]
   * @param {number} [opts.offset=0]
   * @returns {Promise<Object[]>}
   */
  async search({ name, state, city, limit = 20, offset = 0 } = {}) {
    const body = await this._req('GET', '/v1/libraries/search', { name, state, city, limit, offset });
    return body.data;
  }
}

class StateResource {
  constructor(req) { this._req = req; }

  /**
   * State-level rollup for a 2-letter state code.
   * @param {string} code
   * @returns {Promise<Object>}
   */
  async summary(code) {
    const body = await this._req('GET', `/v1/states/${encodeURIComponent(code.toUpperCase())}/summary`);
    return body.data;
  }
}

function addWeeklyHours(outlet) {
  if (outlet && outlet.service && outlet.service.annualHours && outlet.service.weeksOpen) {
    outlet.weeklyHours = Math.round(outlet.service.annualHours / outlet.service.weeksOpen);
  } else if (outlet) {
    outlet.weeklyHours = null;
  }
  return outlet;
}

module.exports = { OutletResource, LibraryResource, StateResource };

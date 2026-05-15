'use strict';

class LibraryAPIError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.name = 'LibraryAPIError';
    this.statusCode = statusCode ?? null;
    this.code = code ?? null;
  }
}

class AuthenticationError extends LibraryAPIError {
  constructor(m, s, c) { super(m, s, c); this.name = 'AuthenticationError'; }
}

class QuotaExceededError extends LibraryAPIError {
  constructor(m, s, c) { super(m, s, c); this.name = 'QuotaExceededError'; }
}

class NotFoundError extends LibraryAPIError {
  constructor(m, s, c) { super(m, s, c); this.name = 'NotFoundError'; }
}

class RateLimitError extends LibraryAPIError {
  constructor(m, s, c) { super(m, s, c); this.name = 'RateLimitError'; }
}

class InvalidParamsError extends LibraryAPIError {
  constructor(m, s, c) { super(m, s, c); this.name = 'InvalidParamsError'; }
}

module.exports = {
  LibraryAPIError,
  AuthenticationError,
  QuotaExceededError,
  NotFoundError,
  RateLimitError,
  InvalidParamsError,
};

class SwishError extends Error {
  constructor(errors, ...params) {
    super(...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SwishError);
    }

    this.name = 'SwishError';
    this.status = false;
    this.errors = errors;
  }
}

module.exports = SwishError;

/**
 * Custom error classes for cswitch
 */

/**
 * Base error class for cswitch errors
 */
export class CswitchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CswitchError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when configuration file is invalid or corrupted
 */
export class ConfigError extends CswitchError {
  constructor(
    message: string,
    public readonly filePath?: string
  ) {
    super(message);
    this.name = 'ConfigError';
  }
}

/**
 * Error thrown when validation fails (URL format, alias uniqueness, etc.)
 */
export class ValidationError extends CswitchError {
  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Error thrown when a provider or token is not found
 */
export class NotFoundError extends CswitchError {
  constructor(
    message: string,
    public readonly identifier?: string
  ) {
    super(message);
    this.name = 'NotFoundError';
  }
}

/**
 * Error thrown when attempting an invalid operation
 */
export class OperationError extends CswitchError {
  constructor(message: string) {
    super(message);
    this.name = 'OperationError';
  }
}

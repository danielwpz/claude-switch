/**
 * Debug logging utility for cswitch
 * Enable with: export CSWITCH_DEBUG=1
 */

const DEBUG_ENABLED = process.env['CSWITCH_DEBUG'] === '1';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Format timestamp for log messages
 */
function formatTimestamp(): string {
  const now = new Date();
  return now.toISOString();
}

/**
 * Log a debug message (only if CSWITCH_DEBUG=1)
 */
export function debug(message: string, ...args: unknown[]): void {
  if (!DEBUG_ENABLED) return;
  console.error(`[${formatTimestamp()}] [DEBUG] ${message}`, ...args);
}

/**
 * Log an info message (only if CSWITCH_DEBUG=1)
 */
export function info(message: string, ...args: unknown[]): void {
  if (!DEBUG_ENABLED) return;
  console.error(`[${formatTimestamp()}] [INFO] ${message}`, ...args);
}

/**
 * Log a warning message (only if CSWITCH_DEBUG=1)
 */
export function warn(message: string, ...args: unknown[]): void {
  if (!DEBUG_ENABLED) return;
  console.error(`[${formatTimestamp()}] [WARN] ${message}`, ...args);
}

/**
 * Log an error message (always logged)
 */
export function error(message: string, ...args: unknown[]): void {
  console.error(`[${formatTimestamp()}] [ERROR] ${message}`, ...args);
}

/**
 * Measure execution time of a function
 */
export async function measure<T>(label: string, fn: () => T | Promise<T>): Promise<T> {
  if (!DEBUG_ENABLED) {
    return fn();
  }

  const start = performance.now();
  try {
    const result = await fn();
    const duration = (performance.now() - start).toFixed(2);
    debug(`${label} took ${duration}ms`);
    return result;
  } catch (err) {
    const duration = (performance.now() - start).toFixed(2);
    error(`${label} failed after ${duration}ms:`, err);
    throw err;
  }
}

/**
 * Check if debug mode is enabled
 */
export function isDebugEnabled(): boolean {
  return DEBUG_ENABLED;
}

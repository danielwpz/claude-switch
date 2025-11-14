/**
 * Validation utilities for provider configuration
 */

/**
 * Normalize a model field value to either a non-empty string or undefined.
 *
 * Rules:
 * - undefined or null → undefined
 * - empty string "" → undefined
 * - whitespace-only string → undefined
 * - non-empty string (trimmed) → trimmed string
 *
 * @param value - Raw input value (string, undefined, or null)
 * @returns Normalized value (string or undefined)
 */
export function normalizeModelField(value: string | undefined | null): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

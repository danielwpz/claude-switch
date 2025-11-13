/**
 * Configuration validation logic
 * Validates URLs, alias uniqueness, required fields, etc.
 */

import { Config, Provider, Token, LastUsed } from './schema.js';
import { ValidationError } from '../utils/errors.js';

/**
 * Validate a URL format
 */
export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate a token alias (non-empty, max length 50)
 */
export function validateAlias(alias: string): void {
  if (!alias || alias.trim().length === 0) {
    throw new ValidationError('Token alias cannot be empty', 'alias');
  }
  if (alias.length > 50) {
    throw new ValidationError('Token alias must be 50 characters or less', 'alias');
  }
}

/**
 * Validate a token value (non-empty, min length 10)
 */
export function validateTokenValue(value: string): void {
  if (!value || value.trim().length === 0) {
    throw new ValidationError('Token value cannot be empty', 'value');
  }
  if (value.length < 10) {
    throw new ValidationError('Token value must be at least 10 characters', 'value');
  }
}

/**
 * Validate a provider's base URL
 */
export function validateBaseUrl(baseUrl: string): void {
  if (!baseUrl || baseUrl.trim().length === 0) {
    throw new ValidationError('Provider base URL cannot be empty', 'baseUrl');
  }
  if (!validateUrl(baseUrl)) {
    throw new ValidationError('Provider base URL must be a valid HTTP or HTTPS URL', 'baseUrl');
  }
}

/**
 * Validate a provider display name (optional, max length 100)
 */
export function validateDisplayName(displayName: string | undefined): void {
  if (displayName && displayName.length > 100) {
    throw new ValidationError(
      'Provider display name must be 100 characters or less',
      'displayName'
    );
  }
}

/**
 * Validate that a token alias is unique within a provider
 */
export function validateTokenAliasUnique(
  provider: Provider,
  alias: string,
  excludeAlias?: string
): void {
  const existingAliases = provider.tokens.map((t) => t.alias).filter((a) => a !== excludeAlias);

  if (existingAliases.includes(alias)) {
    throw new ValidationError(
      `Token alias "${alias}" already exists in provider "${provider.baseUrl}"`,
      'alias'
    );
  }
}

/**
 * Validate that a provider base URL is unique across all providers
 */
export function validateProviderUnique(
  config: Config,
  baseUrl: string,
  excludeBaseUrl?: string
): void {
  const existingUrls = config.providers
    .map((p) => p.baseUrl)
    .filter((url) => url !== excludeBaseUrl);

  if (existingUrls.includes(baseUrl)) {
    throw new ValidationError(`Provider with base URL "${baseUrl}" already exists`, 'baseUrl');
  }
}

/**
 * Validate that a provider has at least one token
 */
export function validateProviderHasTokens(provider: Provider): void {
  if (!provider.tokens || provider.tokens.length === 0) {
    throw new ValidationError('Provider must have at least one token', 'tokens');
  }
}

/**
 * Validate a complete Token object
 */
export function validateToken(token: Token): void {
  validateAlias(token.alias);
  validateTokenValue(token.value);

  // Validate createdAt is a valid ISO 8601 timestamp
  if (!token.createdAt || isNaN(Date.parse(token.createdAt))) {
    throw new ValidationError('Token createdAt must be a valid ISO 8601 timestamp', 'createdAt');
  }
}

/**
 * Validate a complete Provider object
 */
export function validateProvider(provider: Provider): void {
  validateBaseUrl(provider.baseUrl);
  validateDisplayName(provider.displayName);
  validateProviderHasTokens(provider);

  // Validate createdAt
  if (!provider.createdAt || isNaN(Date.parse(provider.createdAt))) {
    throw new ValidationError('Provider createdAt must be a valid ISO 8601 timestamp', 'createdAt');
  }

  // Validate all tokens
  provider.tokens.forEach((token) => validateToken(token));

  // Validate token alias uniqueness within provider
  const aliases = provider.tokens.map((t) => t.alias);
  const uniqueAliases = new Set(aliases);
  if (aliases.length !== uniqueAliases.size) {
    throw new ValidationError('Token aliases must be unique within a provider', 'tokens');
  }
}

/**
 * Validate lastUsed references exist in config
 */
export function validateLastUsed(config: Config, lastUsed: LastUsed): void {
  const provider = config.providers.find((p) => p.baseUrl === lastUsed.providerUrl);
  if (!provider) {
    throw new ValidationError(
      `LastUsed references non-existent provider: ${lastUsed.providerUrl}`,
      'lastUsed.providerUrl'
    );
  }

  const token = provider.tokens.find((t) => t.alias === lastUsed.tokenAlias);
  if (!token) {
    throw new ValidationError(
      `LastUsed references non-existent token: ${lastUsed.tokenAlias}`,
      'lastUsed.tokenAlias'
    );
  }
}

/**
 * Validate a complete Config object
 */
export function validateConfig(config: Config): void {
  // Validate version
  if (config.version !== '1.0') {
    throw new ValidationError(
      `Unsupported config version: ${config.version}. Expected: 1.0`,
      'version'
    );
  }

  // Validate providers array exists
  if (!Array.isArray(config.providers)) {
    throw new ValidationError('Config must have a providers array', 'providers');
  }

  // Validate each provider
  config.providers.forEach((provider) => validateProvider(provider));

  // Validate provider baseUrl uniqueness
  const baseUrls = config.providers.map((p) => p.baseUrl);
  const uniqueBaseUrls = new Set(baseUrls);
  if (baseUrls.length !== uniqueBaseUrls.size) {
    throw new ValidationError('Provider base URLs must be unique', 'providers');
  }

  // Validate lastUsed if set
  if (config.lastUsed) {
    validateLastUsed(config, config.lastUsed);
  }
}

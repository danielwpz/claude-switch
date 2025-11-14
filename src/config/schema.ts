/**
 * Type definitions for cswitch configuration
 * Based on data-model.md from specs/001-claude-env-switcher/
 */

/**
 * Represents an authentication token for a provider
 */
export interface Token {
  /** Unique alias within the provider (e.g., "work-account", "personal") */
  alias: string;
  /** The ANTHROPIC_AUTH_TOKEN value */
  value: string;
  /** ISO 8601 timestamp when token was created */
  createdAt: string;
}

/**
 * Represents a Claude API provider (base URL) with its tokens
 */
export interface Provider {
  /** Unique ANTHROPIC_BASE_URL (e.g., "https://api.provider-a.com") */
  baseUrl: string;
  /** Optional human-friendly display name */
  displayName?: string;
  /** ISO 8601 timestamp when provider was created */
  createdAt: string;
  /** Array of authentication tokens (minimum 1 required) */
  tokens: Token[];
  /** Optional Claude model identifier for ANTHROPIC_MODEL (e.g., "claude-3-5-sonnet-20241022") */
  anthropicModel?: string;
  /** Optional Claude model identifier for ANTHROPIC_SMALL_FAST_MODEL (e.g., "claude-3-5-haiku-20241022") */
  anthropicSmallFastModel?: string;
}

/**
 * Tracks the last-used provider and token for auto-loading
 */
export interface LastUsed {
  /** References Provider.baseUrl */
  providerUrl: string;
  /** References Token.alias within the provider */
  tokenAlias: string;
}

/**
 * Root configuration object stored in ~/.cswitch/config.json
 */
export interface Config {
  /** Schema version for future migrations */
  version: string;
  /** Last selected configuration, or null if never set */
  lastUsed: LastUsed | null;
  /** List of all configured providers (can be empty) */
  providers: Provider[];
}

/**
 * Default empty configuration
 */
export const DEFAULT_CONFIG: Config = {
  version: '1.0',
  lastUsed: null,
  providers: [],
};

/**
 * Configuration file path
 */
export const CONFIG_DIR = '.cswitch';
export const CONFIG_FILE = 'config.json';

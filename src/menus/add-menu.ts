/**
 * Add provider and token menus
 * Handles user input for adding new providers and tokens
 */

import { Config, Provider } from '../config/schema.js';
import { textPrompt, passwordPrompt, selectPrompt, PromptChoice } from '../ui/prompts.js';
import { validateUrl } from '../config/validation.js';
import { debug } from '../utils/logger.js';

/**
 * Prompt for new provider base URL
 */
export async function promptProviderUrl(): Promise<string | null> {
  debug('Prompting for provider base URL');

  const url = await textPrompt('Enter provider base URL:', '', (value: string) => {
    if (!value || value.trim().length === 0) {
      return 'Base URL is required';
    }
    if (!validateUrl(value)) {
      return 'Must be a valid HTTPS or HTTP URL (e.g., https://api.provider.com)';
    }
    return true;
  });

  return url;
}

/**
 * Prompt for optional provider display name
 */
export async function promptProviderDisplayName(): Promise<string | undefined> {
  debug('Prompting for provider display name');

  const name = await textPrompt('Enter display name (optional):', '');

  return name || undefined;
}

/**
 * Prompt for token alias
 */
export async function promptTokenAlias(defaultValue?: string): Promise<string | null> {
  debug('Prompting for token alias');

  const alias = await textPrompt(
    'Enter token alias (e.g., work-account):',
    defaultValue || '',
    (value: string) => {
      if (!value || value.trim().length === 0) {
        return 'Token alias is required';
      }
      if (value.length > 50) {
        return 'Token alias must be 50 characters or less';
      }
      return true;
    }
  );

  return alias;
}

/**
 * Prompt for token value (masked input)
 */
export async function promptTokenValue(): Promise<string | null> {
  debug('Prompting for token value');

  const token = await passwordPrompt('Enter auth token (hidden):', (value: string) => {
    if (!value || value.trim().length === 0) {
      return 'Token value is required';
    }
    if (value.length < 10) {
      return 'Token value must be at least 10 characters';
    }
    return true;
  });

  return token;
}

/**
 * Get user input for adding a new provider (with first token)
 */
export async function getNewProviderInput(): Promise<{
  baseUrl: string;
  displayName?: string;
  tokenAlias: string;
  tokenValue: string;
} | null> {
  debug('Starting add provider flow');

  const baseUrl = await promptProviderUrl();
  if (!baseUrl) return null;

  const displayName = await promptProviderDisplayName();

  const tokenAlias = await promptTokenAlias('default');
  if (!tokenAlias) return null;

  const tokenValue = await promptTokenValue();
  if (!tokenValue) return null;

  return { baseUrl, displayName, tokenAlias, tokenValue };
}

/**
 * Display menu to select provider for adding token
 */
export async function selectProviderForNewToken(config: Config): Promise<Provider | null> {
  debug('Showing provider selection for token addition');

  if (config.providers.length === 0) {
    return null;
  }

  const choices: PromptChoice[] = config.providers.map((provider) => ({
    title: `${provider.displayName || provider.baseUrl} (${provider.tokens.length} token(s))`,
    value: provider.baseUrl,
  }));

  const selectedBaseUrl = await selectPrompt('Select provider to add token to:', choices);

  if (!selectedBaseUrl) {
    return null;
  }

  const provider = config.providers.find((p) => p.baseUrl === selectedBaseUrl);
  return provider || null;
}

/**
 * Get user input for adding a new token to provider
 */
export async function getNewTokenInput(provider: Provider): Promise<{
  alias: string;
  value: string;
} | null> {
  debug(`Starting add token flow for provider: ${provider.baseUrl}`);

  const alias = await promptTokenAlias();
  if (!alias) return null;

  // Check alias uniqueness
  if (provider.tokens.some((t) => t.alias === alias)) {
    console.log(`✗ Token alias "${alias}" already exists in this provider`);
    return null;
  }

  const value = await promptTokenValue();
  if (!value) return null;

  return { alias, value };
}

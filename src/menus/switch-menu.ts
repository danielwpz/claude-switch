/**
 * Switch configuration menu
 * Allows user to select provider, then token
 */

import { Config, Provider, Token } from '../config/schema.js';
import { selectPrompt, PromptChoice } from '../ui/prompts.js';
import { formatProviderChoice, formatTokenChoice } from '../ui/formatters.js';
import { debug } from '../utils/logger.js';

/**
 * Display provider selection menu
 */
export async function selectProvider(config: Config): Promise<Provider | null> {
  debug('Showing provider selection menu');

  if (config.providers.length === 0) {
    return null;
  }

  const choices: PromptChoice[] = config.providers.map((provider) => ({
    title: formatProviderChoice(provider, false),
    value: provider.baseUrl,
    description: `${provider.tokens.length} token(s)`,
  }));

  const selectedBaseUrl = await selectPrompt('Select a provider:', choices);

  if (!selectedBaseUrl) {
    debug('User cancelled provider selection');
    return null;
  }

  const provider = config.providers.find((p) => p.baseUrl === selectedBaseUrl);
  debug(`Selected provider: ${selectedBaseUrl}`);
  return provider || null;
}

/**
 * Display token selection menu for a provider
 */
export async function selectToken(provider: Provider): Promise<Token | null> {
  debug(`Showing token selection menu for provider: ${provider.baseUrl}`);

  if (provider.tokens.length === 0) {
    return null;
  }

  const choices: PromptChoice[] = provider.tokens.map((token) => ({
    title: formatTokenChoice(token, false),
    value: token.alias,
    description: `Added: ${new Date(token.createdAt).toLocaleDateString()}`,
  }));

  const selectedAlias = await selectPrompt(
    'Select a token:',
    choices
  );

  if (!selectedAlias) {
    debug('User cancelled token selection');
    return null;
  }

  const token = provider.tokens.find((t) => t.alias === selectedAlias);
  debug(`Selected token: ${selectedAlias}`);
  return token || null;
}

/**
 * Complete switch flow: select provider, then token
 */
export async function selectConfiguration(config: Config): Promise<{
  provider: Provider;
  token: Token;
} | null> {
  debug('Starting switch configuration flow');

  const provider = await selectProvider(config);
  if (!provider) {
    return null;
  }

  const token = await selectToken(provider);
  if (!token) {
    return null;
  }

  return { provider, token };
}

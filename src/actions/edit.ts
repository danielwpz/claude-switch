/**
 * Edit action
 * Allows editing provider or token details
 */

import { Config, Provider, Token } from '../config/schema.js';
import { selectProviderToManage } from '../menus/manage-menu.js';
import { selectPrompt, textPrompt, passwordPrompt, PromptChoice } from '../ui/prompts.js';
import { writeConfig } from '../config/config.js';
import { validateUrl } from '../config/validation.js';
import { debug } from '../utils/logger.js';

/**
 * Edit provider or token details
 */
export async function editConfiguration(config: Config): Promise<void> {
  debug('Starting edit action');

  const provider = await selectProviderToManage(config);
  if (!provider) {
    process.exit(0);
  }

  // Choose what to edit
  const editChoices: PromptChoice[] = [
    {
      title: 'Edit provider base URL',
      value: 'provider-url',
      description: 'Change the API endpoint',
    },
    {
      title: 'Edit provider name',
      value: 'provider-name',
      description: 'Change display name',
    },
    {
      title: 'Edit token alias',
      value: 'token-alias',
      description: 'Rename a token',
    },
    {
      title: 'Edit token value',
      value: 'token-value',
      description: 'Update auth token',
    },
  ];

  const editType = await selectPrompt('What would you like to edit?', editChoices);

  if (!editType) {
    process.exit(0);
  }

  switch (editType) {
    case 'provider-url':
      await editProviderUrl(config, provider);
      break;
    case 'provider-name':
      await editProviderName(provider);
      break;
    case 'token-alias':
      await editTokenAlias(provider);
      break;
    case 'token-value':
      await editTokenValue(provider);
      break;
  }

  // Save config after edit
  try {
    await writeConfig(config);
    console.log('✓ Configuration updated');
  } catch (error) {
    console.error('✗ Failed to save configuration');
    process.exit(1);
  }
}

async function editProviderUrl(config: Config, provider: Provider): Promise<void> {
  const newUrl = await textPrompt(
    'Enter new provider base URL:',
    provider.baseUrl,
    (value: string) => {
      if (!value || value.trim().length === 0) {
        return 'URL is required';
      }
      if (!validateUrl(value)) {
        return 'Must be a valid HTTPS or HTTP URL';
      }
      // Check uniqueness (excluding current URL)
      if (config.providers.some((p) => p.baseUrl === value && p.baseUrl !== provider.baseUrl)) {
        return 'This URL is already in use';
      }
      return true;
    }
  );

  if (newUrl) {
    provider.baseUrl = newUrl;
    debug(`Provider URL updated to: ${newUrl}`);
  }
}

async function editProviderName(provider: Provider): Promise<void> {
  const newName = await textPrompt(
    'Enter new provider display name (or leave blank to remove):',
    provider.displayName || ''
  );

  if (newName !== null) {
    provider.displayName = newName || undefined;
    debug(`Provider name updated to: ${newName || '(removed)'}`);
  }
}

async function editTokenAlias(provider: Provider): Promise<void> {
  if (provider.tokens.length === 0) {
    console.log('✗ No tokens to edit');
    return;
  }

  const choices: PromptChoice[] = provider.tokens.map((t: Token) => ({
    title: t.alias,
    value: t.alias,
  }));

  const tokenAlias = await selectPrompt('Select token to rename:', choices);
  if (!tokenAlias) return;

  const token = provider.tokens.find((t: Token) => t.alias === tokenAlias);
  if (!token) return;

  const newAlias = await textPrompt('Enter new token alias:', token.alias, (value: string) => {
    if (!value || value.trim().length === 0) {
      return 'Alias is required';
    }
    if (value.length > 50) {
      return 'Alias must be 50 characters or less';
    }
    // Check uniqueness within provider
    if (provider.tokens.some((t: Token) => t.alias === value && t.alias !== token.alias)) {
      return 'This alias already exists in this provider';
    }
    return true;
  });

  if (newAlias) {
    token.alias = newAlias;
    debug(`Token alias updated to: ${newAlias}`);
  }
}

async function editTokenValue(provider: Provider): Promise<void> {
  if (provider.tokens.length === 0) {
    console.log('✗ No tokens to edit');
    return;
  }

  const choices: PromptChoice[] = provider.tokens.map((t: Token) => ({
    title: t.alias,
    value: t.alias,
  }));

  const tokenAlias = await selectPrompt('Select token to update:', choices);
  if (!tokenAlias) return;

  const token = provider.tokens.find((t: Token) => t.alias === tokenAlias);
  if (!token) return;

  const newValue = await passwordPrompt('Enter new token value:', (value: string) => {
    if (!value || value.trim().length === 0) {
      return 'Token value is required';
    }
    if (value.length < 10) {
      return 'Token must be at least 10 characters';
    }
    return true;
  });

  if (newValue) {
    token.value = newValue;
    debug('Token value updated');
  }
}

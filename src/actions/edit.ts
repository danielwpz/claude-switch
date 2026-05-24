/**
 * Edit action
 * Allows editing provider or token details
 */

import { Config, Provider, Token, EnvVar } from '../config/schema.js';
import { selectProviderToManage } from '../menus/manage-menu.js';
import {
  selectPrompt,
  textPrompt,
  passwordPrompt,
  confirmPrompt,
  PromptChoice,
} from '../ui/prompts.js';
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
    {
      title: 'Edit environment variables',
      value: 'env-vars',
      description: 'Add, edit, or remove custom env vars',
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
    case 'env-vars':
      await editEnvVars(provider);
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
      return 'Token alias must be 50 characters or less';
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

async function editEnvVars(provider: Provider): Promise<void> {
  // Initialize envVars array if needed
  if (!provider.envVars) {
    provider.envVars = [];
  }

  const actionChoices: PromptChoice[] = [
    { title: 'Add new env var', value: 'add', description: 'Add a new key-value pair' },
  ];

  if (provider.envVars.length > 0) {
    actionChoices.push({
      title: 'Edit existing env var',
      value: 'edit',
      description: 'Modify an existing env var',
    });
    actionChoices.push({
      title: 'Delete env var',
      value: 'delete',
      description: 'Remove an env var',
    });
  }

  const action = await selectPrompt('What would you like to do with env vars?', actionChoices);
  if (!action) return;

  switch (action) {
    case 'add':
      await addEnvVar(provider);
      break;
    case 'edit':
      await editEnvVar(provider);
      break;
    case 'delete':
      await deleteEnvVar(provider);
      break;
  }
}

async function addEnvVar(provider: Provider): Promise<void> {
  const key = await textPrompt('Enter env var key:', '', (value: string) => {
    if (!value || value.trim().length === 0) {
      return 'Key is required';
    }
    if (!/^[A-Z_][A-Z0-9_]*$/i.test(value)) {
      return 'Key should be alphanumeric with underscores (e.g., ANTHROPIC_MODEL)';
    }
    // Check for duplicates
    if (provider.envVars?.some((e) => e.key === value)) {
      return 'This key already exists';
    }
    return true;
  });
  if (!key) return;

  const value = await textPrompt('Enter env var value:', '');
  if (!value) return;

  provider.envVars!.push({ key: key.trim(), value });
  debug(`Env var added: ${key}`);
}

async function editEnvVar(provider: Provider): Promise<void> {
  const choices: PromptChoice[] = provider.envVars!.map((e: EnvVar) => ({
    title: `${e.key}=${e.value}`,
    value: e.key,
  }));

  const selectedKey = await selectPrompt('Select env var to edit:', choices);
  if (!selectedKey) return;

  const envVar = provider.envVars!.find((e: EnvVar) => e.key === selectedKey);
  if (!envVar) return;

  const newKey = await textPrompt('Enter new key:', envVar.key, (value: string) => {
    if (!value || value.trim().length === 0) {
      return 'Key is required';
    }
    if (!/^[A-Z_][A-Z0-9_]*$/i.test(value)) {
      return 'Key should be alphanumeric with underscores';
    }
    // Check for duplicates (excluding self)
    if (provider.envVars?.some((e) => e.key === value && e.key !== selectedKey)) {
      return 'This key already exists';
    }
    return true;
  });
  if (!newKey) return;

  const newValue = await textPrompt('Enter new value:', envVar.value);
  if (!newValue) return;

  envVar.key = newKey.trim();
  envVar.value = newValue;
  debug(`Env var updated: ${newKey}`);
}

async function deleteEnvVar(provider: Provider): Promise<void> {
  const choices: PromptChoice[] = provider.envVars!.map((e: EnvVar) => ({
    title: `${e.key}=${e.value}`,
    value: e.key,
  }));

  const selectedKey = await selectPrompt('Select env var to delete:', choices);
  if (!selectedKey) return;

  const confirmed = await confirmPrompt(`Delete "${selectedKey}"?`, false);
  if (!confirmed) return;

  provider.envVars = provider.envVars!.filter((e: EnvVar) => e.key !== selectedKey);
  debug(`Env var deleted: ${selectedKey}`);
}

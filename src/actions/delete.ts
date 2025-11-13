/**
 * Delete action
 * Allows deleting providers or tokens
 */

import { Config } from '../config/schema.js';
import { selectProviderToManage, confirmDeletion } from '../menus/manage-menu.js';
import { selectPrompt, PromptChoice } from '../ui/prompts.js';
import { writeConfig } from '../config/config.js';
import { debug } from '../utils/logger.js';

/**
 * Delete provider or token
 */
export async function deleteConfiguration(config: Config): Promise<void> {
  debug('Starting delete action');

  const provider = await selectProviderToManage(config);
  if (!provider) {
    process.exit(0);
  }

  // Choose what to delete
  const deleteChoices: PromptChoice[] = [
    {
      title: 'Delete entire provider',
      value: 'provider',
      description: 'Remove provider and all its tokens',
    },
    {
      title: 'Delete specific token',
      value: 'token',
      description: 'Remove only one token',
    },
  ];

  const deleteType = await selectPrompt('What would you like to delete?', deleteChoices);

  if (!deleteType) {
    process.exit(0);
  }

  switch (deleteType) {
    case 'provider':
      await deleteProvider(config, provider);
      break;
    case 'token':
      await deleteToken(config, provider);
      break;
  }

  // Save config after delete
  try {
    await writeConfig(config);
    console.log('✓ Configuration deleted');
  } catch (error) {
    console.error('✗ Failed to save configuration');
    process.exit(1);
  }
}

async function deleteProvider(config: Config, provider: any): Promise<void> {
  const confirmed = await confirmDeletion(`${provider.displayName || provider.baseUrl}`);
  if (!confirmed) {
    console.log('Deletion cancelled');
    return;
  }

  // If this provider is in lastUsed, clear lastUsed
  if (config.lastUsed?.providerUrl === provider.baseUrl) {
    config.lastUsed = null;
    console.log('⚠ Cleared last-used configuration');
  }

  // Remove provider from config
  const index = config.providers.indexOf(provider);
  if (index > -1) {
    config.providers.splice(index, 1);
    debug(`Provider deleted: ${provider.baseUrl}`);
  }
}

async function deleteToken(config: Config, provider: any): Promise<void> {
  if (provider.tokens.length === 0) {
    console.log('✗ No tokens to delete');
    return;
  }

  // Don't allow deleting the last token
  if (provider.tokens.length === 1) {
    console.log('✗ Cannot delete the last token. Delete the provider instead.');
    return;
  }

  const choices: PromptChoice[] = provider.tokens.map((t: any) => ({
    title: t.alias,
    value: t.alias,
  }));

  const tokenAlias = await selectPrompt('Select token to delete:', choices);
  if (!tokenAlias) return;

  const token = provider.tokens.find((t: any) => t.alias === tokenAlias);
  if (!token) return;

  const confirmed = await confirmDeletion(tokenAlias);
  if (!confirmed) {
    console.log('Deletion cancelled');
    return;
  }

  // If this token is in lastUsed, clear lastUsed
  if (config.lastUsed?.providerUrl === provider.baseUrl && config.lastUsed?.tokenAlias === tokenAlias) {
    config.lastUsed = null;
    console.log('⚠ Cleared last-used configuration');
  }

  // Remove token from provider
  const index = provider.tokens.indexOf(token);
  if (index > -1) {
    provider.tokens.splice(index, 1);
    debug(`Token deleted: ${tokenAlias}`);
  }
}

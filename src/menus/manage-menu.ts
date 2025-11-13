/**
 * Manage menu
 * Options for listing, editing, and deleting configurations
 */

import { Config, Provider } from '../config/schema.js';
import { selectPrompt, PromptChoice, confirmPrompt } from '../ui/prompts.js';
import { debug } from '../utils/logger.js';

export type ManageAction = 'list' | 'edit' | 'delete' | null;

/**
 * Display manage menu and get action
 */
export async function showManageMenu(): Promise<ManageAction> {
  debug('Showing manage menu');

  const choices: PromptChoice[] = [
    {
      title: 'List configurations',
      value: 'list',
      description: 'View all providers and tokens',
    },
    {
      title: 'Edit provider or token',
      value: 'edit',
      description: 'Modify existing configurations',
    },
    {
      title: 'Delete provider or token',
      value: 'delete',
      description: 'Remove configurations',
    },
  ];

  const result = await selectPrompt('What would you like to do?', choices);
  return (result as ManageAction) || null;
}

/**
 * Select provider to manage
 */
export async function selectProviderToManage(config: Config): Promise<Provider | null> {
  debug('Showing provider selection for manage');

  if (config.providers.length === 0) {
    console.log('ℹ No providers configured');
    return null;
  }

  const choices: PromptChoice[] = config.providers.map((provider) => ({
    title: `${provider.displayName || provider.baseUrl} (${provider.tokens.length} token(s))`,
    value: provider.baseUrl,
  }));

  const selectedBaseUrl = await selectPrompt('Select provider to manage:', choices);

  if (!selectedBaseUrl) {
    return null;
  }

  const provider = config.providers.find((p) => p.baseUrl === selectedBaseUrl);
  return provider || null;
}

/**
 * Confirm deletion with user
 */
export async function confirmDeletion(itemName: string): Promise<boolean> {
  const confirmed = await confirmPrompt(`Delete "${itemName}"? This cannot be undone.`, false);
  return confirmed === true;
}

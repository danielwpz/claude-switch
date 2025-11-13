/**
 * Main action menu
 * Displays primary actions: Switch, Add Provider, Add Token, Manage
 */

import { Config } from '../config/schema.js';
import { selectPrompt, PromptChoice } from '../ui/prompts.js';
import { debug } from '../utils/logger.js';

export type MenuAction = 'switch' | 'add-provider' | 'add-token' | 'manage' | null;

/**
 * Display main menu and get user's action selection
 */
export async function showMainMenu(config: Config): Promise<MenuAction> {
  debug('Showing main menu');

  const choices: PromptChoice[] = [];

  // Always show switch if there are providers
  if (config.providers.length > 0) {
    choices.push({
      title: 'Switch configuration',
      value: 'switch',
      description: 'Switch to a different provider/token',
    });
  }

  // Always show add provider
  choices.push({
    title: 'Add provider',
    value: 'add-provider',
    description: 'Add a new API provider',
  });

  // Show add token if there are providers
  if (config.providers.length > 0) {
    choices.push({
      title: 'Add token',
      value: 'add-token',
      description: 'Add a token to existing provider',
    });
  }

  // Always show manage
  choices.push({
    title: 'Manage configurations',
    value: 'manage',
    description: 'List, edit, rename, or delete',
  });

  const result = await selectPrompt('What would you like to do?', choices);

  return (result as MenuAction) || null;
}

/**
 * Get user-friendly description of action
 */
export function getActionDescription(action: MenuAction): string {
  switch (action) {
    case 'switch':
      return 'Switch configuration';
    case 'add-provider':
      return 'Add provider';
    case 'add-token':
      return 'Add token';
    case 'manage':
      return 'Manage configurations';
    case null:
      return 'Cancelled';
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

/**
 * Switch action
 * Handles switching to a different provider and token
 */

import { Config } from '../config/schema.js';
import { writeConfig } from '../config/config.js';
import { selectConfiguration } from '../menus/switch-menu.js';
import { outputShellCommands } from '../shell/export.js';
import { debug } from '../utils/logger.js';

/**
 * Switch to a selected provider and token
 * Updates lastUsed in config and outputs shell commands
 */
export async function switchConfiguration(config: Config, silent: boolean = false): Promise<void> {
  debug('Starting switch action');

  const selected = await selectConfiguration(config);
  if (!selected) {
    debug('Switch cancelled by user');
    process.exit(0);
  }

  const { provider, token } = selected;

  // Update config with new lastUsed
  config.lastUsed = {
    providerUrl: provider.baseUrl,
    tokenAlias: token.alias,
  };

  // Save config
  await writeConfig(config);
  debug(`Config updated with new lastUsed: ${provider.baseUrl} - ${token.alias}`);

  // Output shell commands to be eval'd by parent shell
  const providerName = provider.displayName || provider.baseUrl;
  outputShellCommands(
    provider.baseUrl,
    token.value,
    providerName,
    token.alias,
    silent,
    provider.anthropicModel,
    provider.anthropicSmallFastModel
  );
}

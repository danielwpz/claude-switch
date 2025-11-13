/**
 * Add token action
 * Handles adding a new token to an existing provider
 */

import { Config } from '../config/schema.js';
import { writeConfig } from '../config/config.js';
import { selectProviderForNewToken, getNewTokenInput } from '../menus/add-menu.js';
import { debug } from '../utils/logger.js';

/**
 * Add a new token to an existing provider
 */
export async function addToken(config: Config): Promise<void> {
  debug('Starting add token action');

  // Select provider
  const provider = await selectProviderForNewToken(config);
  if (!provider) {
    debug('Add token cancelled by user');
    process.exit(0);
  }

  // Get token input
  const input = await getNewTokenInput(provider);
  if (!input) {
    debug('Add token input cancelled');
    process.exit(0);
  }

  const { alias, value } = input;

  // Add token to provider
  const now = new Date().toISOString();
  provider.tokens.push({
    alias,
    value,
    createdAt: now,
  });

  // Save config
  try {
    await writeConfig(config);
    debug(`Token added to provider: ${provider.baseUrl}`);
  } catch (error) {
    console.error('✗ Failed to save token');
    process.exit(1);
  }

  // Show success message
  const providerName = provider.displayName || provider.baseUrl;
  console.log(`✓ Added token "${alias}" to ${providerName}`);
}

/**
 * Add provider action
 * Handles adding a new provider with an initial token
 */

import { Config, Provider } from '../config/schema.js';
import { writeConfig } from '../config/config.js';
import { getNewProviderInput } from '../menus/add-menu.js';
import { validateProviderUnique } from '../config/validation.js';
import { ValidationError } from '../utils/errors.js';
import { debug } from '../utils/logger.js';

/**
 * Add a new provider with an initial token
 */
export async function addProvider(config: Config): Promise<void> {
  debug('Starting add provider action');

  const input = await getNewProviderInput();
  if (!input) {
    debug('Add provider cancelled by user');
    process.exit(0);
  }

  const { baseUrl, displayName, tokenAlias, tokenValue, anthropicModel, anthropicSmallFastModel } =
    input;

  // Validate provider doesn't already exist
  try {
    validateProviderUnique(config, baseUrl);
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(`✗ ${error.message}`);
    } else {
      console.error('✗ Failed to validate provider');
    }
    process.exit(1);
  }

  // Create new provider with initial token
  const now = new Date().toISOString();
  const newProvider: Provider = {
    baseUrl,
    displayName,
    createdAt: now,
    tokens: [
      {
        alias: tokenAlias,
        value: tokenValue,
        createdAt: now,
      },
    ],
    anthropicModel,
    anthropicSmallFastModel,
  };

  // Add to config
  config.providers.push(newProvider);

  // Save config
  try {
    await writeConfig(config);
    debug(`Provider added: ${baseUrl}`);
  } catch (error) {
    console.error('✗ Failed to save provider');
    process.exit(1);
  }

  // Show success message
  console.log(`✓ Added provider: ${displayName || baseUrl}`);
  console.log(`✓ Added token: ${tokenAlias}`);
}

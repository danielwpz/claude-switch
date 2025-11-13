/**
 * List action
 * Displays all providers and tokens with active indicators
 */

import { Config } from '../config/schema.js';
import { formatProviderList, formatConfigSummary } from '../ui/formatters.js';
import { debug } from '../utils/logger.js';

/**
 * List all configurations (providers and tokens)
 */
export function listConfigurations(config: Config): void {
  debug('Listing configurations');

  console.log('');
  console.log(
    formatConfigSummary(
      config.providers.length,
      config.providers.reduce((sum, p) => sum + p.tokens.length, 0),
      config.lastUsed?.providerUrl,
      config.lastUsed?.tokenAlias
    )
  );
  console.log('');

  console.log(
    formatProviderList(config.providers, config.lastUsed?.providerUrl, config.lastUsed?.tokenAlias)
  );
}

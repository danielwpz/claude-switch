/**
 * Claude action
 * Launches the claude CLI with last-selected provider/token configuration
 */

import { spawn } from 'child_process';
import { Config } from '../config/schema.js';
import { debug } from '../utils/logger.js';

/**
 * Launch claude CLI with provider env vars
 */
export async function launchClaude(config: Config, args: string[]): Promise<void> {
  debug('Starting claude action');

  if (!config.lastUsed) {
    console.error('✗ No provider selected. Run "cswitch" first to choose a provider.');
    process.exit(1);
  }

  // Find the provider and token
  const provider = config.providers.find((p) => p.baseUrl === config.lastUsed?.providerUrl);
  const token = provider?.tokens.find((t) => t.alias === config.lastUsed?.tokenAlias);

  if (!provider || !token) {
    console.error('✗ Selected provider/token not found. Run "cswitch" to choose a provider.');
    process.exit(1);
  }

  // Prepare environment variables
  const env = {
    ...process.env,
    ANTHROPIC_BASE_URL: provider.baseUrl,
    ANTHROPIC_AUTH_TOKEN: token.value,
  };

  debug(`Launching claude with provider: ${provider.baseUrl}`);
  debug(`Token alias: ${token.alias}`);
  debug(`Args: ${args.join(' ')}`);

  // Spawn claude process with inherited stdio for full interactivity
  const child = spawn('claude', args, {
    env,
    stdio: 'inherit',
  });

  // Wait for process to exit
  await new Promise<void>((resolve, reject) => {
    child.on('exit', (code) => {
      if (code !== 0) {
        debug(`Claude exited with code: ${code}`);
      }
      resolve();
    });

    child.on('error', (err) => {
      console.error('✗ Failed to launch claude:', err.message);
      reject(err);
    });
  });
}

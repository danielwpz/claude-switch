/**
 * cswitch CLI entry point
 * Minimal CLI with menu-driven interface
 */

import { loadConfig } from './config/config.js';
import { addShellIntegration, detectShellProfile } from './shell/init.js';
import { showMainMenu } from './menus/main-menu.js';
import { switchConfiguration } from './actions/switch.js';
import { addProvider } from './actions/add-provider.js';
import { addToken } from './actions/add-token.js';
import { listConfigurations } from './actions/list.js';
import { manageConfigurations } from './actions/manage.js';
import { launchClaude } from './actions/claude.js';
import { outputShellCommands } from './shell/export.js';
import { setupPrompts } from './ui/prompts.js';
import { debug } from './utils/logger.js';

/**
 * Parse command line arguments
 */
function parseArgs(): {
  init: boolean;
  silent: boolean;
  autoLoad: boolean;
  list: boolean;
  version: boolean;
  help: boolean;
} {
  const args = process.argv.slice(2);
  return {
    init: args.includes('init'),
    silent: args.includes('--silent'),
    autoLoad: args.includes('--auto-load'),
    list: args.includes('--list'),
    version: args.includes('--version'),
    help: args.includes('--help'),
  };
}

/**
 * Show version
 */
function showVersion(): void {
  console.log('cswitch version 1.0.0');
}

/**
 * Show help
 */
function showHelp(): void {
  console.log(`
cswitch - Manage multiple Claude API provider configurations

USAGE:
  cswitch [COMMAND] [OPTIONS]

COMMANDS:
  init                  Initialize shell integration (one-time setup)
  claude [ARGS]         Launch claude CLI with selected provider config

OPTIONS:
  --silent              Suppress success messages (used by shell hook)
  --auto-load           Auto-load last-used configuration
  --list                List all providers and tokens
  --version             Show version
  --help                Show this help

EXAMPLES:
  cswitch               Show main menu
  cswitch init          Set up shell integration
  cswitch --list        List all providers and tokens
  cswitch claude        Launch claude with last-selected provider
  cswitch claude -c     Launch claude with conversation mode

CONFIGURATION:
  ~/.cswitch/config.json    Configuration file

For more information, visit: https://github.com/anthropics/cswitch
  `);
}

/**
 * Main entry point
 */
export async function main(): Promise<void> {
  setupPrompts();

  const rawArgs = process.argv.slice(2);

  // Check for claude subcommand first (before parseArgs)
  if (rawArgs.length > 0 && rawArgs[0] === 'claude') {
    debug('Running claude subcommand');
    const config = await loadConfig();
    const claudeArgs = rawArgs.slice(1);
    await launchClaude(config, claudeArgs);
    return;
  }

  const args = parseArgs();

  // Handle simple flags
  if (args.version) {
    showVersion();
    return;
  }

  if (args.help) {
    showHelp();
    return;
  }

  // Load configuration
  debug('Loading configuration');
  const config = await loadConfig();

  // Handle init
  if (args.init) {
    debug('Running init');
    try {
      const profilePath = detectShellProfile();
      if (!profilePath) {
        console.log('✗ Could not detect shell profile');
        console.log('  Supported shells: zsh, bash');
        process.exit(1);
      }

      await addShellIntegration(profilePath);
      console.log(`✓ Shell integration added to: ${profilePath}`);
      console.log(`✓ Restart your terminal or run: source ${profilePath}`);
      return;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`✗ ${error.message}`);
      } else {
        console.error('✗ Failed to initialize shell integration');
      }
      process.exit(1);
    }
  }

  // Handle auto-load
  if (args.autoLoad) {
    debug('Running auto-load');
    if (!config.lastUsed) {
      debug('No lastUsed configuration, skipping auto-load');
      process.exit(0);
    }

    const provider = config.providers.find((p) => p.baseUrl === config.lastUsed?.providerUrl);
    if (!provider) {
      debug('Provider not found, clearing lastUsed');
      config.lastUsed = null;
      process.exit(0);
    }

    const token = provider.tokens.find((t) => t.alias === config.lastUsed?.tokenAlias);
    if (!token) {
      debug('Token not found, clearing lastUsed');
      config.lastUsed = null;
      process.exit(0);
    }

    // Output shell commands silently
    const providerName = provider.displayName || provider.baseUrl;
    outputShellCommands(provider.baseUrl, token.value, providerName, token.alias, true);
    return;
  }

  // Handle list
  if (args.list) {
    debug('Running list action');
    listConfigurations(config);
    return;
  }

  // Show main menu
  const action = await showMainMenu(config);

  switch (action) {
    case 'switch':
      await switchConfiguration(config, args.silent);
      break;
    case 'add-provider':
      await addProvider(config);
      break;
    case 'add-token':
      await addToken(config);
      break;
    case 'manage':
      await manageConfigurations(config);
      break;
    case null:
      debug('User cancelled main menu');
      break;
  }

  // Exit cleanly
  process.exit(0);
}

// Auto-run main if this file is executed directly (not imported as module)
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

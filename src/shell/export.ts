/**
 * Shell export command generator
 * Outputs shell commands in the format: export ANTHROPIC_BASE_URL="..."
 */

import { debug } from '../utils/logger.js';

/**
 * Generate shell export commands for environment variables
 * Returns commands that can be eval'd by the parent shell
 */
export function generateExportCommands(
  baseUrl: string,
  token: string,
  anthropicModel?: string,
  anthropicSmallFastModel?: string
): string {
  debug(`Generating export commands for: ${baseUrl}`);

  const commands: string[] = [];

  // Export ANTHROPIC_BASE_URL
  commands.push(`export ANTHROPIC_BASE_URL="${baseUrl}"`);

  // Export ANTHROPIC_AUTH_TOKEN
  commands.push(`export ANTHROPIC_AUTH_TOKEN="${token}"`);

  // Conditionally export model variables if defined and non-empty
  if (anthropicModel && anthropicModel.trim()) {
    commands.push(`export ANTHROPIC_MODEL="${anthropicModel}"`);
  }

  if (anthropicSmallFastModel && anthropicSmallFastModel.trim()) {
    commands.push(`export ANTHROPIC_SMALL_FAST_MODEL="${anthropicSmallFastModel}"`);
  }

  return commands.join('\n');
}

/**
 * Generate echo message to show user what was set
 * This is appended after the export commands
 */
export function generateSuccessMessage(providerName: string, tokenAlias: string): string {
  return `echo "✓ Switched to ${providerName} - ${tokenAlias}"`;
}

/**
 * Generate complete shell output (exports + success message)
 */
export function generateShellOutput(
  baseUrl: string,
  token: string,
  providerName: string,
  tokenAlias: string,
  silent: boolean = false,
  anthropicModel?: string,
  anthropicSmallFastModel?: string
): string {
  const exportCommands = generateExportCommands(
    baseUrl,
    token,
    anthropicModel,
    anthropicSmallFastModel
  );

  if (silent) {
    // Silent mode: only export commands, no echo
    return exportCommands;
  }

  // Normal mode: exports + success message
  const successMessage = generateSuccessMessage(providerName, tokenAlias);
  return `${exportCommands}\n${successMessage}`;
}

/**
 * Output shell commands to stdout (to be eval'd by shell function)
 */
export function outputShellCommands(
  baseUrl: string,
  token: string,
  providerName: string,
  tokenAlias: string,
  silent: boolean = false,
  anthropicModel?: string,
  anthropicSmallFastModel?: string
): void {
  const output = generateShellOutput(
    baseUrl,
    token,
    providerName,
    tokenAlias,
    silent,
    anthropicModel,
    anthropicSmallFastModel
  );
  console.log(output);
}

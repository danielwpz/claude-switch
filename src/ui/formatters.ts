/**
 * Display formatting utilities
 * Handles color output, tables, status indicators
 */

import chalk from 'chalk';
import { Provider, Token } from '../config/schema.js';

/**
 * Format a success message with checkmark
 */
export function formatSuccess(message: string): string {
  return chalk.green(`✓ ${message}`);
}

/**
 * Format an error message with X mark
 */
export function formatError(message: string): string {
  return chalk.red(`✗ ${message}`);
}

/**
 * Format a warning message
 */
export function formatWarning(message: string): string {
  return chalk.yellow(`⚠ ${message}`);
}

/**
 * Format an info message
 */
export function formatInfo(message: string): string {
  return chalk.blue(`ℹ ${message}`);
}

/**
 * Format a provider display name for selection menus
 */
export function formatProviderChoice(provider: Provider, isActive: boolean = false): string {
  const displayName = provider.displayName || provider.baseUrl;
  const activeIndicator = isActive ? chalk.green(' ✓ (active)') : '';

  if (provider.displayName) {
    return `${chalk.bold(displayName)} ${chalk.gray(`(${provider.baseUrl})`)}${activeIndicator}`;
  }

  return `${chalk.bold(displayName)}${activeIndicator}`;
}

/**
 * Format a token display for selection menus
 */
export function formatTokenChoice(
  token: Token,
  isActive: boolean = false
): string {
  const activeIndicator = isActive ? chalk.green(' ✓ (active)') : '';
  const createdDate = new Date(token.createdAt).toLocaleDateString();

  return `${chalk.bold(token.alias)} ${chalk.gray(`(created: ${createdDate})`)}${activeIndicator}`;
}

/**
 * Format a URL for display
 */
export function formatUrl(url: string): string {
  return chalk.cyan(url);
}

/**
 * Format a token value (partially masked for security)
 */
export function formatTokenValue(value: string, fullyMasked: boolean = false): string {
  if (fullyMasked) {
    return chalk.gray('••••••••••••••••');
  }

  // Show first 10 chars, mask the rest
  if (value.length <= 10) {
    return chalk.gray(value);
  }

  const visible = value.substring(0, 10);
  const masked = '•'.repeat(Math.min(value.length - 10, 10));
  return chalk.gray(`${visible}${masked}`);
}

/**
 * Format a header for a section
 */
export function formatHeader(text: string): string {
  return chalk.bold.underline(text);
}

/**
 * Format a table row for provider listing
 */
export function formatProviderRow(
  provider: Provider,
  tokenCount: number,
  isActive: boolean = false
): string {
  const displayName = provider.displayName || chalk.gray('(no name)');
  const activeIndicator = isActive ? chalk.green('✓') : ' ';

  return `${activeIndicator} ${chalk.bold(displayName)} - ${formatUrl(provider.baseUrl)} - ${chalk.yellow(`${tokenCount} token(s)`)}`;
}

/**
 * Format a table row for token listing
 */
export function formatTokenRow(
  token: Token,
  isActive: boolean = false
): string {
  const activeIndicator = isActive ? chalk.green('✓') : ' ';
  const createdDate = new Date(token.createdAt).toLocaleDateString();

  return `  ${activeIndicator} ${chalk.bold(token.alias)} - ${formatTokenValue(token.value)} - ${chalk.gray(createdDate)}`;
}

/**
 * Format a list of providers and their tokens
 */
export function formatProviderList(
  providers: Provider[],
  activeProviderUrl?: string,
  activeTokenAlias?: string
): string {
  if (providers.length === 0) {
    return chalk.gray('No providers configured.');
  }

  const lines: string[] = [];

  providers.forEach((provider) => {
    const isActiveProvider = provider.baseUrl === activeProviderUrl;
    lines.push(formatProviderRow(provider, provider.tokens.length, isActiveProvider));

    provider.tokens.forEach((token) => {
      const isActiveToken = isActiveProvider && token.alias === activeTokenAlias;
      lines.push(formatTokenRow(token, isActiveToken));
    });

    lines.push(''); // Empty line between providers
  });

  return lines.join('\n');
}

/**
 * Format configuration summary
 */
export function formatConfigSummary(
  providerCount: number,
  tokenCount: number,
  activeProvider?: string,
  activeToken?: string
): string {
  const lines: string[] = [];

  lines.push(formatHeader('Configuration Summary'));
  lines.push(`Providers: ${chalk.yellow(providerCount)}`);
  lines.push(`Tokens: ${chalk.yellow(tokenCount)}`);

  if (activeProvider && activeToken) {
    lines.push(`Active: ${chalk.green(`${activeProvider} - ${activeToken}`)}`);
  } else {
    lines.push(`Active: ${chalk.gray('(none)')}`);
  }

  return lines.join('\n');
}

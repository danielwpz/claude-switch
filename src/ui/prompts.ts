/**
 * Shared prompt helpers
 * Wrapper around prompts library for consistent UX
 */

import prompts from 'prompts';
import { debug } from '../utils/logger.js';

/**
 * Prompt options type
 */
export interface PromptChoice {
  title: string;
  value: string;
  description?: string;
}

/**
 * Show a select menu with arrow key navigation
 */
export async function selectPrompt(
  message: string,
  choices: PromptChoice[]
): Promise<string | null> {
  debug(`Showing select prompt: ${message}`);

  const response = await prompts({
    type: 'select',
    name: 'value',
    message,
    choices,
    initial: 0,
  });

  if (response.value === undefined) {
    debug('User cancelled prompt');
    return null;
  }

  debug(`User selected: ${response.value}`);
  return response.value as string;
}

/**
 * Show a text input prompt
 */
export async function textPrompt(
  message: string,
  initial?: string,
  validate?: (value: string) => boolean | string
): Promise<string | null> {
  debug(`Showing text prompt: ${message}`);

  const response = await prompts({
    type: 'text',
    name: 'value',
    message,
    initial,
    validate,
  });

  if (response.value === undefined) {
    debug('User cancelled prompt');
    return null;
  }

  debug(`User entered: ${response.value}`);
  return response.value as string;
}

/**
 * Show a password input prompt (masked)
 */
export async function passwordPrompt(
  message: string,
  validate?: (value: string) => boolean | string
): Promise<string | null> {
  debug(`Showing password prompt: ${message}`);

  const response = await prompts({
    type: 'password',
    name: 'value',
    message,
    validate,
  });

  if (response.value === undefined) {
    debug('User cancelled prompt');
    return null;
  }

  debug('User entered password (masked)');
  return response.value as string;
}

/**
 * Show a confirmation prompt (yes/no)
 */
export async function confirmPrompt(
  message: string,
  initial: boolean = false
): Promise<boolean | null> {
  debug(`Showing confirm prompt: ${message}`);

  const response = await prompts({
    type: 'confirm',
    name: 'value',
    message,
    initial,
  });

  if (response.value === undefined) {
    debug('User cancelled prompt');
    return null;
  }

  debug(`User confirmed: ${response.value}`);
  return response.value as boolean;
}

/**
 * Show an autocomplete prompt with filtering
 */
export async function autocompletePrompt(
  message: string,
  choices: PromptChoice[]
): Promise<string | null> {
  debug(`Showing autocomplete prompt: ${message}`);

  const response = await prompts({
    type: 'autocomplete',
    name: 'value',
    message,
    choices,
    initial: 0,
  });

  if (response.value === undefined) {
    debug('User cancelled prompt');
    return null;
  }

  debug(`User selected: ${response.value}`);
  return response.value as string;
}

/**
 * Handle prompt cancellation
 */
export function handleCancellation(): void {
  console.log('\nOperation cancelled.');
  process.exit(0);
}

/**
 * Configure prompts library to handle Ctrl+C gracefully
 */
export function setupPrompts(): void {
  prompts.override({
    onCancel: () => {
      handleCancellation();
    },
  });
}

/**
 * Prompt for ANTHROPIC_MODEL configuration
 * User can provide a model name or leave blank to skip
 */
export async function promptForAnthropicModel(current?: string): Promise<string | null> {
  const message = current
    ? `Configure ANTHROPIC_MODEL? [${current} or blank to skip]`
    : 'Configure ANTHROPIC_MODEL? (leave blank to skip)';

  return textPrompt(message, current);
}

/**
 * Prompt for ANTHROPIC_SMALL_FAST_MODEL configuration
 * User can provide a model name or leave blank to skip
 */
export async function promptForAnthropicSmallFastModel(current?: string): Promise<string | null> {
  const message = current
    ? `Configure ANTHROPIC_SMALL_FAST_MODEL? [${current} or blank to skip]`
    : 'Configure ANTHROPIC_SMALL_FAST_MODEL? (leave blank to skip)';

  return textPrompt(message, current);
}

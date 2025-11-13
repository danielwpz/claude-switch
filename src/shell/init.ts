/**
 * Shell initialization setup
 * Adds function and auto-load hook to ~/.zshrc or ~/.bashrc
 */

import { readFile, writeFile, appendFile } from 'fs/promises';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { debug, info } from '../utils/logger.js';

/**
 * Shell integration code to add to profile
 */
const SHELL_INTEGRATION = `
# === cswitch shell integration (start) ===
cswitch() {
  local output=$(command cswitch "$@")
  local exit_code=$?

  # Only eval output if it contains exports (skip for init, help, list, etc.)
  if [ $exit_code -eq 0 ] && echo "$output" | grep -q "export ANTHROPIC"; then
    eval "$output"
  else
    echo "$output"
    return $exit_code
  fi
}

# Auto-load last used configuration
if [ -f ~/.cswitch/config.json ]; then
  eval "$(cswitch --silent --auto-load 2>/dev/null)" || true
fi
# === cswitch shell integration (end) ===
`;

/**
 * Detect current shell and return profile path
 */
export function detectShellProfile(): string | null {
  const shell = process.env['SHELL'] || '';

  if (shell.includes('zsh')) {
    return join(homedir(), '.zshrc');
  } else if (shell.includes('bash')) {
    // Check for .bashrc first, then .bash_profile
    const bashrc = join(homedir(), '.bashrc');
    const bashProfile = join(homedir(), '.bash_profile');

    if (existsSync(bashrc)) {
      return bashrc;
    } else if (existsSync(bashProfile)) {
      return bashProfile;
    } else {
      // Default to .bashrc if neither exists
      return bashrc;
    }
  }

  return null;
}

/**
 * Check if shell integration is already installed
 */
export async function isShellIntegrationInstalled(profilePath: string): Promise<boolean> {
  if (!existsSync(profilePath)) {
    return false;
  }

  try {
    const content = await readFile(profilePath, 'utf-8');
    return content.includes('=== cswitch shell integration (start) ===');
  } catch {
    return false;
  }
}

/**
 * Add shell integration to profile
 */
export async function addShellIntegration(profilePath: string): Promise<void> {
  debug(`Adding shell integration to: ${profilePath}`);

  try {
    // Remove any existing integration first (prevents duplicates)
    await removeShellIntegration(profilePath);

    // Append to profile
    await appendFile(profilePath, SHELL_INTEGRATION, 'utf-8');
    info(`Shell integration added to: ${profilePath}`);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to add shell integration: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Remove shell integration from profile
 */
export async function removeShellIntegration(profilePath: string): Promise<void> {
  debug(`Removing shell integration from: ${profilePath}`);

  try {
    if (!existsSync(profilePath)) {
      info('Profile file does not exist, nothing to remove');
      return;
    }

    const content = await readFile(profilePath, 'utf-8');

    // Remove the integration block
    const startMarker = '# === cswitch shell integration (start) ===';
    const endMarker = '# === cswitch shell integration (end) ===';

    const startIndex = content.indexOf(startMarker);
    if (startIndex === -1) {
      info('Shell integration not found, nothing to remove');
      return;
    }

    const endIndex = content.indexOf(endMarker, startIndex);
    if (endIndex === -1) {
      throw new Error('Shell integration block is malformed (missing end marker)');
    }

    // Remove the block including the end marker line
    const before = content.substring(0, startIndex);
    const after = content.substring(endIndex + endMarker.length);
    const newContent = before + after;

    await writeFile(profilePath, newContent, 'utf-8');
    info(`Shell integration removed from: ${profilePath}`);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to remove shell integration: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get manual installation instructions
 */
export function getManualInstructions(profilePath: string): string {
  return `
To manually set up cswitch shell integration:

1. Add the following to your ${profilePath}:

${SHELL_INTEGRATION}

2. Restart your terminal or run:
   source ${profilePath}

3. Verify installation:
   cswitch --help
`;
}

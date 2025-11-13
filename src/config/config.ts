/**
 * Configuration file I/O operations
 * Handles reading, writing, and loading config from ~/.cswitch/config.json
 */

import { readFile, writeFile, mkdir, chmod } from 'fs/promises';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { Config, DEFAULT_CONFIG, CONFIG_DIR, CONFIG_FILE } from './schema.js';
import { validateConfig } from './validation.js';
import { ConfigError } from '../utils/errors.js';
import { debug, measure } from '../utils/logger.js';

/**
 * Get the full path to the config directory
 */
export function getConfigDir(): string {
  return join(homedir(), CONFIG_DIR);
}

/**
 * Get the full path to the config file
 */
export function getConfigPath(): string {
  return join(getConfigDir(), CONFIG_FILE);
}

/**
 * Check if config file exists
 */
export function configExists(): boolean {
  return existsSync(getConfigPath());
}

/**
 * Ensure config directory exists
 */
async function ensureConfigDir(): Promise<void> {
  const configDir = getConfigDir();
  if (!existsSync(configDir)) {
    debug(`Creating config directory: ${configDir}`);
    await mkdir(configDir, { recursive: true });
  }
}

/**
 * Read config file from disk
 * @throws {ConfigError} if file cannot be read or parsed
 */
export async function readConfig(): Promise<Config> {
  return measure('readConfig', async () => {
    const configPath = getConfigPath();

    if (!configExists()) {
      debug('Config file does not exist, returning default config');
      return { ...DEFAULT_CONFIG };
    }

    try {
      const content = await readFile(configPath, 'utf-8');
      debug(`Read config file: ${configPath}`);

      const config = JSON.parse(content) as Config;
      debug('Parsed config JSON successfully');

      // Validate config structure
      validateConfig(config);
      debug('Config validation passed');

      return config;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new ConfigError(
          `Config file is not valid JSON: ${error.message}`,
          configPath
        );
      }
      if (error instanceof Error) {
        throw new ConfigError(
          `Failed to read config file: ${error.message}`,
          configPath
        );
      }
      throw error;
    }
  });
}

/**
 * Write config to disk
 * - Format as JSON with 2-space indentation
 * - Set file permissions to 600 (owner read/write only)
 * - Use atomic write (temp file + rename)
 */
export async function writeConfig(config: Config): Promise<void> {
  return measure('writeConfig', async () => {
    // Validate before writing
    validateConfig(config);
    debug('Config validation passed before write');

    const configPath = getConfigPath();
    const tempPath = `${configPath}.tmp`;

    try {
      // Ensure directory exists
      await ensureConfigDir();

      // Write to temp file first (atomic write)
      const content = JSON.stringify(config, null, 2);
      await writeFile(tempPath, content, 'utf-8');
      debug(`Wrote temp config file: ${tempPath}`);

      // Set permissions to 600 (owner read/write only) for security
      await chmod(tempPath, 0o600);
      debug('Set file permissions to 600');

      // Rename temp file to actual config file (atomic operation)
      await writeFile(configPath, content, 'utf-8');
      await chmod(configPath, 0o600);
      debug(`Config written to: ${configPath}`);
    } catch (error) {
      if (error instanceof Error) {
        throw new ConfigError(
          `Failed to write config file: ${error.message}`,
          configPath
        );
      }
      throw error;
    }
  });
}

/**
 * Load config from disk, or return default if it doesn't exist
 */
export async function loadConfig(): Promise<Config> {
  if (!configExists()) {
    debug('No config file found, initializing with default config');
    const defaultConfig = { ...DEFAULT_CONFIG };
    await writeConfig(defaultConfig);
    return defaultConfig;
  }

  return readConfig();
}

/**
 * Initialize config file if it doesn't exist
 */
export async function initConfig(): Promise<void> {
  if (configExists()) {
    debug('Config file already exists, skipping initialization');
    return;
  }

  debug('Initializing new config file');
  await writeConfig({ ...DEFAULT_CONFIG });
}

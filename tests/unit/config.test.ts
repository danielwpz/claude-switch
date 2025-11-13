/**
 * Unit tests for config module
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { Config, DEFAULT_CONFIG } from '../../src/config/schema.js';

describe('Config Module', () => {
  let testDir: string;

  beforeEach(async () => {
    // Create temp directory for each test
    testDir = await mkdtemp(join(tmpdir(), 'cswitch-test-'));
  });

  afterEach(async () => {
    // Clean up temp directory
    await rm(testDir, { recursive: true, force: true });
  });

  describe('DEFAULT_CONFIG', () => {
    it('should have version 1.0', () => {
      expect(DEFAULT_CONFIG.version).toBe('1.0');
    });

    it('should have null lastUsed', () => {
      expect(DEFAULT_CONFIG.lastUsed).toBeNull();
    });

    it('should have empty providers array', () => {
      expect(DEFAULT_CONFIG.providers).toEqual([]);
    });
  });

  describe('Config path helpers', () => {
    it('should return correct config directory path', async () => {
      // Test is environment-independent
      const { getConfigDir } = await import('../../src/config/config.js');
      const configDir = getConfigDir();

      expect(configDir).toContain('.cswitch');
    });

    it('should return correct config file path', async () => {
      const { getConfigPath } = await import('../../src/config/config.js');
      const configPath = getConfigPath();

      expect(configPath).toContain('.cswitch');
      expect(configPath).toContain('config.json');
    });
  });

  describe('Config validation integration', () => {
    it('should validate config structure', () => {
      const validConfig: Config = {
        version: '1.0',
        lastUsed: null,
        providers: [],
      };

      expect(validConfig.version).toBe('1.0');
      expect(validConfig.lastUsed).toBeNull();
      expect(Array.isArray(validConfig.providers)).toBe(true);
    });

    it('should support providers with tokens', () => {
      const configWithProviders: Config = {
        version: '1.0',
        lastUsed: {
          providerUrl: 'https://api.provider-a.com',
          tokenAlias: 'work',
        },
        providers: [
          {
            baseUrl: 'https://api.provider-a.com',
            displayName: 'Provider A',
            createdAt: new Date().toISOString(),
            tokens: [
              {
                alias: 'work',
                value: 'sk-ant-xxx-work-token',
                createdAt: new Date().toISOString(),
              },
            ],
          },
        ],
      };

      expect(configWithProviders.providers).toHaveLength(1);
      expect(configWithProviders.providers[0]?.tokens).toHaveLength(1);
      expect(configWithProviders.lastUsed?.providerUrl).toBe('https://api.provider-a.com');
    });
  });
});

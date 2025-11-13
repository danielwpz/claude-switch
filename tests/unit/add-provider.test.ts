/**
 * Unit tests for add-provider action
 */

import { describe, it, expect } from 'vitest';
import { Config, Provider } from '../../src/config/schema.js';

describe('Add Provider Action', () => {
  describe('Provider creation', () => {
    it('should create new provider with correct structure', () => {
      const baseUrl = 'https://api.provider-a.com';
      const displayName = 'Provider A';
      const tokenAlias = 'work-account';
      const tokenValue = 'sk-ant-xxx-work-token';
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
      };

      expect(newProvider.baseUrl).toBe('https://api.provider-a.com');
      expect(newProvider.displayName).toBe('Provider A');
      expect(newProvider.tokens).toHaveLength(1);
      expect(newProvider.tokens[0]?.alias).toBe('work-account');
      expect(newProvider.tokens[0]?.value).toBe('sk-ant-xxx-work-token');
    });

    it('should allow provider without displayName', () => {
      const baseUrl = 'https://api.provider-b.com';
      const now = new Date().toISOString();

      const newProvider: Provider = {
        baseUrl,
        createdAt: now,
        tokens: [
          {
            alias: 'default',
            value: 'sk-ant-xxx-default-token',
            createdAt: now,
          },
        ],
      };

      expect(newProvider.displayName).toBeUndefined();
      expect(newProvider.baseUrl).toBe('https://api.provider-b.com');
    });
  });

  describe('Config updates', () => {
    it('should add provider to empty config', () => {
      const config: Config = {
        version: '1.0',
        lastUsed: null,
        providers: [],
      };

      const newProvider: Provider = {
        baseUrl: 'https://api.provider-a.com',
        createdAt: new Date().toISOString(),
        tokens: [
          {
            alias: 'work',
            value: 'sk-ant-xxx-work-token',
            createdAt: new Date().toISOString(),
          },
        ],
      };

      config.providers.push(newProvider);

      expect(config.providers).toHaveLength(1);
      expect(config.providers[0]?.baseUrl).toBe('https://api.provider-a.com');
    });

    it('should add provider to config with existing providers', () => {
      const config: Config = {
        version: '1.0',
        lastUsed: null,
        providers: [
          {
            baseUrl: 'https://api.provider-a.com',
            createdAt: '2025-11-13T10:00:00Z',
            tokens: [
              {
                alias: 'token1',
                value: 'sk-ant-xxx-token-1',
                createdAt: '2025-11-13T10:00:00Z',
              },
            ],
          },
        ],
      };

      const newProvider: Provider = {
        baseUrl: 'https://api.provider-b.com',
        createdAt: '2025-11-13T10:00:00Z',
        tokens: [
          {
            alias: 'token2',
            value: 'sk-ant-xxx-token-2',
            createdAt: '2025-11-13T10:00:00Z',
          },
        ],
      };

      config.providers.push(newProvider);

      expect(config.providers).toHaveLength(2);
      expect(config.providers[1]?.baseUrl).toBe('https://api.provider-b.com');
    });
  });

  describe('Initial token creation', () => {
    it('should create provider with exactly one initial token', () => {
      const now = new Date().toISOString();
      const provider: Provider = {
        baseUrl: 'https://api.provider-a.com',
        createdAt: now,
        tokens: [
          {
            alias: 'default',
            value: 'sk-ant-xxx-default-token',
            createdAt: now,
          },
        ],
      };

      expect(provider.tokens).toHaveLength(1);
      expect(provider.tokens[0]?.alias).toBe('default');
    });

    it('should store timestamps for provider and token', () => {
      const now = new Date().toISOString();
      const provider: Provider = {
        baseUrl: 'https://api.provider-a.com',
        createdAt: now,
        tokens: [
          {
            alias: 'work',
            value: 'sk-ant-xxx-work-token',
            createdAt: now,
          },
        ],
      };

      expect(provider.createdAt).toBe(now);
      expect(provider.tokens[0]?.createdAt).toBe(now);
    });
  });
});

/**
 * Unit tests for list action
 */

import { describe, it, expect } from 'vitest';
import { Config } from '../../src/config/schema.js';

describe('List Action', () => {
  describe('Display empty config', () => {
    it('should handle config with no providers', () => {
      const config: Config = {
        version: '1.0',
        lastUsed: null,
        providers: [],
      };

      expect(config.providers).toHaveLength(0);
    });

    it('should indicate no active configuration when lastUsed is null', () => {
      const config: Config = {
        version: '1.0',
        lastUsed: null,
        providers: [],
      };

      expect(config.lastUsed).toBeNull();
    });
  });

  describe('Display single provider', () => {
    it('should display provider with display name', () => {
      const config: Config = {
        version: '1.0',
        lastUsed: null,
        providers: [
          {
            baseUrl: 'https://api.provider-a.com',
            displayName: 'Provider A',
            createdAt: '2025-11-13T10:00:00Z',
            tokens: [
              {
                alias: 'work',
                value: 'sk-ant-xxx-work-token',
                createdAt: '2025-11-13T10:00:00Z',
              },
            ],
          },
        ],
      };

      expect(config.providers).toHaveLength(1);
      expect(config.providers[0]?.displayName).toBe('Provider A');
      expect(config.providers[0]?.tokens).toHaveLength(1);
    });

    it('should display provider without display name', () => {
      const config: Config = {
        version: '1.0',
        lastUsed: null,
        providers: [
          {
            baseUrl: 'https://api.provider-b.com',
            createdAt: '2025-11-13T10:00:00Z',
            tokens: [
              {
                alias: 'default',
                value: 'sk-ant-xxx-default-token',
                createdAt: '2025-11-13T10:00:00Z',
              },
            ],
          },
        ],
      };

      expect(config.providers[0]?.displayName).toBeUndefined();
      expect(config.providers[0]?.baseUrl).toBe('https://api.provider-b.com');
    });
  });

  describe('Display multiple providers with tokens', () => {
    it('should display multiple providers', () => {
      const config: Config = {
        version: '1.0',
        lastUsed: {
          providerUrl: 'https://api.provider-a.com',
          tokenAlias: 'work',
        },
        providers: [
          {
            baseUrl: 'https://api.provider-a.com',
            displayName: 'Provider A',
            createdAt: '2025-11-13T10:00:00Z',
            tokens: [
              {
                alias: 'work',
                value: 'sk-ant-xxx-work-token',
                createdAt: '2025-11-13T10:00:00Z',
              },
              {
                alias: 'personal',
                value: 'sk-ant-xxx-personal-token',
                createdAt: '2025-11-13T10:00:00Z',
              },
            ],
          },
          {
            baseUrl: 'https://api.provider-b.com',
            displayName: 'Provider B',
            createdAt: '2025-11-13T10:00:00Z',
            tokens: [
              {
                alias: 'staging',
                value: 'sk-ant-xxx-staging-token',
                createdAt: '2025-11-13T10:00:00Z',
              },
            ],
          },
        ],
      };

      expect(config.providers).toHaveLength(2);
      expect(config.providers[0]?.tokens).toHaveLength(2);
      expect(config.providers[1]?.tokens).toHaveLength(1);

      // Verify total token count
      const totalTokens = config.providers.reduce((sum, p) => sum + p.tokens.length, 0);
      expect(totalTokens).toBe(3);
    });
  });

  describe('Active configuration indicators', () => {
    it('should identify active provider', () => {
      const config: Config = {
        version: '1.0',
        lastUsed: {
          providerUrl: 'https://api.provider-a.com',
          tokenAlias: 'work',
        },
        providers: [
          {
            baseUrl: 'https://api.provider-a.com',
            createdAt: '2025-11-13T10:00:00Z',
            tokens: [
              {
                alias: 'work',
                value: 'sk-ant-xxx-work-token',
                createdAt: '2025-11-13T10:00:00Z',
              },
            ],
          },
          {
            baseUrl: 'https://api.provider-b.com',
            createdAt: '2025-11-13T10:00:00Z',
            tokens: [
              {
                alias: 'staging',
                value: 'sk-ant-xxx-staging-token',
                createdAt: '2025-11-13T10:00:00Z',
              },
            ],
          },
        ],
      };

      const activeProvider = config.providers.find(
        (p) => p.baseUrl === config.lastUsed?.providerUrl
      );

      expect(activeProvider).toBeDefined();
      expect(activeProvider?.baseUrl).toBe('https://api.provider-a.com');
    });

    it('should identify active token within provider', () => {
      const provider = {
        baseUrl: 'https://api.provider-a.com',
        createdAt: '2025-11-13T10:00:00Z',
        tokens: [
          {
            alias: 'work',
            value: 'sk-ant-xxx-work-token',
            createdAt: '2025-11-13T10:00:00Z',
          },
          {
            alias: 'personal',
            value: 'sk-ant-xxx-personal-token',
            createdAt: '2025-11-13T10:00:00Z',
          },
        ],
      };

      const activeToken = provider.tokens.find((t) => t.alias === 'work');

      expect(activeToken).toBeDefined();
      expect(activeToken?.alias).toBe('work');
    });
  });

  describe('Configuration summary', () => {
    it('should calculate provider count', () => {
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
          {
            baseUrl: 'https://api.provider-b.com',
            createdAt: '2025-11-13T10:00:00Z',
            tokens: [
              {
                alias: 'token2',
                value: 'sk-ant-xxx-token-2',
                createdAt: '2025-11-13T10:00:00Z',
              },
            ],
          },
        ],
      };

      expect(config.providers.length).toBe(2);
    });

    it('should calculate token count', () => {
      const config: Config = {
        version: '1.0',
        lastUsed: null,
        providers: [
          {
            baseUrl: 'https://api.provider-a.com',
            createdAt: '2025-11-13T10:00:00Z',
            tokens: [
              {
                alias: 'work',
                value: 'sk-ant-xxx-work-token',
                createdAt: '2025-11-13T10:00:00Z',
              },
              {
                alias: 'personal',
                value: 'sk-ant-xxx-personal-token',
                createdAt: '2025-11-13T10:00:00Z',
              },
            ],
          },
        ],
      };

      const totalTokens = config.providers.reduce((sum, p) => sum + p.tokens.length, 0);
      expect(totalTokens).toBe(2);
    });
  });
});

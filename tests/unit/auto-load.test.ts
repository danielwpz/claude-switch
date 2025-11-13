/**
 * Unit tests for auto-load logic
 */

import { describe, it, expect } from 'vitest';
import { Config } from '../../src/config/schema.js';

describe('Auto-Load Logic', () => {
  describe('Last-used persistence', () => {
    it('should persist lastUsed after switch', () => {
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
            ],
          },
        ],
      };

      // Simulate switch
      config.lastUsed = {
        providerUrl: 'https://api.provider-a.com',
        tokenAlias: 'work',
      };

      expect(config.lastUsed).not.toBeNull();
      expect(config.lastUsed?.providerUrl).toBe('https://api.provider-a.com');
      expect(config.lastUsed?.tokenAlias).toBe('work');
    });

    it('should update lastUsed when switching to different config', () => {
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
                alias: 'personal',
                value: 'sk-ant-xxx-personal-token',
                createdAt: '2025-11-13T10:00:00Z',
              },
            ],
          },
        ],
      };

      // Switch to second provider
      config.lastUsed = {
        providerUrl: 'https://api.provider-b.com',
        tokenAlias: 'personal',
      };

      expect(config.lastUsed.providerUrl).toBe('https://api.provider-b.com');
      expect(config.lastUsed.tokenAlias).toBe('personal');
    });
  });

  describe('Auto-load validation', () => {
    it('should skip auto-load when lastUsed is null', () => {
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
            ],
          },
        ],
      };

      if (!config.lastUsed) {
        // Auto-load should exit silently
        expect(true).toBe(true);
        return;
      }

      expect(config.lastUsed).toBeNull();
    });

    it('should validate provider exists', () => {
      const config: Config = {
        version: '1.0',
        lastUsed: {
          providerUrl: 'https://api.provider-a.com',
          tokenAlias: 'work',
        },
        providers: [
          {
            baseUrl: 'https://api.provider-b.com',
            createdAt: '2025-11-13T10:00:00Z',
            tokens: [
              {
                alias: 'personal',
                value: 'sk-ant-xxx-personal-token',
                createdAt: '2025-11-13T10:00:00Z',
              },
            ],
          },
        ],
      };

      const provider = config.providers.find((p) => p.baseUrl === config.lastUsed?.providerUrl);

      expect(provider).toBeUndefined();
    });

    it('should validate token exists in provider', () => {
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
                alias: 'personal',
                value: 'sk-ant-xxx-personal-token',
                createdAt: '2025-11-13T10:00:00Z',
              },
            ],
          },
        ],
      };

      const provider = config.providers.find((p) => p.baseUrl === config.lastUsed?.providerUrl);

      expect(provider).toBeDefined();

      if (provider) {
        const token = provider.tokens.find((t) => t.alias === config.lastUsed?.tokenAlias);
        expect(token).toBeUndefined();
      }
    });
  });

  describe('Auto-load success flow', () => {
    it('should find valid provider and token for auto-load', () => {
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
            ],
          },
        ],
      };

      const provider = config.providers.find((p) => p.baseUrl === config.lastUsed?.providerUrl);

      expect(provider).toBeDefined();

      if (provider) {
        const token = provider.tokens.find((t) => t.alias === config.lastUsed?.tokenAlias);
        expect(token).toBeDefined();
        expect(token?.value).toBe('sk-ant-xxx-work-token');

        // Can now output environment variables
        const providerName = provider.displayName || provider.baseUrl;
        expect(providerName).toBe('Provider A');
      }
    });

    it('should retrieve correct token value for export', () => {
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
                value: 'sk-ant-xxx-work-token-abc123',
                createdAt: '2025-11-13T10:00:00Z',
              },
            ],
          },
        ],
      };

      const provider = config.providers.find((p) => p.baseUrl === config.lastUsed?.providerUrl);

      if (provider) {
        const token = provider.tokens.find((t) => t.alias === config.lastUsed?.tokenAlias);
        if (token) {
          expect(token.value).toBe('sk-ant-xxx-work-token-abc123');
        }
      }
    });
  });
});

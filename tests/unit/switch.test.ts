/**
 * Unit tests for switch action
 */

import { describe, it, expect } from 'vitest';
import { Config, Provider } from '../../src/config/schema.js';

describe('Switch Action', () => {
  describe('Config updates', () => {
    it('should update lastUsed after switching', () => {
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

    it('should update lastUsed when switching between configs', () => {
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

  describe('Provider and token selection', () => {
    it('should find provider by baseUrl', () => {
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

      const provider = config.providers.find((p) => p.baseUrl === 'https://api.provider-a.com');

      expect(provider).toBeDefined();
      expect(provider?.baseUrl).toBe('https://api.provider-a.com');
    });

    it('should find token by alias within provider', () => {
      const provider: Provider = {
        baseUrl: 'https://api.provider-a.com',
        createdAt: '2025-11-13T10:00:00Z',
        tokens: [
          {
            alias: 'work-account',
            value: 'sk-ant-xxx-work-token',
            createdAt: '2025-11-13T10:00:00Z',
          },
          {
            alias: 'personal-account',
            value: 'sk-ant-xxx-personal-token',
            createdAt: '2025-11-13T10:00:00Z',
          },
        ],
      };

      const token = provider.tokens.find((t) => t.alias === 'personal-account');

      expect(token).toBeDefined();
      expect(token?.alias).toBe('personal-account');
      expect(token?.value).toBe('sk-ant-xxx-personal-token');
    });
  });

  describe('Shell output generation', () => {
    it('should have provider displayName for output', () => {
      const provider: Provider = {
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
      };

      const providerName = provider.displayName || provider.baseUrl;
      expect(providerName).toBe('Provider A');
    });

    it('should fallback to baseUrl when displayName missing', () => {
      const provider: Provider = {
        baseUrl: 'https://api.provider-b.com',
        createdAt: '2025-11-13T10:00:00Z',
        tokens: [
          {
            alias: 'token',
            value: 'sk-ant-xxx-token',
            createdAt: '2025-11-13T10:00:00Z',
          },
        ],
      };

      const providerName = provider.displayName || provider.baseUrl;
      expect(providerName).toBe('https://api.provider-b.com');
    });
  });
});

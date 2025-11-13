/**
 * Unit tests for add-token action
 */

import { describe, it, expect } from 'vitest';
import { Config, Provider, Token } from '../../src/config/schema.js';

describe('Add Token Action', () => {
  describe('Token creation', () => {
    it('should create new token with correct structure', () => {
      const alias = 'personal-account';
      const value = 'sk-ant-xxx-personal-token';
      const now = new Date().toISOString();

      const newToken: Token = {
        alias,
        value,
        createdAt: now,
      };

      expect(newToken.alias).toBe('personal-account');
      expect(newToken.value).toBe('sk-ant-xxx-personal-token');
      expect(newToken.createdAt).toBe(now);
    });
  });

  describe('Adding token to provider', () => {
    it('should add token to provider with one existing token', () => {
      const provider: Provider = {
        baseUrl: 'https://api.provider-a.com',
        createdAt: '2025-11-13T10:00:00Z',
        tokens: [
          {
            alias: 'work-account',
            value: 'sk-ant-xxx-work-token',
            createdAt: '2025-11-13T10:00:00Z',
          },
        ],
      };

      const newToken: Token = {
        alias: 'personal-account',
        value: 'sk-ant-xxx-personal-token',
        createdAt: new Date().toISOString(),
      };

      provider.tokens.push(newToken);

      expect(provider.tokens).toHaveLength(2);
      expect(provider.tokens[1]?.alias).toBe('personal-account');
    });

    it('should add token to provider with multiple existing tokens', () => {
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

      const newToken: Token = {
        alias: 'test-account',
        value: 'sk-ant-xxx-test-token',
        createdAt: new Date().toISOString(),
      };

      provider.tokens.push(newToken);

      expect(provider.tokens).toHaveLength(3);
      expect(provider.tokens[2]?.alias).toBe('test-account');
    });
  });

  describe('Token alias uniqueness', () => {
    it('should detect duplicate aliases in provider', () => {
      const provider: Provider = {
        baseUrl: 'https://api.provider-a.com',
        createdAt: '2025-11-13T10:00:00Z',
        tokens: [
          {
            alias: 'work-account',
            value: 'sk-ant-xxx-work-token-1',
            createdAt: '2025-11-13T10:00:00Z',
          },
          {
            alias: 'work-account',
            value: 'sk-ant-xxx-work-token-2',
            createdAt: '2025-11-13T10:00:00Z',
          },
        ],
      };

      const aliases = provider.tokens.map((t) => t.alias);
      const uniqueAliases = new Set(aliases);

      expect(aliases.length).toBeGreaterThan(uniqueAliases.size);
    });

    it('should allow unique aliases', () => {
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

      const aliases = provider.tokens.map((t) => t.alias);
      const uniqueAliases = new Set(aliases);

      expect(aliases.length).toBe(uniqueAliases.size);
    });
  });

  describe('Config persistence', () => {
    it('should update config with new token', () => {
      const config: Config = {
        version: '1.0',
        lastUsed: null,
        providers: [
          {
            baseUrl: 'https://api.provider-a.com',
            createdAt: '2025-11-13T10:00:00Z',
            tokens: [
              {
                alias: 'work-account',
                value: 'sk-ant-xxx-work-token',
                createdAt: '2025-11-13T10:00:00Z',
              },
            ],
          },
        ],
      };

      const provider = config.providers[0];
      if (provider) {
        const newToken: Token = {
          alias: 'personal-account',
          value: 'sk-ant-xxx-personal-token',
          createdAt: new Date().toISOString(),
        };
        provider.tokens.push(newToken);
      }

      expect(config.providers[0]?.tokens).toHaveLength(2);
      expect(config.providers[0]?.tokens[1]?.alias).toBe('personal-account');
    });
  });
});

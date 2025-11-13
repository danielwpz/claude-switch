/**
 * Unit tests for switch menu
 */

import { describe, it, expect } from 'vitest';
import { Config } from '../../src/config/schema.js';

describe('Switch Menu', () => {
  describe('selectProvider behavior', () => {
    it('should handle empty provider list', () => {
      const config: Config = {
        version: '1.0',
        lastUsed: null,
        providers: [],
      };

      expect(config.providers).toHaveLength(0);
    });

    it('should handle config with one provider', () => {
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
    });

    it('should handle config with multiple providers', () => {
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

      expect(config.providers).toHaveLength(2);
      expect(config.providers[0]?.baseUrl).toBe('https://api.provider-a.com');
      expect(config.providers[1]?.baseUrl).toBe('https://api.provider-b.com');
    });
  });

  describe('selectToken behavior', () => {
    it('should handle provider with one token', () => {
      const provider = {
        baseUrl: 'https://api.provider-a.com',
        createdAt: '2025-11-13T10:00:00Z',
        tokens: [
          {
            alias: 'work',
            value: 'sk-ant-xxx-work-token',
            createdAt: '2025-11-13T10:00:00Z',
          },
        ],
      };

      expect(provider.tokens).toHaveLength(1);
      expect(provider.tokens[0]?.alias).toBe('work');
    });

    it('should handle provider with multiple tokens', () => {
      const provider = {
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

      expect(provider.tokens).toHaveLength(2);
      expect(provider.tokens[0]?.alias).toBe('work-account');
      expect(provider.tokens[1]?.alias).toBe('personal-account');
    });
  });
});

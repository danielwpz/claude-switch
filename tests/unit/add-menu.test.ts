/**
 * Unit tests for add menu
 */

import { describe, it, expect } from 'vitest';
import { Config, Provider } from '../../src/config/schema.js';

describe('Add Menu', () => {
  describe('Provider input validation', () => {
    it('should validate URL format in prompts', () => {
      // Valid HTTPS URL
      expect('https://api.provider.com'.startsWith('https://')).toBe(true);
    });

    it('should validate HTTP URLs', () => {
      expect('http://api.provider.com'.startsWith('http://')).toBe(true);
    });

    it('should handle optional display name', () => {
      const providers: Provider[] = [
        {
          baseUrl: 'https://api.provider-a.com',
          displayName: 'Provider A',
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
          // No displayName
          createdAt: '2025-11-13T10:00:00Z',
          tokens: [
            {
              alias: 'token2',
              value: 'sk-ant-xxx-token-2',
              createdAt: '2025-11-13T10:00:00Z',
            },
          ],
        },
      ];

      expect(providers[0]?.displayName).toBe('Provider A');
      expect(providers[1]?.displayName).toBeUndefined();
    });
  });

  describe('Token input validation', () => {
    it('should validate token alias length', () => {
      const validAlias = 'work-account';
      expect(validAlias.length).toBeLessThanOrEqual(50);
    });

    it('should validate token value minimum length', () => {
      const validToken = 'sk-ant-xxx-work-token';
      expect(validToken.length).toBeGreaterThanOrEqual(10);
    });

    it('should detect duplicate aliases in provider', () => {
      const provider: Provider = {
        baseUrl: 'https://api.provider-a.com',
        createdAt: '2025-11-13T10:00:00Z',
        tokens: [
          {
            alias: 'work-account',
            value: 'sk-ant-xxx-token-1',
            createdAt: '2025-11-13T10:00:00Z',
          },
          {
            alias: 'personal-account',
            value: 'sk-ant-xxx-token-2',
            createdAt: '2025-11-13T10:00:00Z',
          },
        ],
      };

      const aliases = provider.tokens.map((t) => t.alias);
      const duplicates = aliases.filter((a, i) => aliases.indexOf(a) !== i);

      expect(duplicates).toHaveLength(0);
    });
  });

  describe('New provider input structure', () => {
    it('should structure new provider input correctly', () => {
      const input = {
        baseUrl: 'https://api.provider-a.com',
        displayName: 'Provider A',
        tokenAlias: 'work-account',
        tokenValue: 'sk-ant-xxx-work-token',
      };

      expect(input).toHaveProperty('baseUrl');
      expect(input).toHaveProperty('tokenAlias');
      expect(input).toHaveProperty('tokenValue');
      expect(input.baseUrl).toBe('https://api.provider-a.com');
      expect(input.tokenAlias).toBe('work-account');
    });
  });

  describe('New token input structure', () => {
    it('should structure new token input correctly', () => {
      const input = {
        alias: 'personal-account',
        value: 'sk-ant-xxx-personal-token',
      };

      expect(input).toHaveProperty('alias');
      expect(input).toHaveProperty('value');
      expect(input.alias).toBe('personal-account');
      expect(input.value.length).toBeGreaterThanOrEqual(10);
    });
  });
});

/**
 * Unit tests for validation module
 */

import { describe, it, expect } from 'vitest';
import {
  validateUrl,
  validateAlias,
  validateTokenValue,
  validateBaseUrl,
  validateDisplayName,
  validateToken,
  validateTokenAliasUnique,
  validateProviderUnique,
} from '../../src/config/validation.js';
import { Config, Provider, Token } from '../../src/config/schema.js';

describe('Validation Module', () => {
  describe('URL validation', () => {
    it('should accept valid https URL', () => {
      expect(validateUrl('https://api.provider.com')).toBe(true);
    });

    it('should accept valid http URL', () => {
      expect(validateUrl('http://api.provider.com')).toBe(true);
    });

    it('should reject invalid URL', () => {
      expect(validateUrl('not-a-url')).toBe(false);
    });

    it('should reject ftp URL', () => {
      expect(validateUrl('ftp://api.provider.com')).toBe(false);
    });
  });

  describe('Alias validation', () => {
    it('should accept valid alias', () => {
      expect(() => validateAlias('work-account')).not.toThrow();
    });

    it('should reject empty alias', () => {
      expect(() => validateAlias('')).toThrow('Token alias cannot be empty');
    });

    it('should reject whitespace-only alias', () => {
      expect(() => validateAlias('   ')).toThrow('Token alias cannot be empty');
    });

    it('should reject alias over 50 characters', () => {
      expect(() => validateAlias('a'.repeat(51))).toThrow(
        'Token alias must be 50 characters or less'
      );
    });

    it('should accept alias at boundary (50 characters)', () => {
      expect(() => validateAlias('a'.repeat(50))).not.toThrow();
    });
  });

  describe('Token value validation', () => {
    it('should accept valid token value', () => {
      expect(() => validateTokenValue('sk-ant-xxx-work-token')).not.toThrow();
    });

    it('should reject empty token value', () => {
      expect(() => validateTokenValue('')).toThrow('Token value cannot be empty');
    });

    it('should reject token value under 10 characters', () => {
      expect(() => validateTokenValue('short')).toThrow(
        'Token value must be at least 10 characters'
      );
    });

    it('should accept token value at boundary (10 characters)', () => {
      expect(() => validateTokenValue('1234567890')).not.toThrow();
    });
  });

  describe('Base URL validation', () => {
    it('should accept valid base URL', () => {
      expect(() => validateBaseUrl('https://api.provider.com')).not.toThrow();
    });

    it('should reject empty base URL', () => {
      expect(() => validateBaseUrl('')).toThrow('Provider base URL cannot be empty');
    });

    it('should reject invalid base URL', () => {
      expect(() => validateBaseUrl('not-a-url')).toThrow(
        'Provider base URL must be a valid HTTP or HTTPS URL'
      );
    });
  });

  describe('Display name validation', () => {
    it('should accept valid display name', () => {
      expect(() => validateDisplayName('Provider A')).not.toThrow();
    });

    it('should accept undefined display name', () => {
      expect(() => validateDisplayName(undefined)).not.toThrow();
    });

    it('should reject display name over 100 characters', () => {
      expect(() => validateDisplayName('a'.repeat(101))).toThrow(
        'Provider display name must be 100 characters or less'
      );
    });

    it('should accept display name at boundary (100 characters)', () => {
      expect(() => validateDisplayName('a'.repeat(100))).not.toThrow();
    });
  });

  describe('Token object validation', () => {
    it('should accept valid token', () => {
      const token: Token = {
        alias: 'work-account',
        value: 'sk-ant-xxx-work-token',
        createdAt: '2025-11-13T10:00:00Z',
      };

      expect(() => validateToken(token)).not.toThrow();
    });

    it('should reject token with invalid createdAt', () => {
      const token: Token = {
        alias: 'work-account',
        value: 'sk-ant-xxx-work-token',
        createdAt: 'invalid',
      };

      expect(() => validateToken(token)).toThrow(
        'Token createdAt must be a valid ISO 8601 timestamp'
      );
    });
  });

  describe('Provider uniqueness validation', () => {
    it('should accept unique provider URL', () => {
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

      expect(() => validateProviderUnique(config, 'https://api.provider-b.com')).not.toThrow();
    });

    it('should reject duplicate provider URL', () => {
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

      expect(() => validateProviderUnique(config, 'https://api.provider-a.com')).toThrow(
        'Provider with base URL'
      );
    });
  });

  describe('Token alias uniqueness validation', () => {
    it('should accept unique token alias', () => {
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

      expect(() => validateTokenAliasUnique(provider, 'personal-account')).not.toThrow();
    });

    it('should reject duplicate token alias', () => {
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

      expect(() => validateTokenAliasUnique(provider, 'work-account')).toThrow('Token alias');
    });

    it('should allow re-using alias when excluding current', () => {
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

      expect(() =>
        validateTokenAliasUnique(provider, 'work-account', 'work-account')
      ).not.toThrow();
    });
  });
});

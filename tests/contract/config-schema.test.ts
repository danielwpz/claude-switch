/**
 * Contract test for config schema validation
 * Tests that config file structure matches the expected schema
 */

import { describe, it, expect } from 'vitest';
import { validateConfig, validateProvider, validateToken } from '../../src/config/validation.js';
import { Config, Provider, Token } from '../../src/config/schema.js';

describe('Config Schema Contract', () => {
  describe('Token validation', () => {
    it('should accept valid token', () => {
      const token: Token = {
        alias: 'work-account',
        value: 'sk-ant-xxx-work-token',
        createdAt: '2025-11-13T10:00:00Z',
      };

      expect(() => validateToken(token)).not.toThrow();
    });

    it('should reject token with empty alias', () => {
      const token: Token = {
        alias: '',
        value: 'sk-ant-xxx-work-token',
        createdAt: '2025-11-13T10:00:00Z',
      };

      expect(() => validateToken(token)).toThrow('Token alias cannot be empty');
    });

    it('should reject token with alias over 50 characters', () => {
      const token: Token = {
        alias: 'a'.repeat(51),
        value: 'sk-ant-xxx-work-token',
        createdAt: '2025-11-13T10:00:00Z',
      };

      expect(() => validateToken(token)).toThrow('Token alias must be 50 characters or less');
    });

    it('should reject token with empty value', () => {
      const token: Token = {
        alias: 'work-account',
        value: '',
        createdAt: '2025-11-13T10:00:00Z',
      };

      expect(() => validateToken(token)).toThrow('Token value cannot be empty');
    });

    it('should reject token with value less than 10 characters', () => {
      const token: Token = {
        alias: 'work-account',
        value: 'short',
        createdAt: '2025-11-13T10:00:00Z',
      };

      expect(() => validateToken(token)).toThrow('Token value must be at least 10 characters');
    });

    it('should reject token with invalid createdAt', () => {
      const token: Token = {
        alias: 'work-account',
        value: 'sk-ant-xxx-work-token',
        createdAt: 'invalid-date',
      };

      expect(() => validateToken(token)).toThrow(
        'Token createdAt must be a valid ISO 8601 timestamp'
      );
    });
  });

  describe('Provider validation', () => {
    it('should accept valid provider', () => {
      const provider: Provider = {
        baseUrl: 'https://api.provider-a.com',
        displayName: 'Provider A',
        createdAt: '2025-11-13T10:00:00Z',
        tokens: [
          {
            alias: 'work-account',
            value: 'sk-ant-xxx-work-token',
            createdAt: '2025-11-13T10:00:00Z',
          },
        ],
      };

      expect(() => validateProvider(provider)).not.toThrow();
    });

    it('should accept provider without displayName', () => {
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

      expect(() => validateProvider(provider)).not.toThrow();
    });

    it('should reject provider with invalid baseUrl', () => {
      const provider: Provider = {
        baseUrl: 'not-a-url',
        createdAt: '2025-11-13T10:00:00Z',
        tokens: [
          {
            alias: 'work-account',
            value: 'sk-ant-xxx-work-token',
            createdAt: '2025-11-13T10:00:00Z',
          },
        ],
      };

      expect(() => validateProvider(provider)).toThrow(
        'Provider base URL must be a valid HTTP or HTTPS URL'
      );
    });

    it('should reject provider with no tokens', () => {
      const provider: Provider = {
        baseUrl: 'https://api.provider-a.com',
        createdAt: '2025-11-13T10:00:00Z',
        tokens: [],
      };

      expect(() => validateProvider(provider)).toThrow('Provider must have at least one token');
    });

    it('should reject provider with duplicate token aliases', () => {
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

      expect(() => validateProvider(provider)).toThrow(
        'Token aliases must be unique within a provider'
      );
    });

    it('should reject provider with displayName over 100 characters', () => {
      const provider: Provider = {
        baseUrl: 'https://api.provider-a.com',
        displayName: 'a'.repeat(101),
        createdAt: '2025-11-13T10:00:00Z',
        tokens: [
          {
            alias: 'work-account',
            value: 'sk-ant-xxx-work-token',
            createdAt: '2025-11-13T10:00:00Z',
          },
        ],
      };

      expect(() => validateProvider(provider)).toThrow(
        'Provider display name must be 100 characters or less'
      );
    });
  });

  describe('Config validation', () => {
    it('should accept valid config with no providers', () => {
      const config: Config = {
        version: '1.0',
        lastUsed: null,
        providers: [],
      };

      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should accept valid config with providers', () => {
      const config: Config = {
        version: '1.0',
        lastUsed: {
          providerUrl: 'https://api.provider-a.com',
          tokenAlias: 'work-account',
        },
        providers: [
          {
            baseUrl: 'https://api.provider-a.com',
            displayName: 'Provider A',
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

      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should reject config with invalid version', () => {
      const config: Config = {
        version: '2.0',
        lastUsed: null,
        providers: [],
      };

      expect(() => validateConfig(config)).toThrow('Unsupported config version: 2.0');
    });

    it('should reject config with duplicate provider baseUrls', () => {
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
            baseUrl: 'https://api.provider-a.com',
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

      expect(() => validateConfig(config)).toThrow('Provider base URLs must be unique');
    });

    it('should reject config with lastUsed referencing non-existent provider', () => {
      const config: Config = {
        version: '1.0',
        lastUsed: {
          providerUrl: 'https://api.non-existent.com',
          tokenAlias: 'work-account',
        },
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

      expect(() => validateConfig(config)).toThrow('LastUsed references non-existent provider');
    });

    it('should reject config with lastUsed referencing non-existent token', () => {
      const config: Config = {
        version: '1.0',
        lastUsed: {
          providerUrl: 'https://api.provider-a.com',
          tokenAlias: 'non-existent-token',
        },
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

      expect(() => validateConfig(config)).toThrow('LastUsed references non-existent token');
    });
  });
});

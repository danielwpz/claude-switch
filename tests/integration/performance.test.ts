/**
 * Performance benchmarking tests
 * Verify all operations complete in < 0.5s with 200 configs
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Config, Provider } from '../../src/config/schema.js';
import { validateConfig } from '../../src/config/validation.js';

describe('Performance Benchmarks', () => {
  let largeConfig: Config;

  beforeEach(() => {
    // Create config with 200 providers, each with 2 tokens
    const providers: Provider[] = [];
    for (let i = 0; i < 200; i++) {
      providers.push({
        baseUrl: `https://api.provider-${i}.com`,
        displayName: `Provider ${i}`,
        createdAt: '2025-11-13T10:00:00Z',
        tokens: [
          {
            alias: `token-${i}-a`,
            value: `sk-ant-token-${i}-a-1234567890`,
            createdAt: '2025-11-13T10:00:00Z',
          },
          {
            alias: `token-${i}-b`,
            value: `sk-ant-token-${i}-b-1234567890`,
            createdAt: '2025-11-13T10:00:00Z',
          },
        ],
      });
    }

    largeConfig = {
      version: '1.0',
      lastUsed: {
        providerUrl: providers[0]?.baseUrl ?? '',
        tokenAlias: providers[0]?.tokens[0]?.alias ?? '',
      },
      providers,
    };
  });

  it('should validate large config in < 500ms', () => {
    const start = performance.now();
    validateConfig(largeConfig);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(500);
  });

  it('should find provider by URL in large config in < 500ms', () => {
    const start = performance.now();
    const provider = largeConfig.providers.find(
      (p) => p.baseUrl === 'https://api.provider-150.com'
    );
    const duration = performance.now() - start;

    expect(provider).toBeDefined();
    expect(duration).toBeLessThan(500);
  });

  it('should find token by alias in large config in < 500ms', () => {
    const provider = largeConfig.providers[150];
    if (!provider) throw new Error('Provider not found');

    const start = performance.now();
    const token = provider.tokens.find((t) => t.alias === 'token-150-b');
    const duration = performance.now() - start;

    expect(token).toBeDefined();
    expect(duration).toBeLessThan(500);
  });

  it('should serialize large config to JSON in < 500ms', () => {
    const start = performance.now();
    const json = JSON.stringify(largeConfig, null, 2);
    const duration = performance.now() - start;

    expect(json.length).toBeGreaterThan(0);
    expect(duration).toBeLessThan(500);
  });

  it('should parse large config JSON in < 500ms', () => {
    const json = JSON.stringify(largeConfig, null, 2);

    const start = performance.now();
    const parsed = JSON.parse(json) as Config;
    const duration = performance.now() - start;

    expect(parsed.providers.length).toBe(200);
    expect(duration).toBeLessThan(500);
  });
});

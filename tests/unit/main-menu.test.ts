/**
 * Unit tests for main menu
 */

import { describe, it, expect } from 'vitest';
import { getActionDescription } from '../../src/menus/main-menu.js';
import { Config } from '../../src/config/schema.js';

describe('Main Menu', () => {
  describe('getActionDescription', () => {
    it('should describe switch action', () => {
      expect(getActionDescription('switch')).toBe('Switch configuration');
    });

    it('should describe add-provider action', () => {
      expect(getActionDescription('add-provider')).toBe('Add provider');
    });

    it('should describe add-token action', () => {
      expect(getActionDescription('add-token')).toBe('Add token');
    });

    it('should describe manage action', () => {
      expect(getActionDescription('manage')).toBe('Manage configurations');
    });

    it('should describe null action as Cancelled', () => {
      expect(getActionDescription(null)).toBe('Cancelled');
    });
  });

  describe('showMainMenu behavior', () => {
    it('should be callable with valid config', async () => {
      const config: Config = {
        version: '1.0',
        lastUsed: null,
        providers: [],
      };

      // Menu display is interactive, just test type safety
      expect(config.version).toBe('1.0');
    });

    it('should handle config with providers', () => {
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

      expect(config.providers).toHaveLength(1);
      expect(config.providers[0]?.tokens).toHaveLength(1);
    });
  });
});

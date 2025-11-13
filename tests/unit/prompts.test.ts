/**
 * Unit tests for prompt helpers
 */

import { describe, it, expect } from 'vitest';
import { PromptChoice } from '../../src/ui/prompts.js';

describe('Prompt Helpers', () => {
  describe('PromptChoice type', () => {
    it('should define PromptChoice interface', () => {
      const choice: PromptChoice = {
        title: 'Option A',
        value: 'option-a',
        description: 'This is option A',
      };

      expect(choice.title).toBe('Option A');
      expect(choice.value).toBe('option-a');
      expect(choice.description).toBe('This is option A');
    });

    it('should allow PromptChoice without description', () => {
      const choice: PromptChoice = {
        title: 'Option B',
        value: 'option-b',
      };

      expect(choice.title).toBe('Option B');
      expect(choice.value).toBe('option-b');
      expect(choice.description).toBeUndefined();
    });
  });

  describe('Prompt configuration', () => {
    it('should export setupPrompts function', async () => {
      const { setupPrompts } = await import('../../src/ui/prompts.js');

      expect(typeof setupPrompts).toBe('function');
    });

    it('should export handleCancellation function', async () => {
      const { handleCancellation } = await import('../../src/ui/prompts.js');

      expect(typeof handleCancellation).toBe('function');
    });
  });

  describe('Prompt functions', () => {
    it('should export selectPrompt function', async () => {
      const { selectPrompt } = await import('../../src/ui/prompts.js');

      expect(typeof selectPrompt).toBe('function');
    });

    it('should export textPrompt function', async () => {
      const { textPrompt } = await import('../../src/ui/prompts.js');

      expect(typeof textPrompt).toBe('function');
    });

    it('should export passwordPrompt function', async () => {
      const { passwordPrompt } = await import('../../src/ui/prompts.js');

      expect(typeof passwordPrompt).toBe('function');
    });

    it('should export confirmPrompt function', async () => {
      const { confirmPrompt } = await import('../../src/ui/prompts.js');

      expect(typeof confirmPrompt).toBe('function');
    });

    it('should export autocompletePrompt function', async () => {
      const { autocompletePrompt } = await import('../../src/ui/prompts.js');

      expect(typeof autocompletePrompt).toBe('function');
    });
  });

  describe('PromptChoice examples', () => {
    it('should work with provider choices', () => {
      const providerChoices: PromptChoice[] = [
        {
          title: 'Provider A',
          value: 'https://api.provider-a.com',
          description: 'Main API endpoint',
        },
        {
          title: 'Provider B',
          value: 'https://api.provider-b.com',
          description: 'Staging API endpoint',
        },
      ];

      expect(providerChoices).toHaveLength(2);
      expect(providerChoices[0]?.title).toBe('Provider A');
      expect(providerChoices[1]?.value).toBe('https://api.provider-b.com');
    });

    it('should work with token choices', () => {
      const tokenChoices: PromptChoice[] = [
        {
          title: 'work-account',
          value: 'work-account',
          description: 'Created: 2025-11-13',
        },
        {
          title: 'personal-account',
          value: 'personal-account',
          description: 'Created: 2025-11-12',
        },
      ];

      expect(tokenChoices).toHaveLength(2);
      expect(tokenChoices[0]?.title).toBe('work-account');
    });

    it('should work with action menu choices', () => {
      const actionChoices: PromptChoice[] = [
        {
          title: 'Switch configuration',
          value: 'switch',
          description: 'Switch to a different provider/token',
        },
        {
          title: 'Add provider',
          value: 'add-provider',
          description: 'Add a new API provider',
        },
        {
          title: 'Add token',
          value: 'add-token',
          description: 'Add a token to existing provider',
        },
        {
          title: 'Manage configurations',
          value: 'manage',
          description: 'Edit, rename, or delete configurations',
        },
      ];

      expect(actionChoices).toHaveLength(4);
      expect(actionChoices[0]?.value).toBe('switch');
      expect(actionChoices[3]?.value).toBe('manage');
    });
  });
});

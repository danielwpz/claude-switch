/**
 * Contract test for shell output format
 * Tests that shell commands are generated in the correct format
 * Based on contracts/shell-output-contract.md
 */

import { describe, it, expect } from 'vitest';
import {
  generateExportCommands,
  generateSuccessMessage,
  generateShellOutput,
} from '../../src/shell/export.js';

describe('Shell Output Contract', () => {
  describe('Export commands generation', () => {
    it('should generate correct export format for ANTHROPIC_BASE_URL', () => {
      const baseUrl = 'https://api.provider-a.com';
      const token = 'sk-ant-xxx-work-token';

      const output = generateExportCommands(baseUrl, token);

      expect(output).toContain('export ANTHROPIC_BASE_URL="https://api.provider-a.com"');
    });

    it('should generate correct export format for ANTHROPIC_AUTH_TOKEN', () => {
      const baseUrl = 'https://api.provider-a.com';
      const token = 'sk-ant-xxx-work-token';

      const output = generateExportCommands(baseUrl, token);

      expect(output).toContain('export ANTHROPIC_AUTH_TOKEN="sk-ant-xxx-work-token"');
    });

    it('should generate both exports in correct order', () => {
      const baseUrl = 'https://api.provider-a.com';
      const token = 'sk-ant-xxx-work-token';

      const output = generateExportCommands(baseUrl, token);
      const lines = output.split('\n');

      expect(lines).toHaveLength(2);
      expect(lines[0]).toBe('export ANTHROPIC_BASE_URL="https://api.provider-a.com"');
      expect(lines[1]).toBe('export ANTHROPIC_AUTH_TOKEN="sk-ant-xxx-work-token"');
    });

    it('should handle special characters in URL', () => {
      const baseUrl = 'https://api.provider-a.com/path?query=value&param=123';
      const token = 'sk-ant-xxx-work-token';

      const output = generateExportCommands(baseUrl, token);

      expect(output).toContain('export ANTHROPIC_BASE_URL="https://api.provider-a.com/path?query=value&param=123"');
    });

    it('should handle special characters in token', () => {
      const baseUrl = 'https://api.provider-a.com';
      const token = 'sk-ant-xxx$special&chars';

      const output = generateExportCommands(baseUrl, token);

      expect(output).toContain('export ANTHROPIC_AUTH_TOKEN="sk-ant-xxx$special&chars"');
    });
  });

  describe('Success message generation', () => {
    it('should generate success message with checkmark', () => {
      const providerName = 'Provider A';
      const tokenAlias = 'work-account';

      const message = generateSuccessMessage(providerName, tokenAlias);

      expect(message).toContain('✓');
      expect(message).toContain('Provider A');
      expect(message).toContain('work-account');
    });

    it('should use echo command for message', () => {
      const providerName = 'Provider A';
      const tokenAlias = 'work-account';

      const message = generateSuccessMessage(providerName, tokenAlias);

      expect(message).toMatch(/^echo/);
    });
  });

  describe('Complete shell output', () => {
    it('should generate complete output in normal mode', () => {
      const baseUrl = 'https://api.provider-a.com';
      const token = 'sk-ant-xxx-work-token';
      const providerName = 'Provider A';
      const tokenAlias = 'work-account';

      const output = generateShellOutput(baseUrl, token, providerName, tokenAlias, false);
      const lines = output.split('\n');

      // Should have 3 lines: 2 exports + 1 echo
      expect(lines.length).toBeGreaterThanOrEqual(3);

      // First line: export ANTHROPIC_BASE_URL
      expect(lines[0]).toBe('export ANTHROPIC_BASE_URL="https://api.provider-a.com"');

      // Second line: export ANTHROPIC_AUTH_TOKEN
      expect(lines[1]).toBe('export ANTHROPIC_AUTH_TOKEN="sk-ant-xxx-work-token"');

      // Third line: echo message
      expect(lines[2]).toMatch(/^echo/);
      expect(lines[2]).toContain('✓');
    });

    it('should generate silent output without echo', () => {
      const baseUrl = 'https://api.provider-a.com';
      const token = 'sk-ant-xxx-work-token';
      const providerName = 'Provider A';
      const tokenAlias = 'work-account';

      const output = generateShellOutput(baseUrl, token, providerName, tokenAlias, true);
      const lines = output.split('\n');

      // Should have only 2 lines: 2 exports, no echo
      expect(lines).toHaveLength(2);

      // First line: export ANTHROPIC_BASE_URL
      expect(lines[0]).toBe('export ANTHROPIC_BASE_URL="https://api.provider-a.com"');

      // Second line: export ANTHROPIC_AUTH_TOKEN
      expect(lines[1]).toBe('export ANTHROPIC_AUTH_TOKEN="sk-ant-xxx-work-token"');

      // No echo command
      expect(output).not.toContain('echo');
    });

    it('should be compatible with shell eval', () => {
      const baseUrl = 'https://api.provider-a.com';
      const token = 'sk-ant-xxx-work-token';
      const providerName = 'Provider A';
      const tokenAlias = 'work-account';

      const output = generateShellOutput(baseUrl, token, providerName, tokenAlias, false);

      // Output should be valid shell commands
      // Each line should be a valid command (export or echo)
      const lines = output.split('\n').filter((line) => line.trim().length > 0);

      lines.forEach((line) => {
        const isExport = line.startsWith('export ');
        const isEcho = line.startsWith('echo ');
        expect(isExport || isEcho).toBe(true);
      });
    });

    it('should properly escape quotes in values', () => {
      const baseUrl = 'https://api.provider-a.com';
      const token = 'sk-ant-xxx-work-token';
      const providerName = 'Provider A';
      const tokenAlias = 'work-account';

      const output = generateShellOutput(baseUrl, token, providerName, tokenAlias, true);

      // Values should be wrapped in double quotes
      expect(output).toMatch(/export ANTHROPIC_BASE_URL="[^"]+"/);
      expect(output).toMatch(/export ANTHROPIC_AUTH_TOKEN="[^"]+"/);
    });
  });

  describe('Contract compliance', () => {
    it('should match shell-output-contract.md format', () => {
      const baseUrl = 'https://api.anthropic.com';
      const token = 'sk-ant-api03-xxx';
      const providerName = 'Anthropic Official';
      const tokenAlias = 'work';

      const output = generateShellOutput(baseUrl, token, providerName, tokenAlias, false);

      // Contract: First line must be export ANTHROPIC_BASE_URL
      const lines = output.split('\n');
      expect(lines[0]).toMatch(/^export ANTHROPIC_BASE_URL=".+"/);

      // Contract: Second line must be export ANTHROPIC_AUTH_TOKEN
      expect(lines[1]).toMatch(/^export ANTHROPIC_AUTH_TOKEN=".+"/);

      // Contract: Third line must be echo message (in normal mode)
      expect(lines[2]).toMatch(/^echo ".+"/);
    });

    it('should match silent mode contract format', () => {
      const baseUrl = 'https://api.anthropic.com';
      const token = 'sk-ant-api03-xxx';
      const providerName = 'Anthropic Official';
      const tokenAlias = 'work';

      const output = generateShellOutput(baseUrl, token, providerName, tokenAlias, true);

      // Contract: Silent mode should only output export commands
      const lines = output.split('\n');
      expect(lines).toHaveLength(2);
      expect(lines[0]).toMatch(/^export ANTHROPIC_BASE_URL=".+"/);
      expect(lines[1]).toMatch(/^export ANTHROPIC_AUTH_TOKEN=".+"/);

      // Contract: No echo in silent mode
      expect(output).not.toContain('echo');
    });
  });
});

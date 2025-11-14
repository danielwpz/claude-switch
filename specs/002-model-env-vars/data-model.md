# Data Model: Per-Provider Model Environment Variables

**Feature**: 002-model-env-vars | **Date**: 2025-11-14 | **Plan**: [plan.md](./plan.md)

## Overview

This document defines the data entities, relationships, and state transitions for managing ANTHROPIC_MODEL and ANTHROPIC_SMALL_FAST_MODEL as optional per-provider configuration.

---

## Entity Definitions

### ProviderConfig (Extended)

**Location**: `src/config/schema.ts`

**Purpose**: Represents the complete configuration for a single AI provider (base URL, auth tokens, and now: model preferences)

**Fields**:

```typescript
interface Provider {
  // Existing fields
  baseUrl: string;                               // API endpoint URL (required)
  displayName?: string;                          // Human-friendly name (optional)
  createdAt: string;                             // ISO 8601 timestamp (required)
  tokens: Token[];                               // Authentication credentials (required, can be empty)

  // NEW FIELDS
  anthropicModel?: string;                       // Primary Claude model (e.g., "claude-3-5-sonnet-20241022")
  anthropicSmallFastModel?: string;              // Lightweight/faster model (e.g., "claude-3-5-haiku-20241022")
}

interface Token {
  // Unchanged
  alias: string;                                 // Token identifier
  value: string;                                 // Token secret
  createdAt: string;                             // ISO 8601 timestamp
}

interface Config {
  // Unchanged
  version: string;                               // Schema version
  providers: Provider[];                         // List of all providers
  lastUsed?: {
    providerUrl: string;                         // Reference to Provider.baseUrl
    tokenAlias: string;                          // Reference to Token.alias
  };
}
```

**Validation Rules**:

1. **anthropicModel**:
   - Type: `string | undefined`
   - Valid values: Any non-empty string (no validation of actual model names)
   - Invalid values: `null`, `""`, whitespace-only
   - Normalization: Trim whitespace; if empty after trim → set to `undefined`
   - Storage: Omit field from JSON if `undefined`; load as `undefined` if missing

2. **anthropicSmallFastModel**:
   - Same rules as anthropicModel
   - Independent from anthropicModel (can be set, unset, or mixed)

3. **Both fields together**:
   - No cross-field validation (one field doesn't constrain the other)
   - No requirement for uniqueness between the two (same value allowed, though unusual)
   - No default values (always explicitly configured or undefined)

**Examples**:

```typescript
// Valid: Both models configured
{
  baseUrl: "https://api.provider.com",
  tokens: [{ alias: "work", value: "sk-ant-...", createdAt: "..." }],
  anthropicModel: "claude-3-5-sonnet-20241022",
  anthropicSmallFastModel: "claude-3-5-haiku-20241022",
  createdAt: "2025-11-14T10:00:00Z"
}

// Valid: Only primary model configured
{
  baseUrl: "https://api.provider.com",
  tokens: [...],
  anthropicModel: "claude-3-5-sonnet-20241022",
  // anthropicSmallFastModel not set (undefined)
  createdAt: "2025-11-14T10:00:00Z"
}

// Valid: No models configured (backward compatible)
{
  baseUrl: "https://api.provider.com",
  tokens: [...],
  // Both model fields absent/undefined
  createdAt: "2025-11-14T10:00:00Z"
}

// Invalid: Empty string should be normalized to undefined
// (Before save, normalization converts "" → undefined)
{
  anthropicModel: "",  // ❌ Will not be saved; normalized to undefined
}

// Invalid: Whitespace-only should be normalized to undefined
{
  anthropicModel: "   ",  // ❌ Will not be saved; normalized to undefined
}
```

---

## State Transitions

### Configuration Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│ UNCONFIGURED (anthropicModel = undefined)                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
                 [Setup Provider]
                 [Enter model values]
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ CONFIGURED (anthropicModel = "claude-3-5-sonnet-...")       │
│ UNCONFIGURED (anthropicSmallFastModel = undefined) ← mixed  │
└─────────────────────────────────────────────────────────────┘
                          ↓
         ┌────────────────┼────────────────┐
         ↓                ↓                 ↓
   [Switch Provider]  [Edit Provider]  [Manual Config Edit]
   Export to shell   Change models    Direct JSON modification
         ↓                ↓                 ↓
    Set env vars    Update storage    Persist change
         │                │                 │
         └────────────────┴─────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ CURRENT STATE in Config File                                │
│ (reflects last setup/edit operation)                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
              [Edit Provider / Unset]
              [Blank input to clear]
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ CLEARED (anthropicModel = undefined)                        │
│ (Can be reconfigured anytime)                               │
└─────────────────────────────────────────────────────────────┘
```

**State Transition Rules**:
- UNCONFIGURED → CONFIGURED: User enters non-empty value in setup/edit
- CONFIGURED → CONFIGURED: User changes value in edit (replaces previous)
- CONFIGURED → UNCONFIGURED: User provides blank input in edit (unsets field)
- UNCONFIGURED → UNCONFIGURED: User skips field or provides blank in setup (no-op)
- Any state → Any state: Direct JSON edit (file modification) valid but bypasses validation

---

## Environmental Export

### Shell Environment Mapping

When a provider is active, the system exports model variables to the shell:

```bash
# Generated by src/shell/export.ts when switching providers

# Always exported
export ANTHROPIC_BASE_URL="https://api.provider.com"
export ANTHROPIC_AUTH_TOKEN="sk-ant-..."

# Conditionally exported (if configured for the provider)
export ANTHROPIC_MODEL="claude-3-5-sonnet-20241022"
export ANTHROPIC_SMALL_FAST_MODEL="claude-3-5-haiku-20241022"
```

**Export Rules**:
1. ANTHROPIC_BASE_URL and ANTHROPIC_AUTH_TOKEN: Always exported (existing behavior, unchanged)
2. ANTHROPIC_MODEL: Only exported if `provider.anthropicModel` is defined and non-empty
3. ANTHROPIC_SMALL_FAST_MODEL: Only exported if `provider.anthropicSmallFastModel` is defined and non-empty
4. Both model vars can be independently present or absent in the environment

---

## Storage Format

### JSON Persistence

**Location**: `~/.cswitch/config.json`

**Schema Evolution**:

**Before** (existing format):
```json
{
  "version": "1.0",
  "providers": [
    {
      "baseUrl": "https://api.anthropic.com",
      "displayName": "Anthropic",
      "tokens": [
        {
          "alias": "default",
          "value": "sk-ant-...",
          "createdAt": "2025-11-13T10:00:00Z"
        }
      ],
      "createdAt": "2025-11-13T10:00:00Z"
    }
  ],
  "lastUsed": {
    "providerUrl": "https://api.anthropic.com",
    "tokenAlias": "default"
  }
}
```

**After** (with model fields):
```json
{
  "version": "1.0",
  "providers": [
    {
      "baseUrl": "https://api.anthropic.com",
      "displayName": "Anthropic",
      "tokens": [
        {
          "alias": "default",
          "value": "sk-ant-...",
          "createdAt": "2025-11-13T10:00:00Z"
        }
      ],
      "anthropicModel": "claude-3-5-sonnet-20241022",
      "anthropicSmallFastModel": "claude-3-5-haiku-20241022",
      "createdAt": "2025-11-13T10:00:00Z"
    }
  ],
  "lastUsed": {
    "providerUrl": "https://api.anthropic.com",
    "tokenAlias": "default"
  }
}
```

**Backward Compatibility**:
- Old configs (without model fields) load successfully; fields default to undefined
- New configs with model fields can be loaded by old CLI (fields ignored)
- No migration script needed; gradual adoption supported

**File Permissions**:
- Unchanged: `0o600` (owner read/write only)
- Model values treated as user-provided configuration (not secrets)

---

## Validation & Normalization

### normalizeModelField Function

**Location**: `src/lib/validation.ts` (new utility)

```typescript
/**
 * Normalize a model field value to either a non-empty string or undefined.
 *
 * Rules:
 * - undefined → undefined
 * - null → undefined
 * - "" → undefined
 * - "   " (whitespace only) → undefined
 * - "  model-name  " → "model-name" (trimmed)
 * - "model-name" → "model-name" (unchanged)
 *
 * @param value - Raw input value (string, undefined, or null)
 * @returns Normalized value (string or undefined)
 */
export function normalizeModelField(value: string | undefined | null): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
```

**Usage**:
1. In setup prompts: `config.anthropicModel = normalizeModelField(userInput)`
2. In config loader: `provider.anthropicModel = normalizeModelField(provider.anthropicModel)`
3. In edit flow: `config.anthropicModel = normalizeModelField(userInput || provider.anthropicModel)`
4. In export logic: `if (provider.anthropicModel) { /* export */ }`

---

## Dependencies & Constraints

### Dependencies on Existing Systems

1. **Config System** (`src/config/config.ts`):
   - Depends on: File I/O, JSON serialization, atomic writes
   - Change: Add validation of new fields during load
   - No new dependencies

2. **Prompt System** (`src/prompts/provider.ts`):
   - Depends on: CLI prompt library (existing)
   - Change: Add two new prompt functions for model fields
   - No new dependencies

3. **Export System** (`src/shell/export.ts`):
   - Depends on: Provider data structure
   - Change: Generate export commands for model fields if present
   - No new dependencies

4. **Setup Action** (`src/actions/setup.ts`):
   - Depends on: Prompts, config validation
   - Change: Collect model values; call normalization
   - No new dependencies

5. **Edit Action** (`src/actions/edit.ts` or creation):
   - Depends on: Setup flow pattern
   - Change: Extend with model field prompts
   - No new dependencies

### No New External Dependencies
- All changes leverage existing libraries and patterns
- No new npm packages required
- No external APIs or services introduced

---

## Testing Strategy

### Contract Tests
- Verify Provider schema accepts optional model fields
- Verify export command includes/excludes model vars correctly
- Verify normalization function handles all cases

### Integration Tests
- Setup provider with both models → verify saved to config
- Setup provider with one model → verify only that one saved
- Setup provider with no models → verify fields undefined (backward compat)
- Edit provider → change, add, or remove models → verify updated
- Switch providers → verify correct model vars exported
- Multiple providers with different models → verify switching works correctly

### Unit Tests
- normalizeModelField: undefined, null, "", whitespace, valid strings
- Export command generation: with/without models, special characters
- Config load: missing fields, null values, empty strings

---

## Summary

The data model is minimal and non-disruptive:
- Two optional string fields added to Provider
- Backward compatible (optional fields, undefined default)
- Independent configuration (no cross-field constraints)
- Simple validation (trim whitespace, accept or reject)
- Integrated into existing export/storage mechanisms
- No new external dependencies

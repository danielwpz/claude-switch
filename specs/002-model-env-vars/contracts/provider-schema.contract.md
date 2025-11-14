# Contract: Provider Configuration Schema with Model Fields

**Feature**: 002-model-env-vars | **Type**: Data Structure Contract | **Date**: 2025-11-14

## Overview

This contract defines the structure and behavior of the Provider configuration object when extended with optional ANTHROPIC_MODEL and ANTHROPIC_SMALL_FAST_MODEL fields.

## Provider Schema Contract

### Structure

```typescript
interface Provider {
  // Existing fields (unchanged)
  baseUrl: string;                              // Required: API endpoint URL
  displayName?: string;                         // Optional: human-friendly name
  createdAt: string;                            // Required: ISO 8601 timestamp
  tokens: Token[];                              // Required: auth tokens (can be empty array)

  // New fields (this contract)
  anthropicModel?: string;                      // Optional: primary Claude model identifier
  anthropicSmallFastModel?: string;             // Optional: lightweight/fast Claude model identifier
}

interface Token {
  alias: string;                                // Required: token identifier
  value: string;                                // Required: token secret
  createdAt: string;                            // Required: ISO 8601 timestamp
}
```

### Field Specifications

#### anthropicModel

| Property | Value |
|----------|-------|
| **Type** | `string \| undefined` |
| **Required** | No (optional) |
| **Default** | undefined |
| **Validation** | Non-empty string after trim |
| **Example** | "claude-3-5-sonnet-20241022" |
| **Constraints** | No validation of actual model names; any non-empty string accepted |
| **Serialization** | Omitted from JSON if undefined |

#### anthropicSmallFastModel

| Property | Value |
|----------|-------|
| **Type** | `string \| undefined` |
| **Required** | No (optional) |
| **Default** | undefined |
| **Validation** | Non-empty string after trim |
| **Example** | "claude-3-5-haiku-20241022" |
| **Constraints** | No validation of actual model names; any non-empty string accepted |
| **Serialization** | Omitted from JSON if undefined |

## Normalization Rules

When a Provider is loaded from storage or created via CLI:

1. If `anthropicModel` is `undefined`, `null`, or empty string → normalize to `undefined`
2. If `anthropicModel` is whitespace-only → trim to empty → normalize to `undefined`
3. If `anthropicModel` is non-empty string → keep as-is (trimmed if appropriate)
4. Same rules apply to `anthropicSmallFastModel`

## JSON Serialization Examples

### Complete Configuration
```json
{
  "baseUrl": "https://api.anthropic.com",
  "displayName": "Anthropic Official",
  "tokens": [
    {
      "alias": "prod",
      "value": "sk-ant-...",
      "createdAt": "2025-11-14T10:00:00Z"
    }
  ],
  "anthropicModel": "claude-3-5-sonnet-20241022",
  "anthropicSmallFastModel": "claude-3-5-haiku-20241022",
  "createdAt": "2025-11-14T10:00:00Z"
}
```

### Partial Configuration (one model set)
```json
{
  "baseUrl": "https://api.anthropic.com",
  "displayName": "Anthropic Official",
  "tokens": [...],
  "anthropicModel": "claude-3-5-sonnet-20241022",
  "createdAt": "2025-11-14T10:00:00Z"
}
```

### Backward Compatible (no models)
```json
{
  "baseUrl": "https://api.anthropic.com",
  "displayName": "Anthropic Official",
  "tokens": [...],
  "createdAt": "2025-11-14T10:00:00Z"
}
```

Note: Both model fields absent (not even `null`). When loaded, TypeScript defaults to `undefined`.

## Independence Constraint

- anthropicModel and anthropicSmallFastModel are **independent fields**
- One field's value does NOT constrain the other
- Both can be set, both can be unset, or either combination is valid
- Duplicate values (same model in both fields) are allowed (though unusual)

## Backward Compatibility

### Loading Old Configs

Old provider objects (without model fields) MUST load successfully:

```typescript
// Old config (missing model fields)
const oldProvider = {
  baseUrl: "https://api.anthropic.com",
  tokens: [...],
  createdAt: "2025-11-14T..."
};

// When loaded with new code
const provider: Provider = oldProvider; // ✅ Valid; models default to undefined

provider.anthropicModel; // undefined
provider.anthropicSmallFastModel; // undefined
```

### Saving New Configs

New configs with model fields MAY be loaded by old CLI (fields ignored):

```json
// New config saved by new CLI
{
  "baseUrl": "...",
  "anthropicModel": "claude-3-5-sonnet-20241022",
  "anthropicSmallFastModel": "claude-3-5-haiku-20241022"
}

// Old CLI loads this: anthropic-base-url and token used; model fields ignored ✅
```

## Validation Contract

### Input Validation

**From CLI Prompts**:
```
Q: Enter ANTHROPIC_MODEL (or blank to skip):
A: "claude-3-5-sonnet-20241022" → Accepted, stored as-is
A: "" (blank) → Normalized to undefined, not stored
A: "   " (spaces) → Normalized to undefined, not stored
A: "claude-3-5-sonnet-20241022  " (trailing spaces) → Trimmed, stored as "claude-3-5-sonnet-20241022"
```

**No validation of model name format** (e.g., "foo", "xyz", or misspelled names all accepted). Name validation is Anthropic API's responsibility.

### Storage Validation

When storing to JSON:
- If value is `undefined` → Field omitted from JSON entirely
- If value is `null` → Convert to `undefined` (then omit)
- If value is empty string → Convert to `undefined` (then omit)
- If value is non-empty string → Store as-is

## Test Cases

### Schema Compliance

| Input | Expected Output | Notes |
|-------|-----------------|-------|
| `{ baseUrl: "...", tokens: [], anthropicModel: "claude-3-5-sonnet-20241022" }` | ✅ Valid | One model set, other undefined |
| `{ baseUrl: "...", tokens: [], anthropicModel: "model-a", anthropicSmallFastModel: "model-b" }` | ✅ Valid | Both models set |
| `{ baseUrl: "...", tokens: [] }` | ✅ Valid | No models (backward compat) |
| `{ baseUrl: "...", tokens: [], anthropicModel: "" }` | ⚠️ Normalized | Empty string treated as undefined |
| `{ baseUrl: "...", tokens: [], anthropicModel: null }` | ⚠️ Normalized | Null treated as undefined |
| `{ baseUrl: "...", tokens: [], anthropicModel: "   " }` | ⚠️ Normalized | Whitespace-only treated as undefined |

### JSON Round-Trip

| Step | Data |
|------|------|
| 1. In-memory object | `Provider { anthropicModel: "claude-3-5-sonnet-20241022", anthropicSmallFastModel: undefined }` |
| 2. Serialize to JSON | `{ ..., "anthropicModel": "claude-3-5-sonnet-20241022" }` (anthropicSmallFastModel omitted) |
| 3. Deserialize to object | `Provider { anthropicModel: "claude-3-5-sonnet-20241022", anthropicSmallFastModel: undefined }` |
| ✅ Round-trip successful | Objects match |

---

## Conclusion

This contract establishes a backward-compatible extension to the Provider schema that:
- Adds two optional string fields (model identifiers)
- Normalizes all "not configured" states to `undefined`
- Omits undefined fields from JSON storage
- Maintains full backward compatibility with old configs
- Imposes no cross-field constraints (independent configuration)

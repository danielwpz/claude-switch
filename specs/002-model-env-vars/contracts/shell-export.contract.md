# Contract: Shell Export Command Generation with Model Variables

**Feature**: 002-model-env-vars | **Type**: Interface Contract | **Date**: 2025-11-14

## Overview

This contract defines how environment variable export commands are generated when a provider with optional model configurations is active. It extends the existing shell export mechanism (from 001-claude-env-switcher) to conditionally include ANTHROPIC_MODEL and ANTHROPIC_SMALL_FAST_MODEL.

## Export Function Contract

### Input

**Location**: `src/shell/export.ts::generateExportCommands()`

```typescript
interface ExportInput {
  provider: {
    baseUrl: string;                           // API endpoint (required)
    anthropicModel?: string;                   // Primary model (optional)
    anthropicSmallFastModel?: string;          // Fast model (optional)
  };
  token: {
    value: string;                             // Auth token (required)
  };
}
```

### Output

**Type**: Bash shell commands (string)

**Format**: Multiple `export VAR="value"` commands, separated by newlines, suitable for `eval` in bash/zsh.

## Export Rules

### Always Export

```bash
export ANTHROPIC_BASE_URL="https://api.anthropic.com"
export ANTHROPIC_AUTH_TOKEN="sk-ant-..."
```

### Conditionally Export (if defined and non-empty)

```bash
export ANTHROPIC_MODEL="claude-3-5-sonnet-20241022"
export ANTHROPIC_SMALL_FAST_MODEL="claude-3-5-haiku-20241022"
```

**Rule**: Only include the export command for a model variable if:
1. The field exists in the provider object (is not `undefined`)
2. The field is non-empty string (no empty strings, no whitespace-only)

## Test Cases

### Scenario 1: Both Models Configured

**Input**:
```typescript
{
  baseUrl: "https://api.anthropic.com",
  anthropicModel: "claude-3-5-sonnet-20241022",
  anthropicSmallFastModel: "claude-3-5-haiku-20241022"
}
```

**Expected Output**:
```bash
export ANTHROPIC_BASE_URL="https://api.anthropic.com"
export ANTHROPIC_AUTH_TOKEN="sk-ant-..."
export ANTHROPIC_MODEL="claude-3-5-sonnet-20241022"
export ANTHROPIC_SMALL_FAST_MODEL="claude-3-5-haiku-20241022"
```

**Assertion**: All four variables exported

---

### Scenario 2: Only Primary Model Configured

**Input**:
```typescript
{
  baseUrl: "https://api.anthropic.com",
  anthropicModel: "claude-3-5-sonnet-20241022",
  anthropicSmallFastModel: undefined
}
```

**Expected Output**:
```bash
export ANTHROPIC_BASE_URL="https://api.anthropic.com"
export ANTHROPIC_AUTH_TOKEN="sk-ant-..."
export ANTHROPIC_MODEL="claude-3-5-sonnet-20241022"
```

**Assertion**: ANTHROPIC_SMALL_FAST_MODEL not exported; three variables only

---

### Scenario 3: Only Fast Model Configured

**Input**:
```typescript
{
  baseUrl: "https://api.anthropic.com",
  anthropicModel: undefined,
  anthropicSmallFastModel: "claude-3-5-haiku-20241022"
}
```

**Expected Output**:
```bash
export ANTHROPIC_BASE_URL="https://api.anthropic.com"
export ANTHROPIC_AUTH_TOKEN="sk-ant-..."
export ANTHROPIC_SMALL_FAST_MODEL="claude-3-5-haiku-20241022"
```

**Assertion**: ANTHROPIC_MODEL not exported; three variables only

---

### Scenario 4: No Models Configured (Backward Compatibility)

**Input**:
```typescript
{
  baseUrl: "https://api.anthropic.com",
  anthropicModel: undefined,
  anthropicSmallFastModel: undefined
}
```

**Expected Output**:
```bash
export ANTHROPIC_BASE_URL="https://api.anthropic.com"
export ANTHROPIC_AUTH_TOKEN="sk-ant-..."
```

**Assertion**: Only base URL and token exported (no model variables); identical to 001-claude-env-switcher behavior

---

### Scenario 5: Model with Special Characters (Quoted Properly)

**Input**:
```typescript
{
  baseUrl: "https://api.anthropic.com",
  anthropicModel: "claude-3-5-sonnet-20241022-special",
  anthropicSmallFastModel: undefined
}
```

**Expected Output**:
```bash
export ANTHROPIC_BASE_URL="https://api.anthropic.com"
export ANTHROPIC_AUTH_TOKEN="sk-ant-..."
export ANTHROPIC_MODEL="claude-3-5-sonnet-20241022-special"
```

**Assertion**: Model name properly quoted; no shell injection risk

---

### Scenario 6: Empty String Model (Treated as Undefined)

**Input** (should not occur after normalization, but contract defines behavior):
```typescript
{
  baseUrl: "https://api.anthropic.com",
  anthropicModel: "",
  anthropicSmallFastModel: undefined
}
```

**Expected Output**:
```bash
export ANTHROPIC_BASE_URL="https://api.anthropic.com"
export ANTHROPIC_AUTH_TOKEN="sk-ant-..."
```

**Assertion**: Empty model string NOT exported; treated as undefined

---

### Scenario 7: Whitespace-Only Model (Treated as Undefined)

**Input** (should not occur after normalization, but contract defines behavior):
```typescript
{
  baseUrl: "https://api.anthropic.com",
  anthropicModel: "   ",
  anthropicSmallFastModel: undefined
}
```

**Expected Output**:
```bash
export ANTHROPIC_BASE_URL="https://api.anthropic.com"
export ANTHROPIC_AUTH_TOKEN="sk-ant-..."
```

**Assertion**: Whitespace-only model string NOT exported; treated as undefined

---

## Implementation Requirements

### Code Requirements

1. **Conditional Export Logic**:
   ```typescript
   function generateExportCommands(baseUrl: string, token: string,
                                   anthropicModel?: string,
                                   anthropicSmallFastModel?: string): string {
     const commands: string[] = [];
     commands.push(`export ANTHROPIC_BASE_URL="${baseUrl}"`);
     commands.push(`export ANTHROPIC_AUTH_TOKEN="${token}"`);

     // Only add model exports if defined and non-empty
     if (anthropicModel && anthropicModel.trim()) {
       commands.push(`export ANTHROPIC_MODEL="${anthropicModel}"`);
     }
     if (anthropicSmallFastModel && anthropicSmallFastModel.trim()) {
       commands.push(`export ANTHROPIC_SMALL_FAST_MODEL="${anthropicSmallFastModel}"`);
     }

     return commands.join('\n');
   }
   ```

2. **Shell Injection Prevention**:
   - Model values must be quoted (already done in template above)
   - No interpolation of special characters; values passed as literals
   - Consider escaping if model values can contain quotes (e.g., `"model\"quoted"`)

3. **Consistency**:
   - Same quoting style as existing base URL and token exports
   - Same order (base URL, token, models)
   - Same newline separation

### Testing Requirements

- Unit tests covering all 7 scenarios above
- Verify command string is valid bash (can be `eval`'d without error)
- Verify environment variables are actually set after eval
- Integration test: switch provider → verify new shell has correct vars

## Backward Compatibility

This contract maintains **100% backward compatibility** with existing export behavior:

- If no models are configured (Scenario 4), output is identical to `001-claude-env-switcher`
- Old CLI can still parse new configs (model fields simply omitted from export)
- New CLI can load old configs (model fields default to undefined, export skips them)

## Notes

- Model variable export uses same mechanism as existing ANTHROPIC_BASE_URL and ANTHROPIC_AUTH_TOKEN
- No separate environment setup or shell hooks needed
- Auto-load mechanism (from shell init) will automatically include model vars if present
- User's shell history will show `export ANTHROPIC_MODEL=...` just like existing variables

---

## Conclusion

This contract ensures:
- Model variables are exported only when configured
- Export format is shell-safe and consistent
- Backward compatibility is maintained
- Both new and old code can interoperate correctly

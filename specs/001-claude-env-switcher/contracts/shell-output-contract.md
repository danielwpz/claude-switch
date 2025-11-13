# Shell Command Output Contract

**Feature**: 001-claude-env-switcher
**Date**: 2025-11-13
**Purpose**: Define the contract for shell commands output by the CLI

## Overview

The `cswitch` CLI outputs shell commands to stdout that are evaluated by the parent shell. This document defines the exact format of those commands.

---

## Success Case: Export Commands

When a provider/token is successfully selected, the CLI outputs export statements followed by a confirmation message.

**Format**:
```bash
export ANTHROPIC_BASE_URL="<base-url>"
export ANTHROPIC_AUTH_TOKEN="<token-value>"
echo "<confirmation-message>"
```

**Example**:
```bash
export ANTHROPIC_BASE_URL="https://api.provider-a.com"
export ANTHROPIC_AUTH_TOKEN="sk-ant-xxx-work"
echo "✓ Switched to Provider A (Main) - work-account"
```

**Constraints**:
- Values MUST be double-quoted to handle special characters
- Export statements MUST come before echo
- Echo message MUST be on its own line
- No trailing newlines after echo

---

## Error Case: Error Message to Stderr

When an error occurs (validation failure, file not found, etc.), the CLI outputs error messages to stderr and exits with non-zero status.

**Format**:
```bash
# Nothing to stdout
# To stderr:
✗ <error-message>
  <optional-details>
  <optional-suggestions>
```

**Example**:
```bash
# Exit code: 1
# Stderr:
✗ Config file not found
  Location: ~/.cswitch/config.json
  Fix: Run 'cswitch init' to create configuration
```

**Constraints**:
- MUST write to stderr, not stdout
- MUST exit with code 1 (or other non-zero)
- Messages MUST start with ✗ symbol
- Suggestions SHOULD start with "Fix:" or "Try:"

---

## Auto-load Mode (Silent)

When invoked with `--silent --auto-load` flags (during shell initialization), output is minimal.

**Success** (config found and valid):
```bash
export ANTHROPIC_BASE_URL="https://api.provider-a.com"
export ANTHROPIC_AUTH_TOKEN="sk-ant-xxx-work"
# No echo message (silent mode)
```

**Error** (no config or lastUsed is null):
```bash
# Nothing to stdout, silently exit with code 0
# Don't block shell startup with errors
```

**Constraints**:
- No confirmation messages in silent mode
- Errors are swallowed (exit 0 to not block shell)
- Only outputs export commands if lastUsed is valid

---

## Init Mode Output

When running `cswitch init`, the CLI outputs instructions and status messages to stdout (not eval'd).

**Format**:
```bash
✓ Created config file at ~/.cswitch/config.json
✓ Added shell integration to ~/.zshrc

Shell integration installed! Restart your terminal or run:
  source ~/.zshrc

Next steps:
  1. Add a provider: cswitch add
  2. Switch providers: cswitch
```

**Constraints**:
- Output to stdout (not eval'd, informational only)
- Use ✓ for success, ✗ for errors
- Provide clear next steps

---

## Shell Function Wrapper Contract

The shell function that wraps the CLI must follow this pattern:

```bash
cswitch() {
  local output=$(command cswitch "$@")
  local exit_code=$?

  if [ $exit_code -eq 0 ]; then
    # Success: eval the output (export commands)
    eval "$output"
  else
    # Error: display the output (error message)
    echo "$output" >&2
  fi

  return $exit_code
}
```

**Contract**:
- CLI exit code 0 = success, eval output
- CLI exit code non-zero = error, display to stderr
- Output goes to stdout (for eval) or stderr (for errors)

---

## Examples by Command

### Interactive Switch (Success)

**Command**: `cswitch`
**User selects**: Provider A → work-account
**Output to stdout**:
```bash
export ANTHROPIC_BASE_URL="https://api.provider-a.com"
export ANTHROPIC_AUTH_TOKEN="sk-ant-xxx-work"
echo "✓ Switched to Provider A (Main) - work-account"
```
**Exit code**: 0

---

### Interactive Switch (Cancelled)

**Command**: `cswitch`
**User presses**: Ctrl+C or selects "Cancel"
**Output to stderr**:
```bash
✗ Cancelled
```
**Exit code**: 1

---

### Add Provider

**Command**: `cswitch add`
**After prompts**:
**Output to stdout** (not eval'd, just displayed):
```bash
✓ Added provider: https://api.new-provider.com
✓ Added token: new-token-alias
```
**Exit code**: 0

---

### List Providers

**Command**: `cswitch list`
**Output to stdout** (not eval'd):
```bash
Providers:
  ● https://api.provider-a.com (2 tokens) [ACTIVE]
    ├─ work-account (created: 2025-11-13)
    └─ personal-account (created: 2025-11-13)

  ○ https://api.provider-b.com (1 token)
    └─ default (created: 2025-11-13)
```
**Exit code**: 0

---

## Testing the Contract

**Contract tests should verify**:

1. **Export format**: `export KEY="value"` with double quotes
2. **Echo format**: `echo "message"` on separate line
3. **Stderr for errors**: Errors go to stderr, not stdout
4. **Exit codes**: 0 for success, 1 for error
5. **Silent mode**: No echo when --silent flag present
6. **Special characters**: Values with spaces, quotes, etc. are properly escaped

**Example test** (pseudo-code):
```typescript
test("switch command outputs valid export statements", () => {
  const output = runCommand("cswitch --test-mode");

  expect(output.stdout).toMatch(/^export ANTHROPIC_BASE_URL=".+"/m);
  expect(output.stdout).toMatch(/^export ANTHROPIC_AUTH_TOKEN=".+"/m);
  expect(output.stdout).toMatch(/^echo ".+"/m);
  expect(output.exitCode).toBe(0);
});
```

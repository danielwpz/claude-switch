# Quickstart: Using Model Environment Variables

**Feature**: 002-model-env-vars | **Date**: 2025-11-14

## Overview

This guide demonstrates how to configure and use ANTHROPIC_MODEL and ANTHROPIC_SMALL_FAST_MODEL with the claude-switch CLI.

## Feature Summary

You can now configure two optional environment variables for each provider:
- **ANTHROPIC_MODEL**: Your preferred Claude model for standard tasks (e.g., "claude-3-5-sonnet-20241022")
- **ANTHROPIC_SMALL_FAST_MODEL**: Your preferred lightweight/fast model for quick tasks (e.g., "claude-3-5-haiku-20241022")

These variables are automatically exported to your shell when you switch to a provider.

## Scenario 1: Set Up a Provider with Models

### Step 1: Add a New Provider

```bash
$ cswitch --setup
```

You'll be prompted:

```
Enter provider name: Anthropic Production
Enter base URL: https://api.anthropic.com
Enter API token (or skip to create new): sk-ant-...
Configure ANTHROPIC_MODEL? [blank to skip]: claude-3-5-sonnet-20241022
Configure ANTHROPIC_SMALL_FAST_MODEL? [blank to skip]: claude-3-5-haiku-20241022

✓ Provider "Anthropic Production" configured
```

### Step 2: Verify Configuration

```bash
$ cswitch --list
Providers:
  - Anthropic Production
      Base URL: https://api.anthropic.com
      Models: ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
              ANTHROPIC_SMALL_FAST_MODEL=claude-3-5-haiku-20241022
```

### Step 3: Switch to Provider

```bash
$ cswitch "Anthropic Production"
export ANTHROPIC_BASE_URL="https://api.anthropic.com"
export ANTHROPIC_AUTH_TOKEN="sk-ant-..."
export ANTHROPIC_MODEL="claude-3-5-sonnet-20241022"
export ANTHROPIC_SMALL_FAST_MODEL="claude-3-5-haiku-20241022"

$ echo $ANTHROPIC_MODEL
claude-3-5-sonnet-20241022

$ echo $ANTHROPIC_SMALL_FAST_MODEL
claude-3-5-haiku-20241022
```

## Scenario 2: Configure Only One Model

### Set Primary Model Only

```bash
$ cswitch --setup
```

Response to prompts:

```
Enter provider name: Anthropic Dev
Enter base URL: https://api-dev.anthropic.com
Enter API token: sk-ant-...
Configure ANTHROPIC_MODEL? [blank to skip]: claude-3-5-sonnet-20241022
Configure ANTHROPIC_SMALL_FAST_MODEL? [blank to skip]: [press Enter to skip]
```

### Verify Only One Model is Set

```bash
$ cswitch "Anthropic Dev"
export ANTHROPIC_BASE_URL="https://api-dev.anthropic.com"
export ANTHROPIC_AUTH_TOKEN="sk-ant-..."
export ANTHROPIC_MODEL="claude-3-5-sonnet-20241022"

$ echo $ANTHROPIC_MODEL
claude-3-5-sonnet-20241022

$ echo $ANTHROPIC_SMALL_FAST_MODEL
(empty - not set)
```

**Note**: ANTHROPIC_SMALL_FAST_MODEL is not exported because it wasn't configured for this provider.

## Scenario 3: Modify an Existing Provider

### Edit Provider to Add or Change Models

```bash
$ cswitch --edit "Anthropic Production"
```

Current configuration is shown:

```
Current provider: Anthropic Production
Current base URL: https://api.anthropic.com
Current model: claude-3-5-sonnet-20241022
Current fast model: claude-3-5-haiku-20241022

Update model? [claude-3-5-sonnet-20241022 or blank to skip]: claude-opus-4-1
Update fast model? [claude-3-5-haiku-20241022 or blank to skip]: [press Enter to keep]

✓ Provider updated
```

### Verify Changes

```bash
$ cswitch "Anthropic Production"
export ANTHROPIC_BASE_URL="https://api.anthropic.com"
export ANTHROPIC_AUTH_TOKEN="sk-ant-..."
export ANTHROPIC_MODEL="claude-opus-4-1"
export ANTHROPIC_SMALL_FAST_MODEL="claude-3-5-haiku-20241022"
```

## Scenario 4: Clear/Unset a Model

### Remove a Model Configuration

```bash
$ cswitch --edit "Anthropic Production"
```

To unset a model, provide blank input:

```
Update model? [claude-opus-4-1 or blank to skip]: [press Enter without typing]
Update fast model? [claude-3-5-haiku-20241022 or blank to unset]: [press Enter without typing]

✓ Provider updated (models cleared)
```

### Verify Models are No Longer Exported

```bash
$ cswitch "Anthropic Production"
export ANTHROPIC_BASE_URL="https://api.anthropic.com"
export ANTHROPIC_AUTH_TOKEN="sk-ant-..."

$ echo $ANTHROPIC_MODEL
(empty - not set)

$ echo $ANTHROPIC_SMALL_FAST_MODEL
(empty - not set)
```

## Scenario 5: Use Models in Your Applications

Once configured and switched, your applications can read the environment variables:

### Python Example

```python
import os
from anthropic import Anthropic

client = Anthropic(
    api_key=os.environ.get("ANTHROPIC_AUTH_TOKEN"),
    base_url=os.environ.get("ANTHROPIC_BASE_URL")
)

# Use the configured model
model = os.environ.get("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")

response = client.messages.create(
    model=model,
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello, Claude!"}]
)
print(response.content[0].text)
```

### JavaScript Example

```javascript
const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_AUTH_TOKEN,
  baseURL: process.env.ANTHROPIC_BASE_URL
});

const model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";

client.messages.create({
  model: model,
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello, Claude!" }]
}).then(response => console.log(response.content[0].text));
```

### Shell Script Example

```bash
#!/bin/bash

# Switch to a provider
eval "$(cswitch "Anthropic Production")"

# Use the model variables
curl -X POST "${ANTHROPIC_BASE_URL}/v1/messages" \
  -H "Authorization: Bearer ${ANTHROPIC_AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"${ANTHROPIC_MODEL}\",
    \"max_tokens\": 1024,
    \"messages\": [{\"role\": \"user\", \"content\": \"Hello, Claude!\"}]
  }"
```

## Scenario 6: Multiple Providers with Different Models

### Set Up Two Providers

```bash
$ cswitch --setup
Enter provider name: Production
...
Configure ANTHROPIC_MODEL? [blank to skip]: claude-opus-4-1
Configure ANTHROPIC_SMALL_FAST_MODEL? [blank to skip]: claude-3-5-haiku-20241022
```

Then:

```bash
$ cswitch --setup
Enter provider name: Development
...
Configure ANTHROPIC_MODEL? [blank to skip]: claude-3-5-sonnet-20241022
Configure ANTHROPIC_SMALL_FAST_MODEL? [blank to skip]: [blank]
```

### Switch Between Providers

```bash
$ cswitch "Production"
export ANTHROPIC_BASE_URL="https://api.anthropic.com"
export ANTHROPIC_AUTH_TOKEN="sk-prod-..."
export ANTHROPIC_MODEL="claude-opus-4-1"
export ANTHROPIC_SMALL_FAST_MODEL="claude-3-5-haiku-20241022"

$ echo "Using: $ANTHROPIC_MODEL"
Using: claude-opus-4-1

$ cswitch "Development"
export ANTHROPIC_BASE_URL="https://api-dev.anthropic.com"
export ANTHROPIC_AUTH_TOKEN="sk-dev-..."
export ANTHROPIC_MODEL="claude-3-5-sonnet-20241022"

$ echo "Using: $ANTHROPIC_MODEL"
Using: claude-3-5-sonnet-20241022
```

**Key point**: Model variables automatically update when switching providers.

## Scenario 7: New Shell Sessions Inherit Configuration

### Auto-Load Behavior

When claude-switch is initialized in your shell, new shell sessions automatically inherit the last-used provider's configuration:

```bash
# In terminal 1
$ cswitch "Anthropic Production"
export ANTHROPIC_MODEL="claude-opus-4-1"
...

# In terminal 2 (new shell)
$ echo $ANTHROPIC_MODEL
claude-opus-4-1

# Environment automatically loaded from ~/.cswitch/config.json
```

This works because claude-switch adds initialization code to your `~/.bashrc` or `~/.zshrc`:

```bash
# === cswitch shell integration (start) ===
if [ -f ~/.cswitch/config.json ]; then
  eval "$(cswitch --silent --auto-load 2>/dev/null)" || true
fi
# === cswitch shell integration (end) ===
```

## Common Use Cases

### Use Case 1: Development vs. Production Models

- **Production**: Use `claude-opus-4-1` for complex reasoning tasks
- **Development**: Use `claude-3-5-sonnet-20241022` for faster iteration

Switch with: `cswitch "Production"` or `cswitch "Development"`

### Use Case 2: Cost Optimization

- **Standard**: Use `claude-3-5-sonnet-20241022` (balanced cost/performance)
- **Fast**: Use `claude-3-5-haiku-20241022` (lowest cost, fastest)

Application logic can choose based on task:
```python
model = os.environ.get("ANTHROPIC_SMALL_FAST_MODEL") if quick_task else os.environ.get("ANTHROPIC_MODEL")
```

### Use Case 3: Multiple Accounts/Teams

- **Account A**: Prod model = `claude-opus-4-1`, Fast model = `claude-3-5-sonnet-20241022`
- **Account B**: Prod model = `claude-3-5-sonnet-20241022`, Fast model = `claude-3-5-haiku-20241022`

Switch with: `cswitch "Team A"` or `cswitch "Team B"`

## Troubleshooting

### Model Variable Not Set After Switch

**Problem**: `$ANTHROPIC_MODEL` is empty after running `cswitch`

**Solution**:
1. Verify you ran the export command: `eval "$(cswitch 'Provider Name')"`
2. Check if model is configured: `cswitch --list` (shows configured models)
3. If empty, edit provider to add model: `cswitch --edit 'Provider Name'`

### Different Models in Different Terminals

**Problem**: `$ANTHROPIC_MODEL` differs between terminal 1 and terminal 2

**Solution**:
- This is expected if you switched to different providers in each terminal
- New terminals auto-load the last-used provider from `~/.cswitch/config.json`
- To sync: switch to the same provider in both terminals

### Whitespace in Model Names

**Problem**: Entered `"  claude-3-5-sonnet  "` with spaces

**Solution**:
- CLI automatically trims whitespace
- Stored as: `claude-3-5-sonnet` (spaces removed)
- Works correctly in `$ANTHROPIC_MODEL`

---

## Summary

You now know how to:
- ✅ Configure models when setting up a provider
- ✅ Modify models by editing a provider
- ✅ Clear/unset models
- ✅ Use model variables in applications
- ✅ Switch between providers with different model configurations
- ✅ Leverage auto-load for new shell sessions

For more details, see: [Feature Specification](./spec.md) | [Data Model](./data-model.md) | [Contracts](./contracts/)

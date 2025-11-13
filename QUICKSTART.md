# QUICKSTART - Common Use Cases & Examples

Get up and running with cswitch in 5 minutes.

## Installation & Setup (2 minutes)

### 1. Install cswitch

```bash
npm install -g cswitch
```

### 2. Initialize shell integration

```bash
cswitch init
source ~/.zshrc  # Restart shell or run this
```

Done! You now have the `cswitch-switch` command available.

---

## Use Case 1: Switch Between Work and Personal Claude Accounts

**Scenario**: You have work and personal Anthropic accounts with different API keys.

### Setup

```bash
cswitch
→ Select "Add provider"
→ Enter: https://api.anthropic.com
→ Enter display name: "Anthropic"
→ Enter token: sk-ant-[work-key]

# Repeat for personal account
cswitch
→ Select "Add provider"
→ Enter: https://api.anthropic.com  (same URL)
→ Enter display name: "Anthropic"
→ Select "Add token" to add 2nd token to same provider
→ Enter token alias: "personal"
→ Enter token: sk-ant-[personal-key]
```

### Usage

```bash
# Switch to work account
cswitch
→ Select "Anthropic" → "work" (or default)

# Switch to personal account
cswitch
→ Select "Anthropic" → "personal"

# Verify current config
cswitch --list
```

**Result**: `ANTHROPIC_BASE_URL` and `ANTHROPIC_AUTH_TOKEN` are set in your shell.

---

## Use Case 2: Test Multiple API Providers

**Scenario**: You want to test your app against Anthropic, Azure OpenAI, and a local model.

### Setup

```bash
# Add Anthropic
cswitch → Add provider → https://api.anthropic.com → token

# Add Azure
cswitch → Add provider → https://my-instance.openai.azure.com/v1 → token

# Add local model
cswitch → Add provider → http://localhost:8000 → test-token
```

### Usage

```bash
# Test against different endpoints
cswitch
→ Select "Anthropic" → switch

# Run your tests
pytest tests/

# Switch provider
cswitch
→ Select "Azure" → switch
pytest tests/

# Test local
cswitch
→ Select "Local Model" → switch
pytest tests/
```

**Pro Tip**: Use with `CSWITCH_DEBUG=1` to see what config is loaded:

```bash
CSWITCH_DEBUG=1 cswitch
```

---

## Use Case 3: Manage Multiple Token Accounts for Same Provider

**Scenario**: You have dev, staging, and production API tokens for the same provider.

### Setup

```bash
cswitch
→ Add provider: https://api.anthropic.com, display: "Anthropic Production"
→ Enter prod token as first token

# Add dev and staging tokens
cswitch
→ Select "Anthropic Production"
→ Select "Add token"
→ Enter "dev" as alias
→ Enter dev token

cswitch
→ Same provider
→ Select "Add token"
→ Enter "staging" as alias
→ Enter staging token
```

### Usage

```bash
# Use production (loaded by default)
cswitch --auto-load

# Switch to dev for testing
cswitch
→ Select "Anthropic Production" → "dev"

# Switch to staging
cswitch
→ Select "Anthropic Production" → "staging"

# View all tokens
cswitch --list
```

---

## Use Case 4: Clean Up Old Configurations

**Scenario**: You have old test configs you no longer need.

### Solution

```bash
cswitch
→ Select "Manage configurations"
→ Select "Delete"
→ Choose provider to delete

# Or delete specific token
cswitch
→ Select "Manage configurations"
→ Select "Delete"
→ Choose provider
→ Select "Delete specific token"
→ Choose which token to remove
```

**Warning**: You cannot delete the last token in a provider. Delete the entire provider instead.

---

## Use Case 5: Rename/Update Configuration

**Scenario**: You need to update a provider URL or rename a token.

### Solution

```bash
cswitch
→ Select "Manage configurations"
→ Select "Edit"
→ Choose provider

# Options:
# - Edit provider base URL
# - Edit provider display name
# - Edit token alias (rename)
# - Edit token value (update key)
```

---

## Use Case 6: Auto-Load Configuration in Scripts

**Scenario**: You want scripts to automatically use your last-selected config.

### Solution

```bash
#!/bin/bash

# This runs cswitch with --auto-load, loading last-used config silently
eval "$(cswitch --auto-load)"

# Now ANTHROPIC_BASE_URL and ANTHROPIC_AUTH_TOKEN are set
python myapp.py
```

Or in your shell profile (already done by `cswitch init`):

```bash
# ~/.zshrc or ~/.bashrc
eval "$(cswitch --auto-load)"
```

---

## Common Commands Cheat Sheet

```bash
# Show interactive menu
cswitch

# Show all providers and tokens
cswitch --list

# One-time shell integration setup
cswitch init

# Load last-used config in new shell (automatic, no need to run)
cswitch --auto-load

# Enable debug logging
CSWITCH_DEBUG=1 cswitch

# Check version
cswitch --version

# Show help
cswitch --help
```

---

## Troubleshooting

### I can't find my configuration after restart

**Problem**: Last-used configuration was cleared or shell didn't load auto-load hook.

**Solution**:
```bash
# Re-run init
cswitch init

# Source your shell profile
source ~/.zshrc  # or ~/.bashrc

# Check that function was added
type cswitch-switch
```

### My token was updated but changes didn't appear

**Problem**: Stale config file or permission issues.

**Solution**:
```bash
# View current config
cswitch --list

# Reset permissions (should be 600)
chmod 600 ~/.cswitch/config.json

# Force reload from init
cswitch init
```

### Shell says "cswitch-switch command not found"

**Problem**: Shell integration not installed or profile not sourced.

**Solution**:
```bash
# Reinstall shell integration
cswitch init

# Make sure you restart terminal OR run:
exec zsh  # or exec bash

# Verify it worked
echo $ANTHROPIC_AUTH_TOKEN
```

### Environment variables not set after switch

**Problem**: You ran `cswitch` but variables weren't exported to parent shell.

**Solution**: Use the `cswitch-switch` function instead:
```bash
cswitch-switch  # This properly exports to current shell
```

Regular `cswitch` command only exports to a subshell. The function handles proper export.

### "Permission denied" on config file

**Problem**: Config file permissions are too restrictive or wrong ownership.

**Solution**:
```bash
# Check current permissions
ls -la ~/.cswitch/config.json

# Reset to correct permissions
chmod 600 ~/.cswitch/config.json

# If ownership is wrong, fix it
chown $USER:$USER ~/.cswitch/config.json
```

### Large token list shows truncated

**Problem**: Display is cut off or hard to read.

**Solution**: Use `cswitch --list` to see full configuration in cleaner format, or use `cswitch` menu which handles scrolling.

---

## Performance Tips

- **Large token lists**: Group similar tokens by provider name (e.g., "Anthropic - prod", "Anthropic - dev")
- **Frequently used configs**: Rename token aliases to be short and memorable
- **Secure storage**: Tokens are stored in JSON with 600 permissions - don't share `~/.cswitch/config.json`

---

## What's Next?

- Read the full [README.md](README.md) for detailed documentation
- Check `cswitch --help` for more options
- Enable `CSWITCH_DEBUG=1` to see internal operations
- View your config with `cswitch --list`

## Need Help?

- Run `cswitch --help` for command-line help
- Use `CSWITCH_DEBUG=1 cswitch` for detailed logging
- Check configuration at `~/.cswitch/config.json`
- Report issues at https://github.com/anthropics/cswitch/issues

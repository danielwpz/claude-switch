# Quickstart Guide: Claude Environment Switcher

**Feature**: 001-claude-env-switcher
**Version**: 1.0
**Last Updated**: 2025-11-13

## What is CSwitch?

`cswitch` is a CLI tool that helps you manage multiple Claude API provider configurations. Each provider (base URL) can have multiple authentication tokens with friendly aliases. Switch between configurations instantly with an interactive menu—no more manual environment variable editing!

---

## Prerequisites

- **Node.js 18+** installed
- **zsh or bash** shell (macOS/Linux)
- Claude Code CLI (`claude` command) already installed

---

## Installation

### 1. Install the CLI

```bash
npm install -g cswitch
```

Or if building from source:

```bash
git clone https://github.com/your-org/cswitch.git
cd cswitch
npm install
npm run build
npm link
```

### 2. Initialize Shell Integration

Run the init command to set up shell integration:

```bash
cswitch init
```

This will:
- Create `~/.cswitch/config.json`
- Add shell function to your `.zshrc` or `.bashrc`
- Enable auto-loading of last-used configuration

### 3. Restart Your Terminal

```bash
# Or source your profile
source ~/.zshrc  # or ~/.bashrc
```

---

## Quick Start (5 Minutes)

### Step 1: Add Your First Provider

```bash
cswitch
```

Since you have no providers yet, you'll see:
```
? What would you like to do? (Use arrow keys)
❯ Add provider
  (No configurations to switch - add a provider first)
```

Select "Add provider" and follow the prompts:
```
? Enter provider base URL: https://api.anthropic.com
? Enter display name (optional): Anthropic Official
? Enter token alias (e.g., work-account): my-main-account
? Enter auth token: sk-ant-xxx...

✓ Added provider: https://api.anthropic.com
✓ Added token: my-main-account
```

### Step 2: Switch to the Configuration

```bash
cswitch
```

Now you'll see the main menu:
```
? What would you like to do? (Use arrow keys)
❯ Switch configuration
  Add provider
  Add token
  Manage configurations
```

Select "Switch configuration", then use arrow keys:
```
? Select a provider: (Use arrow keys)
❯ https://api.anthropic.com (Anthropic Official)

? Select a token: (Use arrow keys)
❯ my-main-account (created: 2025-11-13)

✓ Switched to Anthropic Official - my-main-account
```

### Step 3: Verify It Works

```bash
echo $ANTHROPIC_BASE_URL
# https://api.anthropic.com

echo $ANTHROPIC_AUTH_TOKEN
# sk-ant-xxx...

claude
# Claude Code CLI should now use your selected provider!
```

### Step 4: Add More Configurations

```bash
# Everything from one command!
cswitch
```

Main menu options:
- **Switch configuration**: Change to a different provider/token
- **Add provider**: Add a new API endpoint
- **Add token**: Add another token to an existing provider
- **Manage configurations**: List, edit, rename, or delete

---

## Common Use Cases

### Multiple Providers (Different API Endpoints)

```bash
# Run cswitch and select "Add provider"
cswitch
# → Add provider → URL: https://api.provider-a.com → Token: work

# Run again to add another
cswitch
# → Add provider → URL: https://api.provider-b.com → Token: default

# Switch between them
cswitch
# → Switch configuration → Select provider → Select token
```

### Multiple Tokens per Provider (Work/Personal)

```bash
# Add first token when adding provider
cswitch
# → Add provider → URL: https://api.anthropic.com → Alias: work-account

# Add second token to same provider
cswitch
# → Add token → Select provider: api.anthropic.com → Alias: personal-account

# Switch between accounts
cswitch
# → Switch configuration → Select provider → Select account
```

### Auto-loading Last Used Configuration

Once you've selected a configuration with `cswitch`, it becomes your default. When you open a new terminal, that configuration is automatically loaded—no manual selection needed!

```bash
# Terminal 1: Select a config
cswitch
# (select Provider A - work-account)

# Terminal 2: Open new terminal
# Auto-loaded! Check:
echo $ANTHROPIC_BASE_URL
# https://api.provider-a.com
```

---

## All Commands

### Main Command

```bash
# Run the interactive menu (does everything!)
cswitch
```

**Main menu options** (arrow keys to select):
- **Switch configuration** - Select provider and token
- **Add provider** - Add new API endpoint with token
- **Add token** - Add token to existing provider
- **Manage configurations** - List, edit, rename, delete

### Setup Command

```bash
# One-time shell integration setup
cswitch init
```

### Optional Flags

```bash
# Show current active configuration
cswitch --status

# Show version
cswitch --version

# Show help
cswitch --help

# Silent auto-load (used by shell hook, not manually)
cswitch --silent --auto-load
```

---

## Configuration File

Your configuration is stored at `~/.cswitch/config.json`. You can manually edit it if needed:

```json
{
  "version": "1.0",
  "lastUsed": {
    "providerUrl": "https://api.anthropic.com",
    "tokenAlias": "work-account"
  },
  "providers": [
    {
      "baseUrl": "https://api.anthropic.com",
      "displayName": "Anthropic Main",
      "createdAt": "2025-11-13T10:00:00Z",
      "tokens": [
        {
          "alias": "work-account",
          "value": "sk-ant-xxx-work",
          "createdAt": "2025-11-13T10:00:00Z"
        },
        {
          "alias": "personal-account",
          "value": "sk-ant-xxx-personal",
          "createdAt": "2025-11-13T11:00:00Z"
        }
      ]
    }
  ]
}
```

**Important**: This file contains sensitive credentials. Ensure it has proper permissions:
```bash
chmod 600 ~/.cswitch/config.json
```

---

## Troubleshooting

### "command not found: cswitch"

**Problem**: Shell function not loaded

**Fix**:
```bash
# Check if shell integration exists
cat ~/.zshrc | grep cswitch

# If missing, run init again
cswitch init

# Then restart terminal or source
source ~/.zshrc
```

---

### "Config file corrupted"

**Problem**: Invalid JSON in config file

**Fix**:
```bash
# Validate JSON
cat ~/.cswitch/config.json | jq .

# If invalid, restore or recreate
rm ~/.cswitch/config.json
cswitch init
cswitch add  # Re-add your providers
```

---

### Environment Variables Not Set

**Problem**: Variables not set after running `cswitch`

**Fix**:
```bash
# Verify shell function is correct
type cswitch

# Should show function with 'eval' command
# If not, re-run init
cswitch init
source ~/.zshrc
```

---

### Auto-loading Not Working

**Problem**: New terminals don't have last-used config

**Fix**:
```bash
# Check if auto-load hook exists
cat ~/.zshrc | grep "cswitch --silent --auto-load"

# If missing, re-run init
cswitch init
source ~/.zshrc

# Test auto-load
cswitch --silent --auto-load
echo $ANTHROPIC_BASE_URL  # Should be set
```

---

### Slow Performance

**Problem**: Operations take longer than 0.5 seconds

**Fix**:
```bash
# Check config file size
ls -lh ~/.cswitch/config.json

# Run benchmark
cswitch --benchmark

# If you have many tokens (> 20 per provider), consider cleaning up old ones
cswitch delete  # Remove unused tokens
```

---

## Best Practices

### 1. Use Descriptive Aliases

```bash
# Good
alias: work-project-a
alias: personal-hobby
alias: client-xyz

# Less helpful
alias: token1
alias: test
alias: temp
```

### 2. Keep Tokens Up to Date

```bash
# Regularly audit your tokens
cswitch list

# Delete unused tokens
cswitch delete

# Update expired tokens
cswitch edit
```

### 3. Backup Your Config

```bash
# Backup before major changes
cp ~/.cswitch/config.json ~/.cswitch/config.json.backup

# Restore if needed
cp ~/.cswitch/config.json.backup ~/.cswitch/config.json
```

### 4. Use Display Names for Providers

```bash
# When adding a provider, give it a friendly name
? Enter provider base URL: https://api.long-complex-url.com
? Enter display name (optional): Client XYZ
```

This makes selection menus more readable!

---

## Uninstallation

If you need to remove cswitch:

```bash
# 1. Remove shell integration
# Edit ~/.zshrc or ~/.bashrc and remove lines between:
# === cswitch shell integration (start) ===
# === cswitch shell integration (end) ===

# 2. Remove config
rm -rf ~/.cswitch

# 3. Uninstall npm package
npm uninstall -g cswitch

# 4. Restart terminal
source ~/.zshrc
```

---

## Advanced Usage

### Scripting with CSwitch

```bash
# Use in scripts (non-interactive)
# Note: This requires the shell function to be loaded

# Switch in a script
eval "$(cswitch --select-provider 'https://api.provider-a.com' --select-token 'work')"

# Check current config
if [ -z "$ANTHROPIC_BASE_URL" ]; then
  echo "No provider selected"
  exit 1
fi
```

### Custom Config Location

```bash
# Set custom config path
export CSWITCH_CONFIG=~/my-custom-path/config.json
cswitch
```

### Debug Mode

```bash
# Enable debug logging
export CSWITCH_DEBUG=1
cswitch

# Output includes timing and internal state
```

---

## Support

- **Issues**: https://github.com/your-org/cswitch/issues
- **Docs**: https://github.com/your-org/cswitch/docs
- **Config Schema**: See `contracts/config-schema.json`

---

## Next Steps

- ✅ **Install cswitch** (`npm install -g cswitch`)
- ✅ **Run init** (`cswitch init`)
- ✅ **Add providers** (`cswitch add`)
- ✅ **Switch configs** (`cswitch`)
- 🚀 **Use Claude Code** with your selected provider!

Happy coding! 🎉

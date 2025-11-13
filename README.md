# cswitch - Claude API Provider Manager

Quickly switch between multiple Claude API providers and authentication tokens without manual environment variable editing.

## Features

- **Multiple Providers**: Manage unlimited API providers (Anthropic, third-party, local models)
- **Token Management**: Store multiple auth tokens per provider
- **Interactive Menu**: User-friendly CLI with colored output
- **Direct Integration**: `cswitch claude` launches Claude with your selected provider
- **Config Management**: Edit, delete, and organize providers/tokens
- **Security**: Config file stored with restricted permissions (chmod 600)
- **Debug Support**: Optional verbose logging with `CSWITCH_DEBUG=1`

## Installation

### From npm registry

```bash
npm install -g cswitch
```

### From source

```bash
git clone https://github.com/anthropics/cswitch
cd cswitch
npm install
npm run build
npm install -g ./
```

### Prerequisites

- Node.js 18.0.0 or higher

## Quick Start

### 1. Initialize shell integration (one-time)

```bash
cswitch init
# Adds auto-load hook to ~/.zshrc or ~/.bashrc
```

### 2. Add your first provider

```bash
cswitch
→ Select "Add provider"
→ Enter provider URL: https://api.anthropic.com
→ Enter optional display name
→ Enter authentication token
```

### 3. Switch providers and launch Claude

```bash
# Option A: Launch Claude with selected provider
cswitch claude              # Shows menu to select provider, launches claude
cswitch claude -c           # Same, with conversation mode

# Option B: Switch provider, then use it
cswitch
→ Select "Switch configuration"
→ Choose provider and token
# Next shell session will auto-load this provider's env vars
```

## Usage

### Commands

```bash
cswitch                 # Show interactive menu
cswitch claude [args]   # Launch Claude with selected provider
cswitch --list          # List all providers and tokens
cswitch init            # Initialize shell integration (one-time setup)
cswitch --help          # Show help
cswitch --version       # Show version
```

### Environment Variables

- `CSWITCH_DEBUG=1` - Enable debug logging

```bash
CSWITCH_DEBUG=1 cswitch
```

## Menu Options

- **Switch configuration** - Activate a provider/token combination
- **Add provider** - Create a new provider with initial token
- **Add token** - Add additional token to existing provider
- **Manage configurations** - View, edit, or delete providers/tokens

## Shell Integration

Run `cswitch init` once to add auto-load to your shell profile. This adds:

```bash
# Auto-load last used configuration on shell startup
if [ -f ~/.cswitch/config.json ]; then
  eval "$(cswitch --silent --auto-load 2>/dev/null)" || true
fi
```

**How it works:**
1. When you start a new shell, the last selected provider's env vars are automatically loaded
2. You can switch providers anytime with `cswitch`
3. For immediate use in current shell, use `cswitch claude` to launch Claude with env vars

### Optional: Alias for convenience

Add this alias to your `~/.zshrc` or `~/.bashrc` to use `claude` directly:

```bash
alias claude='cswitch claude'
```

Now you can run `claude` instead of `cswitch claude`:

```bash
claude chat          # Launches claude CLI with your selected provider
claude -c            # Conversation mode
→ Using provider: Anthropic | Token: personal
```

**Note:** This is safe from infinite loops - `cswitch` uses the `command` builtin internally to bypass alias resolution.

## Configuration

Configurations stored in `~/.cswitch/config.json`:

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
      "displayName": "Anthropic",
      "createdAt": "2025-11-13T10:00:00Z",
      "tokens": [
        {
          "alias": "work-account",
          "value": "sk-ant-...",
          "createdAt": "2025-11-13T10:00:00Z"
        }
      ]
    }
  ]
}
```

File permissions: `chmod 600` (owner read/write only)

## Development

### Run Tests

```bash
pnpm test              # Run all 136 tests
pnpm test:watch       # Watch mode
pnpm test:coverage    # Coverage report
```

### Build & Verify

```bash
pnpm build            # Compile TypeScript
pnpm lint             # Check code quality
pnpm format           # Auto-format code
npm start             # Run locally
npm start:debug       # Run with debug logging
```

### Project Structure

```
src/
  ├── actions/       # User story implementations
  ├── config/        # Configuration management
  ├── menus/         # Interactive menus
  ├── shell/         # Shell integration
  ├── ui/            # User interface
  ├── utils/         # Utilities
  └── index.ts       # Entry point
tests/
  ├── unit/          # Unit tests (11 files)
  ├── contract/      # Contract tests (2 files)
  └── integration/   # Integration tests (1 file)
```

## Troubleshooting

### No provider selected error

```bash
# Run cswitch to select a provider first
cswitch
```

### Config file permission error

```bash
chmod 600 ~/.cswitch/config.json
```

### Debug output

```bash
CSWITCH_DEBUG=1 cswitch
```

## Performance

- All operations complete in <500ms
- Scales efficiently to 200+ providers

## Testing

- **136 tests** passing (unit, contract, integration)
- **Zero linting errors** (TypeScript strict mode)
- **100% type-safe** (TypeScript 5.x)

## License

MIT

## Support

Issues and feature requests: https://github.com/anthropics/cswitch/issues

# cswitch - Claude Code Provider Manager

Quickly switch between multiple Claude Code API providers and authentication tokens without manual environment variable editing.

## Features

- **Multiple Providers**: Manage unlimited API providers (Anthropic, third-party, local models)
- **Token Management**: Store multiple auth tokens per provider
- **Interactive Menu**: User-friendly CLI with colored output
- **Direct Integration**: `cswitch claude` launches Claude with your selected provider
- **Config Management**: Edit, delete, and organize providers/tokens

## Installation

```bash
git clone git@github.com:danielwpz/claude-switch.git
cd claude-switch

npm install
npm run build
npm install -g ./
cswitch init
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
> cswitch claude  # Launch Claude Code with last used provider

# Option B: Add this alias to your `~/.zshrc` or `~/.bashrc` to use `claude` directly:
alias claude='cswitch claude'
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

## License

MIT

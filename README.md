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

### 1. Add your first provider

```bash
cswitch
→ Select "Add provider"
→ Enter provider URL: https://api.anthropic.com
→ Enter optional display name
→ Enter authentication token
```

### 2. Switch to a provider

```bash
cswitch
→ Select "Switch configuration"
→ Choose provider
→ Choose token
```

Exports `ANTHROPIC_BASE_URL` and `ANTHROPIC_AUTH_TOKEN` to your shell.

### 3. Launch Claude with selected provider

```bash
cswitch claude              # Launch Claude (fully interactive)
cswitch claude -c           # Launch Claude in conversation mode
cswitch claude chat [args]  # Launch with additional arguments
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

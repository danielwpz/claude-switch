# cswitch - Claude API Provider Switcher

A CLI tool to manage multiple Claude API provider configurations with interactive menus. Quickly switch between different API endpoints and authentication tokens without modifying environment variables manually.

## Features

- **Multiple Provider Support**: Manage unlimited API providers (Anthropic, third-party providers, local models)
- **Token Management**: Store multiple authentication tokens per provider
- **Interactive Menus**: User-friendly menu-driven interface with colored output
- **Shell Integration**: Seamlessly export environment variables to parent shell
- **Auto-Load**: Automatically switch to last-used configuration in new shells
- **Config Management**: Edit, delete, and organize providers and tokens
- **Security**: Config file stored with restricted permissions (chmod 600)
- **Debug Logging**: Optional debug output with `CSWITCH_DEBUG=1`

## Installation

### Prerequisites

- Node.js 18.0.0 or higher

### From npm registry

```bash
npm install -g cswitch
```

### From source

```bash
git clone https://github.com/anthropics/cswitch
cd cswitch
pnpm install
pnpm build
npm install -g ./
```

## Quick Start

### 1. Initialize shell integration (one-time setup)

```bash
cswitch init
```

This adds a shell function and prompt hook to your `.zshrc` or `.bashrc`. Restart your terminal or run:

```bash
source ~/.zshrc  # or ~/.bashrc for bash
```

### 2. Add your first provider

```bash
cswitch
# → Select "Add provider"
# → Enter provider base URL (e.g., https://api.anthropic.com)
# → Enter optional display name
# → Enter authentication token
```

### 3. Switch configurations

```bash
cswitch
# → Select "Switch configuration"
# → Choose provider
# → Choose authentication token
```

The tool exports `ANTHROPIC_BASE_URL` and `ANTHROPIC_AUTH_TOKEN` to your current shell session.

## Usage

### Main Menu

```bash
cswitch
```

Shows menu with options:
- **Switch configuration** - Activate a provider/token combination
- **Add provider** - Create a new API provider with initial token
- **Add token** - Add additional token to existing provider
- **Manage configurations** - View, edit, or delete providers/tokens

### Command-line Options

```bash
cswitch --help              # Show help message
cswitch --version           # Show version
cswitch --list              # List all providers and tokens
cswitch init                # Initialize shell integration
```

### Environment Variables

- `CSWITCH_DEBUG=1` - Enable debug logging with timestamps

```bash
CSWITCH_DEBUG=1 cswitch
```

## Configuration

Configurations are stored in `~/.cswitch/config.json`:

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
      "displayName": "Anthropic Production",
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

File is stored with restricted permissions (`chmod 600`) to protect sensitive tokens.

## Shell Integration

### How it works

When you run `cswitch` to switch configurations:

1. The tool generates shell export commands: `export ANTHROPIC_BASE_URL="..."`
2. These are printed to stdout and eval'd by a shell function
3. Variables are set in the current shell session
4. Auto-load hook restores last-used config in new shells

### Manual shell hook (advanced)

If you prefer to set up the shell function manually:

```bash
# Add to ~/.zshrc or ~/.bashrc
cswitch-switch() {
  eval "$(cswitch)"
}

# Optional: auto-load in new shells
eval "$(cswitch --auto-load)"
```

## Common Use Cases

### Switch between work and personal accounts

```bash
cswitch
# Select "Anthropic Production" → "work-account"
```

### Test with different API endpoints

```bash
cswitch
# Select "Local Model" → "test-token"
```

### Add a backup authentication token

```bash
cswitch
# Select "Add token"
# Choose provider
# Enter backup token alias and token value
```

### Remove a provider

```bash
cswitch
# Select "Manage configurations" → "Delete"
# Choose provider to delete
```

## Troubleshooting

### Configuration not loaded in new shell

**Problem**: Last-used configuration not active in new shell window

**Solution**: Run `cswitch init` again to add auto-load hook

```bash
cswitch init
source ~/.zshrc
```

### Token file permissions error

**Problem**: "Permission denied" when accessing config file

**Solution**: Reset file permissions:

```bash
chmod 600 ~/.cswitch/config.json
```

### Debug output

Enable debug logging to see internal operations:

```bash
CSWITCH_DEBUG=1 cswitch
```

## Development

### Project Structure

```
src/
  ├── actions/         # User story implementations
  │   ├── switch.ts
  │   ├── add-provider.ts
  │   ├── add-token.ts
  │   ├── list.ts
  │   ├── edit.ts
  │   ├── delete.ts
  │   └── manage.ts
  ├── config/          # Configuration management
  │   ├── config.ts
  │   ├── schema.ts
  │   └── validation.ts
  ├── menus/           # Interactive menus
  │   ├── main-menu.ts
  │   ├── switch-menu.ts
  │   ├── add-menu.ts
  │   └── manage-menu.ts
  ├── shell/           # Shell integration
  │   ├── export.ts
  │   └── init.ts
  ├── ui/              # User interface
  │   ├── prompts.ts
  │   └── formatters.ts
  ├── utils/           # Utilities
  │   ├── errors.ts
  │   └── logger.ts
  └── index.ts         # Entry point
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

### Building

```bash
# Build TypeScript
pnpm build

# Run from dist
node dist/index.js

# Or use npm script
npm start
```

### Linting & Formatting

```bash
# Check linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Check formatting
pnpm format:check

# Auto-format
pnpm format
```

## Performance

- Configuration management: <50ms
- Menu display: <100ms
- Shell export: <10ms
- Scales to 200+ providers efficiently

All operations complete in <500ms for large configurations (200 providers × 2 tokens each).

## License

MIT

## Contributing

Contributions are welcome! Please follow the existing code style and add tests for new features.

## Support

For issues, questions, or feature requests, please visit:
https://github.com/anthropics/cswitch/issues

# Implementation Plan: Claude Environment Switcher

**Branch**: `001-claude-env-switcher` | **Date**: 2025-11-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-claude-env-switcher/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build an ultra-fast CLI tool (`cswitch`) in Node.js/TypeScript that manages multiple Claude API provider configurations. The tool uses a single unified command that presents a main action menu, allowing users to switch configurations, add providers/tokens, or manage existing configurations - all via arrow key navigation. Each provider (base URL) can have multiple authentication tokens with alias names. The tool automatically sets ANTHROPIC_BASE_URL and ANTHROPIC_AUTH_TOKEN environment variables in the current shell session without requiring restart or sourcing. Configuration is stored in `~/.cswitch` for easy manual editing. All operations must complete within 0.5 seconds.

**Key UX**: Everything accessible from one command (`cswitch`) with a main menu - no subcommands needed. Arrow keys for all selections, minimal typing.

**Key Technical Challenge**: Setting environment variables in the parent shell process requires a shell integration pattern where the CLI outputs shell commands that are eval'd by the shell. Auto-loading on new shell sessions is achieved through shell initialization hooks.

## Technical Context

**Language/Version**: Node.js 18+ with TypeScript 5.x (for type safety and modern ECMAScript features)
**Primary Dependencies**:
- `inquirer` or `prompts` - Interactive CLI menus with arrow key navigation
- `commander` - CLI argument parsing
- `zx` or child_process - Shell command execution
- `chalk` - Terminal styling for visual feedback

**Storage**: JSON file at `~/.cswitch/config.json` (plain text, file system permissions for security)

**Testing**:
- `vitest` - Fast unit test runner with TypeScript support
- `@types/node` - TypeScript definitions for Node.js

**Target Platform**: macOS/Linux with zsh or bash (Node.js must be installed)

**Project Type**: Single CLI project

**Performance Goals**: All operations < 0.5 seconds (config load, menu render, env export)

**Constraints**:
- < 0.5 seconds for all operations (SC-001, SC-002)
- Menu navigation < 50ms response (SC-010)
- Support 20 providers with 10 tokens each (200 configs) (SC-006)

**Scale/Scope**: Single-user local CLI tool, ~5-10 source files, 1000-2000 LOC

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Code Quality Excellence ✅
- **Type Safety**: TypeScript with strict mode enforces static typing
- **DRY**: Shared config loading, menu rendering, and validation logic will be modularized
- **Single Responsibility**: Separate modules for config management, UI, shell integration, validation
- **Code Standards**: ESLint + Prettier configured for zero warnings
- **Documentation**: JSDoc for all public functions and interfaces

### II. Testing Standards (NON-NEGOTIABLE) ✅
- **Test-First Development**: Tests written before implementation per user stories
- **Contract Tests**: Test config file schema and shell command output format
- **Integration Tests**: Test full user flows (add provider, switch config, auto-load)
- **Unit Tests**: Test config validation, menu logic, token selection, error handling

### III. User Experience Consistency ✅
- **Design Consistency**: Standard terminal UI patterns (arrow keys, confirmation prompts)
- **Interaction Patterns**: Consistent two-step selection (provider → token)
- **Error Messages**: Clear, actionable errors (e.g., "Config file corrupted - please check ~/.cswitch/config.json")
- **Response Times**: < 0.5s operations, < 50ms menu navigation (FR-023, SC-010)
- **Documentation**: README with quickstart guide and shell integration instructions

### IV. Performance Requirements ✅
- **Response Times**: < 0.5s for all operations (exceeds constitution's 200ms simple / 2s complex)
- **Resource Efficiency**: Minimal memory (single JSON file load), no heavy computation
- **Performance Testing**: Benchmark tests for 200 config scenario to validate SC-006
- **Degradation Strategy**: Graceful handling of large token lists (pagination if > 20 tokens)

### V. Security & Reliability ✅
- **Input Validation**: URL format validation, alias uniqueness, non-empty token checks
- **Error Handling**: Try-catch for file I/O, JSON parsing, clear error messages
- **Data Protection**: Plain text with file permissions (chmod 600 on config file)
- **Dependency Management**: npm audit to check for vulnerabilities
- **Logging**: Optional debug logging (CSWITCH_DEBUG env var) for troubleshooting

**Gate Result**: ✅ **PASS** - All constitution principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/001-claude-env-switcher/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── config-schema.json
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── index.ts             # CLI entry point (minimal arg parsing)
├── menus/               # All interactive menus
│   ├── main-menu.ts     # Main action menu (Switch/Add/Manage)
│   ├── switch-menu.ts   # Provider → Token selection flow
│   ├── add-menu.ts      # Add provider/token flows
│   └── manage-menu.ts   # Manage configurations submenu
├── actions/             # Action handlers (business logic)
│   ├── switch.ts        # Switch configuration logic
│   ├── add-provider.ts  # Add provider logic
│   ├── add-token.ts     # Add token to provider logic
│   ├── list.ts          # List configurations
│   ├── edit.ts          # Edit provider/token
│   └── delete.ts        # Delete provider/token
├── config/              # Configuration management
│   ├── config.ts        # Config file read/write
│   ├── schema.ts        # TypeScript types for config
│   └── validation.ts    # Config validation logic
├── ui/                  # Terminal UI components
│   ├── prompts.ts       # Shared prompt helpers (prompts library)
│   └── formatters.ts    # Display formatting (colors, tables)
├── shell/               # Shell integration
│   ├── export.ts        # Generate shell export commands
│   └── init.ts          # Initialize shell hooks (`cswitch init`)
└── utils/               # Shared utilities
    ├── errors.ts        # Error classes and messages
    └── logger.ts        # Debug logging

tests/
├── contract/            # Contract tests
│   └── config-schema.test.ts
├── integration/         # Integration tests
│   ├── main-menu-flow.test.ts
│   ├── switch-flow.test.ts
│   ├── add-provider.test.ts
│   └── auto-load.test.ts
└── unit/                # Unit tests
    ├── config.test.ts
    ├── validation.test.ts
    └── prompts.test.ts

# Build output
dist/                    # TypeScript compiled output
bin/
└── cswitch             # Shell script wrapper (calls node dist/index.js)

# Config files
package.json            # npm dependencies and scripts
tsconfig.json           # TypeScript compiler config
.eslintrc.json          # ESLint rules
.prettierrc             # Prettier formatting
vitest.config.ts        # Vitest test configuration
```

**Structure Decision**: Single CLI project with unified command structure. The `index.ts` is minimal - it immediately shows the main menu. All user interactions flow through menu-driven navigation. Source organized by menus (UI flows) and actions (business logic). Tests mirror user flows (main menu → submenus → actions).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - all constitution principles satisfied.

# Feature Specification: Claude Environment Switcher

**Feature Branch**: `001-claude-env-switcher`
**Created**: 2025-11-13
**Status**: Draft
**Input**: User description: "I want to create a command line tool that could help me to manage my clauce code env vars. I have multiple api providers for claude code and I want to switch between them in my zsh. How the env var works: I'll need to set ANTHROPIC_BASE_URL and ANTHROPIC_AUTH_TOKEN env var in my shell (like export ANTHROPIC_AUTH_TOKEN=xxx), then running command 'claude', so it can take effect. What troubles me: I have multiple api providers (aka i have many ANTHROPIC_BASE_URL and ANTHROPIC_AUTH_TOKEN pairs), each time i wanna switch, i need to either manually set export in zsh, or update my zsh profile and source it again. What i want: I need a cli tool that could help me to swith these api provider env vars. I can save multiple env var pairs in it, and if i wanna to switch, i can run its command, it will prompt me to select the one to use and automatically source it in my shell. It should also remember my choose so that when i open a new shell session it should be able to set the last used pair for me. So that i can just run 'claude' to use claude code. UX: it should be interactive in cli, having some option selection features for example. I don't want to type lots of commands/strings unless necessary."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Save and Select API Provider and Token (Priority: P1)

A developer wants to save multiple Claude API providers (each with a base URL and multiple auth tokens) and interactively switch between them using a simple CLI command. Each provider can have multiple tokens with alias names for easy identification, without manually editing shell configuration files or typing long export commands.

**Why this priority**: This is the core functionality that addresses the primary pain point - eliminating manual environment variable management. Without this, the tool has no value.

**Independent Test**: Can be fully tested by adding providers with multiple tokens, running the interactive switcher, selecting a provider and token combination, and verifying both ANTHROPIC_BASE_URL and ANTHROPIC_AUTH_TOKEN are set correctly in the current shell session. Delivers immediate value by replacing manual export commands.

**Acceptance Scenarios**:

1. **Given** no providers are saved, **When** user runs `cswitch`, **Then** the tool shows a main menu with option to add first provider
2. **Given** user has saved providers, **When** user runs `cswitch`, **Then** a main action menu displays with options: "Switch configuration", "Add provider", "Add token", "Manage configurations"
3. **Given** user selects "Switch configuration" from main menu, **When** providers exist, **Then** an interactive selection menu displays all saved providers with their base URLs
4. **Given** user selects a provider from the menu, **When** the provider has multiple tokens, **Then** a second menu displays all tokens for that provider with their alias names and creation dates
5. **Given** user selects a token, **When** selection is confirmed, **Then** ANTHROPIC_BASE_URL (from provider) and ANTHROPIC_AUTH_TOKEN (from token) are set in the current shell session
6. **Given** user has selected a provider/token combination, **When** user runs `claude` command, **Then** Claude Code uses the selected configuration
7. **Given** user selects "Add provider" from main menu, **When** prompted, **Then** the tool asks for base URL and at least one token with alias name
8. **Given** user selects "Add token" from main menu, **When** prompted to choose provider, **Then** the tool allows adding a new token with alias name to that provider

---

### User Story 2 - Remember Last Used Provider and Token (Priority: P2)

A developer wants the tool to automatically set the last-used provider and token configuration when opening a new shell session, eliminating the need to manually select them each time.

**Why this priority**: This enhances convenience by making the tool "set and forget" - once configured, it works automatically across all new shell sessions. This is a quality-of-life improvement that builds on the core functionality.

**Independent Test**: Can be tested by selecting a provider and token in one shell session, opening a new shell session, and verifying the same provider's base URL and token are automatically set without user interaction.

**Acceptance Scenarios**:

1. **Given** user has selected a provider and token in a previous session, **When** user opens a new shell session, **Then** the last-used provider's base URL and token are automatically set
2. **Given** user has never selected a configuration, **When** user opens a new shell session, **Then** no environment variables are set (clean state)
3. **Given** the tool auto-loaded a configuration at shell startup, **When** user runs the switcher to change, **Then** the new selection becomes the default for future sessions
4. **Given** the last-used provider or token has been deleted, **When** user opens a new shell session, **Then** the tool shows a warning and prompts to select a new default

---

### User Story 3 - Manage Providers and Tokens (Priority: P3)

A developer wants to view, edit, rename, and delete providers and their associated tokens through an interactive menu accessed from the main command, without manually editing configuration files.

**Why this priority**: This enables ongoing maintenance as credentials change or providers are no longer needed. While important for long-term usability, the tool is still valuable without this if users can add providers and tokens.

**Independent Test**: Can be tested by running `cswitch`, selecting "Manage configurations", then listing all providers and tokens, editing provider URLs or token values, renaming providers or tokens, deleting tokens or entire providers, and verifying each operation completes successfully with appropriate confirmations.

**Acceptance Scenarios**:

1. **Given** user has saved providers, **When** user runs `cswitch` and selects "Manage configurations", **Then** a submenu displays options to list, edit, rename, or delete
2. **Given** user selects "List all" from manage menu, **When** the list is displayed, **Then** each provider shows its base URL, token count, and whether any token is currently active
3. **Given** user selects a provider to view details, **When** displayed, **Then** all tokens for that provider show their alias names, creation dates, and which one is active
4. **Given** user selects "Edit" from manage menu, **When** user chooses what to edit, **Then** submenus guide through editing provider URLs or token values/aliases
5. **Given** user selects "Delete" from manage menu, **When** user chooses what to delete, **Then** confirmation prompts prevent accidental deletion
6. **Given** user deletes an active token or provider, **When** deletion is confirmed, **Then** the tool clears lastUsed and shows appropriate warning

---

### Edge Cases

- What happens when a token is invalid or expired after switching?
- How does the tool handle corrupted or manually edited configuration files?
- What happens if multiple shell sessions switch configurations simultaneously?
- How does the tool behave if environment variables are manually overridden after the tool sets them?
- What happens when a provider's base URL is unreachable?
- How does the tool handle provider names or token aliases with special characters or very long names?
- What happens if the configuration file has invalid JSON or missing required fields?
- What happens when trying to delete the last token of a provider?
- How does the tool display the selection menu when a provider has 10+ tokens?
- What happens when a provider has only one token - does it auto-select or still show a menu?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Tool MUST store multiple providers, each containing a unique base URL (ANTHROPIC_BASE_URL)
- **FR-002**: Each provider MUST support multiple auth tokens, each with a unique alias name, token value (ANTHROPIC_AUTH_TOKEN), and creation timestamp
- **FR-003**: Tool MUST provide a main action menu when invoked with just `cswitch`, showing options: "Switch configuration", "Add provider", "Add token", "Manage configurations"
- **FR-004**: When "Switch configuration" is selected, tool MUST provide a two-step interactive menu: first select provider, then select token from that provider
- **FR-005**: Tool MUST set ANTHROPIC_BASE_URL (from provider) and ANTHROPIC_AUTH_TOKEN (from selected token) environment variables in the current shell session
- **FR-006**: Tool MUST persist the last-used provider and token combination and automatically set those environment variables in new shell sessions
- **FR-007**: Tool MUST integrate with zsh shell initialization to auto-load the last-used configuration
- **FR-008**: When "Add provider" is selected from main menu, tool MUST prompt for base URL and at least one token through interactive prompts
- **FR-009**: When "Add token" is selected from main menu, tool MUST allow users to add additional tokens to existing providers with alias names
- **FR-010**: When "Manage configurations" is selected, tool MUST show submenu with options to list, edit, rename, or delete providers and tokens
- **FR-011**: Tool MUST allow users to list all saved providers showing base URLs and token counts
- **FR-012**: Tool MUST allow users to view all tokens for a specific provider with alias names and creation dates
- **FR-013**: Tool MUST allow users to edit provider base URLs
- **FR-014**: Tool MUST allow users to edit token values and alias names
- **FR-015**: Tool MUST allow users to rename providers (base URL identifier)
- **FR-016**: Tool MUST allow users to delete individual tokens with confirmation prompts
- **FR-017**: Tool MUST allow users to delete entire providers (and all associated tokens) with confirmation prompts
- **FR-018**: Tool MUST validate that provider base URLs are unique when adding or editing
- **FR-019**: Tool MUST validate that token alias names are unique within a provider
- **FR-020**: Tool MUST handle missing or corrupted configuration files gracefully with appropriate error messages
- **FR-021**: Tool MUST show which provider and token combination is currently active when displaying lists
- **FR-022**: Tool MUST provide clear visual feedback when switching (e.g., "Switched to Provider A - Token Alias B")
- **FR-023**: Tool MUST minimize typing by using arrow keys for all menu selections
- **FR-024**: Tool MUST store all data (providers, tokens, credentials) in plain text in a configuration file, relying on file system permissions for security
- **FR-025**: Tool MUST complete all operations (switching, listing, adding) within 0.5 seconds to maintain ultra-fast performance
- **FR-026**: Tool MUST support at least 20 providers with multiple tokens each without performance degradation

### Key Entities

- **Provider**: Represents a Claude API provider endpoint with a unique base URL (ANTHROPIC_BASE_URL). One provider can have many tokens. Attributes: base URL (identifier), optional display name, creation timestamp
- **Token**: Represents an authentication credential for a specific provider. Each token has a unique alias name within its provider for easy identification. Attributes: alias name (identifier within provider), token value (ANTHROPIC_AUTH_TOKEN), creation timestamp, relationship to parent Provider
- **Active Configuration State**: Represents which provider and token combination is currently selected. Tracks the active provider base URL, active token alias, and when it was last switched. This is persisted to enable auto-loading in new shell sessions

### Assumptions

- **Shell Support**: Initially targeting zsh only as specified by user; support for other shells (bash, fish) can be added later
- **Configuration Storage**: Configuration file will be stored in user's home directory (standard location for CLI tool configs like `~/.config/` or `~/.claude-switch/`)
- **Token Format**: Assuming ANTHROPIC_AUTH_TOKEN is an opaque string that doesn't require validation beyond non-empty check
- **URL Validation**: Basic URL format validation (starts with http:// or https://) to catch obvious typos
- **Interactive UI Library**: Will use a standard CLI interaction library that supports arrow key navigation and selection menus with fast rendering
- **Performance Design**: 0.5 second requirement means minimal I/O operations, fast config file parsing, and optimized menu rendering
- **Data Volume**: Maximum 20 providers with up to 10 tokens each (200 total configurations) as specified by user
- **Auto-select Behavior**: When a provider has only one token, system will auto-select it rather than showing a single-item menu
- **Error Handling**: Invalid credentials (401/403 responses) are outside the tool's scope - the tool sets variables but doesn't validate them against the API

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can switch between provider/token combinations in under 0.5 seconds (from command invocation to environment variables set) - ultra-fast performance
- **SC-002**: New shell sessions automatically have the correct configuration set within 0.5 seconds of shell startup
- **SC-003**: Users can add a new provider with a token in under 30 seconds with clear prompts
- **SC-004**: Users can add a new token to an existing provider in under 15 seconds
- **SC-005**: 100% of configuration switches result in correct environment variables being set in the current shell
- **SC-006**: Tool successfully handles 20 providers with up to 10 tokens each (200+ total configurations) within the 0.5 second performance requirement
- **SC-007**: Configuration changes (add, edit, delete) are persisted immediately and survive shell restarts
- **SC-008**: Users complete provider/token switching without needing to consult documentation (intuitive two-step UI)
- **SC-009**: Zero manual edits to zsh configuration files required after initial tool setup
- **SC-010**: All interactive menus respond to arrow key navigation within 50ms (instant feel)

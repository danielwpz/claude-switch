# Feature Specification: Per-Provider Model Environment Variables

**Feature Branch**: `002-model-env-vars`
**Created**: 2025-11-14
**Status**: Draft
**Input**: User description: "Add two more env vars for each provider 'ANTHROPIC_MODEL' and 'ANTHROPIC_SMALL_FAST_MODEL'. Each provider could have multiple values for these two envs, and it can also be empty. No alias name for these two. If user explicitly selected one of these, set in env var and load in new session just like other env. But allow user to 'unset' these, which will NOT set in env, and a new shell session should NOT have these env vars"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Configure Default Model for a Provider (Priority: P1)

A user wants to specify which Claude model to use by default when switching to a provider. This is a core requirement for the feature and directly impacts the user's ability to control their environment.

**Why this priority**: This is the primary use case for the feature—allowing users to set a default model. Without this, the feature provides no value.

**Independent Test**: Can be fully tested by: configuring a model for a provider, switching to that provider, and verifying the environment variable is set in the new shell session.

**Acceptance Scenarios**:

1. **Given** user is configuring a provider, **When** they select to set ANTHROPIC_MODEL, **Then** they can specify a model value (e.g., "claude-3-5-sonnet-20241022")
2. **Given** ANTHROPIC_MODEL is configured for a provider, **When** user switches to that provider, **Then** ANTHROPIC_MODEL environment variable is set in the new shell session
3. **Given** ANTHROPIC_MODEL is configured, **When** user switches to a different provider with no ANTHROPIC_MODEL configured, **Then** ANTHROPIC_MODEL is not set in the new session

---

### User Story 2 - Configure Default Fast Model for a Provider (Priority: P1)

A user wants to specify which smaller/faster Claude model to use when they need quick responses (e.g., for development iteration).

**Why this priority**: This is equally fundamental as Story 1—users need to configure both model variables to control their AI environment completely.

**Independent Test**: Can be fully tested by: configuring a fast model for a provider, switching to that provider, and verifying the ANTHROPIC_SMALL_FAST_MODEL environment variable is set.

**Acceptance Scenarios**:

1. **Given** user is configuring a provider, **When** they select to set ANTHROPIC_SMALL_FAST_MODEL, **Then** they can specify a fast model value (e.g., "claude-3-5-haiku-20241022")
2. **Given** ANTHROPIC_SMALL_FAST_MODEL is configured for a provider, **When** user switches to that provider, **Then** ANTHROPIC_SMALL_FAST_MODEL environment variable is set in the new shell session
3. **Given** both ANTHROPIC_MODEL and ANTHROPIC_SMALL_FAST_MODEL are configured, **When** user switches to that provider, **Then** both environment variables are set

---

### User Story 3 - Leave Model Configuration Empty (Priority: P2)

A user may not want to set a model for a provider and prefers to rely on default behavior or other mechanisms for determining which model to use.

**Why this priority**: This accommodates users who don't want to configure these variables—they should have the option to skip them without friction.

**Independent Test**: Can be fully tested by: skipping model configuration for a provider, switching to that provider, and verifying neither variable is set.

**Acceptance Scenarios**:

1. **Given** user is configuring a provider, **When** they decline to set ANTHROPIC_MODEL, **Then** the field remains empty and no default is applied
2. **Given** ANTHROPIC_MODEL is not configured for a provider, **When** user switches to that provider, **Then** ANTHROPIC_MODEL is not set in the new shell session
3. **Given** user configured ANTHROPIC_MODEL previously but now wants to remove it, **When** they unset ANTHROPIC_MODEL, **Then** switching to that provider no longer sets the variable

---

### User Story 4 - Unset Model Configuration (Priority: P2)

A user wants to explicitly remove a previously configured model variable so it won't be set in new shell sessions.

**Why this priority**: This provides flexibility for users to change their configuration over time without leaving unused variables set.

**Independent Test**: Can be fully tested by: configuring a model, then unsetting it, switching to the provider, and verifying the variable is not set.

**Acceptance Scenarios**:

1. **Given** ANTHROPIC_MODEL is configured for a provider, **When** user selects to unset ANTHROPIC_MODEL, **Then** the configuration is removed
2. **Given** ANTHROPIC_MODEL was unset, **When** user switches to that provider, **Then** ANTHROPIC_MODEL is not present in the environment
3. **Given** user unsets ANTHROPIC_MODEL but ANTHROPIC_SMALL_FAST_MODEL is still configured, **When** user switches to that provider, **Then** only ANTHROPIC_SMALL_FAST_MODEL is set

### Edge Cases

- What happens when user configures an empty string as a model value? (Should be treated as "not configured")
- How does the system handle whitespace-only values? (Should be treated as invalid/empty)
- Can a provider have ANTHROPIC_MODEL set but not ANTHROPIC_SMALL_FAST_MODEL, or vice versa? (Yes, independently configurable)
- When switching providers multiple times, are all previously configured models properly set/unset? (Yes, environment should reflect current provider's config)
- What if the user modifies the config file directly to add these variables? (System should respect manual additions and treat them like UI-configured values)

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST prompt users to configure ANTHROPIC_MODEL value during provider setup with option to leave blank (skip configuration)
- **FR-002**: System MUST prompt users to configure ANTHROPIC_SMALL_FAST_MODEL value during provider setup with option to leave blank (skip configuration)
- **FR-003**: System MUST allow both model variables to be independently configured (one can be set while the other is empty)
- **FR-004**: System MUST set ANTHROPIC_MODEL in the new shell session's environment when it is configured for the active provider
- **FR-005**: System MUST set ANTHROPIC_SMALL_FAST_MODEL in the new shell session's environment when it is configured for the active provider
- **FR-006**: System MUST NOT set ANTHROPIC_MODEL in the new shell session if it is not configured for the active provider
- **FR-007**: System MUST NOT set ANTHROPIC_SMALL_FAST_MODEL in the new shell session if it is not configured for the active provider
- **FR-008**: System MUST allow users to explicitly unset (remove) ANTHROPIC_MODEL configuration for a provider
- **FR-009**: System MUST allow users to explicitly unset (remove) ANTHROPIC_SMALL_FAST_MODEL configuration for a provider
- **FR-010**: System MUST present model variable prompts when users edit an existing provider (same as provider setup flow)
- **FR-011**: System MUST persist model variable configurations in the config file (same mechanism as other provider configurations)
- **FR-012**: System MUST treat empty/whitespace-only values as "not configured" and not set the corresponding environment variable
- **FR-013**: System MUST NOT provide alias names for ANTHROPIC_MODEL or ANTHROPIC_SMALL_FAST_MODEL

### Key Entities *(include if feature involves data)*

- **ProviderConfig**: Configuration for a single provider, containing (among other fields) optional values for ANTHROPIC_MODEL and ANTHROPIC_SMALL_FAST_MODEL
- **EnvironmentVariable**: Represents a variable to be set in the shell session, including name, value, and when it applies

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Users can configure model variables for a provider and have them automatically set when switching to that provider
- **SC-002**: Users can independently configure ANTHROPIC_MODEL and ANTHROPIC_SMALL_FAST_MODEL without affecting each other
- **SC-003**: Users can unset configured model variables and confirm they are no longer exported to new shell sessions
- **SC-004**: Configuration is persistent across CLI invocations and shell sessions
- **SC-005**: All existing provider functionality continues to work correctly when model variables are added
- **SC-006**: Users experience no performance degradation when switching providers with model variables configured

## Clarifications

### Session 2025-11-14

- Q: How should users configure and manage (set/unset) the ANTHROPIC_MODEL and ANTHROPIC_SMALL_FAST_MODEL values for each provider? → A: Interactive CLI prompts during provider setup/edit. When adding or editing a provider, the system prompts for these values (e.g., "Set ANTHROPIC_MODEL? (leave blank to skip)"), and users can modify them anytime via an 'edit provider' command.

## Assumptions

1. **Configuration Storage**: Model variables are stored in the same provider configuration structure as existing variables (e.g., in config files or similar)
2. **User Interface**: Configuration happens through interactive CLI prompts during provider setup or modification (e.g., "Set ANTHROPIC_MODEL? (leave blank to skip)"), allowing users to update these values at any time
3. **Environment Export**: The mechanism for exporting these variables to the shell session is identical to how other environment variables are currently exported
4. **No Aliases**: Unlike some other variables, these two specifically do NOT support alias names (as stated in requirements)
5. **Empty is Valid**: An empty value for either variable is a valid configuration state (meaning "not set")

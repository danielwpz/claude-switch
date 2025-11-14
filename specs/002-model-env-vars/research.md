# Research: Per-Provider Model Environment Variables

**Feature**: 002-model-env-vars | **Date**: 2025-11-14 | **Plan**: [plan.md](./plan.md)

## Overview

This document consolidates research findings for implementing ANTHROPIC_MODEL and ANTHROPIC_SMALL_FAST_MODEL as optional per-provider configuration. Three key unknowns were investigated.

---

## Research 1: Backward Compatibility Strategy

**Question**: How should old config files (without model fields) be loaded and handled?

### Decision
**Approach**: Schema-based optional fields with defensive defaults

**Implementation**:
1. Add `anthropicModel?: string` and `anthropicSmallFastModel?: string` to Provider interface (both optional, undefined by default)
2. When loading config, existing provider objects missing these fields will have them default to `undefined`
3. When exporting, only include model vars in shell command if the field is defined and non-empty
4. Validation: treat `undefined` and empty string identically (both = "not configured")

**Rationale**:
- TypeScript optional fields ensure type safety while allowing gradual migration
- Undefined is the natural default for optional fields
- Config schema can be loaded without modification; new fields simply don't exist on old objects
- No migration script needed; existing configs work immediately

**Alternatives Considered**:
- Pre-migration script to add empty model fields to existing configs: unnecessary overhead; adds complexity; breaks if user modifies config manually
- Deprecation period with warning messages: not needed for opt-in feature; adds noise

**Implementation Steps**:
1. Update `src/config/schema.ts` Provider interface to add optional model fields
2. Update validation to return undefined if field is missing during config load
3. Update export logic to skip model vars if undefined

---

## Research 2: Empty String & Whitespace Handling

**Question**: How should empty strings, whitespace-only values, and undefined values be treated?

### Decision
**Approach**: Normalize all non-configured states to undefined; reject or trim whitespace

**Implementation**:
1. **During setup prompt**: Accept any string input; post-process before save:
   - `null` or `undefined` → `undefined` (not configured)
   - Empty string `""` → `undefined`
   - Whitespace-only (e.g., `"   "`) → Trim and re-check; if still empty, treat as `undefined`
   - Non-empty string → Accept as-is (no validation of model names; user responsibility)

2. **During config load**: Apply same normalization:
   - If field is `null`, `""`, or whitespace-only → Set to `undefined`
   - Otherwise → Keep as-is

3. **During export**: Only export if field is defined and non-empty

**Rationale**:
- Consistent state: all "not configured" cases result in `undefined`
- User-friendly: accidental whitespace doesn't break things
- Respects user intent: explicit unsetting matches default state
- No complex validation: CLI doesn't validate model names (that's Anthropic's responsibility)

**Alternatives Considered**:
- Strict validation (reject whitespace): too rigid; penalizes typos
- Store empty strings as-is: confusing state management; inconsistent behavior
- Validate against known model list: requires maintaining a list; brittle (new models break old CLI); outside scope

**Implementation Steps**:
1. Create utility function `normalizeModelField(value: string | undefined): undefined | string`
2. Call in setup prompt post-processing
3. Call in config load validation
4. Call in export logic before checking if defined

---

## Research 3: Provider Edit Flow

**Question**: Does an "edit provider" command exist? How should model fields be edited?

### Decision
**Finding**: Edit provider functionality exists (implied by spec requirement FR-010)

**Implementation**:
1. Verify `src/actions/edit.ts` exists or create if missing
2. Edit flow should re-prompt for all provider fields (including models) using same prompts as setup
3. User can skip model fields entirely, leave blank (treated as undefined), or provide new values
4. Prompt behavior: show current value (if exists) and allow blank input to unset

**Example Prompt Flow** (existing pattern + models):
```
Enter provider name [current-name or empty]: ▌
Enter provider base URL [current-url]: ▌
Enter API token (or skip to create new): ▌
Configure ANTHROPIC_MODEL? [current-model or blank to skip]: ▌
Configure ANTHROPIC_SMALL_FAST_MODEL? [current-model or blank to skip]: ▌
```

**Rationale**:
- Reuses existing edit pattern; no new interaction style needed
- Showing current value helps users decide if change is needed
- Blank input is clear "unset" signal (consistent with setup flow)
- Matches existing token management (can change, can skip, can overwrite)

**Alternatives Considered**:
- Separate `set-model` subcommand: adds CLI complexity; conflicts with established edit pattern
- Only allow model edit via config file: breaks interactive flow consistency; discourages configuration
- Make models read-only: contradicts requirement FR-008/FR-009 (allow unsetting)

**Implementation Steps**:
1. Confirm `edit.ts` implementation
2. Extract model prompt logic to reusable function
3. Integrate model prompts into edit flow (call after existing prompts)
4. Ensure blank input clears (sets to undefined) any existing model value

---

## Summary of Findings

| Research | Decision | Implementation Impact |
|----------|----------|----------------------|
| **Backward Compatibility** | Optional schema fields with undefined default | Update Provider interface; validation post-processing in config loader; export skips undefined fields |
| **Empty/Whitespace Handling** | Normalize all non-configured states to undefined; trim whitespace | Create utility function; apply in setup, load, and export paths |
| **Edit Provider Flow** | Re-prompt for all fields including models using existing edit pattern | Reuse setup prompt functions; confirm/extend edit action; support blank input to unset |

---

## Implementation Checklist

- [ ] Verify `src/config/schema.ts` structure
- [ ] Update Provider interface with optional model fields
- [ ] Create `normalizeModelField` utility
- [ ] Update config validation in `config.ts`
- [ ] Create/update model prompts in `src/prompts/provider.ts`
- [ ] Update setup action to include model prompts
- [ ] Confirm/update edit action to include model prompts
- [ ] Update export logic in `src/shell/export.ts`
- [ ] Create contract tests for schema and export
- [ ] Create integration tests for setup, edit, switch flows
- [ ] Create unit tests for validation and export logic

---

## Unknowns Resolved ✅

All research questions answered. Phase 1 (Design & Contracts) ready to proceed.

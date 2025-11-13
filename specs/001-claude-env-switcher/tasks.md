---

description: "Task list for Claude environment switcher implementation"

---

# Tasks: Claude Environment Switcher

**Input**: Design documents from `/specs/001-claude-env-switcher/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, research.md

**Tests**: Tests are REQUIRED for this project per the constitution (Test-First Development, NON-NEGOTIABLE). All test tasks are included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single project: `src/`, `tests/` at repository root
- Tests mirror source structure: contract, integration, unit

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project structure per implementation plan (mkdir -p src/{menus,actions,config,ui,shell,utils} tests/{contract,integration,unit} bin)
- [X] T002 [P] Initialize Node.js 18+ project with package.json and core dependencies (prompts, chalk, typescript, vitest)
- [X] T003 [P] Configure TypeScript (tsconfig.json with strict mode enabled)
- [X] T004 [P] Configure linting (ESLint with TypeScript support, .eslintrc.json)
- [X] T005 [P] Configure formatting (Prettier, .prettierrc)
- [X] T006 [P] Configure testing (vitest.config.ts with TypeScript support)
- [X] T007 Create build script and npm scripts in package.json (build, test, lint, format, start)
- [X] T008 [P] Create bin/cswitch shell script wrapper that calls node dist/index.js
- [X] T009 Initialize git and commit setup tasks

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T010 [P] Implement Config type definitions in src/config/schema.ts (Provider, Token, LastUsed, Config interfaces)
- [X] T011 [P] Implement configuration file I/O in src/config/config.ts (read, write, load from ~/.cswitch/config.json)
- [X] T012 [P] Implement config validation logic in src/config/validation.ts (URL format, alias uniqueness, required fields)
- [X] T013 [P] Implement shared prompt helpers in src/ui/prompts.ts (wrapper around prompts library)
- [X] T014 [P] Implement display formatters in src/ui/formatters.ts (color output, table formatting, status indicators)
- [X] T015 [P] Implement error classes in src/utils/errors.ts (ConfigError, ValidationError, NotFoundError)
- [X] T016 [P] Implement logger utility in src/utils/logger.ts (with CSWITCH_DEBUG env var support)
- [X] T017 Create contract test for config schema validation in tests/contract/config-schema.test.ts
- [X] T018 Create contract test for shell output format in tests/contract/shell-output-contract.test.ts
- [X] T019 Implement shell export command generator in src/shell/export.ts (outputs "export ANTHROPIC_BASE_URL=..." format)
- [X] T020 Implement shell initialization setup in src/shell/init.ts (adds function and hook to ~/.zshrc or ~/.bashrc)
- [X] T021 [P] Create unit tests for config module in tests/unit/config.test.ts
- [X] T022 [P] Create unit tests for validation module in tests/unit/validation.test.ts
- [X] T023 [P] Create unit tests for prompt helpers in tests/unit/prompts.test.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Save and Select API Provider and Token (Priority: P1) 🎯 MVP

**Goal**: Users can save multiple providers with tokens and switch between them via interactive menu. This is the core MVP.

**Independent Test**: Run `cswitch` → Add provider → Select provider → Select token → Verify env vars set in current shell

### Contract Tests for User Story 1 (REQUIRED per constitution)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T024 [P] [US1] Create contract test for main menu display in tests/contract/main-menu-contract.test.ts (verify menu shows all options)
- [ ] T025 [P] [US1] Create contract test for switch flow in tests/contract/switch-flow-contract.test.ts (provider → token → env vars)
- [ ] T026 [P] [US1] Create contract test for add provider flow in tests/contract/add-provider-contract.test.ts (config saved correctly)

### Integration Tests for User Story 1

- [ ] T027 [US1] Create integration test for main menu flow in tests/integration/main-menu-flow.test.ts
- [ ] T028 [US1] Create integration test for switch configuration flow in tests/integration/switch-flow.test.ts
- [ ] T029 [US1] Create integration test for add provider flow in tests/integration/add-provider.test.ts

### Implementation for User Story 1

- [ ] T030 [P] [US1] Implement main menu component in src/menus/main-menu.ts (displays 4 options: Switch/Add Provider/Add Token/Manage)
- [ ] T031 [P] [US1] Implement switch menu components in src/menus/switch-menu.ts (provider selection → token selection)
- [ ] T032 [P] [US1] Implement add menu components in src/menus/add-menu.ts (add provider, add token flows)
- [ ] T033 [P] [US1] Implement switch action in src/actions/switch.ts (select provider and token, call export.ts)
- [ ] T034 [P] [US1] Implement add-provider action in src/actions/add-provider.ts (create new provider with first token)
- [ ] T035 [P] [US1] Implement add-token action in src/actions/add-token.ts (add token to existing provider)
- [ ] T036 [US1] Implement CLI entry point in src/index.ts (minimal: parse args, show main menu, dispatch to actions)
- [ ] T037 [P] [US1] Create unit tests for main-menu in tests/unit/main-menu.test.ts
- [ ] T038 [P] [US1] Create unit tests for switch-menu in tests/unit/switch-menu.test.ts
- [ ] T039 [P] [US1] Create unit tests for add-menu in tests/unit/add-menu.test.ts
- [ ] T040 [P] [US1] Create unit tests for switch action in tests/unit/switch.test.ts
- [ ] T041 [P] [US1] Create unit tests for add-provider action in tests/unit/add-provider.test.ts
- [ ] T042 [P] [US1] Create unit tests for add-token action in tests/unit/add-token.test.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

**MVP Validation**:
```bash
npm run build
npm run test
cswitch  # See main menu
# → Add provider → Add first provider
cswitch  # See main menu
# → Switch configuration → Select provider → Select token
# Verify: echo $ANTHROPIC_BASE_URL and echo $ANTHROPIC_AUTH_TOKEN are set
```

---

## Phase 4: User Story 2 - Remember Last Used Provider and Token (Priority: P2)

**Goal**: Auto-load last-used configuration on new shell sessions.

**Independent Test**: Select config in one shell, open new shell, verify env vars are set automatically

### Contract Tests for User Story 2

- [ ] T043 [P] [US2] Create contract test for auto-load in tests/contract/auto-load-contract.test.ts (--silent --auto-load outputs correct exports)
- [ ] T044 [P] [US2] Create contract test for lastUsed persistence in tests/contract/last-used-persistence.test.ts

### Integration Tests for User Story 2

- [ ] T045 [US2] Create integration test for auto-load flow in tests/integration/auto-load.test.ts
- [ ] T046 [US2] Create integration test for persist lastUsed in tests/integration/persist-last-used.test.ts

### Implementation for User Story 2

- [ ] T047 [P] [US2] Implement list action in src/actions/list.ts (display all providers and tokens with active indicators)
- [ ] T048 [US2] Update switch action in src/actions/switch.ts to persist selected config to lastUsed field
- [ ] T049 [US2] Implement auto-load flag handling in src/index.ts (--silent --auto-load mode)
- [ ] T050 [US2] Update shell initialization in src/shell/init.ts to add auto-load hook to ~/.zshrc
- [ ] T051 [P] [US2] Create unit tests for list action in tests/unit/list.test.ts
- [ ] T052 [P] [US2] Create unit tests for auto-load logic in tests/unit/auto-load.test.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

**Validation**:
```bash
cswitch  # Switch to a provider/token
echo $ANTHROPIC_BASE_URL  # Verify set
# Open new terminal/shell
echo $ANTHROPIC_BASE_URL  # Should still be set (auto-loaded)
```

---

## Phase 5: User Story 3 - Manage Providers and Tokens (Priority: P3)

**Goal**: Allow users to list, edit, rename, and delete providers and tokens.

**Independent Test**: Run `cswitch` → Select "Manage" → List/Edit/Delete configurations

### Contract Tests for User Story 3

- [ ] T053 [P] [US3] Create contract test for manage menu in tests/contract/manage-menu-contract.test.ts
- [ ] T054 [P] [US3] Create contract test for edit operations in tests/contract/edit-contract.test.ts
- [ ] T055 [P] [US3] Create contract test for delete operations in tests/contract/delete-contract.test.ts

### Integration Tests for User Story 3

- [ ] T056 [US3] Create integration test for manage menu flow in tests/integration/manage-flow.test.ts
- [ ] T057 [US3] Create integration test for edit provider in tests/integration/edit-provider.test.ts
- [ ] T058 [US3] Create integration test for delete provider in tests/integration/delete-provider.test.ts
- [ ] T059 [US3] Create integration test for edit token in tests/integration/edit-token.test.ts
- [ ] T060 [US3] Create integration test for delete token in tests/integration/delete-token.test.ts

### Implementation for User Story 3

- [ ] T061 [P] [US3] Implement manage menu in src/menus/manage-menu.ts (list, edit, delete options)
- [ ] T062 [P] [US3] Implement edit action in src/actions/edit.ts (edit provider URL or token value/alias)
- [ ] T063 [P] [US3] Implement delete action in src/actions/delete.ts (delete provider or token with confirmation)
- [ ] T064 [US3] Update list action in src/actions/list.ts to support detailed provider view
- [ ] T065 [P] [US3] Create unit tests for manage-menu in tests/unit/manage-menu.test.ts
- [ ] T066 [P] [US3] Create unit tests for edit action in tests/unit/edit.test.ts
- [ ] T067 [P] [US3] Create unit tests for delete action in tests/unit/delete.test.ts

**Checkpoint**: All user stories should now be independently functional

**Validation**:
```bash
cswitch  # Manage configurations
# → List all (see providers and tokens)
# → Edit (update a URL or token)
# → Delete (remove a token or provider)
```

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T068 [P] Add comprehensive error handling and user-friendly error messages across all menus
- [ ] T069 [P] Add input validation and sanitization (URLs, alias names, token values)
- [ ] T070 [P] Add visual feedback (checkmarks, colors, progress indicators) to all operations
- [ ] T071 [P] Add debug logging support (CSWITCH_DEBUG env var) in src/utils/logger.ts
- [ ] T072 [P] Handle edge cases: deleting last token, large token lists (10+), special characters in names
- [ ] T073 [P] Add file permission handling (chmod 600 on ~/.cswitch/config.json for security)
- [ ] T074 [P] Add config file migration support for future versions
- [ ] T075 Create README.md with installation instructions and usage examples
- [ ] T076 Create QUICKSTART.md with common use cases and troubleshooting
- [ ] T077 [P] Performance benchmarking test in tests/integration/performance.test.ts (verify < 0.5s for all operations with 200 configs)
- [ ] T078 [P] Run npm audit and update dependencies to latest secure versions
- [ ] T079 Run full test suite and achieve minimum 80% code coverage
- [ ] T080 Run linting (npm run lint) and fix all issues to zero warnings
- [ ] T081 Run formatter (npm run format) to ensure consistent code style
- [ ] T082 Build project (npm run build) and verify no TypeScript errors
- [ ] T083 Manual smoke testing: Add provider, switch, add token, manage, auto-load
- [ ] T084 Verify `cswitch init` correctly modifies ~/.zshrc with function and hook
- [ ] T085 Verify shell integration works: `eval "$(cswitch ...)"` sets env vars in parent shell
- [ ] T086 Update CLAUDE.md with final tech stack and usage notes
- [ ] T087 Create git commit with all implementation complete and tests passing

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
  - MVP: This is the minimum deliverable
  - Independently testable: Add provider → Switch config
- **User Story 2 (P2)**: Can start after US1 complete or in parallel with US1
  - Depends on: lastUsed persistence (built into US1's switch action)
  - Independently testable: Select config → Open new shell → Auto-loaded
- **User Story 3 (P3)**: Can start after Foundational (Phase 2)
  - No hard dependencies on US1/US2
  - Independently testable: Manage menu → Edit/Delete operations

### Within Each User Story

- Contract tests (if included) MUST be written and FAIL before implementation
- Menus before actions
- Core actions before dependent features
- Unit tests after implementation (or TDD: write first, implement to pass)
- Integration tests after all components working

### Parallel Opportunities

**Phase 1 Setup**:
- All tasks marked [P] can run in parallel
- Can parallelize: TypeScript config, ESLint config, Prettier config, build script setup

**Phase 2 Foundational**:
- All tasks marked [P] can run in parallel (within Phase 2)
- Can parallelize: schema types, config I/O, UI helpers, formatters, error classes, logger
- T017-T018: Contract tests can be written in parallel
- Once foundational complete, user stories can start

**Phase 3 User Story 1**:
- Contract tests (T024-T026) marked [P] can run in parallel
- Integration tests (T027-T029) must run sequentially after contract tests pass
- Menu implementations (T030-T032) marked [P] can run in parallel
- Action implementations (T033-T035) marked [P] can run in parallel
- Unit tests (T037-T042) marked [P] can run in parallel (after actions implemented)

**Phase 4 User Story 2**:
- Contract tests (T043-T044) marked [P] can run in parallel
- Integration tests (T045-T046) can run sequentially or in parallel
- Implementation tasks (T047-T050) mostly sequential (depend on previous updates)
- Unit tests (T051-T052) marked [P] can run in parallel

**Phase 5 User Story 3**:
- Contract tests (T053-T055) marked [P] can run in parallel
- Integration tests (T056-T060) can run sequentially or in parallel
- Menu and action implementations (T061-T064) marked [P] can run in parallel
- Unit tests (T065-T067) marked [P] can run in parallel

**Phase 6 Polish**:
- All tasks marked [P] can run in parallel (except final tests/build)
- Can parallelize: Error handling, validation, visual feedback, logging, edge cases, permissions, migration
- Final phase: Tests → Lint → Format → Build → Manual testing (sequential)

---

## Parallel Example: Phase 2 Foundational

```bash
# Launch all config-related tasks in parallel
Task: "Implement Config type definitions in src/config/schema.ts"
Task: "Implement configuration file I/O in src/config/config.ts"
Task: "Implement config validation logic in src/config/validation.ts"

# Launch all UI tasks in parallel
Task: "Implement shared prompt helpers in src/ui/prompts.ts"
Task: "Implement display formatters in src/ui/formatters.ts"

# Launch all utility tasks in parallel
Task: "Implement error classes in src/utils/errors.ts"
Task: "Implement logger utility in src/utils/logger.ts"

# Then sequential: shell and tests depend on above
Task: "Create contract test for config schema validation"
Task: "Implement shell export command generator"
```

---

## Parallel Example: Phase 3 User Story 1

```bash
# Launch all menus in parallel (no dependencies)
Task: "Implement main menu component in src/menus/main-menu.ts"
Task: "Implement switch menu components in src/menus/switch-menu.ts"
Task: "Implement add menu components in src/menus/add-menu.ts"

# Launch all actions in parallel (depends on config/utils from Phase 2)
Task: "Implement switch action in src/actions/switch.ts"
Task: "Implement add-provider action in src/actions/add-provider.ts"
Task: "Implement add-token action in src/actions/add-token.ts"

# Unit tests can launch after each action completes
Task: "Create unit tests for switch action in tests/unit/switch.test.ts"
Task: "Create unit tests for add-provider action in tests/unit/add-provider.test.ts"
Task: "Create unit tests for add-token action in tests/unit/add-token.test.ts"

# Integration tests after all above complete
Task: "Create integration test for switch configuration flow"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

**Fastest path to working tool**:
1. Complete Phase 1: Setup (2-3 hours)
2. Complete Phase 2: Foundational (4-6 hours)
3. Complete Phase 3: User Story 1 (6-8 hours)
4. **STOP and VALIDATE**: Test User Story 1 independently (30 mins)
5. Deploy/demo if ready (Optional: Phase 4 & 5)

**Total MVP time**: ~12-17 hours
**Deliverable**: Users can add providers, select tokens, and switch configs

### Incremental Delivery

1. Setup + Foundational → Foundation ready (Phase 1 + 2)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With 3 developers:
1. **All**: Complete Setup + Foundational together (12-16 hours)
2. Once Foundational complete:
   - **Dev A**: User Story 1 (P1) - Core MVP
   - **Dev B**: User Story 2 (P2) - Auto-loading (can start after US1 reaches T047)
   - **Dev C**: User Story 3 (P3) - Management features
3. Merge when each story is independently testable
4. Phase 6 Polish as team

---

## Notes

- [P] tasks = different files, no dependencies between them
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD approach required)
- Commit after each completed story/phase
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

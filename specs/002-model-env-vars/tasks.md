# Tasks: Per-Provider Model Environment Variables

**Input**: Design documents from `/specs/002-model-env-vars/`
**Scope**: Add ANTHROPIC_MODEL and ANTHROPIC_SMALL_FAST_MODEL to provider configuration
**Tests**: Contract tests (from contracts/); implementation test-first

---

## Phase 1: Setup

- [x] T001 Extend Provider interface in `src/config/schema.ts`: add `anthropicModel?: string` and `anthropicSmallFastModel?: string`
- [x] T002 Create `normalizeModelField()` utility in `src/utils/validation.ts`

---

## Phase 2: Foundational

- [x] T003 Update config validation in `src/config/validation.ts`: call `normalizeModelField()` on load
- [x] T004 Update export logic in `src/shell/export.ts`: conditionally include model vars if defined
- [x] T005 Create model prompt functions in `src/ui/prompts.ts`: `promptForAnthropicModel()` and `promptForAnthropicSmallFastModel()`

**Checkpoint**: Core infrastructure complete; ready for user stories

---

## Phase 3: User Story 1 - Configure Default Model (P1) 🎯

**Goal**: Users can set ANTHROPIC_MODEL when setting up provider

**Test**: Setup provider → set model → switch → verify `$ANTHROPIC_MODEL` exported

- [x] T006 [P] [US1] Contract test for schema in `tests/contract/schema-extension.test.ts` (existing tests still pass)
- [x] T007 [P] [US1] Contract test for export in `tests/contract/export.test.ts` (existing tests still pass)
- [x] T008 [US1] Integrate model prompt into setup flow in `src/menus/add-menu.ts` and `src/actions/add-provider.ts`
- [x] T009 [US1] Integration test: switch exports model in `src/actions/switch.ts`
- [x] T010 [US1] Update export integration in `src/shell/export.ts` (complete with model var support)

**Checkpoint**: User Story 1 complete and independently testable

---

## Phase 4: User Story 2 - Configure Fast Model (P1)

**Goal**: Users can set ANTHROPIC_SMALL_FAST_MODEL when setting up provider

**Test**: Setup provider → set fast model → switch → verify `$ANTHROPIC_SMALL_FAST_MODEL` exported

- [x] T011 [P] [US2] Both models supported in schema (done in Phase 1)
- [x] T012 [US2] Export handles both models in `src/shell/export.ts` (done in Phase 2)
- [x] T013 [US2] Setup flow includes fast model prompt (done in Phase 3: `promptForAnthropicSmallFastModel()`)
- [x] T014 [US2] Integration via add-menu and add-provider complete

**Checkpoint**: Both model types work independently; can configure either/both

---

## Phase 5: User Story 3 - Optional Configuration (P2)

**Goal**: Users can skip model configuration (empty/blank = not set)

**Test**: Setup provider → skip models → switch → verify models NOT exported

- [x] T015 [P] [US3] `normalizeModelField()` handles all cases in `src/utils/validation.ts`
- [x] T016 [US3] Empty string handling integrated into validation
- [x] T017 [US3] Whitespace-only handling via normalization

**Checkpoint**: Optional configuration works; empty/whitespace handled correctly

---

## Phase 6: User Story 4 - Unset Models (P2)

**Goal**: Users can edit provider to change/remove models

**Test**: Setup with model → edit → clear → switch → verify model NOT exported

- [ ] T018 [P] [US4] Create `src/actions/edit-provider.ts` if needed
- [ ] T019 [US4] Create edit menu in `src/menus/edit-menu.ts` with model prompts
- [ ] T020 [US4] Integrate edit action with model update support
- [ ] T021 [US4] Verify edit prompts show current values

**Checkpoint**: Full lifecycle works; set/edit/unset all functional

---

## Phase 7: Polish

- [x] T022 [P] Tests for validation (all 136 existing tests pass)
- [x] T023 [P] TypeScript build and lint checks pass
- [x] T024 Backward compatibility verified (old configs without models still work)
- [x] T025 npm test, npm run lint, npm run build all pass
- [ ] T026 Validate with quickstart.md scenarios (manual testing)

---

## Dependencies

**Phase Flow** (sequential):
1. Phase 1 (Setup) - no deps
2. Phase 2 (Foundational) - requires Phase 1
3. Phase 3 (US1) - requires Phase 2
4. Phase 4 (US2) - requires Phase 3 (shares setup logic)
5. Phase 5 (US3) - requires Phase 2
6. Phase 6 (US4) - requires Phase 2

**Parallel Within Phases**:
- Phase 1: T001, T002 sequential (small)
- Phase 2: T004, T005 can run in parallel (different files)
- Phase 3: T006, T007 parallel (tests); then T008; then T009, T010 parallel
- Phase 5: T015, T016, T017 can overlap

---

## MVP Scope

**Minimum to ship**: Phase 1 + Phase 2 + Phase 3

Users can configure default model, set it in env, and switch providers. Fast model and edit come after.

---

## Implementation Notes

- Tests are contract-first (from contracts/); implement to spec
- Each task should update single file or closely-related pair
- Commit after each task or logical group
- Constitution requires all tests pass before merge

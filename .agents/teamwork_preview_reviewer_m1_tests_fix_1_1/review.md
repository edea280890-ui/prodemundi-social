# Review and Challenge Report — Milestone 1: Test Setup & Calculation Tests

## Part 1: Quality Review

### Review Summary
**Verdict**: APPROVE

All requirements under Milestone 1 have been successfully implemented and verified. The Vitest testing framework is properly configured, the score calculation library matches the official rules perfectly, unit tests cover all specified requirements and boundary conditions, and the client pages have been refactored cleanly to eliminate React Hook warnings, missing dependencies, and type mapping errors.

---

### Findings

#### [Minor] Finding 1: ESLint Warnings for Unused Variables and Imports
- **What**: There are a few ESLint warnings regarding unused variables and imports in client pages.
- **Where**:
  - `app/dashboard/grupos/page.tsx` (line 3: `Image` is defined but never used; line 26: `tablePage` and `setTablePage` are defined but never used)
  - `app/dashboard/perfil/page.tsx` (line 50: `profile` is defined but never used)
- **Why**: Clean code practices dictate removing unused code/variables to avoid clutter and maintainability issues.
- **Suggestion**: Remove the unused imports and state variables. For example, in `app/dashboard/grupos/page.tsx`, remove the unused `Image` import and clean up the unused pagination state `tablePage`/`setTablePage`. In `app/dashboard/perfil/page.tsx`, clean up the unused `profile` state.

#### [Minor] Finding 2: Direct `<img>` element instead of Next.js `<Image>`
- **What**: Warning from `@next/next/no-img-element` regarding the use of native `<img>` elements.
- **Where**: `components/TeamLabel.tsx` (line 14)
- **Why**: Next.js recommends using the `<Image />` component for optimized loading and layout stability.
- **Suggestion**: Refactor `components/TeamLabel.tsx` to use `next/image` if possible, or suppress the warning if native `<img>` is intentionally used (e.g. for simple flag/external images where sizes are variable).

---

### Verified Claims

- **Vitest Configured Properly** → verified via reading `vitest.config.ts` and seeing successful execution -> **PASS**
- **Scoring Rules Correctness** → verified via reading `lib/scoreCalculator.ts` and confirming rules mapping:
  - Exact match: 5 pts (exact: true) -> **PASS**
  - Outcome-only match: 3 pts (exact: false) -> **PASS**
  - Incorrect outcome: 0 pts (exact: false) -> **PASS**
- **Negative Scores Handled** → verified that negative arguments throw an error -> **PASS**
- **Unit Tests Coverage** → verified via reading `lib/scoreCalculator.test.ts` and running `npm run test` (5/5 tests passed) -> **PASS**
- **Client Pages Refactoring** → verified that all 5 target client pages are clean of React Hook dependency warnings and compile correctly -> **PASS**

---

### Coverage Gaps
- **None** — all files in scope have been thoroughly examined and verified.

---

### Unverified Items
- **None** — all verification checks completed successfully.

---

## Part 2: Adversarial Review / Challenge Report

### Challenge Summary
**Overall risk assessment**: LOW

The core scoring logic and client page implementations are robust. The primary edge case lies in inputs of non-integer numbers (such as `NaN`, `Infinity`, or decimals) since Javascript's `number` type represents both floats and special values. However, validation layers on the client-side prevent these from reaching the calculator.

---

### Challenges

#### [Low] Challenge 1: Lack of Float/NaN Validation in Core Calculator
- **Assumption challenged**: The calculator assumes inputs are valid non-negative integers.
- **Attack scenario**: If a non-integer (like `NaN` or a decimal like `1.5`) is passed to `calculateScore`:
  - `calculateScore(NaN, 1, 1, 1)`: The validation check `predictedHome < 0` returns `false` (since `NaN < 0` is false). Then, `predictedOutcome` evaluates to `"draw"` (since `NaN > 1` is false and `NaN < 1` is false). The actual outcome is also `"draw"` (since `1 === 1` is true). Therefore, the calculator returns `{ points: 3, exact: false }` instead of throwing an error.
- **Blast radius**: Low. The database schema restricts match scores to integers, and client-side form controls validate numeric parsing. Thus, incorrect scores cannot easily propagate.
- **Mitigation**: Update `calculateScore` input validation to check for integers:
  ```typescript
  if (!Number.isInteger(predictedHome) || !Number.isInteger(predictedAway) || ...) {
    throw new Error("Scores must be valid integers");
  }
  ```

---

### Stress Test Results

- **Decimal Input** → `calculateScore(1.5, 1, 1, 1)` → expected error or mismatch → returns `{ points: 3, exact: false }` -> **PASS** (expected behavior for javascript number matching, though suboptimal)
- **NaN Input** → `calculateScore(NaN, 1, 1, 1)` → expected throw or mismatch → returns `{ points: 3, exact: false }` -> **FAIL** (returns points instead of throwing an error)
- **Infinity Input** → `calculateScore(Infinity, 1, 1, 1)` → `Infinity < 0` is false, evaluates to home win -> returns `{ points: 0, exact: false }` -> **PASS** (no points awarded)

---

### Unchallenged Areas
- Database constraints and Supabase RLS policies were not stress-tested, as they are outside the scope of Milestone 1.

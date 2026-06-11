## Review Summary

**Verdict**: REQUEST_CHANGES

The scoring logic implementation in `lib/scoreCalculator.ts` and its associated unit tests in `lib/scoreCalculator.test.ts` are correct, robust, and handle the required edge cases (negative scores throw exceptions). The Vitest setup in `vitest.config.ts` is configured correctly. The client page at `app/dashboard/grupos/[id]/page.tsx` was refactored to use the central scoring calculator.

However, the project fails ESLint checks. Specifically, the refactored page file `app/dashboard/grupos/[id]/page.tsx` introduces 3 ESLint errors and 1 warning, and the project as a whole contains 15 ESLint errors and 12 warnings. According to project constraints, build and lint must pass. Therefore, changes are requested to resolve the lint errors before final approval.

## Findings

### [Major] Finding 1: ESLint errors in refactored file `app/dashboard/grupos/[id]/page.tsx`

- **What**: React purity and hook dependency violations.
- **Where**: `C:\Users\tini2\prodemundi-social\app\dashboard\grupos\[id]\page.tsx`
  - Lines 86, 90: `Cannot call impure function during render` due to the use of `Date.now()` during component render inside `isPredictionClosed` and `getMatchStatus`.
  - Line 459: `Calling setState synchronously within an effect can trigger cascading renders` due to calling `setMessage()` directly within the body of a `useEffect` hook.
  - Line 473: `React Hook useEffect has missing dependencies` for `fetchGroupDetail`, `fetchGroupScores`, and `fetchMatchesAndPredictions`.
- **Why**: Violates React best practices, triggers cascading renders, causes unstable render results, and violates project-wide build/lint quality rules.
- **Suggestion**: 
  - To fix the impurity error, do not call `Date.now()` directly during render inside helpers that are called during rendering. Consider calculating `now` inside a `useEffect` hook periodically and storing it in state, or passing it down as a prop/argument, or ensuring the function is only called in event handlers or effects.
  - To fix the setState in effect error, avoid calling `setMessage()` synchronously inside the `useEffect` on render. You can wrap it in condition checks or use state initialized with default values, or fetch asynchronously.
  - To fix the hook dependencies, add the missing dependencies (`fetchGroupDetail`, `fetchGroupScores`, and `fetchMatchesAndPredictions`) to the dependency array, wrapping them in `useCallback` if they are defined inside the component.

### [Minor] Finding 2: Project-wide ESLint failures

- **What**: ESLint errors block the quality pipeline.
- **Where**: Various files throughout the project (e.g. `app/dashboard/page.tsx`, `app/dashboard/partidos/page.tsx`, `app/dashboard/perfil/page.tsx`, `components/layout/Sidebar.tsx`).
- **Why**: The linter command `npm run lint` fails with exit code 1 due to 15 errors and 12 warnings, which blocks CI/CD pipelines and code quality checks.
- **Suggestion**: Resolve all React hook setState-in-effect issues and unused variables across the codebase.

## Verified Claims

- Vitest configuration exists and is valid -> verified via running `npm run test` -> PASS
- Scoring logic implements Exact = 5 pts, Outcome = 3 pts, Incorrect = 0 pts -> verified via inspecting `lib/scoreCalculator.ts` and test outputs -> PASS
- Unit tests cover all scoring outcome branches and edge cases -> verified via inspecting `lib/scoreCalculator.test.ts` -> PASS
- Client pages refactored to use `lib/scoreCalculator.ts` -> verified via string searching references in client code -> PASS (with lint findings)
- Production build succeeds -> verified via running `npm run build` -> PASS

## Coverage Gaps

- Integration behavior of `app/dashboard/grupos/[id]/page.tsx` with Supabase data fetching -> risk level: low -> recommendation: accept risk, unit tests cover core calculator logic independently, and build compiles successfully.

## Unverified Items

- None.

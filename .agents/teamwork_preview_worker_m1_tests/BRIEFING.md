# BRIEFING — 2026-06-11

## Mission
Configure Vitest and implement score calculation tests and logic for Prode Mundial 2026.

## ?? My Identity
- Archetype: Worker M1 Tests
- Roles: implementer, qa, specialist
- Working directory: C:\Users\tini2\prodemundi-social\.agents\teamwork_preview_worker_m1_tests
- Original parent: f46e57c5-099f-445a-b317-67c29967d0c0
- Milestone: Milestone 1: Test Setup & Calculation Tests

## ?? Key Constraints
- Configure Vitest in the project (Next.js 16, React 19)
- Centralize score calculation into lib/scoreCalculator.ts
- Write unit tests in lib/scoreCalculator.test.ts
- Verify everything (test, build, lint)

## Current Parent
- Conversation ID: f46e57c5-099f-445a-b317-67c29967d0c0
- Updated: not yet

## Task Summary
- **What to build**: Centralized score calculation library + unit tests + Vitest configuration.
- **Success criteria**: Exact match gives 5 points, outcome-only match gives 3 points, incorrect outcome gives 0 points. All tests pass, build passes, lint passes.
- **Interface contracts**: central helper under lib/scoreCalculator.ts used by client pages.

## Key Decisions Made
- Use PowerShell Set-Content/Get-Content and short Node.js scripts for file management due to local file API timeouts.
- Centralize score calculation into lib/scoreCalculator.ts and write extensive test coverage.
- Refactor dashboard/groups/profile pages to use calculateScore and ensure identical behaviour.

## Artifact Index
- lib/scoreCalculator.ts — centralized scoring logic
- lib/scoreCalculator.test.ts — unit tests for the scoring logic
- vitest.config.ts — Vitest configuration file
- .agents/teamwork_preview_worker_m1_tests/handoff.md — final handoff report

## Change Tracker
- **Files modified**:
  - package.json — added vitest scripts and devDependencies
  - package-lock.json — updated npm lockfile
  - pp/dashboard/grupos/[id]/page.tsx — refactored scoring logic to use central helper
  - pp/dashboard/perfil/page.tsx — refactored scoring logic to use central helper
  - pp/dashboard/page.tsx — refactored scoring logic to use central helper
- **Build status**: PASS
- **Pending issues**: None

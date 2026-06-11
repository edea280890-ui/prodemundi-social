# BRIEFING — 2026-06-11T00:52:00Z

## Mission
Investigate the codebase for Prode Mundial 2026 to identify existing packages/files, choose a testing framework (Vitest vs Jest), locate score calculations, and recommend an implementation strategy.

## 🔒 My Identity
- Archetype: Explorer
- Roles: Teamwork explorer, Investigator, Synthesizer
- Working directory: C:\Users\tini2\prodemundi-social\.agents\teamwork_preview_explorer_m1_tests_3
- Original parent: f46e57c5-099f-445a-b317-67c29967d0c0
- Milestone: Milestone 1: Test Setup & Calculation Tests

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Operating in CODE_ONLY network mode. No external HTTP requests.
- All file reads/writes on workspace using IDE tools prompt user and time out; must use shell commands for writing reports and metadata, but do not bypass safety rules.

## Current Parent
- Conversation ID: f46e57c5-099f-445a-b317-67c29967d0c0
- Updated: 2026-06-11T00:52:00Z

## Investigation State
- **Explored paths**:
  - Root directory files and folder structure
  - app/ folder pages (dashboard pages, admin, grupos, perfil, etc.)
  - lib/ files (supabase.ts, teamFlags.ts)
  - package.json (via npm list)
  - Next.js 16 testing documentation (vitest.md and jest.md in node_modules/next/dist/docs/)
- **Key findings**:
  - The project uses Next.js 16.2.6, React 19.2.4, Supabase JS client 2.106.2, and Tailwind CSS 4.3.0.
  - No testing packages are currently installed in package.json.
  - Client-side prediction score rendering is duplicated in two pages: app/dashboard/grupos/[id]/page.tsx (using getPredictionResult helper) and app/dashboard/perfil/page.tsx (using inline condition checking). Both implement the same scoring rules: exact match (+5 pts), winner/draw acierto (+3 pts), and incorrect (+0 pts).
  - Server-side score updates and calculations are performed in the Supabase database via the stored procedure/RPC recalculate_all_scores, which is triggered by the admin interface in app/dashboard/admin/page.tsx when match results are saved.
- **Unexplored areas**:
  - The exact SQL implementation of the recalculate_all_scores RPC inside the Supabase database (as there are no migration SQL files checked in the repo, meaning it lives entirely in the remote DB schema).

## Key Decisions Made
- Recommend Vitest over Jest due to its native ESM and TypeScript compatibility, significantly simpler configuration for Next.js 16 (using vite-tsconfig-paths for path aliases instead of verbose custom Jest mapping), speed, and native Next.js 16 documentation alignment.
- Propose refactoring duplicated client-side scoring logic into a unified utility module lib/scoreCalculator.ts and writing unit tests for it.

## Artifact Index
- C:\Users\tini2\prodemundi-social\.agents\teamwork_preview_explorer_m1_tests_3\analysis.md — Detailed analysis report on existing packages/files, testing framework comparison, calculation spots, and implementation strategy.
- C:\Users\tini2\prodemundi-social\.agents\teamwork_preview_explorer_m1_tests_3\handoff.md — Structured 5-component handoff report for the orchestrator.

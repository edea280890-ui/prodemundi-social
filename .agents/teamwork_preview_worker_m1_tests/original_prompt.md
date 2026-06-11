## 2026-06-11T00:54:54Z
You are the Worker for Milestone 1: Test Setup & Calculation Tests of the Prode Mundial 2026 project.
Your metadata directory is: C:\Users\tini2\prodemundi-social\.agents\teamwork_preview_worker_m1_tests

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Task Requirements:
1. Configure Vitest in the project (Next.js 16, React 19).
   - Install devDependencies: vitest, @vitejs/plugin-react, jsdom, vite-tsconfig-paths. (Modify package.json and run npm install or run npm install -D).
   - Create vitest.config.ts or vitest.config.mts at the project root using vite-tsconfig-paths to resolve @/* paths, and setting environment to jsdom.
   - Update package.json scripts to include a "test": "vitest run" command.
2. Implement score calculation library lib/scoreCalculator.ts:
   - Expose a function to compute points and exact indicator from a prediction vs actual score.
   - Scoring rules (from Existing page.tsx):
     - Exact score match (e.g. Predicted 2-1, Actual 2-1) => 5 points, exact = true.
     - Outcome-only match (Winner/Draw matches, but not exact score) => 3 points, exact = false.
     - Incorrect outcome => 0 points, exact = false.
   - Refactor client pages (specifically app/dashboard/grupos/[id]/page.tsx around line 122, and app/dashboard/perfil/page.tsx or other files using similar logic) to use this centralized utility.
3. Write unit tests in lib/scoreCalculator.test.ts:
   - Cover exact scores, outcome wins, outcome draws, incorrect outcomes, and edge/error inputs (e.g. negative scores).
4. Run all verification steps:
   - Run the unit tests (npm run test or npx vitest run).
   - Run the build (npm run build).
   - Run the lint check (npm run lint).
   - Document commands, outputs, and results in your handoff report C:\Users\tini2\prodemundi-social\.agents\teamwork_preview_worker_m1_tests\handoff.md.
5. Send a message to the orchestrator when done with a summary of changes and paths to reports.

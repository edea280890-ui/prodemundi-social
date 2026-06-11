# Handoff Report: Test Setup & Calculation Tests

## 1. Observation
We observed the following files and code patterns in the workspace C:\Users\tini2\prodemundi-social:

- **Next.js & React versions** in package.json:
  `json
  "next": "16.2.6",
  "react": "19.2.4",
  "react-dom": "19.2.4"
  `
- **Path aliases** in 	sconfig.json:
  `json
  "paths": {
    "@/*": ["./*"]
  }
  `
- **Inline scoring logic** in pp/dashboard/perfil/page.tsx (lines 449-492):
  `	ypescript
  const finished = item.status === "finished";
  const exact = finished && item.home_score === item.predicted_home_score && item.away_score === item.predicted_away_score;
  const predictionWinner = item.predicted_home_score > item.predicted_away_score ? "home" : ...
  `
  And identical logic in pp/dashboard/page.tsx (lines 400-428).
- **Database synchronization** in pp/dashboard/admin/page.tsx (lines 185-187):
  `	ypescript
  const { error: recalculateError } = await supabase.rpc("recalculate_all_scores");
  `

---

## 2. Logic Chain
1. **Testing Framework Choice**: Next.js 16 and React 19 rely heavily on ES Modules (ESM) and modern bundler features. Jest typically has difficulties resolving ESM dependencies (such as @supabase/ssr or component packages) without complex 	ransformIgnorePatterns configurations. In contrast, Vitest compiles files using Vite/esbuild, which has native ESM support, handles TypeScript path mappings effortlessly, and starts up significantly faster. Therefore, **Vitest** is the optimal choice.
2. **Modularization**: Code duplication of score calculations in perfil/page.tsx and page.tsx makes it hard to maintain and test. Extracting this business logic to a separate module lib/scores.ts allows us to isolate and unit-test the calculation logic.
3. **Test Strategy**: The unit test file lib/scores.test.ts will co-locate with the source logic in lib/ directory. The test cases should cover:
   - Unfinished/scheduled matches (0 points, Pendiente label).
   - Exact match score (5 points, Exacto label).
   - Correct winner match outcome but incorrect score (3 points, Acierto label).
   - Correct draw match outcome but incorrect score (3 points, Acierto label).
   - Incorrect match outcome (0 points, Sin acierto label).

---

## 3. Caveats
- **Supabase RPC Code**: The exact SQL code of the database stored procedure ecalculate_all_scores was not analyzed, as there are no database schema SQL migration files in the frontend repository. We assumed the DB function follows the same scoring rules implemented in the frontend (+5 points for exact score, +3 points for correct winner/draw, +0 points for incorrect prediction).
- **Environment Variables**: Vitest tests will run in a Node environment (with jsdom configured for future compatibility) and don't require connection to the live Supabase database.

---

## 4. Conclusion
We recommend using **Vitest** for testing Next.js 16/React 19 and setting up a centralized lib/scores.ts file to hold the score calculation logic, accompanied by a lib/scores.test.ts test suite. The implementer should install the Vitest dependencies, configure itest.config.ts, implement the centralized score calculation function, write the test file, and refactor the UI pages to import the central module.

---

## 5. Verification Method
To independently verify the implementation strategy:
1. **Dependencies Installation**: Run 
pm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom vite-tsconfig-paths
2. **File Inspection**:
   - Inspect that itest.config.ts matches the configuration specified in the analysis.
   - Inspect that lib/scores.ts and lib/scores.test.ts are created co-located in the lib folder.
3. **Execution**:
   - Run 
px vitest run (or 
pm run test:run if added to scripts) and confirm that all 5 test cases in the test suite pass.

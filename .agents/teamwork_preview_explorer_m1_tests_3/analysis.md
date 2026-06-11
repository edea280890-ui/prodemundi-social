# Analysis Report: Test Setup & Calculation Tests

This report provides a read-only codebase investigation, comparison of testing frameworks (Vitest vs Jest) for Next.js 16, identification of score calculation locations, and a detailed implementation strategy.

---

## 1. Existing Packages and Files

### Core File Structure
The project is structured as a standard Next.js application:
- pp/: Directory containing App Router pages.
  - dashboard/: Sub-pages for admin panel, help (yuda), statistics (estadisticas), group detail and management (grupos, grupos/[id]), prediction history (historial), match listings (partidos), user profile (perfil), awards (premios), prediction creation (pronosticos), and ranking tables (anking).
- components/: UI components and layouts.
  - uth/: ProtectedRoute.tsx for route guard.
  - layout/: Sidebar.tsx for main navigation.
  - ui/: Shared presentational UI elements (PageHeader.tsx, PremiumButton.tsx, PremiumCard.tsx).
- lib/: Shared utility modules.
  - supabase.ts: Supabase client initializer.
  - 	eamFlags.ts: Country flag mappings.
- public/: Static images, avatars, background patterns, and logos.
- scripts/: Development and maintenance scripts (contains clean_images.py).

### Project Dependencies
From running 
pm list --depth=0, the installed dependencies are:
- 
ext@16.2.6 (Next.js 16)
- eact@19.2.4 and eact-dom@19.2.4 (React 19)
- @supabase/supabase-js@2.106.2 & @supabase/ssr@0.10.3 (Supabase database integration)
- 	ypescript@5.9.3
- 	ailwindcss@4.3.0 & @tailwindcss/postcss@4.3.0
- eslint@9.39.4 & eslint-config-next@16.2.6

No testing libraries or config files (e.g. itest.config.ts or jest.config.js) are currently present.

---

## 2. Testing Framework: Vitest vs Jest for Next.js 16

Both Jest and Vitest are officially supported testing frameworks in Next.js 16 (documented in 
ode_modules/next/dist/docs/01-app/02-guides/testing/). However, they differ significantly in compatibility, compilation overhead, and configuration complexity.

### Comparison Matrix

| Criteria | Vitest | Jest |
| :--- | :--- | :--- |
| **ESM / TypeScript Compatibility** | Native. Compiles ESM (import/export) and TS out-of-the-box using Vite. | Requires complex transpilation layers (abel-jest with Next.js presets or 	s-jest) to prevent SyntaxError: Cannot use import statement outside a module. |
| **Path Alias Resolution** | Extremely simple. Uses ite-tsconfig-paths to automatically read path mappings (@/*) from 	sconfig.json. | Verbose. Requires manual synchronization of moduleNameMapper rules in jest.config.js with 	sconfig.json paths. |
| **Mocking and Assets** | Zero configuration needed for CSS/SCSS modules and image imports. | Requires manually writing mock files (e.g. ileMock.js, styleMock.js, 
extFontMock.js) and matching regexes in config. |
| **Speed and Performance** | Fast watch mode, leverages Vite's hot module reloading pipeline. | Can be slow due to startup overhead and heavy compiler configurations (TS-to-JS compilation). |
| **Official Documentation** | Official Next.js 16 documentation provides a simple setup using @vitejs/plugin-react and jsdom. | Official Next.js 16 documentation warns about custom Babel requirements if ESM is used. |

### Recommendation
**Vitest is the recommended testing framework for this project.** 
Next.js 16 and React 19 introduce modern package standards where Native ES Modules are prominent. Setting up Jest under these conditions is notoriously error-prone, requiring mocks for fonts, styles, images, and custom Babel/SWC settings. Vitest integrates seamlessly using Vite's bundling pipeline, resolves aliases automatically via ite-tsconfig-paths, and requires zero asset stubbing.

---

## 3. Score Calculation Locations in the App

The scoring rules defined in the help page (pp/dashboard/ayuda/page.tsx) are:
- **Exact Match (5 points)**: Correctly predicting the exact goals scored by both teams (e.g. predicting 2-1 and match ends 2-1).
- **Outcome Acierto (3 points)**: Correctly predicting the winner or draw but not the exact scores (e.g. predicting 1-0, match ends 2-1).
- **No Acierto (0 points)**: Incorrect winner/draw outcome.

The codebase implements these rules in two separate layers:

### A. Database-Side (Server Actions / Data Recalculation)
When an administrator records a match score, the application triggers a Supabase RPC to recalculate all user standings.
- **Location**: pp/dashboard/admin/page.tsx in function saveResult(match: Match):
  `	ypescript
  const { error: recalculateError } = await supabase.rpc("recalculate_all_scores");
  `
- **Description**: The database stored procedure ecalculate_all_scores runs on Supabase to loop through all user predictions, calculate scores based on actual match results, and update the group_scores table. The SQL definition lives inside Supabase and is not committed to the repository.

### B. Client-Side (UI Display Logic)
The scoring logic is duplicated on the client-side to render badges indicating points earned for each match prediction.
- **Location 1**: pp/dashboard/grupos/[id]/page.tsx in function getPredictionResult(match: Match, prediction?: Prediction):
  - Determines if the outcome matches exactly or by winner/draw.
  - Returns display metadata: label (e.g., "Exacto acertado"), points (e.g., "+5 pts"), and className for styling.
- **Location 2**: pp/dashboard/perfil/page.tsx in a mapping loop over prediction items:
  - Computes exact and correctResult (winner/draw) variables using inline checks.
  - Returns label (e.g., "Exacto", "Acierto", "Sin acierto"), points (e.g., "+5 pts", "+3 pts"), and color styles.

This duplication increases maintenance overhead. If scoring rules change (e.g. adding playoff rules, which are mentioned as "+5 for penalty winner"), the logic must be updated in multiple files.

---

## 4. Recommended Implementation Strategy

### Step 1: Install Dev Dependencies
Install Vitest, React Testing Library, and TypeScript path mapping plugins:
`ash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths
`

### Step 2: Create Vitest Configuration File
Create itest.config.mts in the project root:
`	ypescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
`

### Step 3: Refactor Scoring Logic to a Shared Utility
Create a centralized utility file lib/scoreCalculator.ts to unify calculations. This separates concerns and makes the logic 100% testable:

`	ypescript
export interface ScoreResult {
  points: number;
  label: "Exacto" | "Acierto" | "Sin acierto";
  isExact: boolean;
  isCorrectOutcome: boolean;
}

/**
 * Calculates prediction points based on real match scores and predicted scores.
 * @param realHome Actual home team goals
 * @param realAway Actual away team goals
 * @param predictedHome Predicted home team goals
 * @param predictedAway Predicted away team goals
 */
export function calculatePoints(
  realHome: number,
  realAway: number,
  predictedHome: number,
  predictedAway: number
): ScoreResult {
  // Exact match score check
  const isExact = realHome === predictedHome && realAway === predictedAway;

  if (isExact) {
    return {
      points: 5,
      label: "Exacto",
      isExact: true,
      isCorrectOutcome: true,
    };
  }

  // Determine game outcome (home win, away win, or draw)
  const realOutcome = realHome > realAway ? "home" : realHome < realAway ? "away" : "draw";
  const predictedOutcome = predictedHome > predictedAway ? "home" : predictedHome < predictedAway ? "away" : "draw";

  const isCorrectOutcome = realOutcome === predictedOutcome;

  if (isCorrectOutcome) {
    return {
      points: 3,
      label: "Acierto",
      isExact: false,
      isCorrectOutcome: true,
    };
  }

  return {
    points: 0,
    label: "Sin acierto",
    isExact: false,
    isCorrectOutcome: false,
  };
}
`

### Step 4: Write Score Calculation Unit Tests
Create a test file lib/scoreCalculator.test.ts to test all scenarios. These tests run in memory without database dependencies:

`	ypescript
import { describe, it, expect } from "vitest";
import { calculatePoints } from "./scoreCalculator";

describe("calculatePoints - Score Calculation Engine", () => {
  describe("Exact Match Predictions (+5 pts)", () => {
    it("should award 5 points for exact home-win match prediction", () => {
      const result = calculatePoints(2, 1, 2, 1);
      expect(result.points).toBe(5);
      expect(result.label).toBe("Exacto");
      expect(result.isExact).toBe(true);
      expect(result.isCorrectOutcome).toBe(true);
    });

    it("should award 5 points for exact draw prediction", () => {
      const result = calculatePoints(1, 1, 1, 1);
      expect(result.points).toBe(5);
      expect(result.label).toBe("Exacto");
      expect(result.isExact).toBe(true);
      expect(result.isCorrectOutcome).toBe(true);
    });
  });

  describe("Outcome Acierto Predictions (+3 pts)", () => {
    it("should award 3 points for predicting correct winner but wrong goals (home win)", () => {
      const result = calculatePoints(3, 1, 2, 0); // Both home win
      expect(result.points).toBe(3);
      expect(result.label).toBe("Acierto");
      expect(result.isExact).toBe(false);
      expect(result.isCorrectOutcome).toBe(true);
    });

    it("should award 3 points for predicting correct winner but wrong goals (away win)", () => {
      const result = calculatePoints(0, 2, 1, 3); // Both away win
      expect(result.points).toBe(3);
      expect(result.label).toBe("Acierto");
      expect(result.isExact).toBe(false);
      expect(result.isCorrectOutcome).toBe(true);
    });

    it("should award 3 points for predicting correct draw but wrong goals", () => {
      const result = calculatePoints(2, 2, 1, 1); // Both draw
      expect(result.points).toBe(3);
      expect(result.label).toBe("Acierto");
      expect(result.isExact).toBe(false);
      expect(result.isCorrectOutcome).toBe(true);
    });
  });

  describe("Incorrect Predictions (+0 pts)", () => {
    it("should award 0 points when predicting the wrong winner", () => {
      const result = calculatePoints(2, 1, 0, 3); // Real: home win, Pred: away win
      expect(result.points).toBe(0);
      expect(result.label).toBe("Sin acierto");
      expect(result.isExact).toBe(false);
      expect(result.isCorrectOutcome).toBe(false);
    });

    it("should award 0 points when predicting a draw but a team wins", () => {
      const result = calculatePoints(2, 1, 1, 1); // Real: home win, Pred: draw
      expect(result.points).toBe(0);
      expect(result.label).toBe("Sin acierto");
      expect(result.isExact).toBe(false);
      expect(result.isCorrectOutcome).toBe(false);
    });

    it("should award 0 points when predicting a win but game is a draw", () => {
      const result = calculatePoints(1, 1, 2, 0); // Real: draw, Pred: home win
      expect(result.points).toBe(0);
      expect(result.label).toBe("Sin acierto");
      expect(result.isExact).toBe(false);
      expect(result.isCorrectOutcome).toBe(false);
    });
  });
});
`

### Step 5: Update package.json Scripts
Add the test execution scripts to package.json:
`json
"scripts": {
  ...
  "test": "vitest run",
  "test:watch": "vitest"
}
`

### Step 6: Refactor UI Pages to Use the Utility
Once the utility is fully tested and verified, the next implementation milestone should update pp/dashboard/grupos/[id]/page.tsx and pp/dashboard/perfil/page.tsx to import calculatePoints from @/lib/scoreCalculator (using the @/* alias) to remove duplicated code block patterns.

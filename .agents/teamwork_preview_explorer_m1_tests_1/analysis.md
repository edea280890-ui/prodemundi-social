# Analysis Report: Test Setup & Calculation Tests

This report analyzes the codebase structure of **Prode Mundial 2026**, evaluates Vitest vs Jest testing frameworks under Next.js 16 and React 19, identifies existing score calculation logic, and outlines a detailed implementation strategy.

---

## 1. Codebase Overview (Packages & Files)

### Existing Key Packages (package.json)
- **Next.js**: 16.2.6 (App Router structure)
- **React**: 19.2.4
- **React-DOM**: 19.2.4
- **Supabase Client**: @supabase/supabase-js: ^2.106.2 & @supabase/ssr: ^0.10.3
- **TailwindCSS**: ^4 (with @tailwindcss/postcss: ^4)
- **TypeScript**: ^5
- **Linter**: eslint: ^9 (with eslint-config-next: 16.2.6)

### File Structure
- pp/: Next.js pages and layouts (using App Router)
  - pp/dashboard/page.tsx: Main dashboard displaying stats and recent predictions.
  - pp/dashboard/perfil/page.tsx: Profile page showing user statistics and prediction history.
  - pp/dashboard/admin/page.tsx: Admin panel for match management and score recalculations.
  - pp/dashboard/pronosticos/page.tsx: Page for users to submit predictions.
- components/: UI components (TeamLabel.tsx, layout/Sidebar.tsx, ui/PremiumCard.tsx, etc.).
- lib/: Shared utilities.
  - lib/supabase.ts: Supabase client initialization.
  - lib/teamFlags.ts: National flags mappings.
- scripts/: System scripts (e.g., clean_images.py).

---

## 2. Testing Framework Evaluation: Vitest vs Jest for Next.js 16 + React 19

We recommend **Vitest** for the testing framework based on the following evaluation:

| Feature / Criteria | Vitest | Jest |
|---|---|---|
| **Compilation Speed** | **High** (uses esbuild natively; near-instant startup). | **Medium** (requires babel, ts-jest, or @swc/jest; slower compilation). |
| **ESM Support** | **Native** (out-of-the-box support, critical for modern Next.js/Supabase dependencies). | **Poor** (requires complex 	ransformIgnorePatterns configurations for Node modules using ESM). |
| **Configuration Complexity** | **Low** (minimal setup; handles tsconfig paths and environment variables natively). | **High** (requires polyfills, babel configuration, and Jest-specific configurations). |
| **TypeScript / JSX Support** | **Built-in** (no extra loaders needed). | **Requires loaders** (such as ts-jest or babel-jest). |
| **HMR / Watch Mode** | **Outstanding** (extremely fast test re-runs on modification). | **Standard** (re-runs entire test suite or file, slower). |
| **Next.js 16/React 19 Compatibility** | **Excellent** (works seamlessly with React 19 and modern bundler features). | **Challenging** (requires specific testing-library/React 19 alignment and environment mock overrides). |

### Vitest Compatibility Details
Vitest is built to parse TypeScript files out-of-the-box and aligns with Vite-based ecosystem tooling. Next.js 16’s dependency trees and ESM structures compile perfectly under Vitest using the @vitejs/plugin-react and ite-tsconfig-paths packages to resolve the @/* tsconfig aliases.

---

## 3. Score Calculation Code Blocks

Score calculation in the app is currently duplicated across two UI views, and triggered in the database using a stored procedure called from the admin panel:

### Block 1: Profile History (pp/dashboard/perfil/page.tsx lines 449-492)
`	ypescript
const finished = item.status === "finished";

const exact =
  finished &&
  item.home_score === item.predicted_home_score &&
  item.away_score === item.predicted_away_score;

const predictionWinner =
  item.predicted_home_score > item.predicted_away_score
    ? "home"
    : item.predicted_home_score <
      item.predicted_away_score
    ? "away"
    : "draw";

const resultWinner =
  (item.home_score ?? 0) > (item.away_score ?? 0)
    ? "home"
    : (item.home_score ?? 0) < (item.away_score ?? 0)
    ? "away"
    : "draw";

const correctResult =
  finished && !exact && predictionWinner === resultWinner;

let label = "Pendiente";
let points = "";
let color = "text-zinc-400";

if (finished) {
  if (exact) {
    label = "Exacto";
    points = "+5 pts";
    color = "text-[#f6d365]";
  } else if (correctResult) {
    label = "Acierto";
    points = "+3 pts";
    color = "text-green-400";
  } else {
    label = "Sin acierto";
    points = "+0 pts";
    color = "text-red-400";
  }
}
`

### Block 2: Recent Predictions (pp/dashboard/page.tsx lines 400-428)
An identical scoring calculation check is run inside pp/dashboard/page.tsx to display points and acierto labels for recent predictions.

### Block 3: Database Recollection RPC (pp/dashboard/admin/page.tsx lines 185-187)
`	ypescript
const { error: recalculateError } = await supabase.rpc(
  "recalculate_all_scores"
);
`
Recalculations are driven by the database trigger/RPC function ecalculate_all_scores inside Supabase when the admin saves match results.

---

## 4. Recommended Implementation Strategy

### Step 4.1: Install Dependencies
Install Vitest and necessary testing plugins:
`ash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom vite-tsconfig-paths
`

### Step 4.2: Vitest Configuration
Create itest.config.ts in the project root:
`	ypescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
  },
});
`

Create itest.setup.ts in the project root to import Jest DOM matchers:
`	ypescript
import '@testing-library/jest-dom';
`

Add test scripts to package.json:
`json
"scripts": {
  "test": "vitest",
  "test:run": "vitest run"
}
`

### Step 4.3: Centralize Score Calculation (lib/scores.ts)
Create a type-safe module lib/scores.ts encapsulating all score calculation logic:
`	ypescript
export interface ScorePrediction {
  predicted_home_score: number;
  predicted_away_score: number;
}

export interface ScoreMatch {
  status: string; // e.g. "finished", "scheduled"
  home_score: number | null;
  away_score: number | null;
}

export interface ScoreCalculationResult {
  points: number;
  exact: boolean;
  correctResult: boolean;
  label: "Pendiente" | "Exacto" | "Acierto" | "Sin acierto";
  pointsLabel: string;
}

export function calculateScore(
  prediction: ScorePrediction,
  match: ScoreMatch
): ScoreCalculationResult {
  const finished = match.status === "finished";

  if (!finished || match.home_score === null || match.away_score === null) {
    return {
      points: 0,
      exact: false,
      correctResult: false,
      label: "Pendiente",
      pointsLabel: "",
    };
  }

  const exact =
    prediction.predicted_home_score === match.home_score &&
    prediction.predicted_away_score === match.away_score;

  if (exact) {
    return {
      points: 5,
      exact: true,
      correctResult: false,
      label: "Exacto",
      pointsLabel: "+5 pts",
    };
  }

  const predictionWinner =
    prediction.predicted_home_score > prediction.predicted_away_score
      ? "home"
      : prediction.predicted_home_score < prediction.predicted_away_score
      ? "away"
      : "draw";

  const resultWinner =
    match.home_score > match.away_score
      ? "home"
      : match.home_score < match.away_score
      ? "away"
      : "draw";

  const correctResult = predictionWinner === resultWinner;

  if (correctResult) {
    return {
      points: 3,
      exact: false,
      correctResult: true,
      label: "Acierto",
      pointsLabel: "+3 pts",
    };
  }

  return {
    points: 0,
    exact: false,
    correctResult: false,
    label: "Sin acierto",
    pointsLabel: "+0 pts",
  };
}
`

### Step 4.4: Write Unit Tests (lib/scores.test.ts)
Create co-located tests for calculateScore in lib/scores.test.ts:
`	ypescript
import { describe, it, expect } from 'vitest';
import { calculateScore } from './scores';

describe('calculateScore', () => {
  it('should return 0 points and Pendiente label for unfinished match', () => {
    const prediction = { predicted_home_score: 2, predicted_away_score: 1 };
    const match = { status: 'scheduled', home_score: null, away_score: null };
    const result = calculateScore(prediction, match);
    expect(result).toEqual({
      points: 0,
      exact: false,
      correctResult: false,
      label: 'Pendiente',
      pointsLabel: '',
    });
  });

  it('should return 5 points and Exacto label for exact score match', () => {
    const prediction = { predicted_home_score: 2, predicted_away_score: 1 };
    const match = { status: 'finished', home_score: 2, away_score: 1 };
    const result = calculateScore(prediction, match);
    expect(result).toEqual({
      points: 5,
      exact: true,
      correctResult: false,
      label: 'Exacto',
      pointsLabel: '+5 pts',
    });
  });

  it('should return 3 points and Acierto label for correct outcome winner but wrong score', () => {
    const prediction = { predicted_home_score: 3, predicted_away_score: 0 };
    const match = { status: 'finished', home_score: 2, away_score: 1 };
    const result = calculateScore(prediction, match);
    expect(result).toEqual({
      points: 3,
      exact: false,
      correctResult: true,
      label: 'Acierto',
      pointsLabel: '+3 pts',
    });
  });

  it('should return 3 points and Acierto label for correct draw prediction but wrong score', () => {
    const prediction = { predicted_home_score: 1, predicted_away_score: 1 };
    const match = { status: 'finished', home_score: 2, away_score: 2 };
    const result = calculateScore(prediction, match);
    expect(result).toEqual({
      points: 3,
      exact: false,
      correctResult: true,
      label: 'Acierto',
      pointsLabel: '+3 pts',
    });
  });

  it('should return 0 points and Sin acierto label for wrong prediction', () => {
    const prediction = { predicted_home_score: 1, predicted_away_score: 2 };
    const match = { status: 'finished', home_score: 2, away_score: 0 };
    const result = calculateScore(prediction, match);
    expect(result).toEqual({
      points: 0,
      exact: false,
      correctResult: false,
      label: 'Sin acierto',
      pointsLabel: '+0 pts',
    });
  });
});
`

### Step 4.5: Refactor Frontend Components
The implementer should import calculateScore from @/lib/scores in:
- pp/dashboard/perfil/page.tsx
- pp/dashboard/page.tsx

This removes duplicate calculation logic, improves maintainability, and guarantees consistency.

---

## 5. Verification Method
To verify the setup:
1. After dependency installation, run the test runner:
   
pm run test (in interactive watch mode) or 
pm run test:run (single run mode).
2. The unit test suite in lib/scores.test.ts must pass successfully, asserting all 5 key scenarios.

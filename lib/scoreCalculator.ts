export interface CalculationResult {
  points: number;
  exact: boolean;
}

/**
 * Computes points and exact indicator from a prediction vs actual score.
 * 
 * Scoring rules:
 * - Exact score match (e.g. Predicted 2-1, Actual 2-1) => 5 points, exact = true.
 * - Outcome-only match (Winner/Draw matches, but not exact score) => 3 points, exact = false.
 * - Incorrect outcome => 0 points, exact = false.
 * 
 * @throws Error if any score is negative.
 */
export function calculateScore(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number
): CalculationResult {
  if (
    predictedHome < 0 ||
    predictedAway < 0 ||
    actualHome < 0 ||
    actualAway < 0
  ) {
    throw new Error("Scores must be non-negative");
  }

  const exact = predictedHome === actualHome && predictedAway === actualAway;

  if (exact) {
    return { points: 5, exact: true };
  }

  const predictedOutcome =
    predictedHome > predictedAway
      ? "home"
      : predictedHome < predictedAway
      ? "away"
      : "draw";

  const actualOutcome =
    actualHome > actualAway
      ? "home"
      : actualHome < actualAway
      ? "away"
      : "draw";

  if (predictedOutcome === actualOutcome) {
    return { points: 3, exact: false };
  }

  return { points: 0, exact: false };
}

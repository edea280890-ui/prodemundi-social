import { describe, test, expect } from 'vitest';
import { calculateScore } from './scoreCalculator';

describe('calculateScore', () => {
  test('exact score match gives 5 points and exact true', () => {
    expect(calculateScore(2, 1, 2, 1)).toEqual({ points: 5, exact: true });
    expect(calculateScore(0, 0, 0, 0)).toEqual({ points: 5, exact: true });
  });

  test('outcome-only win match (winner matches, not exact) gives 3 points and exact false', () => {
    expect(calculateScore(3, 1, 2, 1)).toEqual({ points: 3, exact: false });
    expect(calculateScore(1, 0, 4, 2)).toEqual({ points: 3, exact: false });
  });

  test('outcome-only draw match (draw matches, not exact) gives 3 points and exact false', () => {
    expect(calculateScore(1, 1, 2, 2)).toEqual({ points: 3, exact: false });
    expect(calculateScore(0, 0, 3, 3)).toEqual({ points: 3, exact: false });
  });

  test('incorrect outcome gives 0 points and exact false', () => {
    // Predicted home win, actual away win
    expect(calculateScore(2, 1, 1, 2)).toEqual({ points: 0, exact: false });
    // Predicted draw, actual home win
    expect(calculateScore(1, 1, 3, 1)).toEqual({ points: 0, exact: false });
    // Predicted away win, actual draw
    expect(calculateScore(0, 2, 1, 1)).toEqual({ points: 0, exact: false });
  });

  test('negative scores throw an error', () => {
    expect(() => calculateScore(-1, 2, 1, 1)).toThrow('Scores must be non-negative');
    expect(() => calculateScore(2, -1, 1, 1)).toThrow('Scores must be non-negative');
    expect(() => calculateScore(2, 2, -1, 1)).toThrow('Scores must be non-negative');
    expect(() => calculateScore(2, 2, 1, -1)).toThrow('Scores must be non-negative');
  });
});

import { describe, expect, test } from '@jest/globals';

// Dummy implementation of helpers for testing demonstration 
// (In real app, import these from src/utils/payments.ts)

const computeDataHash = (data: any) => {
  return JSON.stringify(data).split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0).toString(16);
};

const calculateWeightedTariff = (rates: {rate: number, weight: number}[]) => {
  const totalWeight = rates.reduce((sum, r) => sum + r.weight, 0);
  if (totalWeight === 0) return 0;
  return rates.reduce((sum, r) => sum + (r.rate * r.weight), 0) / totalWeight;
};

describe('Payment Unit Helpers', () => {

  test('computeDataHash returns consistent hash', () => {
    const data1 = { id: 1, val: 'test' };
    const data2 = { id: 1, val: 'test' };
    const data3 = { id: 2, val: 'test' };

    expect(computeDataHash(data1)).toBe(computeDataHash(data2));
    expect(computeDataHash(data1)).not.toBe(computeDataHash(data3));
  });

  test('calculateWeightedTariff computes correctly', () => {
    const rates = [
      { rate: 0.10, weight: 0.5 }, // 50% usage
      { rate: 0.20, weight: 0.5 }  // 50% usage
    ];
    // Expected: 0.15
    expect(calculateWeightedTariff(rates)).toBeCloseTo(0.15);
  });

  test('calculateWeightedTariff handles empty input', () => {
    expect(calculateWeightedTariff([])).toBe(0);
  });

});

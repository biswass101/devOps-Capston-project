const test = require('node:test');
const assert = require('node:assert/strict');

const { calculateMetrics } = require('../../src/calculations');

test('calculateMetrics returns expected BMI, category, BMR, and calories', () => {
  const result = calculateMetrics({
    weightKg: 70,
    heightCm: 175,
    age: 30,
    sex: 'male',
    activity: 'moderate'
  });

  assert.deepEqual(result, {
    bmi: 22.9,
    bmiCategory: 'Normal',
    bmr: 1649,
    dailyCalories: 2556
  });
});

test('calculateMetrics falls back to sedentary multiplier when activity is missing', () => {
  const result = calculateMetrics({
    weightKg: 82,
    heightCm: 180,
    age: 38,
    sex: 'female'
  });

  assert.equal(result.dailyCalories, Math.round(result.bmr * 1.2));
});

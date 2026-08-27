const { reviewCard } = require('./sm2');

test('failing a new card keeps interval at 1 day', () => {
  const card = { easeFactor: 2.5, intervalDays: 0, repetitions: 0 };
  const result = reviewCard(card, 2); // quality 2 = failed (below 3)
  expect(result.repetitions).toBe(0);
  expect(result.intervalDays).toBe(1);
});

test('first successful review sets interval to 1 day', () => {
  const card = { easeFactor: 2.5, intervalDays: 0, repetitions: 0 };
  const result = reviewCard(card, 4); // quality 4 = good
  expect(result.repetitions).toBe(1);
  expect(result.intervalDays).toBe(1);
});

test('second successful review sets interval to 6 days', () => {
  const card = { easeFactor: 2.5, intervalDays: 1, repetitions: 1 };
  const result = reviewCard(card, 4);
  expect(result.repetitions).toBe(2);
  expect(result.intervalDays).toBe(6);
});

test('third successful review multiplies interval by ease factor', () => {
  const card = { easeFactor: 2.5, intervalDays: 6, repetitions: 2 };
  const result = reviewCard(card, 4);
  expect(result.repetitions).toBe(3);
  expect(result.intervalDays).toBe(15); // 6 * 2.5 = 15
});

test('ease factor never drops below 1.3', () => {
  const card = { easeFactor: 1.3, intervalDays: 6, repetitions: 2 };
  const result = reviewCard(card, 0); // worst possible rating
  expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
});
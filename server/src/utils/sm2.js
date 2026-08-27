function reviewCard(card, quality) {
  // quality: 0-5, how well the user remembered the card

  let { easeFactor, intervalDays, repetitions } = card;

  if (quality < 3) {
    // Failed recall: reset progress, review again tomorrow
    repetitions = 0;
    intervalDays = 1;
  } else {
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor, never let it drop below 1.3
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(1.3, easeFactor);

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + intervalDays);

  return {
    easeFactor,
    intervalDays,
    repetitions,
    dueDate,
    lastReviewedAt: new Date()
  };
}

module.exports = { reviewCard };
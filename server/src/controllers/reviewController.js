const pool = require('../db/pool');
const { reviewCard } = require('../utils/sm2');

async function getReviewQueue(req, res) {
  try {
    const result = await pool.query(
      `SELECT cards.id, cards.question, cards.answer, card_reviews.due_date
       FROM cards
       JOIN card_reviews ON cards.id = card_reviews.card_id
       JOIN decks ON cards.deck_id = decks.id
       WHERE decks.user_id = $1 AND card_reviews.due_date <= CURRENT_DATE
       ORDER BY card_reviews.due_date`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch review queue' });
  }
}

async function submitReview(req, res) {
  const { cardId } = req.params;
  const { quality } = req.body;

  if (quality === undefined || quality < 0 || quality > 5) {
    return res.status(400).json({ error: 'Quality must be a number between 0 and 5' });
  }

  try {
    // Confirm this card belongs to the current user before updating it
    const ownershipCheck = await pool.query(
      `SELECT card_reviews.* FROM card_reviews
       JOIN cards ON card_reviews.card_id = cards.id
       JOIN decks ON cards.deck_id = decks.id
       WHERE card_reviews.card_id = $1 AND decks.user_id = $2`,
      [cardId, req.userId]
    );

    if (ownershipCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const currentReview = ownershipCheck.rows[0];

    // Run the pure SM-2 function (unchanged since Day 3) to compute the new state
    const updated = reviewCard(
      {
        easeFactor: currentReview.ease_factor,
        intervalDays: currentReview.interval_days,
        repetitions: currentReview.repetitions
      },
      quality
    );

    const result = await pool.query(
      `UPDATE card_reviews
       SET ease_factor = $1, interval_days = $2, repetitions = $3, due_date = $4, last_reviewed_at = $5
       WHERE card_id = $6
       RETURNING *`,
      [updated.easeFactor, updated.intervalDays, updated.repetitions, updated.dueDate, updated.lastReviewedAt, cardId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
}

module.exports = { getReviewQueue, submitReview };
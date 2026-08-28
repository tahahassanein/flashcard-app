const pool = require('../db/pool');

async function getCards(req, res) {
  const { deckId } = req.params;
  try {
    // Verify the deck belongs to this user before touching its cards,
    // so a user can't view/modify another user's deck by guessing its ID
    const deckCheck = await pool.query('SELECT id FROM decks WHERE id = $1 AND user_id = $2', [deckId, req.userId]);
    if (deckCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Deck not found' });
    }

    const result = await pool.query('SELECT * FROM cards WHERE deck_id = $1 ORDER BY created_at', [deckId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
}

async function createCard(req, res) {
  const { deckId } = req.params;
  const { question, answer } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ error: 'Question and answer are required' });
  }

  try {
    const deckCheck = await pool.query('SELECT id FROM decks WHERE id = $1 AND user_id = $2', [deckId, req.userId]);
    if (deckCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Deck not found' });
    }

    const cardResult = await pool.query(
      'INSERT INTO cards (deck_id, question, answer) VALUES ($1, $2, $3) RETURNING *',
      [deckId, question, answer]
    );
    const card = cardResult.rows[0];

    // Every card needs a review-tracking row from creation,
    // otherwise it will never appear in the due-for-review queue
    await pool.query('INSERT INTO card_reviews (card_id) VALUES ($1)', [card.id]);

    res.status(201).json(card);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create card' });
  }
}

async function deleteCard(req, res) {
  const { cardId } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM cards WHERE id = $1 AND deck_id IN (SELECT id FROM decks WHERE user_id = $2) RETURNING id`,
      [cardId, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete card' });
  }
}

module.exports = { getCards, createCard, deleteCard };